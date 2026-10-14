# 08 — UI Sitemap and Screen Inventory
## Nagorik Sathi AI — R&D Report v1.2

---

## 1. Sitemap Overview

```
Nagorik Sathi AI PWA
├── Public (unauthenticated)
│   ├── / — Landing / App Entry
│   ├── /map — Public Incident Map
│   └── /dashboard — Public Transparency Dashboard
├── Citizen (role: citizen)
│   ├── /register — Registration and Consent
│   ├── /login — Login (OTP)
│   ├── /report/new — Report Wizard (multi-step)
│   │   ├── Step 1: Describe problem (text/voice)
│   │   ├── Step 2: Location confirmation (map)
│   │   ├── Step 3: Media upload (photo/video)
│   │   └── Step 4: Review and submit
│   ├── /guidance — Service Guidance
│   │   ├── /guidance/search — Query service information
│   │   └── /guidance/services — Service list browse
│   ├── /my-reports — My Reports list
│   └── /my-reports/{report_id} — My Report detail / Incident status
│       └── /my-reports/{report_id}/respond — Citizen response (accept/object)
├── Ward-Desk Staff (role: ward_desk)
│   ├── /ward/dashboard — Ward overview
│   ├── /ward/verification — Verification queue
│   ├── /ward/verification/{report_id} — Verification detail / AI proposal
│   ├── /ward/incidents — All incidents in ward
│   └── /ward/incidents/{incident_id} — Incident detail
├── Department Officer (role: dept_officer)
│   ├── /dept/dashboard — Department task overview
│   ├── /dept/tasks — My assigned tasks
│   └── /dept/tasks/{task_id} — Task workspace (status + evidence)
├── Case Coordinator (role: coordinator)
│   ├── /coord/dashboard — Coordinator overview
│   ├── /coord/cases — All cases view
│   ├── /coord/cases/{case_id} — Case coordination workspace
│   ├── /coord/map — Staff incident map with hotspots
│   └── /coord/escalations — Escalation queue
├── Administrator (role: admin)
│   ├── /admin/dashboard — Admin overview
│   ├── /admin/users — User management
│   ├── /admin/config — System configuration
│   ├── /admin/knowledge — Service knowledge management
│   ├── /admin/officers — Officer directory management
│   └── /admin/audit — Audit log viewer
└── Shared
    ├── /profile — Profile and notification preferences
    └── /404, /403, /500 — Error pages
```

---

## 2. Screen Inventory

### S-PUB-01: Landing Page
**Purpose:** Entry point; route to registration, login, service guidance, or public map  
**Actions:** Register, Login, View Map, Browse Services  
**Data:** None (static)  
**Auth:** None  
**Mobile:** Full-width, Bangla first, large buttons  
**Desktop:** Split layout with map preview  

### S-PUB-02: Public Incident Map
**Purpose:** Transparent view of all active incidents by ward  
**Actions:** Filter by ward / priority / type; click pin for incident summary  
**Data:** GET /public/map — incident pins (no citizen data); hotspot zones  
**Auth:** None  
**Empty state:** "No incidents in this area"  
**Privacy:** Pins show location, type, status only — no names, addresses, or reporter info  
**Acceptance criteria:** Pins load within 2 s; filters work; hotspot zones highlighted  

### S-PUB-03: Public Transparency Dashboard
**Purpose:** Aggregated performance metrics  
**Data:** GET /public/analytics — resolution rate, median times, acceptance rate, hotspot count  
**Auth:** None  
**Privacy rule:** Values < 5 cases shown as "<5"; no ward ranking of individuals  
**Acceptance criteria:** Numbers shown with case counts; no personal data visible  

---

### S-CIT-01: Registration and Consent
**Purpose:** New citizen account creation with explicit consent  
**Actions:** Enter phone, receive OTP, confirm consent for location and notifications  
**Validation:** Phone E.164 format; consent_location must be explicitly accepted  
**Data:** POST /auth/register  
**Success state:** OTP sent confirmation  
**Error states:** Invalid phone format; OTP expired (resend option)  
**Mobile:** Single-column, large inputs  

