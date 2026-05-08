import { Router } from "express";
import { db } from "@workspace/db";
import { paymentsTable, ordersTable, tablesTable } from "@workspace/db";
import { eq, and, sql, gte, lte, desc } from "drizzle-orm";
import { authenticate } from "../middlewares/auth";
import { CreatePaymentBody } from "@workspace/api-zod";

const router = Router();

router.get("/payments/daily-report", authenticate, async (req, res) => {
  const date = String(req.query.date ?? new Date().toISOString().slice(0, 10));

  const payments = await db
    .select()
    .from(paymentsTable)
    .where(sql`DATE(${paymentsTable.createdAt}) = ${date}`);

  const totalRevenue = payments.reduce((s, p) => s + p.totalAmount, 0);
  const cashRevenue = payments.filter((p) => p.method === "cash").reduce((s, p) => s + p.totalAmount, 0);
  const upiRevenue = payments.filter((p) => p.method === "upi").reduce((s, p) => s + p.totalAmount, 0);
  const cardRevenue = payments.filter((p) => p.method === "card").reduce((s, p) => s + p.totalAmount, 0);
  const totalOrders = payments.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  res.json({
    date,
    totalRevenue,
    totalOrders,
    totalCustomers: totalOrders,
    cashRevenue,
    upiRevenue,
    cardRevenue,
    avgOrderValue,
  });
});

router.get("/payments/monthly-chart", authenticate, async (req, res) => {
  const now = new Date();
  const year = Number(req.query.year ?? now.getFullYear());
  const month = Number(req.query.month ?? now.getMonth() + 1);

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const payments = await db
    .select()
    .from(paymentsTable)
    .where(and(gte(paymentsTable.createdAt, startDate), lte(paymentsTable.createdAt, endDate)));

  const dayMap = new Map<string, { revenue: number; orders: number }>();
  for (const p of payments) {
    const day = p.createdAt.toISOString().slice(0, 10);
    const existing = dayMap.get(day) ?? { revenue: 0, orders: 0 };
    dayMap.set(day, { revenue: existing.revenue + p.totalAmount, orders: existing.orders + 1 });
  }

  const daysInMonth = endDate.getDate();
  const result = Array.from({ length: daysInMonth }, (_, i) => {
    const day = String(i + 1).padStart(2, "0");
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${day}`;
    const data = dayMap.get(dateStr) ?? { revenue: 0, orders: 0 };
    return { date: dateStr, ...data };
  });

  res.json(result);
});

router.get("/payments", authenticate, async (req, res) => {
  const { date, method } = req.query;
  let query = db.select().from(paymentsTable).$dynamic();

  const conditions = [];
  if (date) conditions.push(sql`DATE(${paymentsTable.createdAt}) = ${date}`);
  if (method) conditions.push(eq(paymentsTable.method, String(method) as any));

  if (conditions.length > 0) {
    const { and } = await import("drizzle-orm");
    query = query.where(and(...conditions));
  }

  const payments = await query.orderBy(desc(paymentsTable.createdAt));

  const result = await Promise.all(
    payments.map(async (p) => {
      const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, p.orderId)).limit(1);
      const [table] = order ? await db.select().from(tablesTable).where(eq(tablesTable.id, order.tableId)).limit(1) : [null];
      return formatPayment(p, table?.number ?? 0);
    })
  );

  res.json(result);
});

router.post("/payments", authenticate, async (req, res) => {
  const parse = CreatePaymentBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { orderId, discount = 0, method, taxRate = 0.05 } = parse.data;

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId)).limit(1);
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const subtotal = order.totalAmount;
  const tax = subtotal * taxRate;
  const totalAmount = subtotal + tax - (discount ?? 0);

  const [payment] = await db
    .insert(paymentsTable)
    .values({ orderId, subtotal, tax, discount: discount ?? 0, totalAmount, method, status: "completed" })
    .returning();

  await db.update(ordersTable).set({ status: "completed" }).where(eq(ordersTable.id, orderId));
  const [table] = await db.select().from(tablesTable).where(eq(tablesTable.id, order.tableId)).limit(1);
  if (table) {
    await db.update(tablesTable).set({ status: "available", currentOrderId: null }).where(eq(tablesTable.id, order.tableId));
  }

  res.status(201).json(formatPayment(payment, table?.number ?? 0));
});

router.get("/payments/:id", authenticate, async (req, res) => {
  const id = Number(req.params.id);
  const [payment] = await db.select().from(paymentsTable).where(eq(paymentsTable.id, id)).limit(1);
  if (!payment) {
    res.status(404).json({ error: "Payment not found" });
    return;
  }
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, payment.orderId)).limit(1);
  const [table] = order ? await db.select().from(tablesTable).where(eq(tablesTable.id, order.tableId)).limit(1) : [null];
  res.json(formatPayment(payment, table?.number ?? 0));
});

function formatPayment(p: typeof paymentsTable.$inferSelect, tableNumber: number) {
  return {
    id: p.id,
    orderId: p.orderId,
    tableNumber,
    subtotal: p.subtotal,
    tax: p.tax,
    discount: p.discount,
    totalAmount: p.totalAmount,
    method: p.method,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
  };
}

export default router;
