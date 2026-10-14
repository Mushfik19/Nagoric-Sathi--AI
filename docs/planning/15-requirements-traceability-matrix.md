# 15 — Requirements Traceability Matrix
## Nagorik Sathi AI — R&D Report v1.2

> Links R&D requirements → workflow → module → screen → API → data entity → authorization rule → test.
> **Status codes:** S = Specified (R&D source), P = Proposed (implementation decision), NC = Needs Clarification, OOS = Out of Scope (this phase)

---

## 1. Core Functional Requirements

| Req ID | R&D Source | Description | Workflow | Module | Screen | API | Entity | Auth Rule | Test |
|--------|-----------|-------------|---------|--------|--------|-----|--------|-----------|------|
| FR-M1-01 | R&D Table 9 | Citizens submit in Bangla text or voice | §4 Flow 1 | M1 | S-CIT-02 | POST /reports | reports.raw_text_bn / voice_file_key | CITIZEN: C own | T-API-01, E2E-01 |
| FR-M1-02 | R&D Table 9 | AI transcribes voice; original kept | §4 Async path | M4 | S-CIT-02 | (async job) | reports.transcription_text_bn, voice_file_key | System only | UT-RE-09 |
| FR-M1-03 | R&D §2.3 | Photo and video upload from start | §4 Flow 1 | M1 | S-CIT-04 | POST /reports/{id}/media | report_media | CITIZEN: C own | T-API-03, E2E-01 |
| FR-M1-04 | R&D Table 9 | System asks where, how long, public/private | §4 Flow 1 | M1 | S-CIT-02/03 | POST /reports | reports.location_description, is_public_place, reported_duration | CITIZEN: C own | CT-FE-03 |
| FR-M1-05 | R&D Table 9 | GPS pin confirmed by citizen | §4 Flow 1 | M1 | S-CIT-03 | POST /reports | reports.reported_location, location_confirmed_by_citizen | CITIZEN: C own | IT-GEO-01 |
| FR-M1-06 | R&D §10.9 | API returns 202 Accepted + job ID | §4 Async | M1 | S-CIT-05 | POST /reports → 202 | ai_jobs | System | T-API-01 |
| FR-M1-07 | R&D §2.3 | Consent before location use | §4 Flow 1 | M9 | S-CIT-01 | POST /auth/register | consent_records | CITIZEN: C own | E2E-01 |
| FR-M1-08 | R&D §7.3 | Drafts saved for weak connections | §6 Fallback | M1 | S-CIT-02 | (IndexedDB, offline) | (client-side) | CITIZEN | FR-07 |
| FR-M1-09 | R&D §2.3 | Ward desk may file on behalf of citizen | §4 Assisted | M1 | S-WARD-03 | POST /reports | reports.submission_channel=ward_desk | WARD_DESK: C | E2E-01 |
| FR-M2-01 | R&D §10.7 | Retrieve from verified docs; answer from retrieved text only | §1 Service path | M2 | S-CIT-09 | POST /guidance/query | service_knowledge, knowledge_sources | PUBLIC+any | IT-VEC-01 |
| FR-M2-02 | R&D §10.7 | Show source, area, and update date | §1 Service path | M2 | S-CIT-09 | POST /guidance/query | knowledge_sources.last_verified_at | PUBLIC | E2E-08 |
| FR-M2-03 | R&D §10.7 | If no source: say so; hand to staff | §1 Service path | M2 | S-CIT-09 | POST /guidance/query → no_source | — | — | IT-VEC-02 |
| FR-M2-04 | R&D §10.7 | Never answer fees/eligibility from model memory | §1 Service path | M2 | S-CIT-09 | POST /guidance/query | — | — | Manual review |
| FR-M3-01 | R&D Table 11 | Eight status values | §3 Closure | M3, M7, M8 | S-CIT-07 | GET /incidents/{id} | incidents.status, status_history | CITIZEN: R own | CT-FE-04 |
| FR-M3-02 | R&D Table 11 | Status visible in real time | §4 Async | M3 | S-CIT-07 | GET /events/stream | incidents.status | CITIZEN: R own | E2E-11 |
| FR-M3-03 | R&D Table 9 | Waiting reasons shown if blocked | §2 Work phase | M3, M7 | S-CIT-07 | GET /incidents/{id} | dept_tasks.waiting_reason | CITIZEN: R own | CT-FE-08 |
| FR-M3-04 | R&D Table 9 | Officer details shown on citizen's own case only | §2 Work phase | M5 | S-CIT-07 | GET /incidents/{id} | officers.* | CITIZEN: R own case | T-RBAC-08 |
| FR-M3-05 | R&D Table 9 | Staff proof shown at Resolved status | §3 Closure | M8 | S-CIT-07 | GET /incidents/{id}.proof_evidence | evidence_files | CITIZEN: R visible | CT-FE-05 |
| FR-M3-06 | R&D §6.5 | Live map: incidents, never reporters | §4 Map | M3, M10 | S-PUB-02 | GET /public/map | incidents.location | PUBLIC | T-RBAC-10, E2E-09 |
| FR-M3-07 | R&D Table 9 | Notifications via SMS/e-mail/push with consent | §2 Work phase | M3 | All | (notification service) | notification_preferences, consent_records | CITIZEN: consent | E2E-01 |
| FR-M3-08 | R&D Table 9 | Citizen feedback and objection | §3 Closure | M3, M8 | S-CIT-08 | POST /cases/{id}/citizen-response | citizen_responses | CITIZEN: F own | E2E-04 |
| FR-M5-01 | R&D Table 9 | Ward boundary + asset owner + rules → departments | §4 Routing | M5 | S-WARD-03 | GET /reports/{id}/ai-proposal | wards, assets, responsibility_rules, ai_results | WARD_DESK: R ward | UT-RE-01, IT-GEO-01 |
| FR-M5-02 | R&D §10.11 | Confidence gate: 80% initial | §4 Routing | M5 | S-WARD-03 | GET /reports/{id}/ai-proposal | ai_results.gate_passed | System | UT-CG-01 |
| FR-M5-03 | R&D §10.11 | Below gate → manual; at/above gate → proposal | §4 Routing | M5 | S-WARD-03 | GET /reports/{id}/ai-proposal | ai_results.gate_passed | System | UT-CG-01, UT-CG-02 |
| FR-M5-04 | R&D Table 26 | Critical flags always stop process | §4 Routing | M5 | S-WARD-03 | GET /reports/{id}/ai-proposal | ai_results.critical_flag | System | UT-CG-03, E2E-05 |
| FR-M5-05 | R&D Table 12 | AI proposes priority with reasons | §4 Routing | M5 | S-WARD-03 | GET /reports/{id}/ai-proposal | ai_results.proposed_priority | WARD_DESK: R | UT-PT-01 |
| FR-M5-06 | R&D §10.5 | Staff override priority with recorded reason | §4 Routing | M5 | S-WARD-03 | POST /incidents/{id}/verify | priority_history.reason | WARD_DESK: O | UT-PT-03 |
| FR-M5-07 | R&D §10.5 | AI cannot lower staff-set priority | §4 Routing | M5 | — | (backend enforcement) | priority_history | System (S9) | UT-PT-02 |
| FR-M5-08 | R&D §10.5, S9 | Emergency always triggers urgent escalation | §4 Emergency | M5 | S-WARD-02 | (immediate SSE + notification) | incidents.priority=emergency | System | E2E-05 |
| FR-M5-10 | R&D Table 24 | Officer directory: name, designation, phone, email, ward, backup, validity | §2 Work | M5 | S-CIT-07 | GET /incidents/{id}.lead_officer | officers.* | CITIZEN: own case; WARD_DESK: ward | T-RBAC-08 |
| FR-M6-01 | R&D §10.8 | Duplicate candidates: GPS + type + time + text | §5 Duplicate | M6 | S-WARD-03 | GET /reports/{id}/ai-proposal.duplicate_candidates | ai_results.duplicate_candidates | WARD_DESK: R | E2E-06 |
| FR-M6-03 | R&D §10.8 | Staff confirm before merge; one incident, one pin | §5 Duplicate | M6 | S-WARD-03 | POST /incidents/{id}/duplicate-action | duplicate_links | WARD_DESK: A ward | E2E-06 |
| FR-M6-05 | R&D §10.8 | Each reporter sees own status; identities hidden | §5 Duplicate | M6, M3 | S-CIT-07 | GET /incidents/{id} | incidents.canonical_report_id | CITIZEN: own only | T-RBAC-01 |
| FR-M6-06 | R&D §10.8 | Links reversible | §5 Duplicate | M6 | S-WARD-03 | POST /incidents/{id}/duplicate-action | duplicate_links.is_reversible | WARD_DESK: A | — |
| FR-M6-09 | R&D §10.8 | Hotspot: repeated closure and return | §5 Hotspot | M6 | S-COORD-04 | GET /hotspots | hotspot_zones | COORD: R | — |
| FR-M6-11 | R&D §10.8 | AI review note: history, photos, alternative solutions | §5 Hotspot | M6 | S-COORD-03 | GET /hotspots | hotspot_zones.ai_review_note | COORD: R | — |
| FR-M7-01 | R&D §6.3 | One case holds all tasks for one problem | §2 Work | M7 | S-COORD-03 | GET /cases/{id} | cases, dept_tasks | COORD, WARD_DESK: R | E2E-03 |
| FR-M7-03 | R&D Table 23 | Task prerequisites and sequencing | §2 Work | M7 | S-COORD-03 | POST /cases (plan_sequence) | task_prerequisites | COORD: A | UT-DM-04, E2E-03 |
| FR-M7-06 | R&D §6.3 | Department accepts or rejects task | §2 Work | M7 | S-DEPT-03 | POST /tasks/{id}/accept, /reject | dept_tasks.status | DEPT_OFFICER: own | T-RBAC-02 |
| FR-M7-07 | R&D §12.1 | Rejection re-routed; nothing dropped | §2 Work | M7 | S-COORD-03 | POST /tasks/{id}/reject → reroute | dept_tasks | DEPT_OFFICER: own | E2E-03 |
| FR-M8-01 | R&D Table 9 | Department uploads proof shown to citizen | §3 Closure | M8 | S-CIT-07 | POST /tasks/{id}/evidence | evidence_files.visible_to_citizen | DEPT_OFFICER: C own | E2E-04 |
| FR-M8-02 | R&D Table 9 | Closure blocked without evidence | §3 Closure | M8 | S-DEPT-03 | PATCH /tasks/{id}/status → 409 | dept_tasks.evidence_required | System (S8) | UT-DM-05, T-API-04 |
| FR-M8-03 | R&D Table 9 | Citizen confirms or objects | §3 Closure | M8 | S-CIT-08 | POST /cases/{id}/citizen-response | citizen_responses | CITIZEN: F own | E2E-04 |
| FR-M8-05 | R&D Table 26 | Objection re-opens related task | §3 Closure | M8 | S-CIT-08 | POST /cases/{id}/citizen-response (objects) | dept_tasks.status=re_opened | CITIZEN: F (S8) | E2E-04 |
| FR-M9-01 | R&D Table 29 | MFA for all staff | §N/A Auth | M9 | Login | POST /auth/mfa/verify | users.mfa_enabled | All staff roles | SEC-05, T-API-06 |
| FR-M9-04 | R&D §11 | Immutable audit log | All workflows | M9 | S-ADMIN-06 | GET /audit | audit_events | ADMIN: H | IT-AUD-01, IT-AUD-02, SEC-07 |
| FR-M10-03 | R&D Table 14 | Public dashboard: aggregated only | §7 Analytics | M10 | S-PUB-03 | GET /public/analytics | — | PUBLIC | T-API-08 |
| FR-M10-05 | R&D §10.11 | Gate lowering: dual approval | §7 Config | M10 | S-ADMIN-03 | PUT /admin/config/routing_confidence_gate | system_config | ADMIN: dual A | E2E-10, T-RBAC-07 |

