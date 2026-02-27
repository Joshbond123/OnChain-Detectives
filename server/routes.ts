import type { Express } from "express";
import type { Server } from "http";
import { z } from "zod";
import {
  facebookSettingsSchema,
  generationRequestSchema,
  providerKeyMutationSchema,
  removeProviderKeySchema,
  systemSettingsSchema,
} from "@shared/schema";
import { addKey, getVault, removeKey } from "./core/keyVault";
import { getStoreFiles, readJson, writeJson } from "./core/fileStore";
import { notifications } from "./core/notifications";
import { scheduler } from "./core/scheduler";
import { collectStaleAssets } from "./core/pipeline";

const sseAuth = process.env.SSE_AUTH_TOKEN || "local-dev-token";

export async function registerRoutes(_httpServer: Server, app: Express): Promise<Server> {
  await scheduler.init();

  app.get("/api/stream", (req, res) => {
    const token = (req.headers.authorization || "").replace("Bearer ", "") || String(req.query.token || "");
    if (token !== sseAuth) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    res.write("data: {\"type\":\"connected\"}\n\n");
    notifications.addClient(res);
    req.on("close", () => notifications.removeClient(res));
  });

  app.get("/api/state", async (_req, res) => {
    const [posts, jobs, vault, analytics, settings, logs] = await Promise.all([
      readJson(getStoreFiles().posts, []),
      readJson(getStoreFiles().queue, []),
      getVault(),
      readJson(getStoreFiles().analytics, {}),
      readJson(getStoreFiles().settings, {}),
      readJson(getStoreFiles().logs, []),
    ]);
    res.json({ posts, jobs, vault, analytics, settings, logs: logs.slice(-100).reverse() });
  });

  app.post("/api/generate", async (req, res) => {
    try {
      const body = generationRequestSchema.parse(req.body);
      const settings = await readJson(getStoreFiles().settings, { facebook: {} });
      if (body.scheduleAt || body.recurringDaily) {
        const when = body.scheduleAt ?? new Date().toISOString();
        await scheduler.enqueue(body.topic, when, body.recurringDaily ? "daily" : "once");
        return res.status(202).json({ queued: true });
      }
      const post = await scheduler.triggerNow(body.topic, settings.facebook || {});
      return res.json(post);
    } catch (error) {
      const msg = error instanceof z.ZodError ? error.errors[0]?.message : "Generation failed";
      return res.status(400).json({ message: msg });
    }
  });

  app.post("/api/keys", async (req, res) => {
    const body = providerKeyMutationSchema.parse(req.body);
    const keys = await addKey(body.provider, body.key, body.label);
    res.json(keys);
  });

  app.delete("/api/keys", async (req, res) => {
    const body = removeProviderKeySchema.parse(req.body);
    const keys = await removeKey(body.provider, body.id);
    res.json(keys);
  });

  app.post("/api/settings/facebook", async (req, res) => {
    const facebook = facebookSettingsSchema.parse(req.body);
    const current = await readJson(getStoreFiles().settings, {});
    await writeJson(getStoreFiles().settings, { ...current, facebook });
    res.json({ ok: true });
  });

  app.post("/api/settings/system", async (req, res) => {
    const system = systemSettingsSchema.parse(req.body);
    const current = await readJson(getStoreFiles().settings, {});
    await writeJson(getStoreFiles().settings, { ...current, system });
    await collectStaleAssets(system.autoCleanupHours);
    res.json({ ok: true });
  });

  return _httpServer;
}
