import { randomUUID } from "crypto";
import { getStoreFiles, readJson, writeJson } from "./fileStore";
import { logEntrySchema } from "@shared/schema";

export async function logEvent(level: "info" | "warn" | "error", source: string, message: string, metadata?: Record<string, unknown>) {
  const file = getStoreFiles().logs;
  const rows = await readJson(file, [] as unknown[]);
  const entry = logEntrySchema.parse({
    id: randomUUID(),
    level,
    source,
    message,
    metadata,
    createdAt: new Date().toISOString(),
  });
  const next = [...rows.slice(-999), entry];
  await writeJson(file, next);
}
