import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { buildInsight } from "./data/demo.js";
import { Profile } from "./models/Profile.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);
const memoryProfiles: unknown[] = [];

app.use(
  cors({
    origin: process.env.WEB_ORIGIN || "http://localhost:3000",
  }),
);
app.use(express.json());

async function connectMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log("MongoDB URI not set. Using in-memory demo storage.");
    return false;
  }

  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected.");
    return true;
  } catch (error) {
    console.warn("MongoDB connection failed. Falling back to demo memory storage.");
    console.warn(error);
    return false;
  }
}

function requireString(body: Record<string, unknown>, key: string) {
  const value = body[key];
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "career-scope-api",
    storage:
      mongoose.connection.readyState === 1 ? "mongodb" : "memory-demo-fallback",
  });
});

app.get("/api/insights", (req, res) => {
  const school = typeof req.query.school === "string" ? req.query.school : "";
  const department =
    typeof req.query.department === "string" ? req.query.department : "";

  res.json(buildInsight(school, department));
});

app.post("/api/signup", async (req, res) => {
  const body = req.body as Record<string, unknown>;
  const required = [
    "school",
    "department",
    "email",
    "name",
    "role",
    "interest",
    "wantsToMeet",
    "intro",
  ];

  const profile = Object.fromEntries(
    required.map((key) => [key, requireString(body, key)]),
  );

  const missing = Object.entries(profile)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    return res.status(400).json({ error: "Missing required fields", missing });
  }

  const payload = {
    ...profile,
    portfolio:
      typeof body.portfolio === "string" ? body.portfolio.trim() : "",
  };

  if (mongoose.connection.readyState === 1) {
    const saved = await Profile.create(payload);
    return res.status(201).json({ id: saved.id, profile: saved });
  }

  const id = `demo-${memoryProfiles.length + 1}`;
  const saved = { id, ...payload, createdAt: new Date().toISOString() };
  memoryProfiles.push(saved);
  return res.status(201).json({ id, profile: saved });
});

app.get("/api/peers", (_req, res) => {
  res.json(buildInsight().peers);
});

connectMongo().finally(() => {
  app.listen(port, () => {
    console.log(`CareerScope API listening on http://localhost:${port}`);
  });
});
