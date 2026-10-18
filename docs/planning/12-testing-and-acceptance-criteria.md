# 12 — Testing and Acceptance Criteria
## Nagorik Sathi AI — R&D Report v1.2

> Test plan derived from R&D §15 (Table 35). All evaluation targets are design targets to be confirmed by validation; they are not claimed results.

---

## 1. Test Strategy Overview

| Level | Scope | Tools | When |
|-------|-------|-------|------|
| Unit | Services, rule engine, registry lookups, Open311 mapping | pytest, Vitest | Per commit |
| Integration | PostgreSQL/PostGIS spatial queries, database constraints, audit log immutability | pytest + TestContainers | Per commit |
| RBAC / Security | Every matrix cell; negative authorization cases | pytest + OWASP ZAP | Per commit + pre-release |
| Frontend component | React components, form validation, accessibility | Vitest + Testing Library | Per commit |
| End-to-end (E2E) | Complete citizen and staff workflows | Playwright | Per PR + pre-release |
| AI offline evaluation | Classification, responsibility, RAG, duplicates, priority | Python evaluation scripts | Per model update |
| Performance / Load | API latency, AI pipeline p95, concurrent users | k6 | Pre-release |
| Accessibility | WCAG 2.1 AA, keyboard navigation, screen reader | axe-core, Playwright accessibility | Per PR |
| Failure recovery | AI timeout, DB failure, SSE drop, worker crash | pytest (mocks) | Per release |
| User / Prototype task testing | 20-30 citizens, a few staff — exploratory | Observed task completion | Weeks 9-10 |
| Shadow mode | AI vs. manual process on approved data | Monitoring + logging | After deployment |

---

## 2. Unit Tests

### Rule Engine (M5)
| Test ID | Description | Expected |
|---------|-------------|---------|
| UT-RE-01 | Waste report in covered ward with known asset → waste dept as lead | Correct lead dept |
| UT-RE-02 | Blocked drain with garbage → drain dept lead, waste dept prerequisite | Correct sequence |
| UT-RE-03 | Compound case: waste+drain+road → waste→drain→road ordering | Correct 3-task sequence |
| UT-RE-04 | Location outside covered wards → CRITICAL flag: unknown_location | Critical flag raised |
| UT-RE-05 | Two departments claim asset → CRITICAL flag: ownership_conflict | Hard stop |
| UT-RE-06 | Street light fault → electrical dept, no prerequisite | Correct single task |
| UT-RE-07 | Private/non-city-corp place → redirect with explanation | Correct redirect |
| UT-RE-08 | Open manhole → CRITICAL flag: hazard, Emergency priority | Emergency escalation |
| UT-RE-09 | Rule engine p95 latency ≤ 300 ms on test dataset | Latency target met |

### Confidence Gate (M5)
| Test ID | Description | Expected |
|---------|-------------|---------|
| UT-CG-01 | Confidence 0.91, no critical flag → gate passed | gate_passed=true |
| UT-CG-02 | Confidence 0.75 → gate failed | gate_passed=false, manual queue |
| UT-CG-03 | Confidence 0.85, critical flag present → hard stop | Hard stop regardless of confidence |
| UT-CG-04 | Unknown item (unverifiable) → treated as below gate | Manual queue |
| UT-CG-05 | Gate value updated by admin → new gate value applied immediately | Config reload |

### Priority Triage (M5)
| Test ID | Description | Expected |
|---------|-------------|---------|
| UT-PT-01 | Text contains "খোলা맨홀" (open manhole) → Emergency | Emergency |
| UT-PT-02 | Staff sets High; AI later sees hazard → Emergency (AI cannot lower staff-set) | Emergency escalated; no lower |
| UT-PT-03 | Staff sets Medium; no hazard cues → Medium | Staff decision preserved |
| UT-PT-04 | 5 merged reports → priority raises | Priority increase |
| UT-PT-05 | Near school + major drain blockage → High | High priority |

