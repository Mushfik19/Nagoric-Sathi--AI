# 10 — RBAC and Security
## Nagorik Sathi AI — R&D Report v1.2

> RBAC matrix derived from R&D §11.2 (Table 30). Security controls from R&D §11.1 (Table 29) and §11.3.

---

## 1. Role Definitions (R&D §11)

| Role | Code | Scope Constraint | Description |
|------|------|-----------------|-------------|
| Citizen | CITIZEN | Own records only | Registers, submits reports, views own incident status, responds to resolution |
| Ward-Desk / Service-Centre Staff | WARD_DESK | Own assigned ward(s) only | Verifies proposals, confirms duplicates, approves plans, assists citizens |
| Department Officer / Field Staff | DEPT_OFFICER | Own assigned department tasks only | Accepts/rejects tasks, updates status, uploads evidence |
| Case Coordinator | COORDINATOR | Authorized jurisdiction (city corporation) | Approves sequencing, handles escalations, closes cases, reviews closures |
| Administrator | ADMIN | System-wide configuration only | User management, rules, gate, knowledge, audit review; does not automatically access private case content |
| Public (unauthenticated) | PUBLIC | Aggregated, anonymised data only | Public map and dashboard |

---

## 2. RBAC Matrix (R&D Table 30)

**Permission codes:** R=Read, C=Create, U=Update, A=Approve, V=Verify, O=Override with reason, F=Citizen feedback/objection, H=History/audit

| Resource | Action | CITIZEN | WARD_DESK | DEPT_OFFICER | COORDINATOR | ADMIN | PUBLIC |
|----------|--------|---------|-----------|--------------|-------------|-------|--------|
| **Own citizen profile** | R | Own only | — | — | — | R all | — |
| **Own citizen profile** | U | Own only | — | — | — | — | — |
| **Consent records** | C | Own only | — | — | — | — | — |
| **Consent records** | U (revoke) | Own only | — | — | — | — | — |
| **Reports** | C | ✓ | On behalf of citizen | — | — | — | — |
| **Own reports** | R | Own only | Ward scope | — | Jurisdiction | — | — |
| **AI proposal** | R | — | Ward scope | — | Jurisdiction | — | — |
| **Incidents (summary)** | R | Own incident only | Ward scope | Assigned task's case | Jurisdiction | — | Anonymised |
| **Incidents (full detail)** | R | Own incident | Ward scope | Assigned task's case | Jurisdiction | V | — |
| **Incidents (status)** | R | Own incident | Ward scope | Assigned task's case | Jurisdiction | — | Anonymised |
| **Incidents** | V (verify/create) | — | Ward scope | — | — | — | — |
| **Priority level** | O (override) | Signal only | V + reason | — | ✓ + reason | — | — |
| **Duplicate merge** | A | — | Ward scope | — | — | — | — |
| **Cases** | R | Own case | Ward scope | Assigned tasks | Jurisdiction | R | — |
| **Cases (sequencing plan)** | A | — | Ward scope | — | Jurisdiction | — | — |
| **Cases** | Close | — | — | — | Jurisdiction | — | — |
| **Department tasks** | R | See case | Ward scope | Own dept only | Jurisdiction | — | — |
| **Department tasks** | U (status update) | — | — | Own dept only | — | — | — |
| **Department tasks** | Accept/Reject | — | — | Own dept only | — | — | — |
| **Evidence files** | C (upload) | — | Assisted upload | Own dept task | — | — | — |
| **Evidence files** | R | Own case, masked | Ward scope | Own dept | Jurisdiction | — | — |
| **Resolution review** | A | — | Ward scope | — | Jurisdiction | — | — |
| **Citizen response** | F | Own case only | — | — | — | — | — |
| **Officer directory** | R | Own case only (name+contact) | Ward scope | Own dept | Jurisdiction | R+U | — |
| **Service knowledge** | R | ✓ | ✓ | ✓ | ✓ | R+U | ✓ |
| **SLA timer** | R | Own incident | Ward scope | Own tasks | Jurisdiction | R | — |
| **Escalation** | C | — | — | — | Jurisdiction | — | — |
| **Public map** | R | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Public analytics** | R | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **User accounts** | C+U | Own profile | — | — | — | ✓ | — |
| **System config** | R | — | — | — | — | ✓ | — |
| **System config (gate)** | U (raise) | — | — | — | — | Admin only | — |
| **System config (gate)** | U (lower) | — | — | — | — | Dual approval | — |
| **Audit log** | H | — | — | — | — | R | — |
| **Hotspot analysis** | R | Map pin only | Ward scope | Own dept context | Jurisdiction | ✓ | Zone only |