### S-CIT-02: Report Wizard — Step 1: Describe
**Purpose:** Capture Bangla text or voice description of the problem  
**Actions:** Type in Bangla; record voice; flag as urgent (signal only)  
**Data:** Draft saved locally (IndexedDB) on every keystroke  
**Empty state:** Prompt: "আপনার সমস্যা বাংলায় লিখুন বা বলুন..."  
**Voice:** Record button → waveform → play back → confirm or re-record  
**AI processing note:** Transcription runs after submit; not during entry  
**Mobile:** Full-width textarea, large record button  

### S-CIT-03: Report Wizard — Step 2: Location
**Purpose:** Confirm GPS location on map  
**Actions:** Allow GPS → map pin appears → citizen can drag pin to correct → confirm  
**Data:** Browser Geolocation API; Leaflet/MapLibre map; ward boundary overlay  
**Validation:** location_confirmed must be set; if GPS denied, manual coordinate entry  
**Edge case:** Location outside covered wards → shown message: "এই এলাকা বর্তমানে কভার করা হয় না" + ward desk contact  
**Acceptance criteria:** GPS resolves within 5 s; map loads within 3 s; pin draggable  

### S-CIT-04: Report Wizard — Step 3: Media
**Purpose:** Attach photos and/or videos  
**Actions:** Camera capture or gallery select; multiple photos; one video; review thumbnails  
**Data:** POST /reports/{id}/media  
**Validation:** Photo ≤ 10 MB; video ≤ 50 MB; client-side compression applied  
**Upload UX:** Progress bar per file; resumable (if connection drops, resume on reconnect)  
**Skip option:** Media is optional; "Skip" continues without uploading  
**Mobile:** Native camera access via browser  

### S-CIT-05: Report Wizard — Step 4: Review and Submit
**Purpose:** Citizen sees all entered data before submission; confirms accuracy  
**Actions:** Edit any step (back navigation); Submit  
**Data:** Local draft; POST /reports on submit  
**On submit:** 202 response → show "Processing..." with tracking number  
**Success state:** "আপনার অভিযোগ নম্বর: #XXXXXXXX। প্রক্রিয়া চলছে।"  
**Error states:** Network error → save draft, retry button  

### S-CIT-06: My Reports List
**Purpose:** View all citizen's own reports  
**Actions:** View report; tap to open detail  
**Data:** GET /reports (own only)  
**Display:** Case number, problem type icon, ward, status badge, priority badge, submitted date  
**Empty state:** "আপনার কোনো অভিযোগ নেই। নতুন অভিযোগ করুন।"  
**Privacy:** Only own reports visible; no other citizens' reports  

### S-CIT-07: Report / Incident Detail
**Purpose:** Track status of one report; view responsible officer; view proof  
**Actions:** View status history; view officer details; view evidence (when available); submit response  
**Data:** GET /reports/{id} → GET /incidents/{id}  
**Displays:**
- Current status with icon and description in Bangla
- Waiting reason if blocked
- Responsible officer name, designation, official phone and e-mail
- Task list with waiting reasons for each department
- Evidence (photos/videos) from department when status = resolved_proof_uploaded
- Action button: "সমাধান নিশ্চিত করুন" when response pending
- Duplicate notice: "আপনার অভিযোগ একই ঘটনায় যুক্ত হয়েছে। ঘটনার সর্বশেষ অবস্থা দেখুন।" if merged
**Mobile:** Timeline-style status display; large evidence viewer  

### S-CIT-08: Citizen Response (Accept/Object)
**Purpose:** Citizen confirms resolution or files objection  
**Actions:** "সমাধান গৃহীত হয়েছে" (Accept) or "আমি একমত নই" (Object)  
**Objection flow:** Required: reason text field; optional: additional photo  
**Data:** POST /cases/{id}/citizen-response  
**Error state:** Response deadline passed → coordinator may document reason and close  
**Acceptance criteria:** Response recorded; status updates immediately; notification sent  

---

### S-WARD-01: Ward Dashboard
**Purpose:** Ward-desk staff overview of their ward  
**Data:** Verification queue count by priority; open incidents count; recent escalations  
**Actions:** Navigate to verification queue; view incidents; view officer directory  
**Auth:** ward_desk role; own ward only  

