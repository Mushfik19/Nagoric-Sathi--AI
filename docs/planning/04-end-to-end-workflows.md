# 04 — End-to-End Workflows
## Nagorik Sathi AI — R&D Report v1.2

> Workflows derived from R&D §6.2 (8-stage flowchart, Figure 1), §6.3 (feature behaviour), §10.3 (responsibility), §10.6 (integrity checks), §10.8 (duplicates), §10.9 (async pipeline), §12.1 (defence in depth), §13 (fallback).

---

## 1. Complete Citizen Journey

The R&D specifies 8 numbered stages, 3 decision points, and 2 alternative paths (service-information path vs. area-problem path; AI-proposed vs. staff-verified responsibility).

```mermaid
flowchart TD
    START([Citizen opens platform]) --> LANG[Select language preference\nBangla default]
    LANG --> AUTH{Registered?}
    AUTH -->|No| REG[Register: phone + consent]
    REG --> TYPE
    AUTH -->|Yes| TYPE

    TYPE{Service request or\narea problem?}

    TYPE -->|Service information| SVC[Service Guidance Path]
    TYPE -->|Area problem| AREA[Area Problem Path]

    subgraph SVC [Service Guidance Path - M2]
        SVC1[Citizen types service question\nin Bangla]
        SVC2[M4: RAG retrieval from\nverified government documents]
        SVC3{Verified source found?}
        SVC4[Answer shown with source,\napplicable area, update date]
        SVC5[System says: no verified source\nHand over to ward desk]
        SVC6[Application readiness check\noptional]
        SVC1 --> SVC2 --> SVC3
        SVC3 -->|Yes| SVC4 --> SVC6
        SVC3 -->|No| SVC5
    end

    subgraph AREA [Area Problem Path]
        direction TB
        A1[M1: Citizen writes in Bangla or\nrecords voice message]
        A2[M1: Attach photos and/or videos\noptional]
        A3[System asks: Where? How long?\nPublic or private?]
        A4[Live GPS pin confirmed\nby citizen]
        A5[API returns 202 Accepted + job ID\nCase registered immediately]

        A6[M4 async: AI transcribes voice\noriginal kept]
        A7[M4 async: Entity extraction\nproblem type, location, duration]
        A8[M4 async: Confidence scoring per field]

        A9{Safety check:\nHazard detected?}
        A10[EMERGENCY: Hard stop\nUrgent escalation + emergency contact\nshown immediately]

        A11{Duplicate candidate\ndetected?}
        A12[Warning shown to ward desk:\nSuggest link to existing incident]
        A13[Ward desk confirms: merge or not\nIf merged: one incident, one map pin\neach reporter still sees own status]

        A14{Routing confidence\n>= 80% gate?}
        A15[Pre-filled proposal shown:\nLead dept + supporting depts + reasons]
        A16[Staff manual determination:\nWard desk assigns responsibility]

        A17[Citizen confirms proposal:\nProblem type, location, proposed dept]

        A18[Ward desk verifies and approves plan:\nStatus -> Verified]

        A1 --> A2 --> A3 --> A4 --> A5
        A5 --> A6 --> A7 --> A8
        A8 --> A9
        A9 -->|Yes - Critical flag| A10
        A9 -->|No| A11
        A11 -->|Yes| A12 --> A13
        A11 -->|No| A14
        A13 --> A14
        A14 -->|Below gate or critical| A16 --> A18
        A14 -->|At or above gate| A15 --> A17 --> A18
    end

    A18 --> COORD[M7: Case Creation\nLead officer assigned\nDept tasks with prerequisites\nSequencing approved]
    COORD --> WORK[Multi-Dept Work Phase]
    WORK --> CLOSURE[Evidence and Closure Phase]
```

---

## 2. Multi-Department Work Phase

