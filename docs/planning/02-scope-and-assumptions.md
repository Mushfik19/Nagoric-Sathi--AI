# 02 — Scope and Assumptions
## Nagorik Sathi AI — R&D Report v1.2

> Requirements derived from R&D v1.2. **[PROPOSED]** = implementation decision not specified by R&D. **[NEEDS CLARIFICATION]** = requires confirmation before implementation.

---

## 1. First-Version Boundary

The first version is deliberately limited and testable: 3-5 wards, four problem types, a 12-week plan, with contribution shown through coordination of responsibility, work sequence and evidence, and through honestly reported test results.

### 1.1 Geographical Boundary
- **Specified**: One city corporation
- **Specified**: 3-5 wards
- **[NEEDS CLARIFICATION]**: Which specific city corporation? (Dhaka North, Dhaka South, Chattogram, or other) — affects ward boundary data source and department structure
- **[NEEDS CLARIFICATION]**: Which 3-5 specific wards? Affects asset registry, officer directory
- **[PROPOSED]**: For prototype/demo, ward boundaries will be loaded as GeoJSON fixtures; real ward boundary data from the city corporation replaces fixtures in pilot phase

### 1.2 Problem Type Boundary
- **Specified**: Waste, drain, street light, road
- **[PROPOSED]**: "Compound cases" (e.g. waste + drain + road) are in scope for v1 because the multi-department workflow explicitly covers them (R&D Table 23)
- **Out of scope**: All other civic problem categories (infrastructure, public transport, building permit, etc.)

### 1.3 Service Information Boundary
- **Specified**: Approximately 10-15 verified service-information items
- **[NEEDS CLARIFICATION]**: Exact list and source of the 10-15 items — to be confirmed with the city corporation or appropriate authority
- **[PROPOSED]**: Items must have a verifiable government source with a URL and last-verified date; unverified items are not ingested
- **Out of scope**: Full national service catalogue

### 1.4 Department Connection Boundary
| Tier | Description | v1 Status |
|------|-------------|-----------|
| 1 | Verified service list, guidance, paper checklist | In scope |
| 2 | Approved technical connection to start/read applications | Only where owning authority approves; treated as optional in v1 |
| 3 | Partner departments, defined responsibilities, approved procedures | In scope for demo (illustrative departments); real connection requires departmental approval |
- **Out of scope**: Any unapproved real department connection

---

## 2. Feature Scope Clarifications

### 2.1 Photo and Video Upload vs. AI Interpretation
This distinction is critical and must not be confused in implementation:

| Capability | v1 Status | Note |
|------------|-----------|------|
| Photo upload | **In scope** | Citizen and department evidence upload |
| Video upload | **In scope** | Resumable chunked upload, size-capped |
| Voice upload and ASR transcription | **In scope** | AI transcribes voice to text; original kept |
| AI-based photo content analysis | **Phase 2** | Not in v1; upload is passive storage |
| AI-based video content analysis | **Phase 2** | Not in v1 |
| Key-frame extraction (informational) | **[PROPOSED Phase 2]** | Background worker feature |

### 2.2 SMS and Phone Fallback
- **In scope**: Citizen sends Bangla SMS to a number; receives case number; ward desk can register by phone
- **Conditional**: 333 helpline integration requires formal agreement with operator — treated as option, not assumption
- **[NEEDS CLARIFICATION]**: Which SMS gateway? (local Bangladesh provider required)
- **[PROPOSED]**: For prototype, SMS gateway is mocked; real gateway integrated in pilot

### 2.3 Map and Location
- **In scope**: Live incident map with pins (incidents, not reporters)
- **In scope**: One-time GPS location capture with consent
- **Out of scope**: Continuous citizen location tracking
- **Out of scope**: Indoor positioning or tracking of device location after the report is submitted
- **[PROPOSED]**: MapLibre with OpenStreetMap as the base map (R&D lists Leaflet/MapLibre as alternatives; MapLibre recommended for PWA performance)

### 2.4 Hotspot and Seasonal Risk
- **In scope**: Hotspot detection and marking (repeat-problem zones)
- **In scope**: AI review note for engineer with alternative solutions
- **Phase 2**: Seasonal risk forecasting / pre-monsoon inspection lists
- **[NEEDS CLARIFICATION]**: Hotspot threshold (number of recurrences + time window) — to be set by the city corporation during configuration

### 2.5 Notifications
- **In scope**: SMS, e-mail, web push (with citizen consent)
- **[PROPOSED]**: Web push via Web Push API (supported by PWA)
- **[NEEDS CLARIFICATION]**: Specific SMS gateway and SMTP provider for Bangladesh

### 2.6 Offline Support
- **In scope**: Draft saving for weak connections
- **Out of scope**: Full offline sync (phase 2)
- **[PROPOSED]**: Service worker with IndexedDB for draft persistence

---

## 3. Architecture Scope

### 3.1 Modular Monolith
- **Specified**: Modular monolith (FastAPI) for transactional workflows + separate AI worker services
- **Rationale (R&D §7.1)**: Reduces operational complexity and attack surface for a small team; module boundaries (M1-M10) allow later extraction into services
- **Out of scope**: Microservices split for v1

### 3.2 Message Queue
- **Specified**: Redis (queue, cache) — required
- **Specified**: RabbitMQ — optional
- **[PROPOSED]**: Use Redis Streams for the asynchronous AI job queue in v1; RabbitMQ can be added as the platform scales
- **Rationale**: Avoids an additional infrastructure component for a small team; Redis is already required

