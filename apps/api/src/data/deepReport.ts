import { FunctionDeclarationSchemaType, VertexAI, type ResponseSchema } from "@google-cloud/vertexai";
import { GoogleAuth } from "google-auth-library";

type DeepReportInput = {
  school: string;
  department: string;
  field?: string;
  headline?: string;
  summary?: string;
  activities?: unknown;
  comparisons?: unknown;
  curriculum?: unknown;
  portfolioStats?: unknown;
  analysis?: unknown;
  curriculumSimilarity?: unknown;
};

export type DeepReport = {
  generatedAt: string;
  model: string;
  executiveSummary: string;
  benchmarkInsights: Array<{
    title: string;
    detail: string;
    scoreImpact: string;
  }>;
  portfolioPriorities: Array<{
    title: string;
    why: string;
    nextStep: string;
  }>;
  activityMix: Array<{
    name: string;
    reason: string;
    confidence: string;
  }>;
  curriculumRecommendations: string[];
  riskNotes: string[];
  sources: string[];
};

type GeminiGenerateResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

const reportSystemInstruction =
  "You are a Korean career advisor for university students. Generate practical, evidence-grounded premium reports from the provided curriculum and benchmark data. Return JSON only.";

const deepReportSchema: ResponseSchema = {
  type: FunctionDeclarationSchemaType.OBJECT,
  properties: {
    executiveSummary: { type: "STRING" },
    benchmarkInsights: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          detail: { type: "STRING" },
          scoreImpact: { type: "STRING" },
        },
        propertyOrdering: ["title", "detail", "scoreImpact"],
      },
    },
    portfolioPriorities: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          why: { type: "STRING" },
          nextStep: { type: "STRING" },
        },
        propertyOrdering: ["title", "why", "nextStep"],
      },
    },
    activityMix: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          reason: { type: "STRING" },
          confidence: { type: "STRING" },
        },
        propertyOrdering: ["name", "reason", "confidence"],
      },
    },
    curriculumRecommendations: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
    riskNotes: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
    sources: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
  },
  propertyOrdering: [
    "executiveSummary",
    "benchmarkInsights",
    "portfolioPriorities",
    "activityMix",
    "curriculumRecommendations",
    "riskNotes",
    "sources",
  ],
} as unknown as ResponseSchema;

export async function buildGeminiDeepReport(input: DeepReportInput): Promise<DeepReport> {
  const project = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT;
  if (project) {
    return buildVertexDeepReport(input, project);
  }

  return buildApiKeyDeepReport(input);
}

async function buildVertexDeepReport(input: DeepReportInput, project: string): Promise<DeepReport> {
  const model = process.env.VERTEX_GEMINI_MODEL || "gemini-3-flash-preview";
  const location =
    process.env.GOOGLE_CLOUD_LOCATION || (model.startsWith("gemini-3") ? "global" : "us-central1");

  if (location === "global") {
    return buildVertexRestDeepReport(input, project, location, model);
  }

  const vertexAI = new VertexAI({ project, location });
  const generativeModel = vertexAI.getGenerativeModel({
    model,
    systemInstruction: reportSystemInstruction,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: deepReportSchema,
      temperature: 0.35,
      maxOutputTokens: 4096,
    },
  });

  try {
    const result = await generativeModel.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: buildPrompt(input) }],
        },
      ],
    });
    const text = result.response.candidates?.[0]?.content?.parts
      ?.map((part) => ("text" in part ? part.text || "" : ""))
      .join("")
      .trim();

    if (!text) {
      throw new GeminiReportError("Vertex AI Gemini returned an empty report.", 502);
    }

    return normalizeDeepReport(parseJsonReport(text), `vertex:${model}`);
  } catch (error) {
    if (error instanceof GeminiReportError) {
      throw error;
    }

    throw new GeminiReportError(
      error instanceof Error ? error.message : "Failed to generate Vertex AI Gemini report.",
      502,
    );
  }
}

async function buildVertexRestDeepReport(
  input: DeepReportInput,
  project: string,
  location: string,
  model: string,
): Promise<DeepReport> {
  const auth = new GoogleAuth({
    credentials: readGoogleCredentials(),
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  const client = await auth.getClient();
  const authHeaders = toHeaderRecord(await client.getRequestHeaders());
  const modelPath = `projects/${project}/locations/${location}/publishers/google/models/${model}`;
  const response = await fetch(`https://aiplatform.googleapis.com/v1/${modelPath}:generateContent`, {
    method: "POST",
    headers: {
      ...authHeaders,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: reportSystemInstruction }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: buildPrompt(input) }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: deepReportSchema,
        temperature: 0.35,
        maxOutputTokens: 4096,
      },
    }),
  });

  const raw = await response.text();
  let payload: GeminiGenerateResponse;
  try {
    payload = JSON.parse(raw) as GeminiGenerateResponse;
  } catch {
    throw new GeminiReportError(`Vertex AI returned a non-JSON response: ${raw.slice(0, 120)}`, 502);
  }

  if (!response.ok) {
    throw new GeminiReportError(payload.error?.message || "Vertex AI Gemini request failed.", 502);
  }

  const text = payload.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();

  if (!text) {
    throw new GeminiReportError("Vertex AI Gemini returned an empty report.", 502);
  }

  return normalizeDeepReport(parseJsonReport(text), `vertex:${model}`);
}