---

## 2. Safety Rules Traceability

| Safety Rule | R&D Source | Enforcing Module | API Enforcement | Test |
|-------------|-----------|-----------------|----------------|------|
| S1: Below gate → fallback | R&D Table 33 | M5, confidence_gate.py | GET /ai-proposal gate_passed=false | UT-CG-02, FR-01 |
| S2: Pass → pre-filled proposal | R&D Table 33 | M5 | GET /ai-proposal gate_passed=true | UT-CG-01 |
| S3: Critical flag → hard stop | R&D Table 33 | M5 | GET /ai-proposal critical_flag=true → 422 | UT-CG-03, E2E-05 |
| S4: Unknown → below gate | R&D Table 33 | M5 | (no_source path) | UT-CG-04 |
| S5: Always human in loop | R&D Table 33 | M7, M8 | No auto-close endpoint; POST /cases/{id}/close requires coordinator | T-RBAC-04, T-API-05 |
| S6: AI failure → manual mode | R&D Table 33 | AI worker + circuit breaker | 503 AI_UNAVAILABLE + SSE banner | E2E-07, FR-01, FR-02 |
| S7: Gate governance | R&D Table 33 | M10 | PUT /admin/config + dual approval | E2E-10, T-RBAC-07 |
| S8: Closure rule | R&D Table 33 | M7, M8 | POST /cases/{id}/close → validation | T-API-05, UT-DM-05 |
| S9: Emergency/hazard priority | R&D Table 33 | M5 | (backend: priority never lowered from staff-set) | UT-PT-02, E2E-05 |
| S10: Privacy by default | R&D Table 33 | M9, M3 | All responses: no citizen identity | T-RBAC-01, T-RBAC-10, T-API-08 |

