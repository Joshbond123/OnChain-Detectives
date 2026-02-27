import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { execFile } from "child_process";
import { promisify } from "util";
import { postRecordSchema, scriptOutputSchema } from "@shared/schema";
import { getAssetsDir, getStoreFiles, readJson, writeJson } from "./fileStore";
import { logEvent } from "./logger";
import { notifications } from "./notifications";
import { fetchTrendingNews, generateImage, generateScript, publishFacebook, synthVoiceover, uploadCatbox } from "../providers/integrations";

const exec = promisify(execFile);

async function compileVideo(imagePath: string, voicePath: string, outPath: string) {
  await exec("ffmpeg", [
    "-y",
    "-loop",
    "1",
    "-i",
    imagePath,
    "-i",
    voicePath,
    "-shortest",
    "-vf",
    "scale=1080:1920,format=yuv420p",
    "-c:v",
    "libx264",
    "-c:a",
    "aac",
    outPath,
  ]);
}

export async function runGeneration(topic: string, facebook: { pageId?: string; manualPageAccessToken?: string; sessionAccessToken?: string }) {
  const start = Date.now();
  notifications.emit("GenerationStarted", { topic });
  await logEvent("info", "pipeline", "generation-started", { topic });
  const id = randomUUID();
  const assets: string[] = [];
  try {
    const news = await fetchTrendingNews(topic);
    const scriptRaw = await generateScript(news);
    const script = scriptOutputSchema.parse(scriptRaw);
    const imagePath = await generateImage(`${script.title}. cyber executive style 9:16`);
    assets.push(imagePath);
    const voice = await synthVoiceover(`${script.hook} ${script.narrative} ${script.cta}`);
    assets.push(voice.voicePath);
    const videoPath = path.join(getAssetsDir(), `${id}.mp4`);
    assets.push(videoPath);
    await compileVideo(imagePath, voice.voicePath, videoPath);
    const catboxUrl = await uploadCatbox(videoPath);

    await fs.rm(videoPath, { force: true });
    const token = facebook.manualPageAccessToken || facebook.sessionAccessToken || "";
    const postId = await publishFacebook(catboxUrl, `${script.hook}\n\n${script.narrative}\n\n${script.cta}`, script.firstComment, facebook.pageId || "", token);

    await Promise.all(assets.map((f) => fs.rm(f, { force: true })));

    const record = postRecordSchema.parse({
      id,
      topic,
      script,
      status: "published",
      catboxUrl,
      facebookPostId: postId,
      generationMs: Date.now() - start,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const posts = await readJson(getStoreFiles().posts, [] as unknown[]);
    await writeJson(getStoreFiles().posts, [record, ...posts].slice(0, 500));

    notifications.emit("PostPublished", record);
    await logEvent("info", "pipeline", "generation-published", { id, topic });
    await updateAnalytics(true, record.generationMs ?? 0);
    return record;
  } catch (error) {
    await Promise.all(assets.map((f) => fs.rm(f, { force: true })));
    await updateAnalytics(false, Date.now() - start);
    const msg = error instanceof Error ? error.message : "unknown";
    await logEvent("error", "pipeline", msg, { topic });
    notifications.emit("ErrorOccurred", { topic, error: msg });
    throw error;
  }
}

export async function collectStaleAssets(maxHours: number) {
  const dir = getAssetsDir();
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const threshold = Date.now() - maxHours * 60 * 60 * 1000;
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const p = path.join(dir, entry.name);
    const stat = await fs.stat(p);
    if (stat.mtimeMs < threshold) await fs.rm(p, { force: true });
  }
}

async function updateAnalytics(success: boolean, generationMs: number) {
  const file = getStoreFiles().analytics;
  const now = new Date().toISOString();
  const current = await readJson(file, {
    published: 0,
    failures: 0,
    generated: 0,
    totalGenerationMs: 0,
    providerFailures: {},
    apiUsage: {},
    updatedAt: now,
  });
  current.generated += 1;
  current.totalGenerationMs += generationMs;
  if (success) current.published += 1;
  else current.failures += 1;
  current.updatedAt = now;
  await writeJson(file, current);
}
