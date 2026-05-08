import { pgTable, integer, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tablesTable = pgTable("tables", {
  id: serial("id").primaryKey(),
  number: integer("number").notNull().unique(),
  capacity: integer("capacity").notNull(),
  status: text("status", { enum: ["available", "occupied", "cooking", "ready", "billing"] })
    .notNull()
    .default("available"),
  currentOrderId: integer("current_order_id"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertTableSchema = createInsertSchema(tablesTable).omit({ id: true, updatedAt: true });
export type InsertTable = z.infer<typeof insertTableSchema>;
export type RestaurantTable = typeof tablesTable.$inferSelect;