---

## 3. Non-Functional Requirements Traceability

| NFR | R&D Source | Architecture | Test |
|-----|-----------|-------------|------|
| NFR-PERF-01: AI p95 ≤ 8 s | R&D Table 27 | Async AI workers + ONNX | PERF-01 |
| NFR-PERF-02: Rule engine p95 ≤ 300 ms | R&D §10.9 | Redis cache + in-memory engine | UT-RE-09, PERF-02 |
| NFR-PERF-03: AI timeout > 10 s → manual | R&D §10.9 | Circuit breaker in backend | FR-02 |
| NFR-SEC-01: TLS 1.3 | R&D Table 29 | Nginx TLS termination | SEC-01 (ZAP) |
| NFR-SEC-02: AES-256 at rest | R&D Table 29 | MinIO SSE + app encryption | SEC-01 |
| NFR-SEC-03: MFA for staff | R&D Table 29 | M9 auth | SEC-05, T-RBAC tests |
| NFR-SEC-05: Append-only audit | R&D §11 | Postgres trigger | IT-AUD-02, SEC-07 |
| NFR-PRIV-01: Citizen identity hidden | R&D §11, S10 | M9 RBAC | T-RBAC-01, T-RBAC-10 |
| NFR-PRIV-02: Location once with permission | R&D §2.3 | M9 consent | E2E-01 |
| NFR-ACCESS-01: WCAG 2.1 AA | R&D Table 34 | CSS design tokens, axe-core | ACC-01 to ACC-10 |
| NFR-STD-01: Open311-style | R&D Table 34 | API response schema | UT-DM tests |

