# Inha Pilot Data Notes

## Sources

- Primary source: 2026학년도 인하대학교 수시모집요강, `II. 모집단위별 입학정원`
- Download URL: https://admission.inha.ac.kr/ajaxfile/CMN_SVC/FileView.do?GBN=X04_1&TEMP_CODE=IPSI_A&CONFIG_CD=C1405&CONFIG_SEQ=6&SITE_NO=2&SUB_SEQ=8&FD=Y
- Supplemental source: ADIGA 대입정보포털 인하대학교 설치학과/학과정보
- Supplemental URL: https://www.adiga.kr/ucp/uvt/uni/univDetailSubject.do?menuId=PCUVTINF2000&unvCd=0000169&searchSyr=2026
- Official current-term source: 인하대학교 수강신청 2026학년도 1학기 강의시간표 및 강의계획서
- Official current-term URL: https://sugang.inha.ac.kr/sugang/SU_51001/Lec_Time_Search.aspx
- Collection date: 2026-05-16

## What Is Covered

- All undergraduate admission units listed in the source table are represented in `apps/api/src/data/inhaDepartments.ts`.
- Each unit has college, department/admission unit, capacity, academic track, focus tags, source tier, and course-signal seed.
- ADIGA collection currently adds 69 public department pages, 58 with non-empty course lists.
- Official Inha sugang collection adds current-term major course signals for 18 ADIGA gaps, 15 of them with enough course signals to replace archetype-only seed.
- 73 of the 76 Inha admission units now use ADIGA course lists or official Inha sugang course signals instead of archetype-only course signals.
- 3 units remain archetype-only because the official sugang page currently exposes only one generic course signal: 경영융합학부, 사회과학융합학부, 인문융합학부.
- `/api/insights` now returns `curriculumTrust` so the report can distinguish ADIGA full course lists, Inha current-term sugang course signals, and needs-review archetype seed.
- `/api/inha-departments` keeps `adigaMissingAdmissionDepartments` for raw ADIGA gaps, while `missingAdmissionDepartments` means final remaining archetype-only units after the sugang fallback.
- `/api/inha-departments` exposes the normalized catalog and coverage summary for QA.
- Re-run the supplemental collector with `npm run data:collect:inha --workspace @career-scope/api`.
- Re-run the official current-term collector with `npm run data:collect:inha:sugang --workspace @career-scope/api`.

## Current Limitation

The department/admission-unit list is official from Inha admissions. ADIGA provides fuller public course lists for 58 units. The Inha sugang source is official, but it is a current-semester offered-course schedule, not a full four-year curriculum table. Product copy must preserve that distinction.

Next data pass should replace the remaining 3 archetype-only 융합학부 rows with a true curriculum page/PDF or department-level guide if Inha publishes one outside the current-term sugang schedule.