### Data Model Constraints
| Test ID | Description | Expected |
|---------|-------------|---------|
| UT-DM-01 | Circular prerequisite task → exception raised | Application-level check |
| UT-DM-02 | Audit log UPDATE → Postgres trigger raises exception | DB trigger fires |
| UT-DM-03 | Duplicate phone_hash insertion → UNIQUE constraint error | 409 from API |
| UT-DM-04 | Task status advance while prerequisite not done → rejected | Business logic validation |
| UT-DM-05 | Case closure without evidence (evidence_required=true) → blocked | Closure blocked |
| UT-DM-06 | Report linked to merged incident → citizen sees parent incident status | Correct status shown |

---

## 3. PostgreSQL/PostGIS Integration Tests

| Test ID | Description | Expected |
|---------|-------------|---------|
| IT-GEO-01 | GPS point inside Ward 3 boundary → ward_id=Ward3 | Correct ward |
| IT-GEO-02 | GPS point on ward boundary edge | Deterministic assignment (PostGIS WITHIN) |
| IT-GEO-03 | GPS point outside all covered wards → unknown | CRITICAL flag raised |
| IT-GEO-04 | Distance query for duplicate candidates within 100 m | Correct candidates returned |
| IT-GEO-05 | Asset geometry intersection with ward boundary | Asset correctly assigned to ward |
| IT-VEC-01 | pgvector similarity search on Bangla service knowledge | Relevant chunks retrieved |
| IT-VEC-02 | RAG query with no matching chunks → no_source response | Correct fallback |
| IT-AUD-01 | Audit event created for every state-changing operation | All 15 operation types covered |
| IT-AUD-02 | Audit event DELETE attempt → exception | Immutability enforced |

---

## 4. API and RBAC Tests

| Test ID | Covers | Expected |
|---------|--------|---------|
| T-RBAC-01 | Citizen A accesses Citizen B's report | 403 |
| T-RBAC-02 | Dept officer updates task in another department | 403 |
| T-RBAC-03 | Ward desk (Ward 3) accesses Ward 5 incident | 403 |
| T-RBAC-04 | Citizen closes a case | 403 |
| T-RBAC-05 | Dept officer approves case plan | 403 |
| T-RBAC-06 | Admin modifies audit log | 403 / DB exception |
| T-RBAC-07 | Admin alone lowers confidence gate | 403 — dual approval required |
| T-RBAC-08 | Citizen views another citizen's officer contact | 403 |
| T-RBAC-09 | Dept officer views other dept's task evidence | 403 |
| T-RBAC-10 | Public map response contains citizen identity | Not present in response |
| T-RBAC-11 | Ward desk creates system configuration | 403 |
| T-RBAC-12 | Coordinator registers a new user | 403 |
| T-RBAC-13 | Citizen accesses verification queue | 403 |
| T-API-01 | POST /reports without location_confirmed=true | 400 VALIDATION_ERROR |
| T-API-02 | POST /reports without text and without voice | 400 VALIDATION_ERROR |
| T-API-03 | POST /tasks/{id}/evidence with wrong MIME type | 400 |
| T-API-04 | PATCH /tasks/{id}/status without evidence when required | 409 INTEGRITY_CHECK_FAILED |
| T-API-05 | POST /cases/{id}/close without resolution review | 409 |
| T-API-06 | Expired JWT → 401 | 401 UNAUTHENTICATED |
| T-API-07 | GET /events/stream reconnect with Last-Event-ID | Missed events resent |
| T-API-08 | GET /public/analytics — confirm no personal data in response | Privacy check |
| T-API-09 | Rate limit: 101 requests/min from citizen | 429 RATE_LIMITED |

---

## 5. Frontend Component Tests

| Test ID | Component | Expected |
|---------|-----------|---------|
| CT-FE-01 | PriorityBadge: Emergency renders red with "জরুরি" | Correct colour and text |
| CT-FE-02 | AiProposalPanel: confidence 0.91 displays "৯১%" | Correct display |
| CT-FE-03 | ReportWizard: cannot submit without location_confirmed | Submit disabled |
| CT-FE-04 | StatusTimeline: 8 statuses render in correct order | Correct order |
| CT-FE-05 | EvidencePanel: shows masked indicator for is_masked=true | Masking shown |
| CT-FE-06 | VoiceRecorder: handles microphone permission denied | Error state shown |
| CT-FE-07 | CitizenResponse: objection requires text | Submit disabled without reason |
| CT-FE-08 | DependencyView: Task 2 shows "waiting for Task 1" | Correct prereq display |
| CT-FE-09 | Form inputs: font-size >= 16px (iOS zoom prevention) | No zoom on focus |
| CT-FE-10 | All interactive elements: keyboard Tab reachable | Keyboard accessible |