async function buildApiKeyDeepReport(input: DeepReportInput): Promise<DeepReport> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new GeminiReportError(
      "Vertex AI is not configured. Set GOOGLE_CLOUD_PROJECT for Vertex AI, or set GEMINI_API_KEY for legacy Gemini API.",
      503,
    );
  }

  const model = process.env.GEMINI_MODEL || "gemini-3-flash-preview";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          system_instruction: {
            parts: [
              {
                text:
                  reportSystemInstruction,
              },
            ],
          },
          contents: [
            {
              parts: [{ text: buildPrompt(input) }],
            },
          ],
          generationConfig: {
            response_mime_type: "application/json",
            response_schema: deepReportSchema,
            temperature: 0.35,
            maxOutputTokens: 4096,
          },
        }),
      },
    );

    const payload = (await response.json()) as GeminiGenerateResponse;
    if (!response.ok) {
      throw new GeminiReportError(payload.error?.message || "Gemini API request failed.", 502);
    }

    const text = payload.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim();

    if (!text) {
      throw new GeminiReportError("Gemini returned an empty report.", 502);
    }

    return normalizeDeepReport(parseJsonReport(text), model);
  } catch (error) {
    if (error instanceof GeminiReportError) {
      throw error;
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new GeminiReportError("Gemini API request timed out.", 504);
    }
    throw new GeminiReportError(
      error instanceof Error ? error.message : "Failed to generate Gemini report.",
      502,
    );
  } finally {
    clearTimeout(timeout);
  }
}

export class GeminiReportError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "GeminiReportError";
    this.status = status;
  }
}

function buildPrompt(input: DeepReportInput) {
  const compact = JSON.stringify({
    target: {
      school: input.school,
      department: input.department,
      field: input.field,
    },
    headline: input.headline,
    summary: input.summary,
    activities: input.activities,
    comparisons: input.comparisons,
    curriculum: input.curriculum,
    portfolioStats: input.portfolioStats,
    analysis: input.analysis,
    curriculumSimilarity: input.curriculumSimilarity,
  });

  return [
    `${input.school || "선택 학교"} ${input.department || "선택 학과"} 학생을 위한 유료 심화 리포트를 작성해줘.`,
    `사용자가 랜딩페이지에서 선택한 분석 대상은 "${input.school} ${input.department}"이고 관심 분야는 "${input.field || "미선택"}"야. 이 선택값을 리포트의 최종 표기 기준으로 삼아.`,
    "입력 데이터 안에 학교명/학과명의 축약형이나 유사 명칭이 섞여 있어도 최종 문장에서는 랜딩 선택값을 우선해.",
    "한국어로 작성하고, 마크다운 없이 짧고 구체적인 문장만 사용해.",
    "benchmarkInsights는 비교 대학/비교군 관점의 차이를 3개 작성해.",
    "portfolioPriorities는 학생이 다음 2주 안에 실행할 수 있는 보완 과제를 3개 작성해.",
    "activityMix는 추천 활동 조합을 3개 작성하고 confidence는 높음/중간/낮음 중 하나로 작성해.",
    "curriculumRecommendations와 riskNotes는 각각 3개 이하로 작성해.",
    `입력 데이터: ${compact}`,
  ].join("\n");
}

function normalizeDeepReport(value: Record<string, unknown>, model: string): DeepReport {
  return {
    generatedAt: new Date().toISOString(),
    model,
    executiveSummary: readString(value.executiveSummary, "심화 리포트 요약을 생성하지 못했습니다."),
    benchmarkInsights: readObjectArray(value.benchmarkInsights).slice(0, 3).map((item) => ({
      title: readString(item.title, "비교 인사이트"),
      detail: readString(item.detail, "비교 데이터 기반 세부 해석이 필요합니다."),
      scoreImpact: readString(item.scoreImpact, "영향도 확인 필요"),
    })),
    portfolioPriorities: readObjectArray(value.portfolioPriorities).slice(0, 3).map((item) => ({
      title: readString(item.title, "포트폴리오 보완"),
      why: readString(item.why, "현재 커리큘럼 신호를 산출물로 연결해야 합니다."),
      nextStep: readString(item.nextStep, "작은 결과물을 먼저 정의하세요."),
    })),
    activityMix: readObjectArray(value.activityMix).slice(0, 3).map((item) => ({
      name: readString(item.name, "추천 활동"),
      reason: readString(item.reason, "전공 강점과 연결되는 활동입니다."),
      confidence: readString(item.confidence, "중간"),
    })),
    curriculumRecommendations: readStringArray(value.curriculumRecommendations).slice(0, 3),
    riskNotes: readStringArray(value.riskNotes).slice(0, 3),
    sources: readStringArray(value.sources).slice(0, 4),
  };
}

function readString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function readObjectArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> => item !== null && typeof item === "object")
    : [];
}

function readStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
}

function toHeaderRecord(headers: Headers | Record<string, unknown>): Record<string, string> {
  if (headers instanceof Headers) {
    const record: Record<string, string> = {};
    headers.forEach((value, key) => {
      record[key] = value;
    });
    return record;
  }

  return Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [
      key,
      Array.isArray(value) ? value.join(",") : String(value),
    ]),
  );
}

function parseJsonReport(text: string): Record<string, unknown> {
  const trimmed = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");

  try {
    return JSON.parse(trimmed) as Record<string, unknown>;
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1)) as Record<string, unknown>;
    }
    throw new GeminiReportError("Gemini returned malformed JSON.", 502);
  }
}

function readGoogleCredentials(): Record<string, unknown> | undefined {
  const raw =
    process.env.GOOGLE_CREDENTIALS_JSON ||
    (process.env.GOOGLE_CREDENTIALS_BASE64
      ? Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, "base64").toString("utf8")
      : undefined);

  if (!raw) {
    return undefined;
  }

  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    throw new GeminiReportError("Invalid GOOGLE_CREDENTIALS_JSON for Vertex AI.", 500);
  }
}
