import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, orderItemsTable, tablesTable, menuItemsTable, usersTable } from "@workspace/db";
import { eq, and, inArray, sql } from "drizzle-orm";
import { authenticate } from "../middlewares/auth";
import { CreateOrderBody, UpdateOrderBody } from "@workspace/api-zod";
import { getIo } from "../lib/socket";

const router = Router();

async function buildOrderResponse(orderId: number) {
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId)).limit(1);
  if (!order) return null;

  const [table] = await db.select().from(tablesTable).where(eq(tablesTable.id, order.tableId)).limit(1);
  const [waiter] = await db.select().from(usersTable).where(eq(usersTable.id, order.waiterId)).limit(1);
  const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, orderId));

  return {
    id: order.id,
    tableId: order.tableId,
    tableNumber: table?.number ?? 0,
    waiterId: order.waiterId,
    waiterName: waiter?.name ?? "Unknown",
    status: order.status,
    items: items.map((i) => ({
      id: i.id,
      orderId: i.orderId,
      menuItemId: i.menuItemId,
      menuItemName: i.menuItemName,
      menuItemPrice: i.menuItemPrice,
      quantity: i.quantity,
      notes: i.notes ?? null,
      subtotal: i.subtotal,
    })),
    totalAmount: order.totalAmount,
    notes: order.notes ?? null,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

router.get("/orders/active", authenticate, async (req, res) => {
  const activeStatuses = ["pending", "preparing", "ready"];
  const orders = await db
    .select()
    .from(ordersTable)
    .where(inArray(ordersTable.status, activeStatuses))
    .orderBy(ordersTable.createdAt);

  const result = await Promise.all(orders.map((o) => buildOrderResponse(o.id)));
  res.json(result.filter(Boolean));
});

router.get("/orders", authenticate, async (req, res) => {
  const { status, tableId, date } = req.query;
  let query = db.select().from(ordersTable).$dynamic();

  const conditions = [];
  if (status) {
    const statuses = String(status).split(",");
    conditions.push(inArray(ordersTable.status, statuses as any[]));
  }
  if (tableId) conditions.push(eq(ordersTable.tableId, Number(tableId)));
  if (date) {
    conditions.push(sql`DATE(${ordersTable.createdAt}) = ${date}`);
  }

  if (conditions.length > 0) {
    const { and } = await import("drizzle-orm");
    query = query.where(and(...conditions));
  }

  const orders = await query.orderBy(ordersTable.createdAt);
  const result = await Promise.all(orders.map((o) => buildOrderResponse(o.id)));
  res.json(result.filter(Boolean));
});

router.post("/orders", authenticate, async (req, res) => {
  const parse = CreateOrderBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { tableId, items, notes } = parse.data;

  const menuItems = await db
    .select()
    .from(menuItemsTable)
    .where(inArray(menuItemsTable.id, items.map((i) => i.menuItemId)));

  const menuMap = new Map(menuItems.map((m) => [m.id, m]));

  let totalAmount = 0;
  const orderItemsData = items.map((i) => {
    const menu = menuMap.get(i.menuItemId);
    if (!menu) throw new Error(`Menu item ${i.menuItemId} not found`);
    const subtotal = menu.price * i.quantity;
    totalAmount += subtotal;
    return {
      menuItemId: i.menuItemId,
      menuItemName: menu.name,
      menuItemPrice: menu.price,
      quantity: i.quantity,
      notes: i.notes ?? null,
      subtotal,
    };
  });

  const [order] = await db
    .insert(ordersTable)
    .values({ tableId, waiterId: req.user!.userId, notes: notes ?? null, totalAmount })
    .returning();

  const orderItemsWithOrderId = orderItemsData.map((oi) => ({ ...oi, orderId: order.id }));
  await db.insert(orderItemsTable).values(orderItemsWithOrderId);

  await db.update(tablesTable).set({ status: "occupied", currentOrderId: order.id }).where(eq(tablesTable.id, tableId));

  const response = await buildOrderResponse(order.id);

  const io = getIo();
  if (io) io.emit("order:new", response);

  res.status(201).json(response);
});

router.get("/orders/:id", authenticate, async (req, res) => {
  const id = Number(req.params.id);
  const order = await buildOrderResponse(id);
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(order);
});

router.patch("/orders/:id", authenticate, async (req, res) => {
  const id = Number(req.params.id);
  const parse = UpdateOrderBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { status, items, notes } = parse.data;

  const updateData: any = {};
  if (status) updateData.status = status;
  if (notes !== undefined) updateData.notes = notes;

  if (items && items.length > 0) {
    const menuItems = await db
      .select()
      .from(menuItemsTable)
      .where(inArray(menuItemsTable.id, items.map((i) => i.menuItemId)));
    const menuMap = new Map(menuItems.map((m) => [m.id, m]));

    let totalAmount = 0;
    const newOrderItems = items.map((i) => {
      const menu = menuMap.get(i.menuItemId);
      if (!menu) throw new Error(`Menu item ${i.menuItemId} not found`);
      const subtotal = menu.price * i.quantity;
      totalAmount += subtotal;
      return { orderId: id, menuItemId: i.menuItemId, menuItemName: menu.name, menuItemPrice: menu.price, quantity: i.quantity, notes: i.notes ?? null, subtotal };
    });

    await db.delete(orderItemsTable).where(eq(orderItemsTable.orderId, id));
    await db.insert(orderItemsTable).values(newOrderItems);
    updateData.totalAmount = totalAmount;
  }

  if (Object.keys(updateData).length > 0) {
    await db.update(ordersTable).set(updateData).where(eq(ordersTable.id, id));
  }

  if (status) {
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id)).limit(1);
    if (order) {
      let tableStatus: string | null = null;
      if (status === "preparing") tableStatus = "cooking";
      else if (status === "ready") tableStatus = "ready";
      else if (status === "billing") tableStatus = "billing";
      else if (status === "completed" || status === "cancelled") {
        tableStatus = "available";
        await db.update(tablesTable).set({ status: "available", currentOrderId: null }).where(eq(tablesTable.id, order.tableId));
      }
      if (tableStatus && tableStatus !== "available") {
        await db.update(tablesTable).set({ status: tableStatus as any }).where(eq(tablesTable.id, order.tableId));
      }
    }
  }

  const response = await buildOrderResponse(id);
  if (!response) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const io = getIo();
  if (io) io.emit("order:updated", response);

  res.json(response);
});

router.delete("/orders/:id", authenticate, async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(ordersTable).where(eq(ordersTable.id, id));
  res.status(204).send();
});

export default router;
