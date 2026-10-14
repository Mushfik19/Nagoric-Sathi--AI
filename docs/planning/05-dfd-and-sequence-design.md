# 05 — DFD and Sequence Design
## Nagorik Sathi AI — R&D Report v1.2

> DFD derived from R&D §8.1 (DFD Level 0, Figure 6), §8.2 (DFD Level 1, Figure 7) and §8.3 (UML sequence).
> The R&D specifies 7 DFD processes and 5 data stores; these are distinct from the 10 application modules (M1-M10). The mapping is explained in Section 4.

---

## 1. DFD Level 0 — Context Diagram (R&D Figure 6)

The context diagram shows Nagorik Sathi AI as one process exchanging data with five external entities.

```mermaid
graph LR
    E1([Citizen]) -->|Bangla text/voice\nPhoto/video\nGPS consent\nFeedback/objection| P0[Nagorik Sathi AI\nPlatform]
    P0 -->|Case status\nOfficer details\nProof/evidence\nService guidance\nNotifications| E1

    E2([Ward-Desk / Service-Centre Staff]) -->|Verified responsibility\nApproved plan\nDuplicate confirmation\nEvidence review| P0
    P0 -->|Unverified proposals\nVerification queue\nCase details\nAudit access| E2

    E3([Department Officer / Field Staff]) -->|Task status updates\nField evidence\nDepartment acceptance/rejection| P0
    P0 -->|Assigned tasks\nPrerequisites\nCase report package\nEscalation alerts| E3

    E4([Case Coordinator]) -->|Sequencing approval\nClosure decisions\nEscalation handling| P0
    P0 -->|Stalled cases\nWaiting reasons\nRepeat-issue analysis\nDependency view| E4

    E5([Administrator]) -->|Configuration changes\nUser management\nGate adjustments\nAudit queries| P0
    P0 -->|System configuration\nUser accounts\nAudit log\nPublic dashboard data| E5

    E6([Public / Transparency]) -->|No input| P0
    P0 -->|Aggregated analytics\nIncident map pins\nResolution rates| E6
```

**External Entities:**
| Entity | Type | Interaction |
|--------|------|-------------|
| E1: Citizen | Human user (authenticated) | Submits reports; receives status, guidance, notifications; confirms or objects to resolution |
| E2: Ward-Desk / Service-Centre Staff | Human user (staff, authenticated) | Verifies proposals; confirms duplicates; approves plans; reviews evidence |
| E3: Department Officer / Field Staff | Human user (staff, authenticated) | Accepts/rejects tasks; updates work status; uploads evidence |
| E4: Case Coordinator | Human user (staff, authenticated) | Approves sequencing; handles escalations; reviews closures |
| E5: Administrator | Human user (admin, authenticated) | Configures system; manages users; reviews audit |
| E6: Public | Anonymous browser | Views aggregated public dashboard and incident map |

---

## 2. DFD Level 1 — Processes and Data Stores (R&D Figure 7)

Level 1 decomposes the platform into seven processes and five data stores. Process 3.0 is the AI analysis and responsibility recommendation engine; every process also writes events to D5 (audit log).

