import { Router } from "express";
import { db } from "@workspace/db";
import { paymentsTable, ordersTable, tablesTable, inventoryTable, expensesTable, usersTable, orderItemsTable } from "@workspace/db";
import { eq, sql, and, gte, lte, desc, inArray } from "drizzle-orm";
import { authenticate, requireRole } from "../middlewares/auth";

const router = Router();

router.get("/analytics/owner-dashboard", authenticate, requireRole("owner"), async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const todayPayments = await db.select().from(paymentsTable).where(sql`DATE(${paymentsTable.createdAt}) = ${today}`);
  const todayRevenue = todayPayments.reduce((s, p) => s + p.totalAmount, 0);
  const todayOrders = todayPayments.length;

  const monthPayments = await db.select().from(paymentsTable).where(and(gte(paymentsTable.createdAt, monthStart), lte(paymentsTable.createdAt, monthEnd)));
  const monthRevenue = monthPayments.reduce((s, p) => s + p.totalAmount, 0);
  const monthOrders = monthPayments.length;

  const allTables = await db.select().from(tablesTable);
  const occupiedCount = allTables.filter((t) => t.status !== "available").length;
  const tableOccupancyRate = allTables.length > 0 ? (occupiedCount / allTables.length) * 100 : 0;

  const lowStockItems = await db.select().from(inventoryTable).where(sql`${inventoryTable.quantity} <= ${inventoryTable.lowStockThreshold}`);
  const lowStockCount = lowStockItems.length;

  const monthExpenses = await db
    .select()
    .from(expensesTable)
    .where(sql`EXTRACT(MONTH FROM ${expensesTable.createdAt}) = ${now.getMonth() + 1} AND EXTRACT(YEAR FROM ${expensesTable.createdAt}) = ${now.getFullYear()}`);
  const totalExpensesThisMonth = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const netProfitThisMonth = monthRevenue - totalExpensesThisMonth;

  res.json({
    todayRevenue,
    todayOrders,
    todayCustomers: todayOrders,
    monthRevenue,
    monthOrders,
    tableOccupancyRate: Math.round(tableOccupancyRate),
    totalExpensesThisMonth,
    netProfitThisMonth,
    lowStockCount,
  });
});

router.get("/analytics/staff-performance", authenticate, requireRole("owner"), async (req, res) => {
  const waiters = await db.select().from(usersTable).where(eq(usersTable.role, "waiter"));

  const result = await Promise.all(
    waiters.map(async (waiter) => {
      const waiterOrders = await db.select().from(ordersTable).where(eq(ordersTable.waiterId, waiter.id));
      const completedOrderIds = waiterOrders.filter((o) => o.status === "completed").map((o) => o.id);

      let totalRevenue = 0;
      if (completedOrderIds.length > 0) {
        const payments = await db.select().from(paymentsTable).where(inArray(paymentsTable.orderId, completedOrderIds));
        totalRevenue = payments.reduce((s, p) => s + p.totalAmount, 0);
      }

      return {
        userId: waiter.id,
        name: waiter.name,
        role: waiter.role,
        totalOrders: waiterOrders.length,
        totalRevenue,
      };
    })
  );

  res.json(result.sort((a, b) => b.totalRevenue - a.totalRevenue));
});

export default router;
