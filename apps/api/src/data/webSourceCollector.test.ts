import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCollectedSource,
  collectWebSources,
  detectCharset,
  extractCourseTitles,
  normalizeHtmlText,
  summarizeCollectedWebSources,
} from "./webSourceCollector.js";
import { webSourceCatalog } from "./webSourceCatalog.js";

test("normalizes fetched HTML into plain text", () => {
  const text = normalizeHtmlText(`
    <html><head><style>.x{}</style><script>ignored()</script></head>
    <body>자료구조&nbsp; &amp; 알고리즘</body></html>
  `);

  assert.equal(text, "자료구조 & 알고리즘");
});

test("detects legacy Korean page encoding hints", () => {
  assert.equal(detectCharset('text/html; charset=euc-kr <meta charset="euc-kr">'), "euc-kr");
  assert.equal(detectCharset('text/html; charset=utf-8 <meta charset="utf-8">'), "utf-8");
});

test("extracts unique course signals from official text", () => {
  const courses = extractCourseTitles(
    "자료구조 알고리즘 운영체제 데이터베이스 자료구조 인공지능 캡스톤",
  );

  assert.deepEqual(courses, [
    "데이터베이스",
    "알고리즘",
    "운영체제",
    "인공지능",
    "자료구조",
    "캡스톤",
  ]);
});

test("flags low-quality curriculum extraction", () => {
  const result = buildCollectedSource({
    source: webSourceCatalog.find((source) => source.kind === "official-curriculum")!,
    fetchedAt: "2026-05-16T00:00:00.000Z",
    ok: true,
    status: 200,
    html: "<html>짧음</html>",
  });

  assert.ok(result.qualityWarnings.includes("Fetched text is too short for reliable extraction."));
  assert.ok(
    result.qualityWarnings.includes(
      "Official curriculum source yielded fewer than three course signals.",
    ),
  );
});

test("retries transient source fetch failures", async () => {
  let calls = 0;
  const fetcher = (async () => {
    calls += 1;
    if (calls === 1) {
      throw new Error("temporary network failure");
    }

    return new Response("<html>자료구조 알고리즘 운영체제 데이터베이스</html>", {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }) as typeof fetch;

  const [result] = await collectWebSources(fetcher, {
    maxAttempts: 2,
    sources: [webSourceCatalog.find((source) => source.kind === "official-curriculum")!],
    timeoutMs: 0,
  });

  assert.equal(result.ok, true);
  assert.equal(result.fetchAttempts, 2);
  assert.equal(calls, 2);
});

test("summarizes freshness collection results", () => {
  const result = buildCollectedSource({
    source: webSourceCatalog.find((source) => source.kind === "official-curriculum")!,
    fetchedAt: "2026-05-16T00:00:00.000Z",
    ok: true,
    status: 200,
    fetchAttempts: 2,
    html: "<html>자료구조 알고리즘 운영체제 데이터베이스</html>",
  });

  const summary = summarizeCollectedWebSources([result]);

  assert.equal(summary.sourceCount, 1);
  assert.equal(summary.okSourceCount, 1);
  assert.equal(summary.retriedSourceCount, 1);
  assert.equal(summary.readyForSeedReview, true);
});