```mermaid
graph TB
    E1([Citizen])
    E2([Ward-Desk Staff])
    E3([Dept Officer])
    E4([Coordinator])
    E5([Admin])

    D1[(D1: Citizen Profiles\nand Consent)]
    D2[(D2: Cases, Tasks\nand Evidence)]
    D3[(D3: Verified Service\nKnowledge and Rules)]
    D4[(D4: Ward, Asset,\nResponsibility and\nOfficer Directory)]
    D5[(D5: Audit Log)]

    P1[1.0 Citizen Registration\nand Identity]
    P2[2.0 Report Intake\nand Structuring]
    P3[3.0 AI Analysis and\nResponsibility\nRecommendation]
    P4[4.0 Staff Verification\nand Case Management]
    P5[5.0 Department Work\nCoordination\nand Evidence]
    P6[6.0 Resolution Review\nand Closure]
    P7[7.0 Insight, Analytics\nand Configuration]

    E1 -->|Registration data\nconsent| P1
    P1 -->|Citizen profile| D1
    P1 -->|Audit event| D5
    D1 -->|Citizen profile| P1

    E1 -->|Bangla report\nvoice/photo/video\nGPS pin| P2
    P2 -->|Structured report\njob enqueue| D2
    P2 -->|Audit event| D5
    D4 -->|Ward boundaries| P2
    D1 -->|Citizen context\nconsent check| P2

    D2 -->|Structured report| P3
    D3 -->|Service rules\nknowledge| P3
    D4 -->|Asset registry\nresponsibility rules\nofficer directory| P3
    P3 -->|AI proposal\nconfidence\npriority\nduplicate candidates| D2
    P3 -->|Audit event| D5

    D2 -->|Proposals needing\nverification| P4
    E2 -->|Verification decision\nplan approval\nduplicate confirmation| P4
    E4 -->|Sequencing approval\nescalation handling| P4
    P4 -->|Verified case\napproved plan\ntask assignments| D2
    P4 -->|Notifications| E1
    P4 -->|Task assignments| E3
    P4 -->|Audit event| D5
    D4 -->|Officer lookup| P4

    E3 -->|Task status\nevidence upload\nacceptance/rejection| P5
    D2 -->|Task details\nprerequisites| P5
    P5 -->|Updated task status\nevidence records| D2
    P5 -->|Notifications| E1
    P5 -->|Escalation triggers| P4
    P5 -->|Audit event| D5

    D2 -->|Resolved case data| P6
    E2 -->|Evidence review| P6
    E1 -->|Citizen response\nobjection| P6
    E4 -->|Closure decision| P6
    P6 -->|Closed/re-opened case| D2
    P6 -->|Closure notifications| E1
    P6 -->|Audit event| D5

    D2 -->|Aggregated case data| P7
    D3 -->|Knowledge source config| P7
    D4 -->|Registry config| P7
    E5 -->|Configuration changes\nuser management\ngate adjustments| P7
    P7 -->|Public analytics| E5
    P7 -->|Configuration updates| D3
    P7 -->|Configuration updates| D4
    P7 -->|Audit event| D5
    P7 -->|Public dashboard\nincident map| E1
```

---

## 3. Data Stores — Logical Groupings (R&D §8.2)

The five logical data stores are architectural groupings, not five physical tables.

| Store | Contents | Primary Tables (see ERD) | Access Pattern |
|-------|----------|--------------------------|----------------|
| D1: Citizen Profiles and Consent | User accounts, role assignments, consent records, contact preferences | users, citizen_profiles, consent_records, notification_preferences | Auth system, M1, M9 |
| D2: Cases, Tasks and Evidence | Reports, incidents, coordinated cases, dept tasks, prerequisites, priority history, status history, duplicate relationships, evidence, resolution reviews, citizen responses, AI jobs and results | reports, incidents, cases, dept_tasks, task_prerequisites, priority_history, status_history, duplicate_links, evidence_files, resolution_reviews, citizen_responses, ai_jobs | M1, M4-M8 |
| D3: Verified Service Knowledge and Rules | Service information items, source metadata, embeddings (pgvector), responsibility rules, SLA policies, configuration | service_knowledge, knowledge_sources, responsibility_rules, sla_policies, system_config | M2, M5, M10 |
| D4: Ward, Asset, Responsibility and Officer Directory | Ward boundaries (PostGIS geometry), asset registry (PostGIS geometry), department definitions, officer directory, backup officers | wards, assets, departments, officers, officer_ward_assignments | M5, M6, M7 |
| D5: Audit Log | Append-only log of every state change and access event; every process writes here | audit_events | M9, M10 (read-only for admin) |

---

## 4. Mapping: DFD 7 Processes vs. Application 10 Modules

The R&D specifies 7 DFD processes (data-flow decomposition) and 10 application modules (functional decomposition). These are different views of the same system and must not be conflated.

| DFD Process | Description | Application Module(s) | Notes |
|-------------|-------------|----------------------|-------|
| P1: Citizen Registration and Identity | Account creation, consent, authentication | M9 Identity/RBAC/Consent/Audit | M9 spans all processes for audit |
| P2: Report Intake and Structuring | Text/voice/media intake, GPS, structuring | M1 Intake | M4 AI processing is triggered by P2 but runs async |
| P3: AI Analysis and Responsibility Recommendation | AI classification, entity extraction, confidence scoring, duplicate detection, priority triage | M4 AI Intake/Analysis Engine, M5 Responsibility/Triage, M6 Duplicate/Hotspot | P3 = async AI worker layer |
| P4: Staff Verification and Case Management | Verification queue, plan approval, case creation, sequencing, officer lookup | M5 (verification), M7 Case Coordination | Includes coordinator approval |
| P5: Department Work Coordination and Evidence | Task assignment, status updates, evidence upload, escalation | M7 (task side), M8 Evidence/Resolution | M8 handles evidence, M7 handles task flow |
| P6: Resolution Review and Closure | Evidence review, citizen notification, objection handling, closure | M8 Evidence/Resolution, M3 Status/Map/Notifications | M3 handles notifications from P6 |
| P7: Insight, Analytics and Configuration | Public dashboard, hotspot analysis, admin configuration, SLA timers | M6 (hotspot), M10 Admin/Analytics | M6 feeds hotspot data to M10 |

