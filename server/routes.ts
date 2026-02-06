import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { insertSubmissionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/submissions", async (req, res) => {
    try {
      const data = insertSubmissionSchema.parse(req.body);
      const submission = await storage.createSubmission(data);
      res.status(201).json(submission);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/admin/submissions", async (req, res) => {
    const subs = await storage.getSubmissions();
    res.json(subs);
  });

  app.get("/api/admin/settings", async (req, res) => {
    const settings = await storage.getAdminSettings();
    res.json(settings);
  });

  app.post("/api/admin/settings", async (req, res) => {
    try {
      const updated = await storage.updateAdminSettings(req.body);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  app.post("/api/admin/auth", async (req, res) => {
    const { password } = req.body;
    const settings = await storage.getAdminSettings();
    if (password === settings.password) {
      res.json({ success: true });
    } else {
      res.status(401).json({ message: "Invalid password" });
    }
  });

  return httpServer;
}
