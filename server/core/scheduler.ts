import { randomUUID } from "crypto";
import { queueJobSchema, type QueueJob } from "@shared/schema";
import { getStoreFiles, readJson, writeJson } from "./fileStore";
import { runGeneration, collectStaleAssets } from "./pipeline";
import { logEvent } from "./logger";
import { notifications } from "./notifications";

class OnDemandScheduler {
  private timer?: NodeJS.Timeout;

  async init() {
    await this.planNext();
  }

  async enqueue(topic: string, runAt: string, type: "once" | "daily") {
    const jobs = await this.getJobs();
    const now = new Date().toISOString();
    jobs.push(
      queueJobSchema.parse({
        id: randomUUID(),
        runAt,
        type,
        payload: { topic, manual: true },
        status: "pending",
        retries: 0,
        createdAt: now,
        updatedAt: now,
      }),
    );
    await writeJson(getStoreFiles().queue, jobs);
    await this.planNext();
  }

  async triggerNow(topic: string, facebook: { pageId?: string; manualPageAccessToken?: string; sessionAccessToken?: string }) {
    await runGeneration(topic, facebook);
    notifications.emit("GenerationCompleted", { topic });
  }

  async getJobs() {
    const jobs = await readJson(getStoreFiles().queue, [] as unknown[]);
    return jobs.map((j) => queueJobSchema.parse(j));
  }

  private async planNext() {
    if (this.timer) clearTimeout(this.timer);
    const jobs = await this.getJobs();
    const next = jobs
      .filter((j) => j.status === "pending")
      .sort((a, b) => Date.parse(a.runAt) - Date.parse(b.runAt))[0];
    if (!next) return;
    const delay = Math.max(0, Date.parse(next.runAt) - Date.now());
    this.timer = setTimeout(() => this.executeDue().catch(console.error), delay);
  }

  private async executeDue() {
    const jobs = await this.getJobs();
    const due = jobs.filter((j) => j.status === "pending" && Date.parse(j.runAt) <= Date.now());
    for (const job of due) {
      await this.executeJob(job, jobs);
    }
    await this.planNext();
  }

  private async executeJob(job: QueueJob, allJobs: QueueJob[]) {
    job.status = "running";
    job.updatedAt = new Date().toISOString();
    await writeJson(getStoreFiles().queue, allJobs);
    const settings = await readJson<any>(getStoreFiles().settings, { facebook: {}, system: {} });
    try {
      await runGeneration(job.payload.topic, settings.facebook || {});
      job.status = "success";
      if (job.type === "daily") {
        job.status = "pending";
        const date = new Date(job.runAt);
        date.setUTCDate(date.getUTCDate() + 1);
        job.runAt = date.toISOString();
      }
      await collectStaleAssets(settings.system?.autoCleanupHours ?? 6);
    } catch (error) {
      job.retries += 1;
      job.status = job.retries > 2 ? "failed" : "pending";
      job.lastError = error instanceof Error ? error.message : "unknown";
      if (job.status === "pending") {
        job.runAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      }
      await logEvent("error", "scheduler", "job failed", { jobId: job.id, error: job.lastError });
    }
    job.updatedAt = new Date().toISOString();
    await writeJson(getStoreFiles().queue, allJobs);
  }
}

export const scheduler = new OnDemandScheduler();