### 3.3 CloudApper Integration
- **Specified (R&D §7.2 and §8)**: Preliminary test with CloudApper to verify one-complaint, two-department workflow; verify ability to add own AI model, connect external systems, export evaluation data
- **[PROPOSED]**: CloudApper integration is optional for the core prototype; the main architecture does not depend on it
- **[NEEDS CLARIFICATION]**: Has the preliminary CloudApper capability verification been completed? Results affect whether CloudApper is used in the prototype workflow

### 3.4 GPU Requirement
- **Specified**: GPU is optional; models exported to ONNX, quantised, served with dynamic batching
- **[PROPOSED]**: v1 prototype will be validated on CPU; GPU provisioned if latency targets cannot be met

---

## 4. Data Scope

### 4.1 Real Data vs. Fixtures
| Data | v1 Approach |
|------|-------------|
| Ward boundaries | Fixtures (GeoJSON) for prototype; real data from city corporation for pilot |
| Asset registry | Fixtures representing illustrative assets; real registry from city corporation for pilot |
| Officer directory | Illustrative (demo) entries; real directory from city corporation for pilot |
| Responsibility rules | Illustrative rules from R&D Table 23; validated against real department structure for pilot |
| Service knowledge items | 10-15 items from verified public government sources |
| AI training data | Synthetic and publicly available Bangla civic text for prototype; real labelled set for evaluation |

### 4.2 Personal Data
- Citizen: phone, optional e-mail (stored encrypted), NID reference (not stored for v1 unless required for verification)
- **[PROPOSED]**: Citizens register with phone number only; name and NID are optional
- Officer: official name, designation, official phone, official e-mail (no personal numbers)
- Public dashboard: no personal data, aggregated only

### 4.3 Media Storage
- **Specified**: MinIO / S3-compatible, encrypted
- **[PROPOSED]**: MinIO for prototype (self-hosted); S3-compatible API allows migration to AWS/other
- Size limits: **[PROPOSED]** photos ≤ 10 MB each; videos ≤ 50 MB; voice ≤ 5 MB; caps configurable by admin
- Client-side compression applied before upload

---

## 5. Integration Scope

| System | v1 Status | Condition |
|--------|-----------|-----------|
| PostGIS (ward boundaries, spatial queries) | In scope | Required |
| pgvector (RAG retrieval) | In scope | Required |
| Redis (cache + queue) | In scope | Required |
| MinIO (media) | In scope | Required |
| SMS gateway | In scope (mocked for prototype) | Real gateway requires provider agreement |
| SMTP | In scope | Standard SMTP |
| Web push | In scope | Web Push API |
| 333 helpline | Out of scope for v1 | Formal agreement required |
| GRS (Grievance Redress System) | Out of scope for v1 | National integration; later work |
| National Portal | Out of scope for v1 | Later work |
| CloudApper | Optional | Preliminary test only |
| Payment gateway | Out of scope | No payments in v1 |
| Licence system | Out of scope | No licences in v1 |

---

## 6. User Research Assumptions

- **Specified (R&D §15.2)**: Interviews with citizens, service-centre entrepreneurs and relevant officers
- **Specified**: Task testing with 20-30 citizens and a few service staff — exploratory sample, does not claim to represent the whole country
- **Assumption**: This planning phase assumes officer demo and user test sessions are planned alongside development weeks 9-10

---

## 7. Prototype vs. Pilot Distinction

| Prototype (v1) | Pilot |
|----------------|-------|
| Illustrative departments and cases unless a real approved connection exists | Approved real department connections |
| Demo results and real service results documented separately | Approved real pilot data |
| No claimed improvement percentages | Measured against real cases |
| AI runs silently (shadow mode) alongside manual process on approved data | Live deployment |
| Ward-boundary and asset data are fixtures | Real data from city corporation |

---

## 8. Open Questions

| # | Question | Impact | Priority |
|---|----------|--------|----------|
| Q1 | Which city corporation? | Ward boundary GIS data, department structure, officer directory | Critical |
| Q2 | Which 3-5 specific wards? | Asset registry, officer assignment | Critical |
| Q3 | Exact list of 10-15 service-information items | M2 RAG corpus | High |
| Q4 | Which SMS gateway provider? | SMS fallback implementation | High |
| Q5 | Hotspot threshold values | M6 configuration | Medium |
| Q6 | Real department connections approved for v1? | M7 vs. illustrative demo only | Medium |
| Q7 | NID required for citizen registration? | M9 identity model | Medium |
| Q8 | CloudApper capability verification results available? | Optional integration decision | Low |
| Q9 | Pre-approved data for shadow-mode evaluation? | AI evaluation methodology | High |

---

## 9. Department Officer Workspace & Staff Allocation Scope (Explicit Addition)

### In-Scope Additions
- Explicit Department Acceptance and Rejection workflow (with mandatory reasons and review routing).
- Five-state officer availability tracking (`AVAILABLE`, `BUSY`, `ON_LEAVE`, `OFFLINE`, `INACTIVE`) with shift status.
- Capacity constraints (`max_concurrent_tasks` and dynamically calculated active tasks).
- Deterministic, explainable assignment recommendation engine based on hard eligibility rules and multi-criteria weighted scoring (priority, SLA risk, ward affinity, normalized load, fairness).
- Concurrency-safe, restart-persistent task waiting queue (`task_waiting_queue`).
- Automatic queue dispatch trigger on officer capacity release / availability change.
- Expanded 9-view department officer interface with role-scoped permissions.

### Boundary Assumptions
- **Staff Allocation Policy**: As the original R&D did not specify an algorithmic or statistical ML model for staff allocation, a transparent, deterministic multi-factor ranking model is implemented and documented, avoiding black-box or fabricated ML claims.
- **Scope Isolation**: Officers only view tasks belonging to their assigned department and ward coverage unless granted supervisor/dispatcher permissions.

