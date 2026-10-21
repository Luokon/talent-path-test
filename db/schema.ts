import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const redemptionCodes = sqliteTable("redemption_codes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  codeHash: text("code_hash").notNull().unique(),
  label: text("label"),
  maxUses: integer("max_uses").notNull().default(1),
  usedCount: integer("used_count").notNull().default(0),
  createdAt: integer("created_at").notNull(),
  disabledAt: integer("disabled_at"),
});

export const testSessions = sqliteTable("test_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tokenHash: text("token_hash").notNull().unique(),
  codeId: integer("code_id").notNull().references(() => redemptionCodes.id),
  createdAt: integer("created_at").notNull(),
  completedAt: integer("completed_at"),
});