### S-WARD-02: Verification Queue
**Purpose:** Queue of reports awaiting staff verification  
**Actions:** Sort by priority / date; open report for verification  
**Data:** GET /verification/queue  
**Display:** Priority badge (emergency = red, high = orange); AI proposal ready indicator; duplicate candidate indicator; critical flag indicator  
**Emergency handling:** Emergency cases always at top; prominent visual treatment  
**Acceptance criteria:** Queue loads within 2 s; priority sort correct; critical flags prominent  

### S-WARD-03: Verification Detail
**Purpose:** Staff reviews AI proposal and makes decision  
**Data:** GET /reports/{id}/ai-proposal  
**Displays:**
- Original Bangla text (and voice player if voice submitted)
- Transcription (marked as AI transcription)
- Location on map (confirmed pin)
- AI proposed lead department with reasons and confidence percentage
- AI proposed priority with reasons
- Officer details (name, designation, contact)
- Confidence gate result: ">= 80% gate passed" or "Below gate — manual determination required"
- Duplicate candidates with similarity scores and distance
- Critical flag warning if present (prominent, red)
- Case integrity check results
**Actions:**
- Accept AI proposal (if gate passed)
- Override responsibility (select different department with required reason)
- Override priority (with required reason)
- Confirm or reject duplicate link
- Approve plan sequence (drag-and-drop task order; set prerequisites)
- Submit verification
**Validation:** lead_department_id required; plan_sequence required if compound case  
**Acceptance criteria:** All AI reasoning visible; override logged; emergency escalated immediately  

### S-WARD-04: Incident List (Ward)
**Purpose:** All incidents in the ward  
**Filters:** Priority, status, problem type, date range  
**Data:** GET /incidents?ward_id=...  

---

### S-DEPT-01: Department Dashboard
**Purpose:** Department officer task overview  
**Data:** My assigned tasks by status and priority  
**Actions:** Navigate to task workspace  
**Auth:** dept_officer; own department only  

### S-DEPT-02: My Tasks List
**Purpose:** List of assigned tasks sorted by priority and order  
**Data:** GET /tasks/my-tasks  
**Display:** Priority badge; task_order indicator; case number; problem type; status; prerequisite indicator ("Waiting for: Task 1")  
**Acceptance criteria:** Prerequisite-blocked tasks clearly indicated; priority sort correct  

### S-DEPT-03: Task Workspace
**Purpose:** Primary work interface for department officer  
**Data:** GET /tasks/{task_id}; GET /tasks/{task_id}/evidence  
**Actions:**
- Accept task (POST /tasks/{id}/accept)
- Reject task with reason (POST /tasks/{id}/reject)
- Update status: Under Inspection → In Progress → Resolved-Proof Uploaded
- Set waiting reason if blocked
- Upload before/after photos and videos (POST /tasks/{id}/evidence)
- View case context (other tasks in same case; prerequisites)
**Displays:** Full case report package (Bangla text/transcript, location, priority, history, other department status)  
**Validation:** Evidence required before marking resolved if evidence_required=true  
**Acceptance criteria:** Evidence upload works on mobile; status updates push to citizen SSE  

---

### S-COORD-01: Coordinator Dashboard
**Purpose:** Cross-case oversight  
**Data:** Stalled cases; escalation queue; hotspot zones count; cases by status  
**Actions:** Navigate to case list; view escalations; view map  

### S-COORD-02: Case List
**Purpose:** All cases within coordinator's jurisdiction  
**Filters:** Status, priority, stalled (no update > X hours), ward  
**Data:** GET /cases  

### S-COORD-03: Case Coordination Workspace
**Purpose:** Full case management  
**Data:** GET /cases/{case_id}  
**Actions:**
- Approve sequencing plan (POST /cases/{id}/approve-plan)
- View all tasks and prerequisites in dependency view
- Mark evidence review (POST /cases/{id}/resolution-review)
- Close case (POST /cases/{id}/close)
- Escalate case (POST /cases/{id}/escalate)
- View complete status and priority history
- View audit trail for this case
**Displays:**
- Dependency graph: tasks linked by prerequisites
- SLA timer: time elapsed vs. deadline; escalation countdown
- All uploaded evidence in one view
- Citizen response status
**Acceptance criteria:** Dependency graph renders; SLA timer accurate; closure requires evidence + review + citizen response or documented reason  

