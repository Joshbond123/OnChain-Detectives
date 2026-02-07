import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  walletAddress: text("wallet_address"),
  description: text("description").notNull(),
  amountLost: text("amount_lost"),
  platform: text("platform"),
  evidenceFiles: text("evidence_files").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adminSettings = pgTable("admin_settings", {
  id: serial("id").primaryKey(),
  password: text("password").notNull().default("12345"),
  whatsappNumber: text("whatsapp_number").notNull().default(""),
});

export const insertSubmissionSchema = createInsertSchema(submissions).omit({
  id: true,
  createdAt: true,
}).extend({
  email: z.string().email("Invalid email address"),
  walletAddress: z.string().min(10, "Wallet address too short"),
});

export const insertAdminSettingsSchema = createInsertSchema(adminSettings).omit({
  id: true,
});

export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Submission = typeof submissions.$inferSelect;
export type AdminSettings = typeof adminSettings.$inferSelect;
export type InsertAdminSettings = z.infer<typeof insertAdminSettingsSchema>;
