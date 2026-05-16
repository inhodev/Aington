import {
  collectWebSources,
  summarizeCollectedWebSources,
} from "../data/webSourceCollector.js";

const results = await collectWebSources();
const sources = results.map((result) => ({
  id: result.source.id,
  title: result.source.title,
  url: result.source.url,
  ok: result.ok,
  status: result.status,
  fetchAttempts: result.fetchAttempts,
  textLength: result.textLength,
  extractedCourseTitles: result.extractedCourseTitles,
  qualityWarnings: result.qualityWarnings,
}));

console.log(
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      summary: summarizeCollectedWebSources(results),
      sources,
    },
    null,
    2,
  ),
);