**Key insight:** M9 (Identity/RBAC/Audit) cuts across all 7 DFD processes — every process writes to D5 and every process enforces RBAC via M9. This is why M9 does not map 1:1 to any single DFD process.

**Key insight:** The DFD shows P3 as a single AI block. In the application architecture, P3 is distributed across M4, M5, and M6 worker processes. The DFD captures the data-flow view; the modules capture the deployment and code boundary view.

---

## 5. UML Sequence — Multi-Department Scenario (R&D §8.3)

This is the core R&D multi-department scenario: a compound case with waste + drain + road, three departments, task prerequisites.

```mermaid
sequenceDiagram
    actor Citizen
    participant PWA as React PWA
    participant API as FastAPI Backend
    participant Redis as Redis Queue
    participant AIW as AI Workers
    participant DB as PostgreSQL
    participant WardDesk as Ward Desk Staff
    participant WasteDept as Waste Dept Officer
    participant DrainDept as Drainage Dept Officer
    participant RoadDept as Roads Dept Officer
    participant Coord as Coordinator

    Citizen->>PWA: Submit Bangla voice + photo\n"drainer막혀서 rastha noshto হইছে"
    PWA->>API: POST /reports (multipart: voice, photo, GPS)
    API->>DB: INSERT report (status=draft, raw data)
    API->>Redis: ENQUEUE ai_job {report_id, type=full_analysis}
    API-->>PWA: 202 Accepted {job_id: "abc123"}
    PWA-->>Citizen: "আপনার অভিযোগ নিবন্ধিত হয়েছে। প্রক্রিয়া চলছে..."

    Note over AIW: Async AI Processing
    AIW->>Redis: DEQUEUE ai_job
    AIW->>AIW: ASR transcription (Bangla voice → text)
    AIW->>AIW: NLU entity extraction\n{types: [waste, drain, road], location: {...}}
    AIW->>DB: READ ward_boundaries, asset_registry
    AIW->>AIW: Responsibility classification\nwaste_mgmt: 0.91, drainage: 0.87, roads: 0.78
    AIW->>AIW: Priority triage: HIGH (multiple types, drainage)
    AIW->>DB: READ existing incidents (duplicate check)
    AIW->>DB: UPDATE report {status=submitted, ai_proposal=..., confidence=0.87}
    AIW->>Redis: PUBLISH event {report_id, event=ai_complete}

    API->>DB: READ report {ai_proposal}
    Note over API: Confidence 0.87 >= 0.80 gate\nNo critical flags
    API->>DB: READ officer_directory (waste, drain, roads for ward)
    API->>DB: INSERT incident {status=submitted}
    API->>WardDesk: SSE: New case requiring verification\nPriority: HIGH

    WardDesk->>PWA: View verification queue
    WardDesk->>API: GET /incidents/{id}/ai-proposal
    API-->>WardDesk: Proposal {waste_dept, drainage_dept, roads_dept\nwith reasons, confidence, officer names}
    WardDesk->>API: POST /incidents/{id}/verify\n{approved: true, lead_officer_id: ..., plan: sequential}
    API->>DB: UPDATE incident {status=verified}
    API->>DB: INSERT case {incident_id}
    API->>DB: INSERT dept_tasks: [waste (1), drain (2, prereq:1), road (3, prereq:2)]
    API->>DB: INSERT audit_event

    Note over Coord: Coordinator approves sequencing
    Coord->>API: POST /cases/{id}/approve-plan
    API->>DB: UPDATE case {plan_approved: true}

    API->>WasteDept: Notification: New task assigned
    API->>Citizen: SSE: Status → Verified. Waste Mgmt dept assigned.

    WasteDept->>API: PATCH /tasks/{task1_id}/status {status=under_inspection}
    WasteDept->>API: PATCH /tasks/{task1_id}/status {status=in_progress}
    WasteDept->>API: POST /tasks/{task1_id}/evidence (before photo)
    WasteDept->>API: POST /tasks/{task1_id}/evidence (after photo)
    WasteDept->>API: PATCH /tasks/{task1_id}/status {status=resolved_proof_uploaded}
    API->>DB: UPDATE dept_task, INSERT evidence_files
    API->>DB: INSERT audit_event

    Note over API: Task 1 prerequisite satisfied
    API->>DrainDept: Notification: Task 2 UNLOCKED
    API->>Citizen: SSE: Waste cleared. Drainage team starting.

    DrainDept->>API: PATCH /tasks/{task2_id}/status {status=in_progress}
    DrainDept->>API: POST /tasks/{task2_id}/evidence (drain photo)
    DrainDept->>API: PATCH /tasks/{task2_id}/status {status=resolved_proof_uploaded}
    API->>DB: UPDATE dept_task

    Note over API: Task 2 done\nRoad damage check: confirmed needed
    API->>RoadDept: Notification: Task 3 UNLOCKED
    RoadDept->>API: PATCH /tasks/{task3_id}/status {status=in_progress}
    RoadDept->>API: POST /tasks/{task3_id}/evidence (repair photo)
    RoadDept->>API: PATCH /tasks/{task3_id}/status {status=resolved_proof_uploaded}

    Note over API: All tasks resolved-proof
    API->>DB: UPDATE incident {status=resolved_proof_uploaded}
    API->>Citizen: SSE: All work complete. Please confirm resolution.
    API->>Citizen: Notification: Please review resolution and confirm or object

    Citizen->>PWA: View evidence (before/after photos)
    Citizen->>API: POST /cases/{id}/citizen-response {accepts: true}
    API->>DB: INSERT citizen_response
    Coord->>API: POST /cases/{id}/close
    API->>DB: UPDATE incident {status=closed}
    API->>DB: INSERT audit_event
    API->>Citizen: SSE: Case Closed.
```

