import {
  submissions,
  adminSettings,
  type InsertSubmission,
  type Submission,
  type AdminSettings,
  type InsertAdminSettings
} from "@shared/schema";
import fs from "fs/promises";
import path from "path";

export interface IStorage {
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  getSubmissions(): Promise<Submission[]>;
  getAdminSettings(): Promise<AdminSettings>;
  updateAdminSettings(settings: Partial<InsertAdminSettings>): Promise<AdminSettings>;
}

export class FileStorage implements IStorage {
  private submissionsPath = path.join(process.cwd(), "Database", "submissions.json");
  private settingsPath = path.join(process.cwd(), "Database", "admin_settings.json");

  private async readJson<T>(filePath: string, defaultValue: T): Promise<T> {
    try {
      const data = await fs.readFile(filePath, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      return defaultValue;
    }
  }

  private async writeJson<T>(filePath: string, data: T): Promise<void> {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const data = await this.readJson<Submission[]>(this.submissionsPath, []);
    const newSubmission: Submission = {
      ...insertSubmission,
      id: data.length + 1,
      createdAt: new Date(),
      amountLost: insertSubmission.amountLost ?? null,
      platform: insertSubmission.platform ?? null,
    };
    data.push(newSubmission);
    await this.writeJson(this.submissionsPath, data);
    return newSubmission;
  }

  async getSubmissions(): Promise<Submission[]> {
    return await this.readJson<Submission[]>(this.submissionsPath, []);
  }

  async getAdminSettings(): Promise<AdminSettings> {
    let settings = await this.readJson<AdminSettings | null>(this.settingsPath, null);
    if (!settings) {
      settings = { id: 1, password: "12345", whatsappNumber: "" };
      await this.writeJson(this.settingsPath, settings);
    }
    return settings;
  }

  async updateAdminSettings(updates: Partial<InsertAdminSettings>): Promise<AdminSettings> {
    const current = await this.getAdminSettings();
    const updated = { ...current, ...updates };
    await this.writeJson(this.settingsPath, updated);
    return updated;
  }
}

export const storage = new FileStorage();