---

## 3. Special Conditions and Restrictions (R&D §11)

### 3.1 Citizen Restrictions
- Citizens access only their own reports and the incident that their report is linked to
- Citizens cannot see other reporters' identities, contact details, or raw submissions
- Citizens see officer name and contact only on their own case
- Citizens may flag a report as urgent; this is a signal, not a priority override (S9)
- Citizens see proof evidence only after status = resolved_proof_uploaded
- Citizens' location is used once at intake with consent; no continuous tracking

### 3.2 Ward-Desk Restrictions
- Ward scope: strictly enforced; ward_id embedded in JWT claims; API filters by JWT ward
- May not close cases (coordinator only)
- May not lower priority below AI-proposed level without recorded reason
- May approve priority override (with reason); coordinator can also override
- May assist citizen intake (assisted submission); the citizen remains the report owner

### 3.3 Department Officer Restrictions
- Scope: only tasks belonging to their assigned department
- Cannot view other departments' task evidence (only own dept tasks)
- Cannot view citizen identity; can see case context (Bangla text, location, priority)
- May reject tasks with a reason; rejection is re-routed in same case (not dropped)
- May not close cases; coordinator only
- Evidence upload: only for own dept tasks

### 3.4 Coordinator Restrictions
- Can approve and close cases
- Can override priority with a recorded reason
- Can handle escalations
- Cannot access private citizen personal data (phone/email) directly
- Cannot lower confidence gate alone (requires dual approval with admin)

### 3.5 Administrator Restrictions
- Can manage user accounts; cannot see raw citizen personal data through admin interface
- Can view audit log; cannot modify it (append-only constraint)
- Can raise confidence gate alone
- Lowering confidence gate requires: second admin approval + re-validation + versioned audit record
- Administrator does not automatically get access to private case content

---

## 4. Scope Enforcement

All scope constraints are enforced at two levels:
1. **JWT claims level:** ward_id, department_id, role embedded in token at login; scope cannot be escalated without re-authentication
2. **Database query level:** all data queries filter by the requesting user's scope; no "show all then filter in application" patterns

```
Example enforcement (pseudo-code):
GET /verification/queue
  → JWT claims: {role: ward_desk, ward_id: "uuid-ward-3"}
  → query: SELECT * FROM reports WHERE ward_id = jwt.ward_id AND status = 'submitted'
  → Never returns reports from other wards
```

---

## 5. Negative Authorization Test Cases

These operations must be explicitly denied:

| Test | Actor | Action | Expected Result |
|------|-------|--------|----------------|
| T-RBAC-01 | Citizen A | View Citizen B's report | 403 PERMISSION_DENIED |
| T-RBAC-02 | Dept officer | Update task in another department | 403 PERMISSION_DENIED |
| T-RBAC-03 | Ward desk (Ward 3) | Access incident from Ward 5 | 403 PERMISSION_DENIED |
| T-RBAC-04 | Citizen | Close a case | 403 PERMISSION_DENIED |
| T-RBAC-05 | Dept officer | Approve case sequencing plan | 403 PERMISSION_DENIED |
| T-RBAC-06 | Admin | Modify audit log | 409 / DB trigger exception |
| T-RBAC-07 | Admin (solo) | Lower confidence gate | 403 — requires dual approval |
| T-RBAC-08 | Citizen | View another citizen's officer contact | 403 PERMISSION_DENIED |
| T-RBAC-09 | Dept officer | View evidence from other department's task | 403 PERMISSION_DENIED |
| T-RBAC-10 | Public | View citizen identity on public map | Not present in response |
| T-RBAC-11 | Ward desk | Create system configuration | 403 PERMISSION_DENIED |
| T-RBAC-12 | Coordinator | Register a new user | 403 PERMISSION_DENIED |
| T-RBAC-13 | Citizen | Access verification queue | 403 PERMISSION_DENIED |

---

## 6. Security Controls (R&D Table 29)

### 6.1 Transport Security
| Control | Specification |
|---------|--------------|
| TLS version | TLS 1.3 minimum; TLS 1.2 with strong ciphers acceptable for legacy |
| HSTS | max-age=31536000; includeSubDomains |
| Certificate | Valid CA-signed certificate; auto-renewal via Let's Encrypt [PROPOSED] |

