# Nagorik Sathi AI — Security Review & RBAC Audit

## Security Overview
- **Standard:** R&D Report v1.2, Section 11 (Security, Privacy & RBAC Controls)
- **Approved Planning:** `docs/planning/10-rbac-and-security.md`
- **Audit Date:** October 14, 2026

---

## 1. Authentication & Session Management
- **Citizen Authentication:** Passwordless phone number + OTP verification flow (`/api/auth/otp-request`, `/api/auth/otp-verify`).
- **Staff Authentication:** Email + Secure salted PBKDF2 password hashing with JWT Bearer Token session tokens (`/api/auth/login`).
- **Demo Development Bypass:** Only permitted in development mode with clear visual indicators, separated from production authentication logic.
- **Session Expiry:** Access tokens configured for 24 hours with cryptographic signature validation (`HS256`).

---

## 2. Five-Role RBAC Matrix Enforcement

| Role | Scope | Permitted Actions | Strict Prohibitions |
|---|---|---|---|
| **Citizen (নাগরিক)** | Own reports only | Submit problem, confirm location, view own timeline, view Before/After evidence, accept resolution or object ("কাজটি সমাধান হয়নি") | Cannot view other citizens' complaints, cannot access staff dashboards, cannot modify case priority |
| **Ward Desk (ওয়ার্ড ডেস্ক)** | Assigned Ward boundaries | Assisted intake, verify low-confidence proposals, propose duplicate merges, update ward task status | Cannot approve multi-department compound sequences, cannot modify system-wide SLA rules |
| **Dept Officer (বিভাগীয় কর্মকর্তা)** | Assigned Department tasks | View assigned tasks, document valid prerequisite waiting reasons, upload resolution evidence photos | Cannot close whole cases, cannot reassign other departments' tasks, cannot unmask citizen phone |
| **Case Coordinator (সমন্বয়ক)** | Full Corporation Jurisdiction | Review compound problems, approve multi-department execution order (Waste -> Drain -> Road), review SLA escalations, final case closure | Cannot bypass required resolution evidence, cannot override audit logs |
| **System Admin (অ্যাডমিন)** | System Configuration | Manage municipal rules, manage officer directory, inspect SHA-256 audit log, govern AI confidence gate | **Strictly prohibited** from unmasking citizen phone numbers, national IDs, or viewing private cases without authorization |

### Backend Scope Enforcement
- Role checks are performed on the server side via FastAPI dependency injection (`get_current_user`, `require_roles`, `check_scope`).
- Hiding frontend buttons is never relied upon as a security boundary.

---

## 3. Cryptographic Tamper-Evident Audit Logging (Store D5)
- Every critical state change (triage, status change, sequence approval, priority override, evidence upload, objection, closure) generates an append-only audit event.
- **Hash Chaining:** Each record computes `current_hash = SHA256(prev_hash + record_id + action + actor_id + timestamp + payload)`.
- Verified in `backend/tests/test_audit_log.py` to guarantee detection of unauthorized record insertion, deletion, or tampering.

---

## 4. Privacy & Personal Identifiable Information (PII) Protection
- **Phone Number Masking:** In all public feeds, open311 exports, and staff task listings, citizen phone numbers and names are masked (`0171****001`).
- **Location Fuzzing on Public Maps:** The public incident map (`/api/public/map/incidents`) exposes only aggregated ward-level and category-level coordinates without identifying private addresses.
- **Media Protection:** Media files are validated for permitted MIME types (image/jpeg, image/png, video/mp4) and file size limits (10MB image, 50MB video) with signed URL access control.
