import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import {
  buildCurriculumSimilarityFromDatabase,
} from "./data/curriculumSimilarity.js";
import { buildCurriculumReport } from "./data/curriculumReport.js";
import { buildGeminiDeepReport, GeminiReportError } from "./data/deepReport.js";
import { buildInsight } from "./data/demo.js";
import { prisma } from "./lib/prisma.js";
import { Profile } from "./models/Profile.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);
const memoryProfiles: unknown[] = [];
const allowedWebOrigins = new Set([
  process.env.WEB_ORIGIN || "http://localhost:3000",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedWebOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
  }),
);
app.use(express.json());

async function connectMongo() {
  if (prisma) {
    console.log("Neon Postgres configured. Skipping MongoDB connection.");
    return false;
  }

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
      prisma
        ? "neon-postgres"
        : mongoose.connection.readyState === 1
          ? "mongodb"
          : "memory-demo-fallback",
  });
});

app.get("/api/insights", async (req, res) => {
  const school = typeof req.query.school === "string" ? req.query.school : "";
  const department =
    typeof req.query.department === "string" ? req.query.department : "";
  const grade = typeof req.query.grade === "string" ? req.query.grade : "";
  const semester =
    typeof req.query.semester === "string" ? req.query.semester : "";
  const yearTerm =
    typeof req.query.yearTerm === "string" ? req.query.yearTerm : "";

  const options = {
    grade: grade || undefined,
    semester: semester || undefined,
    yearTerm: yearTerm || undefined,
  };
  const insight = buildInsight(school, department, options);
  const curriculumSimilarity = await buildCurriculumSimilarityFromDatabase({
    school,
    department,
    ...options,
  });
  const curriculumReport = buildCurriculumReport(curriculumSimilarity);
  const displayCurriculumSimilarity = {
    ...curriculumSimilarity,
    base: {
      ...curriculumSimilarity.base,
      school: insight.target.school,
      department: insight.target.department,
    },
  };
  const topComparison = curriculumSimilarity.rankings[0];

  res.json({
    ...insight,
    ...curriculumReport,
    headline: `${insight.target.school} ${insight.target.department}는 ${
      topComparison?.school ?? "비교군"
    }와 커리큘럼 구조가 가장 가깝습니다.`,
    curriculumSimilarity: displayCurriculumSimilarity,
  });
});

app.get("/api/curriculum-similarity", async (req, res) => {
  const school = typeof req.query.school === "string" ? req.query.school : "";
  const department =
    typeof req.query.department === "string" ? req.query.department : "";
  const grade = typeof req.query.grade === "string" ? req.query.grade : "";
  const semester =
    typeof req.query.semester === "string" ? req.query.semester : "";
  const yearTerm =
    typeof req.query.yearTerm === "string" ? req.query.yearTerm : "";

  res.json(
    await buildCurriculumSimilarityFromDatabase({
      school,
      department,
      grade: grade || undefined,
      semester: semester || undefined,
      yearTerm: yearTerm || undefined,
    }),
  );
});

app.post("/api/deep-report", async (req, res) => {
  const body = req.body as Record<string, unknown>;
  const school = requireString(body, "school") || "";
  const department = requireString(body, "department") || "";

  if (!school || !department) {
    return res.status(400).json({
      error: "Missing required fields",
      missing: [!school ? "school" : null, !department ? "department" : null].filter(Boolean),
    });
  }

  try {
    const report = await buildGeminiDeepReport({
      school,
      department,
      field: typeof body.field === "string" ? body.field : undefined,
      headline: typeof body.headline === "string" ? body.headline : undefined,
      summary: typeof body.summary === "string" ? body.summary : undefined,
      activities: body.activities,
      comparisons: body.comparisons,
      curriculum: body.curriculum,
      portfolioStats: body.portfolioStats,
      analysis: body.analysis,
      curriculumSimilarity: body.curriculumSimilarity,
    });

    return res.json(report);
  } catch (error) {
    if (error instanceof GeminiReportError) {
      return res.status(error.status).json({ error: error.message });
    }

    console.error(error);
    return res.status(500).json({ error: "Failed to generate deep report." });
  }
});

app.post("/api/signup", async (req, res) => {
  const body = req.body as Record<string, unknown>;
  const profile = {
    school: requireString(body, "school"),
    department: requireString(body, "department"),
    email: requireString(body, "email"),
    name: requireString(body, "name"),
    role: requireString(body, "role"),
    interest: requireString(body, "interest"),
    wantsToMeet: requireString(body, "wantsToMeet"),
    intro: requireString(body, "intro"),
  };

  const missing = Object.entries(profile)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    return res.status(400).json({ error: "Missing required fields", missing });
  }

  const payload = {
    school: profile.school as string,
    department: profile.department as string,
    email: profile.email as string,
    name: profile.name as string,
    role: profile.role as string,
    interest: profile.interest as string,
    wantsToMeet: profile.wantsToMeet as string,
    intro: profile.intro as string,
    portfolio:
      typeof body.portfolio === "string" ? body.portfolio.trim() : "",
  };

  if (prisma) {
    const saved = await prisma.profile.create({
      data: {
        school: payload.school,
        department: payload.department,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        interest: payload.interest,
        wantsToMeet: payload.wantsToMeet,
        intro: payload.intro,
        portfolio: payload.portfolio,
      },
    });
    return res.status(201).json({ id: saved.id, profile: saved });
  }

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