```mermaid
flowchart TD
    START([Case Verified]) --> CASE[Case has ordered tasks\nexample: waste-drain-road]

    CASE --> T1[Task 1: Waste Management\nStatus: Under Inspection]
    T1 --> T1W[Field staff check site\nStatus: In Progress - solving]
    T1W --> T1E[Evidence uploaded:\nbefore/after photo]
    T1E --> T1R[Task 1: Resolved - proof uploaded]
    T1R --> T1C{Staff review\nevidence OK?}
    T1C -->|OK| T1DONE[Task 1 Done\nPrerequisite satisfied]
    T1C -->|Not OK| T1W

    T1DONE --> T2[Task 2 UNLOCKED: Drainage Engineering\nStatus: Under Inspection]
    T2 --> T2W[Field staff check drain\nStatus: In Progress - solving]
    T2W --> T2E[Evidence: drain cleared photo\nwater flow check]
    T2E --> T2R[Task 2: Resolved - proof uploaded]
    T2R --> T2C{Drain clear\nconfirmed?}
    T2C -->|OK| T2DONE[Task 2 Done]
    T2C -->|Not OK| T2W

    T2DONE -->|Road damage check| T3Q{Road repair\nstill needed?}
    T3Q -->|Yes| T3[Task 3: Roads Engineering\nStatus: Under Inspection]
    T3 --> T3W[Field staff repair road\nStatus: In Progress - solving]
    T3W --> T3E[Evidence: repair photo]
    T3E --> T3R[Task 3: Resolved - proof uploaded]
    T3R --> T3DONE[Task 3 Done]
    T3Q -->|No| ALLDONE

    T3DONE --> ALLDONE[All Tasks Complete\nStatus: Resolved - proof uploaded\nCitizen notified]

    subgraph SLA [SLA Timers running throughout]
        SLA1[Emergency: config-defined response time\nescalation if missed]
        SLA2[High: config-defined\nescalation if missed]
        SLA3[Medium/Low: config-defined\nescalation if missed]
    end

    subgraph WAIT [Waiting Reasons - shown to citizen]
        W1[Task 2 waiting for Task 1 to complete]
        W2[Waiting for materials]
        W3[Awaiting specialist]
    end
```

---

## 3. Evidence Review and Closure

```mermaid
flowchart TD
    START([Status: Resolved - proof uploaded]) --> SREVIEW[Staff review evidence\nPhoto/video checked]
    SREVIEW --> SROK{Evidence\nsufficient?}
    SROK -->|No| REOPEN1[Re-open task\nDept notified\nupload more evidence]
    REOPEN1 --> START

    SROK -->|Yes| NOTIF[Citizen notified:\nPlease confirm resolution]
    NOTIF --> CITIZEN{Citizen\nresponds?}

    CITIZEN -->|Accepts| CLOSE[Status: Closed\nSet by coordinator\nAudit logged]
    CITIZEN -->|Objects| OBJ[Citizen submits objection\nwith description]
    CITIZEN -->|No response\nwithin deadline| DOC[Coordinator documents reason\nCase closed with documented reason]
    DOC --> CLOSE

    OBJ --> REOPEN2[Related task re-opened\nin same case\nStatus: Re-opened]
    REOPEN2 --> REVIEW[Coordinator reviews:\nIs objection valid?]
    REVIEW -->|Valid| REASSIGN[Re-assign work to dept\nNew evidence required]
    REASSIGN --> START
    REVIEW -->|Not valid - documented| CLOSE2[Case closed\nwith documented reason\nCitizen informed]
```

---

## 4. Routing Confidence and Critical Flag Handling

```mermaid
flowchart TD
    INPUT[AI analysis complete:\nconfidence score + flags] --> CRIT{Critical flag\npresent?}

    CRIT -->|YES - Ownership conflict\nor unknown ward/asset| HARDSTOP[HARD STOP\nPlan blocked\nStaff verification required]
    CRIT -->|YES - Public safety hazard\nopen manhole, exposed wire| EMERGENCY[URGENT ESCALATION\nEmergency contact shown\nTop of all queues]
    CRIT -->|No| GATE{Confidence\n>= 80% gate?}

    GATE -->|Below gate| MANUAL[Manual verification queue\nWard desk determines\nresponsibility manually]
    GATE -->|At or above gate| PROPOSE[Pre-filled proposal\nLead dept + supporting depts\nReasons shown\nConfidence shown]

    PROPOSE --> CITIZEN_CONFIRM[Citizen confirms:\nProblem type, location, proposed dept]
    CITIZEN_CONFIRM --> STAFF_APPROVE[Ward desk approves plan\nStaff can override with reason]
    STAFF_APPROVE --> DEPT_ACCEPT{Dept accepts\ntask?}
    DEPT_ACCEPT -->|Yes| CASE_ACTIVE[Case active\nWork begins]
    DEPT_ACCEPT -->|No - reason given| REROUTE[Re-routed inside same case\nNot silently dropped\nCoordinator notified]
    REROUTE --> STAFF_APPROVE

    MANUAL --> STAFF_APPROVE

    subgraph CONFIDENCE_NOTES [Confidence Gate Notes]
        CN1[Gate: 80% initial design value\nconfigurable by admin]
        CN2[Raising gate: admin only]
        CN3[Lowering gate: dual approval +\nre-validation + versioned audit]
        CN4[Unknown item always treated\nas below gate]
    end
```