---

## 6. UML Sequence — Service Information Query (RAG)

```mermaid
sequenceDiagram
    actor Citizen
    participant PWA as React PWA
    participant API as FastAPI Backend
    participant RAG as RAG Service (AI Worker)
    participant DB as PostgreSQL + pgvector

    Citizen->>PWA: "ট্রেড লাইসেন্স নবায়নের জন্য কী কী কাগজ লাগবে?"
    PWA->>API: POST /guidance/query {text: "...", ward_id: 3}
    API->>DB: QUERY pgvector similarity + keyword\nover service_knowledge WHERE area covers ward 3
    DB-->>API: Retrieved chunks [{source, text, date}, ...]

    alt Verified source found
        API->>RAG: COMPOSE answer from retrieved chunks only
        RAG-->>API: Answer text + source references
        API-->>PWA: {answer: "...", sources: [{title, url, area, last_updated}], confidence: retrieval-based}
        PWA-->>Citizen: Answer shown with:\n- Source: DCC Official Website\n- Applicable area: Ward 3, Dhaka North\n- Last updated: 15 Sep 2026\n- Documents needed: [list]
    else No verified source found
        API-->>PWA: {no_source: true, message: "এই তথ্য আমাদের যাচাইকৃত তথ্যভাণ্ডারে নেই।\nওয়ার্ড অফিসে যোগাযোগ করুন।"}
        PWA-->>Citizen: "যাচাইকৃত তথ্য পাওয়া যায়নি। ওয়ার্ড অফিসে যোগাযোগ করুন।"
    end
```

---

## 7. UML Sequence — Emergency Escalation

```mermaid
sequenceDiagram
    actor Citizen
    participant PWA as React PWA
    participant API as FastAPI Backend
    participant AIW as AI Worker
    participant DB as PostgreSQL
    participant WardDesk as Ward Desk Staff
    participant Coord as Coordinator

    Citizen->>PWA: "রাস্তায় খোলা맨홀, ভেতরে পড়ে যাওয়ার ভয়"
    PWA->>API: POST /reports {text: "...", gps: {...}}
    API->>DB: INSERT report
    API->>AIW: ENQUEUE ai_job
    API-->>PWA: 202 Accepted

    AIW->>AIW: Entity extraction:\nhazard_detected: true\nhazard_type: open_manhole
    Note over AIW: CRITICAL FLAG: public-safety hazard

    AIW->>DB: UPDATE report {critical_flag: HAZARD, priority: EMERGENCY}
    AIW->>API: SIGNAL emergency {report_id}

    Note over API: S3: Critical flag = HARD STOP\nNormal routing suspended

    API->>WardDesk: URGENT ALERT: Open manhole reported\nLocation: [GPS]\nImmediate action required
    API->>Coord: URGENT ALERT: Emergency case
    API->>DB: INSERT incident {priority=EMERGENCY, status=submitted}
    API->>Citizen: PWA + SMS: "জরুরি! আপনার অভিযোগ জরুরি ভিত্তিতে প্রেরণ করা হয়েছে।\nযোগাযোগ: [emergency officer contact]"

    WardDesk->>API: GET emergency cases (top of all queues)
    WardDesk->>API: POST /incidents/{id}/verify {emergency_override: true}
    API->>DB: UPDATE incident {status=verified, priority=EMERGENCY}
    Note over API: SLA timer: Emergency response time\nescalation if missed
```
