import fs from "fs/promises";
import path from "path";

const ROOT = path.join(process.cwd(), "database");

const files = {
  keyVault: path.join(ROOT, "keys", "vault.json"),
  posts: path.join(ROOT, "posts", "posts.json"),
  queue: path.join(ROOT, "queue", "jobs.json"),
  settings: path.join(ROOT, "settings", "settings.json"),
  logs: path.join(ROOT, "logs", "events.json"),
  analytics: path.join(ROOT, "analytics", "metrics.json"),
};

const locks = new Map<string, Promise<void>>();

async function ensureDirs() {
  await Promise.all([
    fs.mkdir(path.join(ROOT, "settings"), { recursive: true }),
    fs.mkdir(path.join(ROOT, "keys"), { recursive: true }),
    fs.mkdir(path.join(ROOT, "posts"), { recursive: true }),
    fs.mkdir(path.join(ROOT, "queue"), { recursive: true }),
    fs.mkdir(path.join(ROOT, "logs"), { recursive: true }),
    fs.mkdir(path.join(ROOT, "analytics"), { recursive: true }),
    fs.mkdir(path.join(ROOT, "assets"), { recursive: true }),
  ]);
}

async function withLock<T>(file: string, action: () => Promise<T>) {
  const prev = locks.get(file) ?? Promise.resolve();
  let release: () => void = () => {};
  const next = new Promise<void>((resolve) => (release = resolve));
  locks.set(file, prev.then(() => next));
  await prev;
  try {
    return await action();
  } finally {
    release();
  }
}

export async function readJson<T>(file: string, fallback: T): Promise<T> {
  await ensureDirs();
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJson<T>(file: string, value: T): Promise<void> {
  await ensureDirs();
  await withLock(file, async () => {
    await fs.writeFile(file, JSON.stringify(value, null, 2), "utf8");
  });
}

export function getStoreFiles() {
  return files;
}

export function getAssetsDir() {
  return path.join(ROOT, "assets");
}