---

## 5. Duplicate Incident Handling

```mermaid
flowchart TD
    NEWREP[New citizen report\nsubmitted] --> AIDUP{M6: AI duplicate\ncandidate found?\nGPS distance + type +\ntime + text similarity}

    AIDUP -->|No candidate| NEWINCIDENT[New incident created\nNew map pin]
    AIDUP -->|Candidate found| WARDWARN[Ward desk sees warning:\nPossible duplicate of incident #XYZ\nView details]

    WARDWARN --> STAFFDEC{Ward desk\ndecision}
    STAFFDEC -->|Confirm merge| MERGE[Reports merged:\nOne incident\nOne map pin\nCount shown: 3 reports]
    STAFFDEC -->|Not a duplicate| NEWINCIDENT

    MERGE --> PRIVACY[Privacy preserved:\n- Each reporter sees own report status\n- No reporter info shown to others\n- Link is reversible\n- Multiple linked reports may raise priority]

    NEWINCIDENT --> PROC[Normal processing\ncontinues]

    subgraph HOTSPOT [Hotspot Detection - ongoing]
        HS1[Closed cases accumulate\nfor same asset/place]
        HS2[Threshold met:\nN closures that returned\nwithin time window]
        HS3[Zone marked as hotspot\non staff map]
        HS4[AI prepares engineer review note:\n- History of earlier fixes\n- Before/after photos/video\n- Possible alternative solutions\nfrom verified maintenance guidance]
        HS5[Engineer decides; suggestions advisory]
        HS1 --> HS2 --> HS3 --> HS4 --> HS5
    end
```

---

## 6. AI Worker Failure and Manual Fallback

```mermaid
flowchart TD
    JOB[AI job enqueued\nfrom report submission] --> WORKER{AI worker\navailable?}

    WORKER -->|Yes| PROCESS[AI processing begins]
    PROCESS --> TIMEOUT{Timeout\n> 10 seconds?}
    TIMEOUT -->|No| RESULT[Result ready]
    TIMEOUT -->|Yes| FALLBACK

    WORKER -->|No - circuit open| FALLBACK[Automatic manual mode\nUser told clearly:\nAI processing unavailable\nStaff handling your request]

    RESULT --> CONFGATE{Confidence\ngate check}
    CONFGATE -->|Pass| PROPOSAL[Pre-filled proposal\nshown to staff]
    CONFGATE -->|Fail| MANUAL[Manual verification\nqueue]

    FALLBACK --> MANUAL
    MANUAL --> WARDDESK[Ward desk determines\nresponsibility manually\nSimple form shown]

    subgraph RETRY [Retry Policy - PROPOSED]
        R1[Attempt 1: immediate]
        R2[Attempt 2: 5 seconds]
        R3[Attempt 3: 30 seconds]
        R4[Dead-letter queue:\nalert raised to ops]
        R1 --> R2 --> R3 --> R4
    end

    subgraph DRAFT [Draft Preservation]
        D1[All intake data saved\nas draft immediately on 202 response]
        D2[Draft preserved through\nAI processing]
        D3[If AI fails, draft remains\nfor manual processing]
    end
```

---

## 7. Status Lifecycle Summary

```mermaid
stateDiagram-v2
    [*] --> Submitted : System (AI registers report)
    Submitted --> Verified : Ward desk confirms\nresponsibility and priority
    Submitted --> Merged : Staff confirm duplicate merge
    Merged --> [*] : Citizen sees parent incident status
    Verified --> UnderInspection : Department officer\nbegins field check
    UnderInspection --> InProgress : Work begins
    InProgress --> ResolvedProofUploaded : Department uploads proof\n(photo/video)
    ResolvedProofUploaded --> Closed : Citizen accepts\nor documented reason
    ResolvedProofUploaded --> ReOpened : Citizen objects
    ReOpened --> UnderInspection : Task re-assigned\nwork continues
    Closed --> ReOpened : Problem returned\nor coordinator re-opens
    Closed --> [*] : Final closure

    note right of Submitted : Visible to citizen
    note right of Verified : Visible to citizen
    note right of InProgress : Waiting reason shown\nif blocked
    note right of ResolvedProofUploaded : Proof visible to citizen
```

