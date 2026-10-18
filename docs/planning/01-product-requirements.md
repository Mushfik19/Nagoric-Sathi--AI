# 01 — Product Requirements
## Nagorik Sathi AI — R&D Report v1.2

> **Source of truth**: R&D Report v1.2. All requirements are derived from the R&D document.
> Proposed implementation decisions are marked **[PROPOSED]**. Items needing confirmation: **[NEEDS CLARIFICATION]**.

---

## 1. Product Definition

**Problem statement (R&D §2.1):**
There is no explainable, coordinated and evidence-backed channel that carries a citizen's need from the first report, through responsibility assignment and multi-department work, to verified resolution and follow-up. A single citizen problem (e.g. a blocked drain full of garbage damaging the road) may involve waste removal, drain cleaning and road repair under different departments.

**Core principle (R&D):** AI proposes, people decide. An AI recommendation is shown as a pre-filled proposal only when its confidence reaches the routing gate and no critical flag exists; anything else falls back to ward-desk staff verification. The AI never closes a case and never declares a citizen satisfied.

---

## 2. Objectives (R&D §2.2)

| # | Objective |
|---|-----------|
| O1 | Compare existing Bangladeshi civic services with selected international initiatives |
| O2 | Identify real improvement areas through citizen and officer experience |
| O3 | Build a method to determine the problem and the responsible department from a Bangla statement plus a verified location |
| O4 | Show the work of several departments, and the verification of its resolution, inside one case |
| O5 | Compare a simple baseline with advanced methods under a fair evaluation plan |
| O6 | Give citizens live visibility of every incident on a map, with the responsible department and officer shown, while keeping citizen identity hidden |
| O7 | Triage problems by AI-assisted priority level (Emergency, High, Medium, Low) and mark repeat-problem zones with suggested alternative solutions |
| O8 | Establish a scalable, standards-based, AI-ready civic platform for later expansion |

---

## 3. Stakeholders and Roles (R&D §2.3, Table 1)

| Role | Primary Needs | Main Platform Functions |
|------|--------------|-------------------------|
| Citizen | Simple Bangla interaction, clear responsible office, visible progress, a way to object to a wrong fix | Intake, service guidance, progress view, evidence view, feedback and objection |
| Ward-desk / service-centre staff | Help assisted users without re-entering the story | Assisted intake, same case number, verification queue, plan approval |
| Department officer / field staff | Know exactly which task is theirs, prerequisites, proof needed | Assigned tasks, prerequisites, status and evidence upload |
| Case coordinator / senior officer | See stalled cases, waiting reasons and repeat problems | Sequencing approval, closure review, repeat-issue insight |
| Administrator | Governance, configuration, audit | User management, rules and gate configuration, audit review |
| Public (unauthenticated) | Transparency | Public dashboard (aggregated, no personal data) |

---

## 4. First-Version Scope (R&D §2.3)

### In Scope (v1)
- One city corporation, 3-5 wards
- Four problem types: waste, drain, street light, road
- Approximately 10-15 verified service-information items
- Citizen and staff interfaces (React PWA)
- Bangla text and voice intake (AI transcribes voice; original kept)
- Photo and video upload from the start (AI interpretation = phase 2)
- Multi-department case coordination with task prerequisites
- Same-incident linking confirmed by staff
- Resolution verification with citizen objection rights
- AI priority triage (Emergency, High, Medium, Low) — staff-overridable
- Live incident map (pins = incidents, not reporters)
- Officer directory with names and official contacts
- Public transparency dashboard (aggregated)
- SMS/phone fallback channel (basic, consent-based)
- SLA timers and escalation logic
- Hotspot marking (repeat-problem zones)
- Routing confidence gate at 80% (configurable)

### Out of Scope (v1)
- Full national service integration (GRS, National Portal, myGov, 333 — needs formal agreement)
- Issuing licences or taking payments
- AI-based photo/video interpretation (phase 2)
- Autonomous legal decisions on responsibility
- Continuous tracking of citizen movement
- Any real department connection without that department's approval
- Native Android client (phase 2)
- Full offline sync (drafts only in v1)
- Seasonal risk forecasting (phase 2)
- Road-cutting/repair coordination (phase 2)

---

## 5. Module Requirements (R&D Table 10)

