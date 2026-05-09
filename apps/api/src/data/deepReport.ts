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
    confidence: "높음" | "중간" | "낮음";
  }>;
  curriculumRecommendations: string[];
  riskNotes: string[];
  sources: string[];
  chartData: {
    radarChart: {
      labels: string[];
      mySchool: number[];
      avgSchool: number[];
    };
    barChart: Array<{
      category: string;
      me: number;
      avg: number;
      unit: string;
    }>;
  };
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
  'You are a senior Korean career strategist specializing in university curriculum analysis and student career development. You produce premium, data-grounded reports that feel like they were written by a human expert, not a chatbot. Your tone is direct, specific, and actionable. You never use vague filler phrases like "노력하세요" or "중요합니다". Every sentence must contain a concrete fact, comparison, or next step. Return JSON only, no markdown.';

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
    chartData: {
      type: "OBJECT",
      properties: {
        radarChart: {
          type: "OBJECT",
          properties: {
            labels: {
              type: "ARRAY",
              items: { type: "STRING" },
            },
            mySchool: {
              type: "ARRAY",
              items: { type: "NUMBER" },
            },
            avgSchool: {
              type: "ARRAY",
              items: { type: "NUMBER" },
            },
          },
          propertyOrdering: ["labels", "mySchool", "avgSchool"],
        },
        barChart: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              category: { type: "STRING" },
              me: { type: "NUMBER" },
              avg: { type: "NUMBER" },
              unit: { type: "STRING" },
            },
            propertyOrdering: ["category", "me", "avg", "unit"],
          },
        },
      },
      propertyOrdering: ["radarChart", "barChart"],
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
    "chartData",
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

  return `
${input.school || "선택 학교"} ${input.department || "선택 학과"} 재학생을 위한 프리미엄 심화 커리어 리포트를 작성해줘.
관심 분야: ${input.field || "미선택"}
입력 데이터: ${compact}

아래 규칙을 반드시 지켜:

1. 모든 문장은 구체적인 수치, 학교명, 과목명, 직군명을 포함해야 해.
   나쁜 예: "프로젝트 경험을 쌓으세요"
   좋은 예: "한양대·고려대 동일 분야 학생 대비 프로젝트 수가 1.3개 적으므로, 2주 내 GitHub에 토이프로젝트 1개 push를 목표로 해"

2. benchmarkInsights: 비교 대학과의 구체적 차이를 수치로 표현.
   scoreImpact는 "서류 합격률 +12% 예상" 형태로 작성.

3. portfolioPriorities: 각 항목에 nextStep은 오늘 당장 실행 가능한 단 하나의 행동을 동사로 시작하는 한 문장으로 작성.
   예: "가장 완성도 높은 프로젝트 1개 선정 후 README에 기술 스택과 트러블슈팅 2건을 추가 작성하기"

4. activityMix: confidence가 "높음"인 항목은 반드시 1개 이상 포함.
   reason은 왜 이 분야에서 특히 유효한지 커리큘럼 근거를 포함해.

5. curriculumRecommendations: 단순 과목 나열 금지.
   "A 과목에서 배운 B 개념을 C 상황에 적용하라" 형태로 작성.

6. riskNotes: 현재 이대로 가면 발생할 구체적 리스크를 작성.
   예: "AI/보안 과목 미이수 시 관련 직군 서류에서 기술스택 공백으로 탈락 가능성 높음"

7. chartData 필드를 추가로 반환해:
   {
     "radarChart": {
       "labels": ["알고리즘/자료구조", "AI/ML", "데이터베이스", "보안/시스템", "프로젝트/실습"],
       "mySchool": [number, number, number, number, number],
       "avgSchool": [number, number, number, number, number]
     },
     "barChart": [
       { "category": "공모전 참여", "me": number, "avg": number, "unit": "회" },
       { "category": "프로젝트", "me": number, "avg": number, "unit": "개" },
       { "category": "논문", "me": number, "avg": number, "unit": "편" },
       { "category": "자격증", "me": number, "avg": number, "unit": "개" }
     ]
   }
   각 수치는 입력 데이터 기반으로 추론해서 채워줘.

8. executiveSummary는 3문장으로 제한:
   1문장: 이 학생의 가장 큰 강점
   2문장: 가장 시급한 약점
   3문장: 지금 당장 해야 할 한 가지
`.trim();
}

function normalizeDeepReport(value: Record<string, unknown>, model: string): DeepReport {
  const chartData = readChartData(value.chartData);

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
      confidence: readConfidence(item.confidence),
    })),
    curriculumRecommendations: readStringArray(value.curriculumRecommendations).slice(0, 3),
    riskNotes: readStringArray(value.riskNotes).slice(0, 3),
    sources: readStringArray(value.sources).slice(0, 4),
    chartData,
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

function readConfidence(value: unknown): "높음" | "중간" | "낮음" {
  return value === "높음" || value === "중간" || value === "낮음" ? value : "중간";
}

function readChartData(value: unknown): DeepReport["chartData"] {
  const fallbackLabels = ["알고리즘/자료구조", "AI/ML", "데이터베이스", "보안/시스템", "프로젝트/실습"];
  const fallbackBar = [
    { category: "공모전 참여", me: 1, avg: 2.4, unit: "회" },
    { category: "프로젝트", me: 1, avg: 2.8, unit: "개" },
    { category: "논문", me: 0, avg: 0.4, unit: "편" },
    { category: "자격증", me: 0, avg: 1.1, unit: "개" },
  ];

  if (!value || typeof value !== "object") {
    return {
      radarChart: {
        labels: fallbackLabels,
        mySchool: [78, 52, 68, 48, 56],
        avgSchool: [70, 61, 64, 58, 66],
      },
      barChart: fallbackBar,
    };
  }

  const chart = value as Record<string, unknown>;
  const radar = chart.radarChart && typeof chart.radarChart === "object"
    ? chart.radarChart as Record<string, unknown>
    : {};
  const labels = readStringArray(radar.labels).slice(0, 5);
  const normalizedLabels = labels.length === 5 ? labels : fallbackLabels;
  const mySchool = readNumberArray(radar.mySchool, [78, 52, 68, 48, 56], 5, 0, 100);
  const avgSchool = readNumberArray(radar.avgSchool, [70, 61, 64, 58, 66], 5, 0, 100);

  const barChart = readObjectArray(chart.barChart).slice(0, 4).map((item, index) => ({
    category: readString(item.category, fallbackBar[index]?.category || "비교 지표"),
    me: readNumber(item.me, fallbackBar[index]?.me || 0, 0, 100),
    avg: readNumber(item.avg, fallbackBar[index]?.avg || 0, 0, 100),
    unit: readString(item.unit, fallbackBar[index]?.unit || "개"),
  }));

  return {
    radarChart: {
      labels: normalizedLabels,
      mySchool,
      avgSchool,
    },
    barChart: barChart.length === 4 ? barChart : fallbackBar,
  };
}

function readNumberArray(
  value: unknown,
  fallback: number[],
  length: number,
  min: number,
  max: number,
) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const numbers = value
    .map((item) => readNumber(item, Number.NaN, min, max))
    .filter((item) => Number.isFinite(item))
    .slice(0, length);

  return numbers.length === length ? numbers : fallback;
}

function readNumber(value: unknown, fallback: number, min: number, max: number) {
  const number = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
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
