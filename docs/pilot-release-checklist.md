# Pilot Release Checklist

Use this before showing Aington to a private student cohort.

## Current Verification Snapshot

Last verified: 2026-05-16 21:05 KST

| Gate | Evidence | Status |
| --- | --- | --- |
| Local API regression | `npm test --workspace @career-scope/api` | Green, 35/35 passing |
| Type safety | `npm run typecheck --workspaces --if-present` | Green |
| Public source collector | `npm run data:collect --workspace @career-scope/api` | Green, `failedSourceCount: 0`, `warningCount: 1` expected |
| Inha ADIGA collector | `npm run data:collect:inha --workspace @career-scope/api` | Green, 69 public departments, 58 course-backed |
| Inha sugang collector | `npm run data:collect:inha:sugang --workspace @career-scope/api` | Green, 18 checked, 15 course-backed, 3 partial |
| Production API coverage | `GET https://aington-api.vercel.app/api/validation-status` | Green for data gates, sample-size warning only |
| Production web smoke | `https://aington.vercel.app` landing -> Inha EE report | Green, source trust shows Inha official sugang 64 signals |
| Production auth smoke | Header `로그인` click | Green, opens profile notice without Next error |

Current data coverage from production:

- Inha admission units: 76
- ADIGA public course-backed units: 58
- Official Inha sugang course-backed units: 15
- Final source-backed Inha units: 73
- Remaining archetype-only units: 3 (`경영융합학부`, `사회과학융합학부`, `인문융합학부`)

## Must Be Green

- `npm test --workspace @career-scope/api`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run data:collect --workspace @career-scope/api`
- `npm run data:collect:inha --workspace @career-scope/api`
- `npm run data:collect:inha:sugang --workspace @career-scope/api`
- `GET /api/pilot-readiness` has no failed blocker checks.

## Product Gates

- Report opens without Postgres through seed fallback.
- Signup returns `profileId` and `profileToken`; token hash is never returned.
- Recommended peer cards explain why the peer was recommended.
- Peer or meeting interest creates a server-side intent.
- Dashboard shows saved interests and MVP validation status.
- Report source trust shows the actual tier: ADIGA public curriculum, Inha current-term sugang signal, database, or needs-review seed.
- If the API is unavailable, report/signup/dashboard surfaces show the server-unavailable warning instead of silently implying saved actions.
- Interest records shown in the dashboard must be server-confirmed; API failure must not create local-only KPI records.

## Data Gates

- At least 5 seed departments have official source URLs.
- Inha admissions catalog covers at least 70 units.
- Inha ADIGA course-backed departments stay at 55+.
- Inha official sugang course-backed departments stay at 15+.
- Inha source-backed admission units stay at 70+ and archetype-only units stay at 5 or fewer.
- The three remaining archetype-only Inha units are shown as needs-review, not as full official curriculum.
- Live source collection has `failedSourceCount: 0`.
- Known extraction warnings are documented before a test round. Current expected warnings: Hanyang page extraction yields fewer than three generic course signals; the Inha sugang base page yields fewer than three generic signals because detailed department extraction is handled by `data:collect:inha:sugang`.
- New source data is reviewed before replacing seed rows.

## Pilot Interpretation Rules

- Fewer than 10 report views: collect signal only, do not interpret conversion rates.
- 10-30 report views: look for obvious confusion and intent creation rate directionally.
- 30+ report views: compare signup and intent conversion by scenario.

Primary KPI: `intent_created / report_viewed`.