---

## 6. Playwright End-to-End Flows

| Flow ID | Description | Steps | Expected |
|---------|-------------|-------|---------|
| E2E-01 | Citizen report complete journey | Register → Submit report (text + GPS + photo) → Wait for AI → View verified status → View officer details | Case created; status visible; officer shown |
| E2E-02 | Ward desk verification | Login → View queue → Open AI proposal → Accept proposal → Verify → Case appears as Verified | Case moves to Verified |
| E2E-03 | Multi-department compound case | Admin creates compound case → Waste task done → Drain task unlocks → Road task unlocks → All resolved | Sequential unlock works |
| E2E-04 | Citizen objection and re-review | Citizen sees "Resolved" → Objects → Task re-opened → Dept re-uploads evidence → Citizen accepts | Re-open and re-close works |
| E2E-05 | Emergency report | Citizen reports open manhole → Emergency escalation → Ward desk gets urgent alert at top of queue | Emergency priority; urgent alert |
| E2E-06 | Duplicate merge | Two reports at same location → Ward desk sees candidate → Confirms merge → One map pin | Merge works; linked count = 2 |
| E2E-07 | AI unavailable fallback | AI worker killed → Citizen submits report → UI shows manual mode banner → Ward desk can process manually | Manual mode works |
| E2E-08 | Service guidance RAG | Citizen asks service question → Answer with source shown | Correct source display |
| E2E-09 | Public map loads | Anonymous visit → Map loads with incident pins → Filter by ward | Map functional |
| E2E-10 | Admin confidence gate change | Admin proposes gate lower → Second admin approves → Gate changed → Audit log shows change | Dual approval works |
| E2E-11 | SSE real-time update | Citizen has report open → Ward desk verifies → Citizen UI updates without refresh | SSE works |
| E2E-12 | Accessibility keyboard-only | Complete E2E-01 using keyboard only (no mouse) | All actions keyboard-reachable |

---

## 7. AI Offline Evaluation

> These require labelled data and are research measurements, not automated pass/fail tests.

| Evaluation | Metric | Design Target | Method |
|------------|--------|--------------|--------|
| Problem type classification | Macro-F1 (waste/drain/road/street_light) | >= 0.80 | Human-verified held-out Bangla text set |
| Problem type classification | Per-class F1 reported separately | — | Same held-out set |
| Responsibility assignment | Correct dept rate | >= 90% | Verified ward+asset+dept data set |
| Responsibility assignment | Wrong hand-off rate | <= 5% | Same held-out set |
| Confidence calibration | Expected Calibration Error (ECE) | <= 0.05 | Reliability diagram; held-out set |
| Priority triage | Emergency/High recall | >= 0.95 | Staff-labelled set |
| Priority triage | Weighted kappa vs. staff labels | >= 0.70 | Staff-labelled set |
| Voice transcription | WER on Bangla voice messages | <= 20% | Held-out voice recordings |
| Service guidance | Correctness, source consistency | >= 95% on reviewed set | Government guidance + human review |
| Duplicate detection | Precision / Recall | >= 0.85 / >= 0.80 | Verified same/different incident pairs |
| Hotspot detection | Agreement with engineer review | Assessed in pilot | Engineer feedback |

**Evaluation data requirements:**
- All labelled data must be new (not used in training) and from a different time period or ward where possible
- Near-duplicate complaints about the same incident are NOT split across train and test sets
- Results for formal Bangla, colloquial speech, misspellings, and incomplete addresses reported separately
- Shadow mode agreement rate measured before gate is activated
- No "accuracy" claims until evaluation has been run

---

## 8. Performance and Latency Tests (k6)

