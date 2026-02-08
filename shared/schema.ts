import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  caseId: text("case_id").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  walletAddresses: text("wallet_addresses").array(),
  description: text("description").notNull(),
  amountLost: text("amount_lost"),
  evidenceFiles: text("evidence_files").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adminSettings = pgTable("admin_settings", {
  id: serial("id").primaryKey(),
  password: text("password").notNull().default("12345"),
  whatsappNumber: text("whatsapp_number").notNull().default(""),
  logoUrl: text("logo_url"),
  notificationsEnabled: text("notifications_enabled").notNull().default("false"),
  address: text("address").notNull().default("Secure Operations Center: London, UK"),
});

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: serial("id").primaryKey(),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSubmissionSchema = createInsertSchema(submissions).omit({
  id: true,
  caseId: true,
  createdAt: true,
}).extend({
  email: z.string().email("Invalid email address"),
  walletAddresses: z.array(z.string().min(10, "Wallet address too short")).optional().default([]),
});

export const insertAdminSettingsSchema = createInsertSchema(adminSettings).omit({
  id: true,
});

export const insertPushSubscriptionSchema = createInsertSchema(pushSubscriptions).omit({
  id: true,
  createdAt: true,
});

export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Submission = typeof submissions.$inferSelect;
export type AdminSettings = typeof adminSettings.$inferSelect;
export type InsertAdminSettings = z.infer<typeof insertAdminSettingsSchema>;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = z.infer<typeof insertPushSubscriptionSchema>;