### S-COORD-04: Staff Incident Map (with Hotspots)
**Purpose:** Geographic view with operational context  
**Data:** GET /incidents (all visible) + GET /hotspots  
**Displays:** Incident pins (colour by priority); hotspot zones (highlighted polygon); filter controls  

### S-COORD-05: Escalation Queue
**Purpose:** Cases with SLA breaches or raised escalations  
**Data:** Filtered cases with sla_timers.resolution_met=false or escalation_count>0  

---

### S-ADMIN-01: Admin Dashboard
**Purpose:** System overview  
**Data:** User counts by role; config summary; audit events (recent); AI job statistics  

### S-ADMIN-02: User Management
**Purpose:** Create and manage staff accounts  
**Actions:** Create new staff user; assign role/ward/dept; activate/deactivate  
**Data:** GET/POST/PATCH /admin/users  
**Privacy:** Citizen accounts not accessible here; citizen data management out of scope  

### S-ADMIN-03: System Configuration
**Purpose:** Configure system parameters  
**Key config items:**
- Routing confidence gate (80% default; lowering requires dual approval)
- SLA timer values by priority
- Hotspot threshold (recurrence count + time window)
- Media size limits
- AI worker timeout
**Dual-approval flow:** Admin proposes gate lower → second admin approves → change applied and audited  
**Data:** GET/PUT /admin/config  
**Acceptance criteria:** Gate change audited; dual approval enforced for lowering  

### S-ADMIN-04: Service Knowledge Management
**Purpose:** Manage verified service information items  
**Actions:** Add new item; edit existing; mark inactive; view source URL and last-verified date  
**Validation:** Source URL and last-verified date required for every item  
**Data:** GET/POST/PATCH /admin/knowledge  

### S-ADMIN-05: Officer Directory Management
**Purpose:** Manage officer records and ward assignments  
**Actions:** Add/edit officer; set ward/zone coverage; set backup officer; mark validity date  
**Validation:** Only official contacts allowed; validity date required  
**Data:** GET/POST/PATCH /admin/officers  

### S-ADMIN-06: Audit Log Viewer
**Purpose:** Read-only view of all audit events  
**Filters:** Entity type, entity ID, actor, action, date range  
**Data:** GET /audit  
**Privacy:** Shows actor roles and actions; no raw citizen personal data exposed in audit display  

---

## 3. Cross-Cutting Screen Requirements

### Navigation Patterns
| Role | Navigation | Primary Action |
|------|-----------|----------------|
| Citizen | Bottom nav bar (mobile): Home, My Reports, Guidance, Map | "অভিযোগ করুন" (Report Now) floating button |
| Ward-desk | Left sidebar (desktop): Dashboard, Queue, Incidents; Top bar (mobile) | Queue badge count |
| Dept officer | Left sidebar: Dashboard, Tasks; Bottom (mobile) | Task list |
| Coordinator | Left sidebar: Dashboard, Cases, Map, Escalations | Case list |
| Admin | Left sidebar: all admin sections | Config |

### Mobile vs. Desktop
- Citizen interface: **mobile-first** (primary device)
- Staff consoles: **desktop-optimised** with mobile fallback
- Map: full-screen on mobile; split panel on desktop

### Empty / Loading / Error States (all screens)
- **Loading:** Skeleton screens with progress indicators (no blank white)
- **Empty:** Bangla + English empty-state message with CTA
- **Error:** Bangla error message + retry option + request_id for support
- **AI unavailable:** Banner: "AI প্রক্রিয়া সাময়িকভাবে অনুপলব্ধ। ম্যানুয়াল প্রক্রিয়ায় চলছে।"
- **Offline:** Draft mode indicator; "আপনার অভিযোগ সংরক্ষিত হয়েছে। ইন্টারনেট সংযোগে পাঠানো হবে।"

### Acceptance Criteria (all screens)
- Every state-changing action has a confirmation dialog or undo capability
- Priority = Emergency is never displayed in a neutral colour
- AI-generated content is always labelled as AI-proposed
- Confidence percentage shown alongside every AI proposal
- Source and verification date shown alongside every RAG answer
