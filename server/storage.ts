import {
  submissions,
  adminSettings,
  pushSubscriptions,
  type InsertSubmission,
  type Submission,
  type AdminSettings,
  type InsertAdminSettings,
  type PushSubscription,
  type InsertPushSubscription
} from "@shared/schema";
import fs from "fs/promises";
import path from "path";

export interface IStorage {
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  getSubmissions(): Promise<Submission[]>;
  deleteSubmission(id: number): Promise<void>;
  getAdminSettings(): Promise<AdminSettings>;
  updateAdminSettings(settings: Partial<InsertAdminSettings>): Promise<AdminSettings>;
  addPushSubscription(sub: InsertPushSubscription): Promise<PushSubscription>;
  getPushSubscriptions(): Promise<PushSubscription[]>;
  removePushSubscription(endpoint: string): Promise<void>;
}

export class FileStorage implements IStorage {
  private submissionsPath = path.join(process.cwd(), "Database", "submissions.json");
  private settingsPath = path.join(process.cwd(), "Database", "admin_settings.json");
  private pushSubscriptionsPath = path.join(process.cwd(), "Database", "push_subscriptions.json");

  private async readJson<T>(filePath: string, defaultValue: T): Promise<T> {
    try {
      const data = await fs.readFile(filePath, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      return defaultValue;
    }
  }

  private async writeJson<T>(filePath: string, data: T): Promise<void> {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const data = await this.readJson<Submission[]>(this.submissionsPath, []);
    
    // Generate unique Case ID: 5 digits + 2 capital letters
    const generateCaseId = () => {
      const digits = Math.floor(10000 + Math.random() * 90000).toString();
      const letters = String.fromCharCode(65 + Math.random() * 26) + String.fromCharCode(65 + Math.random() * 26);
      return `${digits}${letters}`;
    };

    let caseId = generateCaseId();
    while (data.some(s => s.caseId === caseId)) {
      caseId = generateCaseId();
    }

    const newSubmission: Submission = {
      ...insertSubmission,
      id: data.length + 1,
      caseId,
      createdAt: new Date(),
      amountLost: insertSubmission.amountLost ?? null,
      walletAddresses: insertSubmission.walletAddresses ?? [],
      evidenceFiles: insertSubmission.evidenceFiles ?? [],
    };
    data.push(newSubmission);
    await this.writeJson(this.submissionsPath, data);
    return newSubmission;
  }

  async getSubmissions(): Promise<Submission[]> {
    return await this.readJson<Submission[]>(this.submissionsPath, []);
  }

  async deleteSubmission(id: number): Promise<void> {
    const data = await this.readJson<Submission[]>(this.submissionsPath, []);
    const filtered = data.filter(sub => sub.id !== id);
    await this.writeJson(this.submissionsPath, filtered);
  }

  async getAdminSettings(): Promise<AdminSettings> {
    let settings = await this.readJson<AdminSettings | null>(this.settingsPath, null);
    if (!settings) {
      settings = { id: 1, password: "12345", whatsappNumber: "", logoUrl: null, notificationsEnabled: "false" };
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

  async addPushSubscription(sub: InsertPushSubscription): Promise<PushSubscription> {
    const data = await this.readJson<PushSubscription[]>(this.pushSubscriptionsPath, []);
    const existing = data.find(s => s.endpoint === sub.endpoint);
    if (existing) return existing;

    const newSub: PushSubscription = {
      ...sub,
      id: data.length + 1,
      createdAt: new Date(),
      userAgent: sub.userAgent ?? null,
    };
    data.push(newSub);
    await this.writeJson(this.pushSubscriptionsPath, data);
    return newSub;
  }

  async getPushSubscriptions(): Promise<PushSubscription[]> {
    return await this.readJson<PushSubscription[]>(this.pushSubscriptionsPath, []);
  }

  async removePushSubscription(endpoint: string): Promise<void> {
    const data = await this.readJson<PushSubscription[]>(this.pushSubscriptionsPath, []);
    const filtered = data.filter(s => s.endpoint !== endpoint);
    await this.writeJson(this.pushSubscriptionsPath, filtered);
  }
}

export const storage = new FileStorage();
