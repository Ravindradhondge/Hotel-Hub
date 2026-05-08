import { pgTable, text, serial, timestamp, integer, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { ordersTable } from "./orders";

export const paymentsTable = pgTable("payments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => ordersTable.id),
  subtotal: doublePrecision("subtotal").notNull(),
  tax: doublePrecision("tax").notNull().default(0),
  discount: doublePrecision("discount").notNull().default(0),
  totalAmount: doublePrecision("total_amount").notNull(),
  method: text("method", { enum: ["cash", "upi", "card"] }).notNull(),
  status: text("status", { enum: ["pending", "completed"] }).notNull().default("completed"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(paymentsTable).omit({ id: true, createdAt: true });
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof paymentsTable.$inferSelect;
