# Nagorik Sathi AI (নাগরিক সাথী এআই)

**An AI-Assisted Civic Service and Multi-Department Case Coordination Platform for City Corporations**  
*Authoritative Technical Prototype strictly conforming to `R&D.pdf` (Version 1.2, October 2026).*

---

## 🏛️ Core Philosophy: *"AI proposes, people decide"*

Nagorik Sathi AI transforms municipal service delivery from fragmented silos into an explainable, multi-department civic coordination system:

1. **Multimodal Bangla Intake:** Citizens report problems via Bangla text, voice recording, photo/video evidence, and map GPS location pinning.
2. **Explainable Responsibility Routing:** Deterministic matching using Ward boundaries, physical asset registry, and municipal rules with transparent Bangla reasoning.
3. **80% Safety Confidence Gate:** High-confidence proposals are prepared for citizen & staff confirmation; proposals below 80% confidence or involving safety hazards automatically route to human verification.
4. **Multi-Department Workflow Sequencing:** One compound problem (e.g. Garbage accumulation + Blocked drain + Road damage) becomes **ONE** coordinated case with explicit prerequisites, sequential task unlocking, and visible waiting reasons.
5. **Evidence-Based Closure & Citizen Objection:** Side-by-side Before/After evidence comparison. AI can **never** close a case; closure requires citizen satisfaction or authorized coordinator review. A citizen objection ("কাজটি সমাধান হয়নি") immediately reopens the task inside the same case.
6. **Reversible Duplicate Merge & Repeat-Issue Hotspots:** Spatial GPS radius clustering, reversible merges preserving individual tracking, and chronic hotspot advisory notes with engineering alternatives.
7. **Verified-Source RAG Guidance:** Strict source-grounded citizen charter Q&A with zero hallucination on fees or legal requirements.
8. **Tamper-Evident SHA-256 Audit Trail:** Immutable append-only audit logging with cryptographic hash chaining.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.11+ / Python 3.13
- Node.js v18+ / v20+ / v26+ and npm
- (Optional) Docker & Docker Compose for containerized deployments

### 2. Backend Setup & Run
```powershell
cd backend
$env:PYTHONPATH="."
& "D:\Antigravity\civic services\backend\venv\Scripts\uvicorn.exe" app.main:app --reload --port 8000
```
- **Interactive Swagger API Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health & Readiness Endpoints:** [http://localhost:8000/health](http://localhost:8000/health)

### 3. Frontend Setup & Run
```powershell
cd frontend
npm run dev
```
- **Web Application & PWA:** [http://localhost:5173](http://localhost:5173)

---

## 🧪 Running Automated Tests

### Backend Automated Test Suite (13 tests)
```powershell
$env:PYTHONPATH="d:\Antigravity\Civic Service Prototype\backend"
& "D:\Antigravity\civic services\backend\venv\Scripts\pytest.exe" backend/tests/ -v
```
All 13 test suites pass with 100% success rate:
- `test_ai_gate.py`: AI intake, Bangla entity extraction, ward & asset lookup
- `test_audit_log.py`: Tamper-evident SHA-256 cryptographic audit chain
- `test_auth_rbac.py`: 5-role authentication & admin PII privacy restrictions
- `test_case_workflow.py`: Compound multi-department task sequencing (Waste -> Drain -> Road)
- `test_duplicates_hotspots.py`: Spatial duplicate clustering & strict RAG service guidance
- `test_evidence_closure.py`: Resolution evidence upload & citizen objection reopening
- `test_open311.py`: Open311 GeoReport v2 standard services and requests API
- `test_sla_escalation.py`: SLA countdown evaluation, emergency targets & escalation ladder

### Frontend Automated Test Suite (3 tests)
```powershell
cd frontend
npm test
```
All 3 unit tests pass:
- Localized Bangla number formatting
- SLA countdown calculation & breach detection
- Role permission guards for case plan approvals and citizen objections

### Frontend Production Build & Linting
```powershell
cd frontend
npm run lint     # oxlint src (0 errors)
npm run build    # tsc -b && vite build (0 errors)
```

---

## 👥 Pre-Seeded Demonstration Accounts

| Role | Username / Identifier | Password / OTP | Key Functions & Accessible Screens |
|---|---|---|---|
| **Citizen (নাগরিক)** | `01711000001` | OTP: `123456` | Multimodal intake wizard, my cases timeline, Before/After evidence view, objection |
| **Ward Desk (ওয়ার্ড ডেস্ক)** | `warddesk@nagoriksathi.gov.bd` | `Pass1234!` | Verification queue, assisted citizen intake, duplicate merge, ward operations |
| **Dept Officer (কর্মকর্তা)** | `officer_drain@nagoriksathi.gov.bd` | `Pass1234!` | Department task workspace, prerequisite waiting reasons, evidence proof upload |
| **Case Coordinator (সমন্বয়ক)** | `coordinator@nagoriksathi.gov.bd` | `Pass1234!` | Multi-department dependency sequencing, SLA escalation ladder, hotspot analysis |
| **System Admin (অ্যাডমিন)** | `admin@nagoriksathi.gov.bd` | `AdminPass1234!` | AI confidence gate governance (80% gate), SHA-256 audit log review, directory |

---

## 📁 Technical Documentation Directory

- [Approved Planning Package](docs/planning/) (15 comprehensive documents)
- [Implementation Status Report](docs/implementation/implementation-status.md)
- [Automated Test Results](docs/implementation/test-results.md)
- [Security & RBAC Audit](docs/implementation/security-review.md)
- [Known Limitations & External Blockers](docs/implementation/known-limitations.md)
