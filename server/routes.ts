import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { insertSubmissionSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import express from "express";
import fs from "fs/promises";

const upload = multer({
  storage: multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
  }
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Serve uploaded files
  app.use("/uploads", express.static("uploads"));

  // Special route for favicon
  app.get("/favicon.ico", async (req, res) => {
    const settings = await storage.getAdminSettings();
    if (settings.logoUrl && settings.logoUrl.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), settings.logoUrl);
      try {
        await fs.access(filePath);
        return res.sendFile(filePath);
      } catch (e) {
        // Fallback to default if file doesn't exist
      }
    }
    res.status(404).end();
  });

  app.post("/api/admin/logo", upload.single("logo"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const logoUrl = `/uploads/${req.file.filename}?t=${Date.now()}`;
      const settings = await storage.updateAdminSettings({ logoUrl });
      res.json(settings);
    } catch (err) {
      res.status(500).json({ message: "Failed to upload logo" });
    }
  });

  app.post("/api/submissions", upload.array("evidence"), async (req, res) => {
    try {
      const files = (req.files as Express.Multer.File[]) || [];
      const evidenceFiles = files.map(f => `/uploads/${f.filename}`);

      // Handle multi-value fields from FormData
      let walletAddresses = req.body.walletAddresses;
      if (typeof walletAddresses === "string") {
        walletAddresses = [walletAddresses];
      } else if (!walletAddresses) {
        walletAddresses = [];
      }

      const body = {
        ...req.body,
        walletAddresses,
        evidenceFiles,
      };

      const data = insertSubmissionSchema.parse(body);
      const submission = await storage.createSubmission(data);
      res.status(201).json(submission);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error("Submission error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/admin/submissions", async (req, res) => {
    const subs = await storage.getSubmissions();
    res.json(subs);
  });

  app.delete("/api/admin/submissions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSubmission(id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Failed to delete submission" });
    }
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
