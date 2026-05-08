import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authenticate, requireRole } from "../middlewares/auth";
import { CreateUserBody, UpdateUserBody } from "@workspace/api-zod";

const router = Router();

router.get("/users", authenticate, requireRole("owner"), async (req, res) => {
  const users = await db.select().from(usersTable).orderBy(usersTable.role, usersTable.name);
  res.json(users.map(formatUser));
});

router.post("/users", authenticate, requireRole("owner"), async (req, res) => {
  const parse = CreateUserBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { name, email, password, role } = parse.data;
  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(usersTable).values({ name, email, passwordHash, role }).returning();
  res.status(201).json(formatUser(user));
});

router.get("/users/:id", authenticate, async (req, res) => {
  const id = Number(req.params.id);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(formatUser(user));
});

router.patch("/users/:id", authenticate, requireRole("owner"), async (req, res) => {
  const id = Number(req.params.id);
  const parse = UpdateUserBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { password, ...rest } = parse.data;
  const updateData: any = { ...rest };
  if (password) {
    updateData.passwordHash = await bcrypt.hash(password, 10);
  }
  const [user] = await db.update(usersTable).set(updateData).where(eq(usersTable.id, id)).returning();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(formatUser(user));
});

router.delete("/users/:id", authenticate, requireRole("owner"), async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.status(204).send();
});

function formatUser(u: typeof usersTable.$inferSelect) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
  };
}

export default router;