### M1: Intake (text, voice, photo, video)
| ID | Requirement |
|----|-------------|
| FR-M1-01 | Citizens submit in Bangla text or voice recording |
| FR-M1-02 | AI transcribes voice; original recording kept |
| FR-M1-03 | Photos and videos attached from the start |
| FR-M1-04 | System asks: where, for how long, public or private |
| FR-M1-05 | Live GPS pin, names and addresses confirmed by citizen |
| FR-M1-06 | API returns 202 Accepted with job ID immediately |
| FR-M1-07 | Consent obtained before location use |
| FR-M1-08 | Drafts saved for weak connections |
| FR-M1-09 | Ward-desk staff may file on behalf of a citizen |

### M2: Service Guidance and Application Prep
| ID | Requirement |
|----|-------------|
| FR-M2-01 | Retrieve from verified government documents first, answer from retrieved text only |
| FR-M2-02 | Every answer shows source, area, and date of last update |
| FR-M2-03 | If no verified source, system says so and hands over to staff |
| FR-M2-04 | Never answers fees, eligibility or legal requirements from model memory |
| FR-M2-05 | Application readiness check: required papers, unreadable files, inconsistent information |

### M3: Live Status, Map and Notifications
| ID | Requirement |
|----|-------------|
| FR-M3-01 | Eight status values: Submitted, Verified, Under inspection, In progress, Resolved-proof uploaded, Closed, Re-opened, Merged |
| FR-M3-02 | Status visible to citizen in real time (SSE/WebSocket) |
| FR-M3-03 | Waiting reasons shown if blocked |
| FR-M3-04 | Responsible officer details on citizen's own case only |
| FR-M3-05 | Staff proof shown to citizen at Resolved status |
| FR-M3-06 | Live incident map: incidents, never reporters |
| FR-M3-07 | Notifications via SMS, e-mail or push with consent |
| FR-M3-08 | Citizen may submit feedback and objection |

### M4: AI Intake and Analysis Engine
| ID | Requirement |
|----|-------------|
| FR-M4-01 | Normalise Bangla text (colloquial, misspelled, incomplete addresses) |
| FR-M4-02 | Voice-to-text (ASR) with Bangla support |
| FR-M4-03 | Entity extraction: problem type, location, duration, public/private |
| FR-M4-04 | Confidence scoring per field |
| FR-M4-05 | Unknown is never safe: unverifiable items reported, not silently passed |

### M5: Responsibility, Triage and Officer Directory
| ID | Requirement |
|----|-------------|
| FR-M5-01 | Ward boundary + asset owner + rules -> lead and supporting departments with reasons and confidence |
| FR-M5-02 | Confidence gate: 80% initial design value, configurable |
| FR-M5-03 | Below gate -> staff verification; at/above gate, no critical flag -> pre-filled proposal |
| FR-M5-04 | Critical flags always stop process regardless of confidence |
| FR-M5-05 | AI proposes priority with reasons; staff may override with recorded reason |
| FR-M5-06 | AI may never lower a staff-set priority level |
| FR-M5-07 | Emergency signal always triggers urgent escalation |
| FR-M5-08 | Officer directory fields: department, name, designation, official phone, e-mail, ward/zone, backup officer, validity date |

### M6: Duplicate Merge and Hotspot Analysis
| ID | Requirement |
|----|-------------|
| FR-M6-01 | Candidates: GPS distance, problem type, time window, text similarity |
| FR-M6-02 | Photo/video similarity: phase 2 |
| FR-M6-03 | Staff confirm before merge; one incident, one map pin |
| FR-M6-04 | Count of linked reports displayed |
| FR-M6-05 | Each reporter sees own report status; identities hidden from each other |
| FR-M6-06 | Links reversible |
| FR-M6-07 | Many linked reports can raise priority |
| FR-M6-08 | Hotspot declared after repeated closure and return at same asset/place |
| FR-M6-09 | AI review note: history, photos/video, possible alternative solutions (advisory) |

### M7: Multi-Department Case Coordination
| ID | Requirement |
|----|-------------|
| FR-M7-01 | One case holds all departments' tasks for one problem |
| FR-M7-02 | Lead officer assigned per case |
| FR-M7-03 | Task prerequisites and sequencing (e.g. waste -> drain -> road) |
| FR-M7-04 | Coordinator approves plan and order |
| FR-M7-05 | Full report package to each department |
| FR-M7-06 | Department may accept or reject task with reason |
| FR-M7-07 | Rejection re-routes inside same case |
| FR-M7-08 | Escalation when SLA timers expire |

