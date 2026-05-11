import { Router } from "express";
import { db } from "@workspace/db";
import { attendanceTable, usersTable } from "@workspace/db";
import { eq, and, gte, lte } from "drizzle-orm";
import { authenticate } from "../middlewares/auth";

const router = Router();

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function deriveStatus(checkIn: Date | null): string {
  if (!checkIn) return "present";
  const hour = checkIn.getHours();
  const minute = checkIn.getMinutes();
  return hour > 10 || (hour === 10 && minute > 0) ? "late" : "present";
}

async function formatRecord(r: typeof attendanceTable.$inferSelect) {
  const [user] = await db.select({ name: usersTable.name, role: usersTable.role })
    .from(usersTable).where(eq(usersTable.id, r.userId)).limit(1);
  return {
    id: r.id,
    userId: r.userId,
    userName: user?.name ?? "Unknown",
    userRole: user?.role ?? "unknown",
    date: r.date,
    checkIn: r.checkIn ? r.checkIn.toISOString() : null,
    checkOut: r.checkOut ? r.checkOut.toISOString() : null,
    status: r.status,
  };
}

router.post("/attendance/check-in", authenticate, async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const today = todayStr();
  const existing = await db.select().from(attendanceTable)
    .where(and(eq(attendanceTable.userId, userId), eq(attendanceTable.date, today))).limit(1);

  if (existing.length > 0) {
    res.status(400).json({ error: "Already checked in today" });
    return;
  }

  const now = new Date();
  const status = deriveStatus(now);
  const [record] = await db.insert(attendanceTable)
    .values({ userId, date: today, checkIn: now, status })
    .returning();

  res.json(await formatRecord(record));
});

router.post("/attendance/check-out", authenticate, async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const today = todayStr();
  const [existing] = await db.select().from(attendanceTable)
    .where(and(eq(attendanceTable.userId, userId), eq(attendanceTable.date, today))).limit(1);

  if (!existing) {
    res.status(400).json({ error: "No check-in found for today" });
    return;
  }
  if (existing.checkOut) {
    res.status(400).json({ error: "Already checked out today" });
    return;
  }

  const [record] = await db.update(attendanceTable)
    .set({ checkOut: new Date() })
    .where(eq(attendanceTable.id, existing.id))
    .returning();

  res.json(await formatRecord(record));
});

router.get("/attendance/my-today", authenticate, async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const [record] = await db.select().from(attendanceTable)
    .where(and(eq(attendanceTable.userId, userId), eq(attendanceTable.date, todayStr()))).limit(1);

  if (!record) { res.status(404).json({ error: "No attendance record for today" }); return; }
  res.json(await formatRecord(record));
});

router.get("/attendance/today", authenticate, async (req, res) => {
  const today = todayStr();
  const allStaff = await db.select().from(usersTable)
    .where(eq(usersTable.role, "waiter"));
  const kitchen = await db.select().from(usersTable).where(eq(usersTable.role, "kitchen"));
  const accountants = await db.select().from(usersTable).where(eq(usersTable.role, "accountant"));
  const staff = [...allStaff, ...kitchen, ...accountants];

  const records = await db.select().from(attendanceTable)
    .where(eq(attendanceTable.date, today));

  const result = staff.map((u) => {
    const rec = records.find((r) => r.userId === u.id);
    return {
      userId: u.id,
      userName: u.name,
      userRole: u.role,
      checkIn: rec?.checkIn ? rec.checkIn.toISOString() : null,
      checkOut: rec?.checkOut ? rec.checkOut.toISOString() : null,
      status: rec ? rec.status : "absent",
    };
  });

  res.json(result);
});

router.get("/attendance", authenticate, async (req, res) => {
  const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };

  let query = db.select().from(attendanceTable).$dynamic();
  if (startDate) query = query.where(gte(attendanceTable.date, startDate));
  if (endDate)   query = query.where(lte(attendanceTable.date, endDate));

  const records = await query.orderBy(attendanceTable.date);
  const formatted = await Promise.all(records.map(formatRecord));
  res.json(formatted);
});

export default router;
