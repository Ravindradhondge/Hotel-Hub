import { Router } from "express";
import { db } from "@workspace/db";
import { menuItemsTable, orderItemsTable } from "@workspace/db";
import { eq, sql, ilike, desc } from "drizzle-orm";
import { authenticate } from "../middlewares/auth";
import { CreateMenuItemBody, UpdateMenuItemBody } from "@workspace/api-zod";

const router = Router();

router.get("/menu-items", authenticate, async (req, res) => {
  const { category, available, search } = req.query;
  let query = db.select().from(menuItemsTable).$dynamic();

  const conditions = [];
  if (category) conditions.push(eq(menuItemsTable.category, String(category)));
  if (available !== undefined) conditions.push(eq(menuItemsTable.available, available === "true"));
  if (search) conditions.push(ilike(menuItemsTable.name, `%${search}%`));

  if (conditions.length > 0) {
    const { and } = await import("drizzle-orm");
    query = query.where(and(...conditions));
  }

  const items = await query.orderBy(menuItemsTable.category, menuItemsTable.name);
  res.json(items.map(formatMenuItem));
});

router.post("/menu-items", authenticate, async (req, res) => {
  const parse = CreateMenuItemBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const [item] = await db
    .insert(menuItemsTable)
    .values({ ...parse.data, available: parse.data.available ?? true })
    .returning();
  res.status(201).json(formatMenuItem(item));
});

router.get("/menu-items/categories", authenticate, async (req, res) => {
  const rows = await db.selectDistinct({ category: menuItemsTable.category }).from(menuItemsTable).orderBy(menuItemsTable.category);
  res.json(rows.map((r) => r.category));
});

router.get("/menu-items/top-selling", authenticate, async (req, res) => {
  const limit = Math.min(Number(req.query.limit ?? 10), 50);
  const rows = await db
    .select({
      menuItemId: orderItemsTable.menuItemId,
      name: orderItemsTable.menuItemName,
      totalQuantity: sql<number>`sum(${orderItemsTable.quantity})::int`,
      totalRevenue: sql<number>`sum(${orderItemsTable.subtotal})`,
    })
    .from(orderItemsTable)
    .groupBy(orderItemsTable.menuItemId, orderItemsTable.menuItemName)
    .orderBy(desc(sql`sum(${orderItemsTable.quantity})`))
    .limit(limit);

  const withCategory = await Promise.all(
    rows.map(async (r) => {
      const [item] = await db.select({ category: menuItemsTable.category }).from(menuItemsTable).where(eq(menuItemsTable.id, r.menuItemId)).limit(1);
      return { ...r, category: item?.category ?? "Unknown" };
    })
  );
  res.json(withCategory);
});

router.get("/menu-items/:id", authenticate, async (req, res) => {
  const id = Number(req.params.id);
  const [item] = await db.select().from(menuItemsTable).where(eq(menuItemsTable.id, id)).limit(1);
  if (!item) {
    res.status(404).json({ error: "Menu item not found" });
    return;
  }
  res.json(formatMenuItem(item));
});

router.patch("/menu-items/:id", authenticate, async (req, res) => {
  const id = Number(req.params.id);
  const parse = UpdateMenuItemBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const [item] = await db.update(menuItemsTable).set(parse.data).where(eq(menuItemsTable.id, id)).returning();
  if (!item) {
    res.status(404).json({ error: "Menu item not found" });
    return;
  }
  res.json(formatMenuItem(item));
});

router.delete("/menu-items/:id", authenticate, async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(menuItemsTable).where(eq(menuItemsTable.id, id));
  res.status(204).send();
});

function formatMenuItem(item: typeof menuItemsTable.$inferSelect) {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    price: item.price,
    description: item.description ?? null,
    available: item.available,
    createdAt: item.createdAt.toISOString(),
  };
}

export default router;
