import { Router } from "express";
import { db } from "@workspace/db";
import { expensesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { authenticate } from "../middlewares/auth";
import { CreateExpenseBody, UpdateExpenseBody } from "@workspace/api-zod";

const router = Router();

router.get("/expenses", authenticate, async (req, res) => {
  const { month, year } = req.query;
  let query = db.select().from(expensesTable).$dynamic();

  if (month && year) {
    query = query.where(
      sql`EXTRACT(MONTH FROM ${expensesTable.createdAt}) = ${Number(month)} AND EXTRACT(YEAR FROM ${expensesTable.createdAt}) = ${Number(year)}`
    );
  }

  const expenses = await query.orderBy(expensesTable.date);
  res.json(expenses.map(formatExpense));
});

router.post("/expenses", authenticate, async (req, res) => {
  const parse = CreateExpenseBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const [expense] = await db.insert(expensesTable).values(parse.data).returning();
  res.status(201).json(formatExpense(expense));
});

router.get("/expenses/:id", authenticate, async (req, res) => {
  const id = Number(req.params.id);
  const [expense] = await db.select().from(expensesTable).where(eq(expensesTable.id, id)).limit(1);
  if (!expense) {
    res.status(404).json({ error: "Expense not found" });
    return;
  }
  res.json(formatExpense(expense));
});

router.patch("/expenses/:id", authenticate, async (req, res) => {
  const id = Number(req.params.id);
  const parse = UpdateExpenseBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const [expense] = await db.update(expensesTable).set(parse.data).where(eq(expensesTable.id, id)).returning();
  if (!expense) {
    res.status(404).json({ error: "Expense not found" });
    return;
  }
  res.json(formatExpense(expense));
});

router.delete("/expenses/:id", authenticate, async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(expensesTable).where(eq(expensesTable.id, id));
  res.status(204).send();
});

function formatExpense(e: typeof expensesTable.$inferSelect) {
  return {
    id: e.id,
    description: e.description,
    amount: e.amount,
    category: e.category,
    date: e.date,
    createdAt: e.createdAt.toISOString(),
  };
}

export default router;