---

## 8. Workflow-to-Module Mapping

| Workflow Stage | R&D Modules | Backend Modules | Key APIs |
|---------------|------------|-----------------|---------|
| Registration and consent | M9 | m9_identity | POST /auth/register, POST /auth/consent |
| Intake (text/voice/media) | M1, M4 | m1_intake, m4_ai_engine | POST /reports, POST /media/upload |
| Service guidance | M2, M4 | m2_guidance | POST /guidance/query |
| Duplicate detection | M4, M6 | m6_duplicates | GET /incidents/duplicates?report_id= |
| Confidence gate and proposal | M4, M5 | m5_responsibility | GET /reports/{id}/ai-proposal |
| Staff verification | M5, M7 | m5_responsibility, m7_coordination | POST /incidents/{id}/verify |
| Case creation and tasks | M7 | m7_coordination | POST /cases, POST /cases/{id}/tasks |
| Multi-dept work | M7, M8 | m7_coordination, m8_evidence | PATCH /tasks/{id}/status |
| Evidence upload | M8 | m8_evidence | POST /tasks/{id}/evidence |
| Citizen notification | M3 | m3_status | SSE /events/stream |
| Resolution review | M8 | m8_evidence | POST /cases/{id}/resolution-review |
| Citizen response | M3, M8 | m3_status, m8_evidence | POST /cases/{id}/citizen-response |
| Closure | M7 | m7_coordination | POST /cases/{id}/close |
| Hotspot analysis | M6 | m6_duplicates | GET /hotspots |
| Escalation | M7, M10 | m7_coordination | POST /cases/{id}/escalate |
| Audit | M9 | m9_identity | GET /audit (admin only) |
| Public dashboard | M10 | m10_admin | GET /public/analytics |

---

## 9. Department Acceptance & Workload-Aware Allocation Workflow (Explicit Addition)

```mermaid
sequenceDiagram
    autonumber
    actor Coord as Case Coordinator
    actor DeptHead as Department Officer / Dispatcher
    actor FieldOff as Field Officer
    participant Sys as Nagorik Sathi AI Engine
    participant Queue as task_waiting_queue

    Coord->>Sys: Approves Coordinated Multi-Dept Plan
    Sys->>DeptHead: Routes Task to Department Incoming Queue
    
    alt Department Rejection
        DeptHead->>Sys: POST /tasks/{id}/reject (Mandatory Reason BN)
        Sys->>Coord: Escalates Task back to Coordinator Review
        Sys->>Sys: Records Rejection in Audit Log (Case History intact)
    else Department Acceptance
        DeptHead->>Sys: POST /tasks/{id}/accept
        Sys->>Sys: Marks Task Acceptance = ACCEPTED
        
        alt Prerequisites Pending
            Sys->>Queue: Enqueues Task with status = BLOCKED
            Sys->>DeptHead: Displays "Waiting for Prerequisite"
        else Prerequisites Satisfied
            Sys->>Sys: Evaluates Available Eligible Officers
            alt Eligible Officers Available
                Sys->>DeptHead: Presents Explainable Ranked Recommendations
                DeptHead->>Sys: Confirms Assignment (or Auto-Dispatch triggers)
                Sys->>FieldOff: Task Assigned (IN_PROGRESS), SLA countdown begins
            else No Officers Available / At Capacity
                Sys->>Queue: Enqueues Task with status = QUEUED
                Note over Queue: Persistent queue, priority/SLA sorted
            end
        end
    end

    Note over FieldOff,Sys: When Officer Finishes Task / Shifts to AVAILABLE
    FieldOff->>Sys: Submits Resolution Evidence (Task Completed)
    Sys->>Sys: Frees Officer Capacity (-1 active task)
    Sys->>Sys: Evaluates Waiting Queue for Eligible Tasks
    Sys->>Queue: Atomically Claims Highest Priority/SLA Eligible Task
    Sys->>FieldOff: Dispatches Next Task
```

