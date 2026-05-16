# Aington V1-V10 Roadmap

## Operating Loop

Every version follows the same loop:

1. Pick the sharpest current product risk.
2. Implement the smallest durable improvement.
3. Collect or clean one layer of evidence.
4. Run API tests, typecheck, lint, build, and targeted manual/API QA.
5. Record what changed and choose the next risk.

## Versions

| Version | Goal | Definition of Done |
| --- | --- | --- |
| V1 | Make the MVP reproducible | Seed fallback works, profile tokens exist, meeting intents can be recorded |
| V2 | Add internet data collection rails | Official source catalog, fetch/clean script, and extraction QA exist |
| V3 | Expand curriculum data coverage | At least 5 official source-backed departments replace placeholder-only seed rows |
| V4 | Add source trust UI | Reports show whether data came from seed, official source, or database |
| V5 | Add funnel telemetry | Report view, signup, recommendation click, and intent events are queryable |
| V6 | Improve matching quality | Recommendations use profile gaps, curriculum gaps, and observed intent feedback |
| V7 | Add validation operations panel | Funnel, storage, source coverage, and QA warnings are visible in API/UI |
| V8 | Run usability QA | 3 scripted student scenarios are repeatable and defects are tracked |
| V9 | Prepare pilot operations | Admin-readable intent/export flow and source freshness checks exist |
| V10 | Pilot-ready release | Fresh data QA, product QA, security review, and launch checklist are green |

## Current State

- V1 is implemented in code.
- V2 is implemented in code: official source catalog, fetch/clean script, and extraction QA.
- V3 is implemented in code: five departments now carry official source URLs and seed coverage has regression QA.
- V4 is implemented in code: report UI now exposes source trust state for database, ADIGA public curriculum, Inha sugang course-schedule signals, official-source seed, and needs-review archetype seed.
- V5 is implemented in code: funnel events and aggregate metrics exist for report, signup, recommendation click, and intent creation.
- V6 is implemented in code: complement matching now uses observed peer intent signals in score and recommendation reasons.
- V7 is implemented in code: `/api/validation-status` and the dashboard MVP validation panel expose funnel, storage, source coverage, and QA warnings.
- V8 is implemented in code: three student validation scenarios now drive a repeatable API smoke test and interview script.
- V9 is implemented in code: data collection now retries transient source failures, prints freshness summary, and exposes aggregate intent summary without profile tokens.
- V10 is implemented in code: pilot readiness checks are available through `/api/pilot-readiness` and `docs/pilot-release-checklist.md`.