---

## 4. Out-of-Scope Requirements (this phase)

| Item | Status | Phase |
|------|--------|-------|
| AI photo/video content analysis | OOS | Phase 2 |
| Photo/video duplicate similarity | OOS | Phase 2 |
| Seasonal risk forecasting | OOS | Phase 2 |
| Pre-monsoon inspection list | OOS | Phase 2 (when enough history) |
| Native Android client | OOS | Phase 2 |
| Read-aloud text mode | OOS | Phase 2 |
| Road-cutting/repair coordination | OOS | Phase 2 |
| Full GRS / National Portal integration | OOS | Future (requires formal agreement) |
| 333 helpline integration | OOS | Future (optional; requires operator agreement) |
| Licence issuance or payments | OOS | Permanently out of scope |
| Autonomous legal responsibility decisions | OOS | Permanently out of scope |
| Continuous citizen location tracking | OOS | Permanently out of scope |

---

## 5. Requirements Needing Clarification

| ID | Requirement | NC Reason | Impact | Priority |
|----|------------|-----------|--------|----------|
| Q1 | Which city corporation? | Affects all geographic data | Critical | Must resolve before Phase 0 |
| Q2 | Which 3-5 specific wards? | Affects asset registry, officer directory | Critical | Must resolve before Phase 0 |
| Q3 | Exact list of 10-15 service-information items | Affects M2 RAG corpus | High | Must resolve before Phase 1 |
| Q4 | Which SMS gateway provider? | Affects M3 notifications | High | Must resolve before Phase 4 |
| Q5 | Hotspot threshold (N recurrences, T time window) | Affects M6 configuration | Medium | City corporation to set; before Phase 3 |
| Q6 | Real department connections approved for v1? | Affects M7 demo vs. real | Medium | Affects demo scope |
| Q7 | NID required for citizen registration? | Affects M9 identity model | Medium | Security/privacy decision |
| Q8 | CloudApper capability verification results? | Affects optional integration | Low | Before Phase 3 if integration needed |
| Q9 | Audit log retention policy | Affects D5 schema | Medium | City corporation / legal requirement |
| Q10 | Specific AI models for ASR and NLU? | Affects Phase 2 implementation | High | Must resolve before Phase 2 |
| Q11 | Evaluation labelled dataset — available or to be created? | Affects Phase 6 timeline | High | Must resolve before Phase 5 |

---

## 6. Inconsistency Resolution Log

| ID | Inconsistency | Resolution |
|----|--------------|-----------|
| INC-01 | R&D mentions "ward desk officer" and "service-centre entrepreneur" as separate stakeholders but maps to one RBAC role (WARD_DESK) | Treated as one role per RBAC matrix; service-centre staff have the same interface and permissions as ward desk staff |
| INC-02 | R&D says "photo analysis is added step by step" — could imply partial v1 analysis | Confirmed OOS for v1: upload is passive storage; all AI photo/video interpretation is phase 2 |
| INC-03 | DFD has 7 processes; application has 10 modules | Explicitly mapped in 05-dfd-and-sequence-design.md §4; they are different decompositions (data-flow vs. functional); not an error |
| INC-04 | R&D mentions "about 10-15 verified service-information items" — exact count not specified | Confirmed as NEEDS CLARIFICATION (Q3); fixture of 10 items used for prototype until real list confirmed |
| INC-05 | R&D says "confidence >= gate" shows proposal — does this include cases where only one critical field is below 80%? | Specified in 11-ai-pipeline-and-safety.md: any single critical field below minimum confidence (location < 85%) → treated as below gate; conservative interpretation chosen |