### 6.2 Authentication
| Control | Specification |
|---------|--------------|
| Citizen auth | Phone + OTP (SMS); JWT access (15 min) + refresh (24 h) [PROPOSED] |
| Staff auth | Phone/email + password + MFA (TOTP); JWT access (15 min) + refresh (8 h work session) [PROPOSED] |
| MFA enforcement | Required for all staff roles; cannot be disabled by user |
| Password policy (staff) | Min 12 chars, 1 upper, 1 lower, 1 digit, 1 special [PROPOSED] |
| OTP | 6-digit TOTP; 30-second window; 10-minute expiry for SMS OTP |
| Token storage | Access token: memory only (no localStorage); Refresh token: httpOnly cookie |
| Session termination | Refresh token revoked on logout, password change, account deactivation |

### 6.3 Encryption
| Data | Method |
|------|--------|
| Data in transit | TLS 1.3 |
| Media files at rest | AES-256 (MinIO server-side encryption) |
| Citizen phone number | bcrypt hash in database; plaintext never stored |
| Citizen email | AES-256 application-layer encryption |
| Staff MFA secrets | AES-256 application-layer encryption |
| Database volume | Encrypted at OS level [PROPOSED: depends on deployment environment] |

### 6.4 Input Validation and Injection Prevention
| Control | Method |
|---------|--------|
| SQL injection | SQLAlchemy ORM parameterised queries; never raw SQL with user input |
| XSS | React default escaping; CSP headers: `script-src 'self'`; no dangerouslySetInnerHTML |
| File upload | Magic byte validation (not extension only); MIME type whitelist; size limits |
| Path traversal | MinIO key generation never uses user input directly [PROPOSED] |
| SSRF | No user-controlled URLs in server-side requests [PROPOSED] |

### 6.5 API Security
| Control | Specification |
|---------|--------------|
| Rate limiting | 100 req/min per citizen; 500 req/min per staff [PROPOSED via Redis] |
| CORS | Allow-Origin: own domain only; no wildcard |
| Request ID | Every response includes X-Request-ID header for audit correlation |
| HTTPS redirect | HTTP always redirected to HTTPS at Nginx level |

### 6.6 Audit Log
| Property | Specification |
|----------|--------------|
| Immutability | Postgres trigger: BEFORE UPDATE/DELETE → RAISE EXCEPTION |
| Completeness | Every state-changing operation creates an audit event (S5 — always human in loop) |
| Fields | entity, action, actor, before state, after state, timestamp, IP, request_id |
| Retention | [NEEDS CLARIFICATION] — recommend minimum 5 years; set by city corporation policy |
| Access | Read-only; admin role only; no bulk export without authorised request |
| Partitioning | Monthly partitioned Postgres table for query performance |

### 6.7 Privacy Controls
| Control | Specification |
|---------|--------------|
| Data minimisation | Collect only what is needed; optional fields clearly labelled |
| Location | Used once for incident pin with consent; not stored continuously |
| Media masking | Faces, number plates, house numbers masked where feasible; staff review |
| Identity isolation | Citizen A cannot see Citizen B's identity through any interface path |
| Contact relay | Officer contact shown only on citizen's own case; no broadcast |
| Public dashboard | Only aggregated data; counts < 5 shown as "<5" |
| Consent records | Every consent change logged with timestamp and text shown to citizen |

### 6.8 OWASP ASVS Alignment
Target: ASVS Level 2 for the prototype  
Key areas: Authentication (V2), Session (V3), Access Control (V4), Input Validation (V5), Cryptography (V6), Error Handling (V7), Data Protection (V8), Communications (V9), HTTP Security Headers (V14)

---

## 7. Security Testing Plan

| Test Type | Scope | Tool | Coverage |
|-----------|-------|------|----------|
| RBAC negative cases | All T-RBAC-01 to T-RBAC-13 | pytest + custom client | Every matrix cell |
| OWASP ZAP scan | All API endpoints | OWASP ZAP (automated) | Common vulnerabilities |
| JWT validation | Token expiry, tampering, scope escalation | pytest | Auth boundary |
| Input fuzzing | All text inputs including Bangla text | Schemathesis [PROPOSED] | Injection prevention |
| File upload abuse | Wrong MIME type, oversized, path traversal | pytest | Upload endpoint |
| MFA bypass | Skip TOTP challenge | pytest | Staff auth |
| Audit immutability | Attempt UPDATE/DELETE on audit_events | pytest (DB level) | Trigger test |
| Gate dual-approval | Admin lowers gate without second approval | pytest | Config security |
