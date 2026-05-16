import { webSourceCatalog, type WebSource } from "./webSourceCatalog.js";

export type CollectedWebSource = {
  source: WebSource;
  fetchedAt: string;
  ok: boolean;
  status: number;
  fetchAttempts: number;
  textLength: number;
  extractedCourseTitles: string[];
  qualityWarnings: string[];
};

export type CollectWebSourceOptions = {
  maxAttempts?: number;
  sources?: WebSource[];
  timeoutMs?: number;
};

const courseKeywordPattern =
  /(자료구조|알고리즘|운영체제|데이터베이스|컴퓨터구조|네트워크|소프트웨어공학|인공지능|머신러닝|딥러닝|이산수학|선형대수|확률|통계|컴퓨터비전|보안|캡스톤|프로그래밍|논리설계|임베디드|데이터통신|클라우드)/g;

export async function collectWebSources(
  fetcher: typeof fetch = fetch,
  options: CollectWebSourceOptions = {},
): Promise<CollectedWebSource[]> {
  const fetchedAt = new Date().toISOString();
  const sources = options.sources ?? webSourceCatalog;
  return Promise.all(
    sources.map(async (source) => {
      try {
        const { attempts, html, response } = await fetchSourceHtml({
          fetcher,
          maxAttempts: options.maxAttempts ?? 2,
          source,
          timeoutMs: options.timeoutMs ?? 8000,
        });
        return buildCollectedSource({
          source,
          fetchedAt,
          ok: response.ok,
          status: response.status,
          html,
          fetchAttempts: attempts,
        });
      } catch (error) {
        return {
          source,
          fetchedAt,
          ok: false,
          status: 0,
          fetchAttempts: options.maxAttempts ?? 2,
          textLength: 0,
          extractedCourseTitles: [],
          qualityWarnings: [
            error instanceof Error ? error.message : "Unknown fetch failure",
          ],
        };
      }
    }),
  );
}

async function fetchSourceHtml({
  fetcher,
  maxAttempts,
  source,
  timeoutMs,
}: {
  fetcher: typeof fetch;
  maxAttempts: number;
  source: WebSource;
  timeoutMs: number;
}) {
  let lastError: unknown;
  const attempts = Math.max(1, maxAttempts);

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = timeoutMs > 0 ? new AbortController() : null;
    const timeout =
      controller && timeoutMs > 0
        ? setTimeout(() => controller.abort(), timeoutMs)
        : null;

    try {
      const response = await fetcher(source.url, {
        headers: { "user-agent": "AingtonDataQA/1.0" },
        signal: controller?.signal,
      });
      const html = await decodeResponseText(response);
      return { attempts: attempt, html, response };
    } catch (error) {
      lastError = error;
    } finally {
      if (timeout) {
        clearTimeout(timeout);
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Unknown fetch failure");
}

async function decodeResponseText(response: Response) {
  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const contentType = response.headers.get("content-type") ?? "";
  const preliminary = new TextDecoder("utf-8", { fatal: false }).decode(bytes.slice(0, 2048));
  const charset = detectCharset(`${contentType} ${preliminary}`);

  try {
    return new TextDecoder(charset, { fatal: false }).decode(bytes);
  } catch {
    return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  }
}

export function buildCollectedSource({
  fetchedAt,
  html,
  ok,
  source,
  status,
  fetchAttempts = 1,
}: {
  fetchedAt: string;
  html: string;
  ok: boolean;
  source: WebSource;
  status: number;
  fetchAttempts?: number;
}) {
  const plainText = normalizeHtmlText(html);
  const extractedCourseTitles = extractCourseTitles(plainText);
  const qualityWarnings = buildQualityWarnings({
    ok,
    plainText,
    source,
    extractedCourseTitles,
  });

  return {
    source,
    fetchedAt,
    ok,
    status,
    fetchAttempts,
    textLength: plainText.length,
    extractedCourseTitles,
    qualityWarnings,
  };
}

export function summarizeCollectedWebSources(results: CollectedWebSource[]) {
  const failedSourceCount = results.filter((result) => !result.ok).length;
  const warningCount = results.reduce(
    (total, result) => total + result.qualityWarnings.length,
    0,
  );
  const retriedSourceCount = results.filter((result) => result.fetchAttempts > 1).length;

  return {
    sourceCount: results.length,
    okSourceCount: results.length - failedSourceCount,
    failedSourceCount,
    warningCount,
    retriedSourceCount,
    readyForSeedReview: failedSourceCount === 0,
  };
}

export function normalizeHtmlText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function detectCharset(text: string): "utf-8" | "euc-kr" {
  return /charset=["']?euc-?kr/i.test(text) ? "euc-kr" : "utf-8";
}

export function extractCourseTitles(text: string) {
  const matches = text.match(courseKeywordPattern) ?? [];
  return [...new Set(matches)].sort((a, b) => a.localeCompare(b, "ko"));
}

function buildQualityWarnings({
  extractedCourseTitles,
  ok,
  plainText,
  source,
}: {
  extractedCourseTitles: string[];
  ok: boolean;
  plainText: string;
  source: WebSource;
}) {
  const warnings: string[] = [];
  if (!ok) {
    warnings.push("Fetch failed or returned a non-2xx status.");
  }
  if (plainText.length < 200) {
    warnings.push("Fetched text is too short for reliable extraction.");
  }
  if (source.kind === "official-curriculum" && extractedCourseTitles.length < 3) {
    warnings.push("Official curriculum source yielded fewer than three course signals.");
  }
  return warnings;
}
