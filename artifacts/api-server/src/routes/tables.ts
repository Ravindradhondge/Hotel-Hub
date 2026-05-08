import { Router } from "express";
import { db } from "@workspace/db";
import { tablesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authenticate } from "../middlewares/auth";
import { CreateTableBody, UpdateTableBody } from "@workspace/api-zod";

const router = Router();

router.get("/tables", authenticate, async (req, res) => {
  const tables = await db.select().from(tablesTable).orderBy(tablesTable.number);
  res.json(tables.map(formatTable));
});

router.post("/tables", authenticate, async (req, res) => {
  const parse = CreateTableBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const [table] = await db.insert(tablesTable).values(parse.data).returning();
  res.status(201).json(formatTable(table));
});

router.get("/tables/summary", authenticate, async (req, res) => {
  const tables = await db.select().from(tablesTable);
  const summary = {
    available: tables.filter((t) => t.status === "available").length,
    occupied: tables.filter((t) => t.status === "occupied").length,
    cooking: tables.filter((t) => t.status === "cooking").length,
    ready: tables.filter((t) => t.status === "ready").length,
    billing: tables.filter((t) => t.status === "billing").length,
    total: tables.length,
  };
  res.json(summary);
});

router.get("/tables/:id", authenticate, async (req, res) => {
  const id = Number(req.params.id);
  const [table] = await db.select().from(tablesTable).where(eq(tablesTable.id, id)).limit(1);
  if (!table) {
    res.status(404).json({ error: "Table not found" });
    return;
  }
  res.json(formatTable(table));
});

router.patch("/tables/:id", authenticate, async (req, res) => {
  const id = Number(req.params.id);
  const parse = UpdateTableBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const [table] = await db.update(tablesTable).set(parse.data).where(eq(tablesTable.id, id)).returning();
  if (!table) {
    res.status(404).json({ error: "Table not found" });
    return;
  }
  res.json(formatTable(table));
});

router.delete("/tables/:id", authenticate, async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(tablesTable).where(eq(tablesTable.id, id));
  res.status(204).send();
});

function formatTable(t: typeof tablesTable.$inferSelect) {
  return {
    id: t.id,
    number: t.number,
    capacity: t.capacity,
    status: t.status,
    currentOrderId: t.currentOrderId ?? null,
  };
}

export default router;