| Test ID | Target | Method |
|---------|--------|--------|
| PERF-01 | AI pipeline p95 ≤ 8 s | Load test: 50 concurrent report submissions; measure job completion time |
| PERF-02 | Rule engine p95 ≤ 300 ms | Load test: 200 concurrent rule evaluations from Redis cache |
| PERF-03 | Map tile + incident data load ≤ 2 s | Browser load test with k6 browser |
| PERF-04 | Verification queue load ≤ 2 s | 20 concurrent ward desk sessions |
| PERF-05 | Concurrent users supported | Validate target count (city corporation scope); no advance claim |

---

## 9. Security Tests

| Test ID | Description | Tool |
|---------|-------------|------|
| SEC-01 | OWASP ZAP automated scan on all endpoints | OWASP ZAP |
| SEC-02 | SQL injection attempts on text inputs including Bangla | ZAP + custom Bangla corpus |
| SEC-03 | JWT tampering: modify role claim | pytest |
| SEC-04 | JWT replay after logout | pytest |
| SEC-05 | MFA skip attempt for staff | pytest |
| SEC-06 | File upload: wrong MIME, oversized, path traversal | pytest |
| SEC-07 | Audit log immutability: UPDATE/DELETE attempt | pytest (direct DB) |
| SEC-08 | Gate dual-approval: solo admin attempt | pytest |
| SEC-09 | CORS: cross-origin request from non-allowlisted domain | pytest |
| SEC-10 | Public map response: no citizen identity in JSON | Automated JSON field check |

---

## 10. Accessibility Tests

| Test ID | Description | Tool |
|---------|-------------|------|
| ACC-01 | axe-core scan on all citizen-facing screens | axe-core + Playwright |
| ACC-02 | Keyboard-only E2E flow (complete report submission) | Playwright (no click) |
| ACC-03 | Colour contrast: all text on background | axe-core |
| ACC-04 | Focus visible on all interactive elements | Playwright |
| ACC-05 | Emergency banner ARIA live assertive | Playwright + screen reader |
| ACC-06 | Bangla text font size >= 16px in citizen intake | CSS computed style check |
| ACC-07 | Touch targets >= 44x44px | Playwright element size check |
| ACC-08 | Reduced motion: animations disabled | CSS media query check |
| ACC-09 | Form labels associated with inputs | axe-core |
| ACC-10 | Dialog focus trap | Playwright keyboard test |

---

## 11. Failure Recovery Tests

| Test ID | Failure | Expected Recovery |
|---------|---------|------------------|
| FR-01 | AI worker killed mid-job | Job moves to dead-letter; manual mode activated; user notified |
| FR-02 | AI worker timeout > 10 s | Backend detects; switches to manual mode; user told clearly (S6) |
| FR-03 | PostgreSQL connection lost | 503 returned; circuit breaker opens; reconnects; no data loss |
| FR-04 | MinIO unreachable | Upload returns 503; retry queued; no orphaned records |
| FR-05 | SSE connection dropped by client | Reconnect with Last-Event-ID; missed events resent |
| FR-06 | Redis connection lost | DB reads for rule cache miss; performance degrades but correctness maintained |
| FR-07 | Draft saving on offline | IndexedDB draft preserved; auto-submit on reconnect |
| FR-08 | Partial media upload (connection drop) | Resumable upload resumes from last completed chunk |

---

## 12. Prototype Task and Usability Evaluation (R&D §15.2)

> This is observational user research, not automated testing. Results are exploratory; sample does not represent the whole country.

**Participants:** 20-30 citizens; a few service-centre staff — depending on capacity  
**Tasks for citizens:**
1. Find the right service (service guidance)
2. File a complaint in Bangla
3. View progress of an existing complaint
4. Express dissatisfaction with a resolution

**Tasks for staff:**
1. Process the verification queue
2. Review an AI proposal for a compound case
3. Assign and sequence tasks
4. Upload evidence for a completed task

**Measurements:**
- Task success rate (target >= 80%)
- Task completion time
- Help needed (researcher intervention count)
- System Usability Scale (SUS) score (target >= 70)
- Where users get stuck (observation notes)

**Note:** "Even if a feature already exists in the current system, whether users can actually find it is documented separately." (R&D §15.2)

---

## 13. Research Questions (R&D §15.1)

