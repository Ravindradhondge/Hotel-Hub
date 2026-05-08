import { Router } from "express";
import { db } from "@workspace/db";
import { inventoryTable } from "@workspace/db";
import { eq, lte } from "drizzle-orm";
import { authenticate } from "../middlewares/auth";
import { CreateInventoryItemBody, UpdateInventoryItemBody } from "@workspace/api-zod";

const router = Router();

router.get("/inventory/low-stock", authenticate, async (req, res) => {
  const items = await db
    .select()
    .from(inventoryTable)
    .where(lte(inventoryTable.quantity, inventoryTable.lowStockThreshold))
    .orderBy(inventoryTable.name);
  res.json(items.map(formatItem));
});

router.get("/inventory", authenticate, async (req, res) => {
  const items = await db.select().from(inventoryTable).orderBy(inventoryTable.name);
  res.json(items.map(formatItem));
});

router.post("/inventory", authenticate, async (req, res) => {
  const parse = CreateInventoryItemBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const [item] = await db.insert(inventoryTable).values(parse.data).returning();
  res.status(201).json(formatItem(item));
});

router.get("/inventory/:id", authenticate, async (req, res) => {
  const id = Number(req.params.id);
  const [item] = await db.select().from(inventoryTable).where(eq(inventoryTable.id, id)).limit(1);
  if (!item) {
    res.status(404).json({ error: "Item not found" });
    return;
  }
  res.json(formatItem(item));
});

router.patch("/inventory/:id", authenticate, async (req, res) => {
  const id = Number(req.params.id);
  const parse = UpdateInventoryItemBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const [item] = await db.update(inventoryTable).set(parse.data).where(eq(inventoryTable.id, id)).returning();
  if (!item) {
    res.status(404).json({ error: "Item not found" });
    return;
  }
  res.json(formatItem(item));
});

router.delete("/inventory/:id", authenticate, async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(inventoryTable).where(eq(inventoryTable.id, id));
  res.status(204).send();
});

function formatItem(item: typeof inventoryTable.$inferSelect) {
  return {
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    lowStockThreshold: item.lowStockThreshold,
    isLowStock: item.quantity <= item.lowStockThreshold,
    updatedAt: item.updatedAt.toISOString(),
  };
}

export default router;
