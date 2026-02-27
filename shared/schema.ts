import { z } from "zod";

export const providerNameSchema = z.enum([
  "cerebras",
  "unrealspeech",
  "cloudflare",
  "serpstack",
  "catbox",
  "facebook",
]);

export type ProviderName = z.infer<typeof providerNameSchema>;

export const apiKeySchema = z.object({
  id: z.string(),
  key: z.string().min(1),
  label: z.string().optional(),
  active: z.boolean().default(true),
  failureCount: z.number().int().nonnegative().default(0),
  usageCount: z.number().int().nonnegative().default(0),
  lastUsedAt: z.string().optional(),
  lastFailureAt: z.string().optional(),
  createdAt: z.string(),
});

export const scriptOutputSchema = z.object({
  hook: z.string(),
  narrative: z.string(),
  cta: z.string(),
  firstComment: z.string(),
  title: z.string(),
});

export const scheduleTypeSchema = z.enum(["once", "daily"]);

export const queueJobSchema = z.object({
  id: z.string(),
  runAt: z.string(),
  type: scheduleTypeSchema,
  payload: z.object({ topic: z.string().min(5), manual: z.boolean().default(false) }),
  status: z.enum(["pending", "running", "success", "failed"]).default("pending"),
  retries: z.number().int().nonnegative().default(0),
  lastError: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const generationRequestSchema = z.object({
  topic: z.string().min(5),
  scheduleAt: z.string().datetime().optional(),
  recurringDaily: z.boolean().default(false),
});

export const providerKeyMutationSchema = z.object({
  provider: providerNameSchema,
  key: z.string().min(1),
  label: z.string().optional(),
});

export const removeProviderKeySchema = z.object({
  provider: providerNameSchema,
  id: z.string().min(1),
});

export const facebookSettingsSchema = z.object({
  pageId: z.string().optional().default(""),
  manualPageAccessToken: z.string().optional().default(""),
  sessionAccessToken: z.string().optional().default(""),
});

export const systemSettingsSchema = z.object({
  musicTrackPath: z.string().optional().default(""),
  subtitleStyle: z.string().optional().default("cyber"),
  autoCleanupHours: z.number().int().positive().default(6),
});

export const postRecordSchema = z.object({
  id: z.string(),
  topic: z.string(),
  script: scriptOutputSchema,
  status: z.enum(["generated", "uploaded", "published", "failed"]),
  catboxUrl: z.string().optional(),
  facebookPostId: z.string().optional(),
  error: z.string().optional(),
  generationMs: z.number().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const logEntrySchema = z.object({
  id: z.string(),
  level: z.enum(["info", "warn", "error"]),
  source: z.string(),
  message: z.string(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string(),
});

export const analyticsSchema = z.object({
  published: z.number().int().nonnegative().default(0),
  failures: z.number().int().nonnegative().default(0),
  generated: z.number().int().nonnegative().default(0),
  totalGenerationMs: z.number().nonnegative().default(0),
  providerFailures: z.record(z.number().int().nonnegative()).default({}),
  apiUsage: z.record(z.number().int().nonnegative()).default({}),
  updatedAt: z.string(),
});

export type QueueJob = z.infer<typeof queueJobSchema>;
export type PostRecord = z.infer<typeof postRecordSchema>;
export type ApiKey = z.infer<typeof apiKeySchema>;

// Legacy exports kept for backward compatibility with existing client modules.
export const insertSubmissionSchema = z.object({
  name: z.string().optional().default(""),
  email: z.string().email().optional().default("demo@example.com"),
  walletAddresses: z.array(z.string()).optional().default([]),
  description: z.string().optional().default(""),
  amountLost: z.string().optional(),
  evidenceFiles: z.array(z.string()).optional().default([]),
});
export const insertAdminSettingsSchema = z.object({ password: z.string().optional() });
export const insertPushSubscriptionSchema = z.object({ endpoint: z.string(), p256dh: z.string(), auth: z.string(), userAgent: z.string().optional() });
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Submission = { id: number; caseId: string } & InsertSubmission;
export type AdminSettings = { id: number; password: string; whatsappNumber: string; logoUrl: string | null; notificationsEnabled: string; address: string };
export type InsertAdminSettings = z.infer<typeof insertAdminSettingsSchema>;
export type PushSubscription = { id: number; endpoint: string; p256dh: string; auth: string; userAgent?: string; createdAt: Date };
export type InsertPushSubscription = z.infer<typeof insertPushSubscriptionSchema>;
export const submissions = { $inferSelect: {} as Submission };
export const adminSettings = { $inferSelect: {} as AdminSettings };
export const pushSubscriptions = { $inferSelect: {} as PushSubscription };