### M8: Evidence and Resolution Verification
| ID | Requirement |
|----|-------------|
| FR-M8-01 | Department uploads photo/video proof shown to citizen |
| FR-M8-02 | Closure blocked if required evidence missing |
| FR-M8-03 | Citizen confirms or objects |
| FR-M8-04 | Objection re-opens related task; decision recorded |
| FR-M8-05 | Closure requires: evidence + staff review + citizen response or documented reason |

### M9: Identity, RBAC, Consent and Audit
| ID | Requirement |
|----|-------------|
| FR-M9-01 | Authentication with MFA for all staff roles |
| FR-M9-02 | Five roles with defined permissions (RBAC matrix) |
| FR-M9-03 | Consent required before location use |
| FR-M9-04 | Immutable (append-only) audit log; every process writes to D5 |
| FR-M9-05 | Citizen identity hidden from all other parties |

### M10: Admin Analytics and Configuration
| ID | Requirement |
|----|-------------|
| FR-M10-01 | Configuration: rules, routing gate, knowledge sources, SLA timers |
| FR-M10-02 | User management: create/modify/deactivate accounts |
| FR-M10-03 | Public dashboard: resolution rate, median time, open incidents by priority, citizen satisfaction, hotspot zones |
| FR-M10-04 | Dashboard: rates with case counts; small numbers hidden |
| FR-M10-05 | Gate lowering requires dual approval + re-validation; versioned and audited |

---

## 6. Case Integrity Checks (R&D Table 26)

| Check | Severity | Action |
|-------|----------|--------|
| Ownership conflict | Critical | Hard stop; staff verification |
| Unknown ward or asset | Critical | Ask citizen; staff verification |
| Public-safety hazard | Critical | Urgent escalation and emergency contact |
| Closure without evidence | Critical | Closure blocked |
| Dependency violation | Warning | Warn coordinator; confirm |
| Duplicate candidate | Warning | Suggest link; staff confirm |
| Priority mismatch | Warning | Raise to staff; hazard rule can force Emergency |
| Citizen objection | Re-review | Re-open related task; record decision |
| Unknown/unverifiable | Unknown | Treated as failure -> staff verification |

---

## 7. Safety Rules (R&D Table 33)

| Rule | Condition | Result |
|------|-----------|--------|
| S1 | Confidence below gate | Fallback to staff verification |
| S2 | Confidence >= gate AND no critical flag | Pre-filled proposal; citizen confirms and staff still approve |
| S3 | Critical flag at any confidence | Hard stop; urgent escalation for hazards |
| S4 | Unknown/unverifiable item | Treated as below gate |
| S5 | Always | No auto-approval, no auto-closure, no declared satisfaction |
| S6 | AI timeout or error | Automatic manual mode; user told clearly |
| S7 | Gate change request | Raise by admin; lower with dual approval + re-validation; audited |
| S8 | Closure | Evidence + staff review + citizen response or documented reason |
| S9 | Emergency signal or hazard cues | Immediate escalation; AI may never lower staff-set level |
| S10 | Any display of report or media | Citizen identity hidden; media masked where feasible |

---

## 8. Evaluation Targets (R&D Table 27 — design targets only)

| Component | Metric | Target | Method |
|-----------|--------|--------|--------|
| Problem type | Macro-F1 | >= 0.80 | Human-verified held-out set |
| Responsibility assignment | Correct-department rate; wrong hand-offs | >= 90%; <= 5% | Verified ward/asset/department data |
| Service answers | Correctness, source consistency | >= 95% | Government guidance + human review |
| Same-incident detection | Precision / Recall | >= 0.85 / >= 0.80 | Verified pairs |
| Confidence calibration | ECE | <= 0.05 | Reliability diagram |
| Usability | Task success; SUS | >= 80%; >= 70 | Prototype task testing |
| Priority triage | Emergency/High recall; weighted kappa | >= 0.95; >= 0.70 | Staff-labelled set |
| Voice transcription | WER (Bangla) | <= 20% | Held-out recordings |
| Latency | AI p95; rule engine p95 | <= 8 s; <= 300 ms | Load tests |

---

## 9. Non-Functional Requirements