1. When location and photo information are added to a Bangla statement, how much does responsibility assignment change?
2. When the source and reasons for responsibility are shown, how easily can citizens and officers detect and correct a wrong assignment?
3. When several departments' work is shown in one case, how do coordination steps, time and citizen experience change?

**Evidence source:** Automated test results (measurable) and research observations (qualitative); these are kept separate from production claims.

---

## 14. Test Evidence and Reporting

| Evidence Type | Source | Status |
|--------------|--------|--------|
| Unit/integration test pass/fail | pytest CI output | Automated |
| E2E test pass/fail | Playwright CI output | Automated |
| RBAC test results | pytest CI output | Automated |
| Security scan results | ZAP HTML report | Automated |
| Accessibility audit results | axe-core report | Automated |
| Load test results | k6 summary | Automated |
| AI offline evaluation metrics | Research scripts + labelled data | Research measurement (requires labelled dataset) |
| Usability task results | Observation notes + SUS forms | Research measurement (requires participants) |
| Shadow mode agreement rate | Production monitoring logs | Requires live deployment |
| Pilot resolution time | Approved real pilot data | Requires city corporation cooperation |

---

## 15. Department Workspace, Workload & Queue Acceptance Tests (Explicit Addition)

| # | Test Scenario | Acceptance Criteria | Test Target |
|---|---------------|---------------------|-------------|
| T1 | Classification & Routing | Problem classified, asset resolved, explainable department recommendation produced | `test_ai_gate.py` |
| T2 | Low-Confidence Fallback | Confidence < 80% or unknown asset/location sent to human verification queue | `test_ai_gate.py` |
| T3 | Department Accept/Reject | Explicit acceptance marks task accepted; rejection requires mandatory Bangla reason and returns case to review | `test_officer_workflow.py` |
| T4 | Free Officer Recommendation | Available eligible officer with capacity receives top ranked recommendation with rationale | `test_officer_workflow.py` |
| T5 | Queueing on Saturation | When all officers are busy or at max capacity, task enters `task_waiting_queue` with status `QUEUED` | `test_officer_workflow.py` |
| T6 | Reactive Queue Dispatch | Releasing officer capacity / toggling status to `AVAILABLE` triggers automatic assignment | `test_officer_workflow.py` |
| T7 | Inactive/Busy Exclusion | Officers in `BUSY`, `ON_LEAVE`, `OFFLINE`, or `INACTIVE` state are excluded from recommendations | `test_officer_workflow.py` |
| T8 | Ward/Dept Boundary Guard | Officers from wrong department or non-covering ward cannot be assigned | `test_officer_workflow.py` |
| T9 | Strict Capacity Ceiling | An officer's active assigned tasks cannot exceed `max_concurrent_tasks` | `test_officer_workflow.py` |
| T10 | Priority & SLA Ordering | Emergency tasks and impending SLA breaches are dispatched ahead of older routine FIFO items | `test_officer_workflow.py` |
| T11 | Prerequisite Guard | Dependent road-repair tasks remain locked in `BLOCKED` status until drain cleaning completes | `test_officer_workflow.py` |
| T12 | Concurrency Safety | Parallel dispatch requests use transactional row locks (`SELECT FOR UPDATE`), preventing double-dispatch | `test_officer_workflow.py` |
| T13 | Rejection Workflow Escalate | Rejected task transitions back to coordinator without data loss; case status reflects rejection | `test_officer_workflow.py` |
| T14 | History Preservation | Reassignment logs previous officer, new officer, actor, and reason into `task_assignment_history` | `test_officer_workflow.py` |
| T15 | Scope & RBAC Enforced | Unauthorized roles (citizens, officers of other departments) receive 403 Forbidden | `test_officer_workflow.py` |
| T16 | State & Notifications | Queue status transitions to `DISPATCHED` and notification is delivered to assigned officer | `test_officer_workflow.py` |
| T17 | Restart Persistence | Tasks held in `task_waiting_queue` survive backend restarts with position and metadata intact | `test_officer_workflow.py` |
| T18 | Full Compound Scenario | Waste → Drain → Road end-to-end multi-department flow completes with evidence, objection, and closure | `test_case_workflow.py` |

