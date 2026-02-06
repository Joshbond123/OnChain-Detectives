import {
  submissions,
  adminSettings,
  type InsertSubmission,
  type Submission,
  type AdminSettings,
  type InsertAdminSettings
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  getSubmissions(): Promise<Submission[]>;
  getAdminSettings(): Promise<AdminSettings>;
  updateAdminSettings(settings: Partial<InsertAdminSettings>): Promise<AdminSettings>;
}

export class DatabaseStorage implements IStorage {
  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const [submission] = await db.insert(submissions).values(insertSubmission).returning();
    return submission;
  }

  async getSubmissions(): Promise<Submission[]> {
    return await db.select().from(submissions).orderBy(submissions.createdAt);
  }

  async getAdminSettings(): Promise<AdminSettings> {
    let [settings] = await db.select().from(adminSettings);
    if (!settings) {
      [settings] = await db.insert(adminSettings).values({ password: "12345", whatsappNumber: "" }).returning();
    }
    return settings;
  }

  async updateAdminSettings(updates: Partial<InsertAdminSettings>): Promise<AdminSettings> {
    const settings = await this.getAdminSettings();
    const [updated] = await db
      .update(adminSettings)
      .set(updates)
      .where(eq(adminSettings.id, settings.id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
