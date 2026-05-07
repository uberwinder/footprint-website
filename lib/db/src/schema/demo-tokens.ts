import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const demoTokensTable = pgTable("demo_tokens", {
  id: serial("id").primaryKey(),
  token: text("token").unique().notNull(),
  email: text("email").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  used: boolean("used").notNull().default(false),
  appAccessed: boolean("app_accessed").notNull().default(false),
});

export const insertDemoTokenSchema = createInsertSchema(demoTokensTable).omit({
  id: true,
  createdAt: true,
});
export type InsertDemoToken = z.infer<typeof insertDemoTokenSchema>;
export type DemoToken = typeof demoTokensTable.$inferSelect;