### Performance
- AI pipeline end-to-end p95: <= 8 s
- Rule engine p95: <= 300 ms
- AI timeout > 10 s triggers manual fallback

### Security
- TLS 1.3 all transport
- AES-256 at rest
- MFA for all staff
- RBAC with ward and department scope
- Append-only audit log
- OWASP ASVS compliance target
- ISO/IEC 27001 controls reference

### Privacy
- Citizen identity hidden by default
- Location used once with permission
- Media masked where feasible
- No personal data in public dashboard
- Small numbers hidden from public view

### Accessibility
- WCAG 2.1 AA target
- Bangla-first UI with Bengali web font
- Large-text mode
- Keyboard navigation throughout

### Data Standards
- Open311-style request format
- GeoJSON / PostGIS spatial data
- UTF-8 Bangla text
- ISO 8601 timestamps

---

## 10. Department Officer Workspace & Workload-Aware Assignment Queue (Explicit Added Requirement)

> **Architectural Addition**: Reconciles the R&D requirement for departmental accountability with concrete staff-allocation mechanics not fully detailed in the initial draft.

### FR-DEPT-ACCEPT: Department Acceptance & Rejection Workflow
- **Explicit Department Review**: Incoming tasks routed to a department must enter an incoming department queue requiring explicit acceptance before field execution.
- **Mandatory Rejection Reason**: If a department rejects an assigned task, a structured reason in Bangla must be provided. Rejection does NOT delete or alter the case; it returns the task to coordinator review/reassignment and appends an immutable audit log entry.
- **Prerequisite Transparency**: Officers must see upstream prerequisite status (e.g., Road repair waiting on Drain cleaning).

### FR-OFFICER-AVAIL: Dynamic Officer Availability & Workload Modeling
- **Persisted Availability States**: `AVAILABLE`, `BUSY`, `ON_LEAVE`, `OFFLINE`, `INACTIVE`.
- **Workload Capacity**: Configurable `max_concurrent_tasks` (default: 3-5 tasks) and dynamically tracked `current_active_tasks`. Officers at or above capacity cannot be assigned additional routine tasks.
- **Duty/Shift Tracking**: Validates active shift windows and ward/zone coverage.

### FR-ASSIGN-REC: Explainable Assignment Recommendation Engine
- **Hard Eligibility Constraints**: 
  1. Officer belongs to the responsible department.
  2. Officer covers the case's authorized ward/zone.
  3. Officer is in `AVAILABLE` state and on active duty.
  4. Officer has remaining task capacity (`current_active_tasks < max_concurrent_tasks`).
  5. Task prerequisites are satisfied.
- **Transparent Ranking Formulation**: Scores eligible candidates deterministically:
  $$\text{Score} = w_1 \cdot (1 - \frac{\text{Active Tasks}}{\text{Max Capacity}}) + w_2 \cdot \text{Ward Affinity} + w_3 \cdot \text{SLA Urgency Weight}$$
- **Explainability**: Outputs concise rationale for the top recommendations.
- **Dispatch Modes**: Supports dispatcher manual confirmation and configured automatic queue dispatch with strict prerequisite and capacity guards.

### FR-WAIT-QUEUE: Persistent Concurrency-Safe Waiting Queue
- **Persistence Across Restarts**: Database-backed table `task_waiting_queue` storing task ID, case ID, department, priority, SLA deadline, entry timestamp, queue position, and waiting reason.
- **Priority & SLA-Risk Sorting**: Emergency and high-SLA risk tasks are prioritized over standard FIFO.
- **Prerequisite Locking**: Dependent tasks remain in `BLOCKED` queue state until preceding tasks finish.
- **Atomic Dispatch**: Safe concurrency handling prevents duplicate assignments or race conditions when multiple workers run.

### FR-OFFICER-WORKSPACE: Comprehensive 9-View Department Officer Workspace
1. Department Overview & Workload Summary
2. Incoming Department Requests (Accept/Reject with mandatory reason)
3. My Assigned Tasks & Execution Status
4. Task Detail Page (Location, description, priority, prerequisites, waiting reasons, evidence)
5. Officer Availability & Task Capacity Controls
6. Assignment Recommendation Panel (Ranking & explainability)
7. Persistent Assignment Queue (Position, status, priority, SLA countdown)
8. Evidence Upload & Resolution Submission (Before/After comparison)
9. Assignment & Reassignment History with Notifications

