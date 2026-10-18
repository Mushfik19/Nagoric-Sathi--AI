# 07 — API Contracts
## Nagorik Sathi AI — R&D Report v1.2

> All endpoints use REST over HTTPS. Base URL: `/api/v1`. Authentication: Bearer JWT. All timestamps: ISO 8601 UTC. All text fields: UTF-8. Bangla fields use `_bn` suffix.

---

## 1. API Groups

| Group | Prefix | Description |
|-------|--------|-------------|
| Authentication and Identity | /auth | Login, register, MFA, token refresh |
| Citizen Reports | /reports | Intake, media upload, draft management |
| Service Guidance | /guidance | RAG queries, service list |
| Incidents | /incidents | Incident view, status, map data |
| Cases | /cases | Case management, task coordination |
| Department Tasks | /tasks | Task status, evidence, acceptance |
| Evidence | /evidence | Evidence upload, retrieval |
| Verification Queue | /verification | Ward desk workflow |
| Officer Directory | /officers | Officer lookup |
| Notifications | /notifications | Preference management |
| Public Analytics | /public | Public dashboard, public map |
| Admin Configuration | /admin | Config, users, gate, SLA |
| Audit | /audit | Audit log (admin only) |
| AI Jobs | /jobs | Job status polling |
| Events (SSE) | /events | Server-Sent Events stream |

---

## 2. Authentication

### POST /auth/register
**Purpose:** Register a new citizen account  
**Auth required:** None  
**Request:**
```json
{
  "phone": "+8801XXXXXXXXX",
  "preferred_language": "bn",
  "consent_location": true,
  "consent_notification_sms": true
}
```
**Response 201:**
```json
{
  "user_id": "uuid",
  "phone_last4": "XXXX",
  "otp_sent": true
}
```
**Validation:** Phone in E.164 format; consent_location required; OTP challenge follows  
**Audit:** creates audit_event(action=created, entity=user)

### POST /auth/login
**Auth required:** None  
**Request:** `{"phone": "+8801...", "otp": "123456"}`  
**Response 200:**
```json
{
  "access_token": "jwt...",
  "refresh_token": "jwt...",
  "expires_in": 900,
  "role": "citizen",
  "user_id": "uuid"
}
```

### POST /auth/mfa/verify (staff only)
**Auth required:** Partial JWT (post-login, pre-MFA)  
**Request:** `{"totp_code": "123456"}`  
**Response 200:** Full access JWT

### POST /auth/token/refresh
**Auth required:** Valid refresh token  
**Request:** `{"refresh_token": "..."}`  
**Response 200:** New access_token

---

## 3. Citizen Reports (M1)

### POST /reports
**Purpose:** Submit a new citizen report (multipart or JSON)  
**Auth required:** citizen | ward_desk  
**Request (multipart/form-data):**
```
text_bn: "ড্রেন ময়লায় ভরা, রাস্তা নষ্ট হচ্ছে"
location_lat: 23.8103
location_lng: 90.4125
location_confirmed: true
location_description: "১২ নং ওয়ার্ড, মিরপুর ১০ মোড়ের কাছে"
is_public_place: true
reported_duration: "৩ দিন ধরে"
citizen_priority_flag: "normal"
voice_file: [binary, nullable]
photos: [binary[], nullable]
videos: [binary[], nullable]
```
**Response 202:**
```json
{
  "report_id": "uuid",
  "job_id": "uuid",
  "status": "submitted",
  "message": "আপনার অভিযোগ নিবন্ধিত হয়েছে।",
  "message_en": "Your report has been registered."
}
```
**Validation:** location_confirmed must be true; GPS coordinates required; text_bn or voice_file required  
**Audit:** creates audit_event

### GET /reports/{report_id}
**Auth required:** citizen (own reports only) | ward_desk | coordinator | admin  
**Response 200:**
```json
{
  "report_id": "uuid",
  "status": "submitted|ai_processing|verified|merged",
  "incident_id": "uuid or null",
  "submitted_at": "ISO8601",
  "ai_processing": {
    "job_id": "uuid",
    "job_status": "queued|processing|complete|failed",
    "completed_at": "ISO8601 or null"
  },
  "location": { "lat": 23.81, "lng": 90.41, "description": "..." }
}
```

### GET /reports/{report_id}/ai-proposal
**Auth required:** ward_desk | coordinator  
**Purpose:** View AI routing proposal for staff verification  
**Response 200:**
```json
{
  "report_id": "uuid",
  "proposal": {
    "lead_department": { "id": "uuid", "name": "Waste Management", "name_bn": "বর্জ্য ব্যবস্থাপনা" },
    "supporting_departments": [],
    "reasons_bn": "জিপিএস পিন ওয়ার্ড ৩-এ পয়েন্ট করে। এলাকার বর্জ্য মালিকানা বর্জ্য ব্যবস্থাপনার।",
    "reasons_en": "GPS pin in Ward 3. Waste ownership in area belongs to Waste Management.",
    "confidence": 0.91,
    "gate_passed": true,
    "priority": "high",
    "priority_reasons_bn": "প্রধান রাস্তা, একাধিক দিন ধরে বাধা।"
  },
  "critical_flag": false,
  "critical_flag_type": null,
  "officer": {
    "name": "Engineer Karim Hossain",
    "designation": "Ward Engineer",
    "official_phone": "01X-XXXXXXXX",
    "official_email": "karim@cityco.gov.bd",
    "validity_date": "2027-01-01"
  },
  "duplicate_candidates": [
    { "incident_id": "uuid", "score": 0.82, "distance_m": 45 }
  ]
}
```

### POST /reports/{report_id}/media
**Purpose:** Upload additional media to an existing report  
**Auth required:** citizen (own) | ward_desk  
**Request:** multipart/form-data with media_type and file  
**Response 202:** `{"media_id": "uuid", "upload_status": "pending"}`

---

## 4. Service Guidance (M2)

### POST /guidance/query
**Purpose:** RAG query for service information  
**Auth required:** None (public) | citizen preferred for ward scoping  
**Request:**
```json
{
  "query_bn": "ট্রেড লাইসেন্স নবায়নের জন্য কী কী কাগজ দরকার?",
  "ward_id": "uuid",
  "service_type": "trade_license"
}
```
**Response 200:**
```json
{
  "answer_bn": "ট্রেড লাইসেন্স নবায়নের জন্য যা লাগবে: ...",
  "sources": [
    {
      "title": "DCC Trade License Rules",
      "url": "https://dncc.gov.bd/...",
      "area": "Dhaka North City Corporation",
      "last_verified": "2026-09-15"
    }
  ],
  "has_verified_source": true,
  "disclaimer_bn": "এই তথ্য সরকারি দলিল থেকে সংগৃহীত। চূড়ান্ত সিদ্ধান্তের জন্য কর্তৃপক্ষের সাথে যোগাযোগ করুন।"
}
```
**No verified source response:**
```json
{
  "has_verified_source": false,
  "fallback_message_bn": "এই তথ্য আমাদের যাচাইকৃত তথ্যভাণ্ডারে নেই।",
  "refer_to": "ward_desk"
}
```

### GET /guidance/services
**Auth required:** None  
**Purpose:** List available service information items  
**Query params:** `ward_id`, `category`, `lang`  
**Response 200:** Array of `{id, title_bn, title_en, service_type, applicable_area}`

---

## 5. Incidents and Map (M3, M6)

### GET /incidents/{incident_id}
**Auth required:** citizen (own incident) | ward_desk | dept_officer (assigned) | coordinator | admin  
**Response 200:**
```json
{
  "incident_id": "uuid",
  "status": "in_progress",
  "priority": "high",
  "problem_types": ["waste", "drain"],
  "location": { "lat": 23.81, "lng": 90.41, "description": "..." },
  "ward": { "ward_number": "12", "name_bn": "ওয়ার্ড ১২" },
  "reported_at": "ISO8601",
  "verified_at": "ISO8601",
  "linked_report_count": 3,
  "lead_officer": {
    "name": "Engineer Karim",
    "designation": "Ward Engineer",
    "official_phone": "01X-XXXXXXXX",
    "official_email": "karim@cityco.gov.bd"
  },
  "status_history": [
    { "status": "submitted", "at": "ISO8601" },
    { "status": "verified", "at": "ISO8601", "by_role": "ward_desk" }
  ],
  "waiting_reason": null,
  "case": {
    "case_id": "uuid",
    "tasks": [
      {
        "task_id": "uuid",
        "department": "Waste Management",
        "task_order": 1,
        "status": "done",
        "waiting_reason": null
      },
      {
        "task_id": "uuid",
        "department": "Drainage Engineering",
        "task_order": 2,
        "status": "in_progress",
        "waiting_reason": null
      }
    ]
  },
  "proof_evidence": [
    { "evidence_id": "uuid", "type": "after_photo", "url": "presigned-url", "uploaded_at": "ISO8601" }
  ]
}
```

### GET /public/map
**Auth required:** None  
**Purpose:** Incident map data for public view  
**Query params:** `ward_ids[]`, `priority[]`, `status[]`, `bbox`  
**Response 200:**
```json
{
  "incidents": [
    {
      "incident_id": "uuid",
      "location": { "lat": 23.81, "lng": 90.41 },
      "problem_types": ["drain"],
      "status": "in_progress",
      "priority": "high",
      "linked_report_count": 2
    }
  ],
  "hotspot_zones": [
    {
      "zone_id": "uuid",
      "polygon": { "type": "Polygon", "coordinates": [...] }
    }
  ]
}
```
**Privacy:** No citizen identity; no reporter info; no addresses; coordinates only

---

## 6. Verification Queue (M5, ward desk)

### GET /verification/queue
**Auth required:** ward_desk (own ward only)  
**Query params:** `priority`, `status`, `page`, `page_size`  
**Response 200:**
```json
{
  "items": [
    {
      "report_id": "uuid",
      "incident_id": "uuid",
      "priority": "high",
      "problem_types": ["drain", "road"],
      "submitted_at": "ISO8601",
      "ai_proposal_ready": true,
      "has_duplicate_candidate": true,
      "critical_flag": false
    }
  ],
  "total": 12,
  "page": 1,
  "page_size": 20
}
```

### POST /incidents/{incident_id}/verify
**Auth required:** ward_desk  
**Purpose:** Staff verification of AI proposal or manual determination  
**Request:**
```json
{
  "verification_type": "ai_proposal_accepted | manual_determination",
  "lead_department_id": "uuid",
  "supporting_department_ids": ["uuid"],
  "priority_level": "high",
  "priority_override_reason": "nullable",
  "plan_sequence": [
    { "department_id": "uuid", "problem_type": "waste", "order": 1 },
    { "department_id": "uuid", "problem_type": "drain", "order": 2, "prerequisite_task_orders": [1] }
  ]
}
```
**Response 200:** `{"incident_id": "uuid", "status": "verified", "case_id": "uuid"}`  
**Validation:** lead_department_id required; plan_sequence required if multiple tasks; RBAC: ward scope check  
**Audit:** appends audit_event

### POST /incidents/{incident_id}/duplicate-action
**Auth required:** ward_desk  
**Request:** `{"action": "merge | reject_as_duplicate", "target_incident_id": "uuid"}`  
**Response 200:** `{"incident_id": "uuid", "merged_into": "uuid or null"}`

---

## 7. Case Coordination (M7)

### GET /cases/{case_id}
**Auth required:** ward_desk | dept_officer (assigned) | coordinator | admin  
**Response 200:** Full case detail with tasks, prerequisites, status, evidence, waiting reasons

### POST /cases/{case_id}/approve-plan
**Auth required:** coordinator  
**Request:** `{"approved": true, "notes": "nullable"}`  
**Response 200:** `{"case_id": "uuid", "plan_approved": true}`

### POST /cases/{case_id}/resolution-review
**Auth required:** ward_desk | coordinator  
**Request:** `{"review_status": "approved | rejected", "notes": "text"}`  
**Response 200:** `{"case_id": "uuid", "resolution_review_status": "approved"}`

### POST /cases/{case_id}/citizen-response
**Auth required:** citizen (own case only)  
**Request:** `{"response": "accepts | objects", "objection_reason": "text, required if objects"}`  
**Response 200:** `{"case_id": "uuid", "citizen_response": "accepts"}`

### POST /cases/{case_id}/close
**Auth required:** coordinator  
**Validation:** resolution_review must be approved; citizen_response must exist or documented reason provided  
**Response 200:** `{"case_id": "uuid", "status": "closed"}`

### POST /cases/{case_id}/escalate
**Auth required:** coordinator | system (SLA timer)  
**Request:** `{"reason": "SLA_BREACH | MANUAL", "notes": "text"}`  
**Response 200:** `{"escalation_id": "uuid", "notified_roles": ["coordinator", "admin"]}`

---

## 8. Department Tasks (M7, M8)

### GET /tasks/my-tasks
**Auth required:** dept_officer  
**Response 200:** Array of tasks assigned to the requesting officer's department, sorted by priority and task_order

### PATCH /tasks/{task_id}/status
**Auth required:** dept_officer (own dept task only)  
**Request:**
```json
{
  "status": "under_inspection | in_progress | resolved_proof_uploaded",
  "waiting_reason": "nullable, shown to citizen if blocked"
}
```
**Validation:** Prerequisite tasks must be "done" before status can advance past "assigned"; evidence required before "resolved_proof_uploaded" if evidence_required=true  
**Response 200:** Updated task object  
**Audit:** appends audit_event; SSE event emitted

### POST /tasks/{task_id}/accept
**Auth required:** dept_officer (own dept)  
**Response 200:** `{"task_id": "uuid", "status": "accepted"}`

### POST /tasks/{task_id}/reject
**Auth required:** dept_officer (own dept)  
**Request:** `{"reason": "text, required"}`  
**Response 200:** `{"task_id": "uuid", "status": "rejected", "case_rerouted": true}`

---

## 9. Evidence (M8)

### POST /tasks/{task_id}/evidence
**Auth required:** dept_officer (own dept task) | ward_desk  
**Request (multipart):**
```
evidence_type: before_photo | after_photo | video | inspection_note
file: binary
```
**Response 202:** `{"evidence_id": "uuid", "upload_status": "pending"}`  
**Validation:** File type check (magic bytes); size limits (photo 10MB, video 50MB)

### GET /tasks/{task_id}/evidence
**Auth required:** dept_officer | ward_desk | coordinator | citizen (own case, visible evidence only)  
**Response 200:** Array of `{evidence_id, type, url (presigned, TTL 15min), uploaded_at, visible_to_citizen, masking_status}`

---

## 10. Notifications

### GET /notifications/preferences
**Auth required:** citizen | any authenticated  
**Response 200:** `{sms_enabled, email_enabled, push_enabled}`

### PUT /notifications/preferences
**Auth required:** citizen  
**Request:** `{sms_enabled: true, email_enabled: false, push_enabled: true}`

---

## 11. Public Analytics (M10)

### GET /public/analytics
**Auth required:** None  
**Response 200:**
```json
{
  "resolution_rate": {
    "overall": 0.73,
    "by_ward": [{ "ward_number": "12", "rate": 0.68, "case_count": 45 }],
    "small_number_hidden": true
  },
  "median_resolution_days": {
    "by_priority": { "emergency": 0.5, "high": 3.2, "medium": 8.1 }
  },
  "open_incidents_by_priority": { "emergency": 2, "high": 15, "medium": 43 },
  "citizen_acceptance_rate": 0.81,
  "reopen_rate": 0.12,
  "hotspot_count": 3,
  "hotspot_with_review": 2
}
```
**Privacy:** No personal data; small counts (<5) replaced with `"<5"`; no individual rankings

---

## 12. Admin Configuration (M10)

### GET /admin/config
**Auth required:** admin  
**Response 200:** All system_config records

### PUT /admin/config/{config_key}
**Auth required:** admin  
**Request:** `{"value": "0.82", "reason": "Improving after validation"}`  
**Special rule for routing_confidence_gate:** Lowering requires dual approval (POST /admin/config/{key}/second-approval)  
**Response 200:** Updated config + audit trail  
**Audit:** config_changed event

### GET /admin/users
**Auth required:** admin  
**Query params:** `role`, `ward_id`, `department_id`, `is_active`  
**Response 200:** Paginated user list (no phone raw; no email raw; no citizen personal data)

### POST /admin/users
**Auth required:** admin  
**Purpose:** Create staff account  
**Request:** `{role, department_id, ward_id, official_email, official_phone}`

### PATCH /admin/users/{user_id}
**Auth required:** admin  
**Purpose:** Activate/deactivate; change ward/dept assignment  
**Audit:** user_updated event

---

## 13. Audit Log (M9)

### GET /audit
**Auth required:** admin  
**Query params:** `entity_type`, `entity_id`, `performed_by`, `action`, `from`, `to`, `page`, `page_size`  
**Response 200:** Paginated audit_events (read-only; no modification)

---

## 14. AI Jobs

### GET /jobs/{job_id}
**Auth required:** citizen (own report) | ward_desk | coordinator | admin  
**Response 200:**
```json
{
  "job_id": "uuid",
  "job_type": "full_analysis",
  "status": "complete",
  "started_at": "ISO8601",
  "completed_at": "ISO8601",
  "result_available": true
}
```

---

## 15. Server-Sent Events (M3)

### GET /events/stream?citizen_id={id}&report_id={id}&incident_id={id}
**Auth required:** Any authenticated (own entities)  
**Content-Type:** text/event-stream  
**Events:**
```
event: ai_complete
data: {"job_id": "uuid", "report_id": "uuid", "gate_passed": true}

event: status_change
data: {"incident_id": "uuid", "new_status": "verified", "waiting_reason": null}

event: task_update
data: {"task_id": "uuid", "status": "in_progress", "dept": "Drainage Engineering"}

event: proof_uploaded
data: {"incident_id": "uuid", "evidence_count": 2}

event: case_closed
data: {"case_id": "uuid", "incident_id": "uuid"}
```

---

## 16. Standard Error Responses

```json
{
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "You do not have permission to access this case.",
    "message_bn": "এই কেসটিতে প্রবেশাধিকার নেই।",
    "request_id": "uuid"
  }
}
```

| HTTP Code | Code | Meaning |
|-----------|------|---------|
| 400 | VALIDATION_ERROR | Request validation failed; field errors included |
| 401 | UNAUTHENTICATED | Missing or invalid token |
| 403 | PERMISSION_DENIED | RBAC check failed |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | State conflict (e.g. case already closed) |
| 422 | INTEGRITY_CHECK_FAILED | AI/rule integrity check failed |
| 429 | RATE_LIMITED | Too many requests |
| 503 | AI_UNAVAILABLE | AI service down; manual mode active |

---

## 17. API-to-Workflow Mapping

| Workflow Step | Primary API | Module |
|--------------|-------------|--------|
| Register citizen | POST /auth/register | M9 |
| Submit report | POST /reports | M1 |
| Upload media | POST /reports/{id}/media | M1 |
| Poll AI job | GET /jobs/{job_id} | M4 |
| Service guidance query | POST /guidance/query | M2 |
| View verification queue | GET /verification/queue | M5 |
| View AI proposal | GET /reports/{id}/ai-proposal | M5 |
| Staff verify and create case | POST /incidents/{id}/verify | M5, M7 |
| Confirm/reject duplicate | POST /incidents/{id}/duplicate-action | M6 |
| Coordinator approves plan | POST /cases/{id}/approve-plan | M7 |
| Task accept/reject | POST /tasks/{id}/accept or /reject | M7 |
| Task status update | PATCH /tasks/{id}/status | M7 |
| Upload evidence | POST /tasks/{id}/evidence | M8 |
| Staff resolution review | POST /cases/{id}/resolution-review | M8 |
| Citizen response | POST /cases/{id}/citizen-response | M8 |
| Close case | POST /cases/{id}/close | M7 |
| View public map | GET /public/map | M3, M10 |
| Public analytics | GET /public/analytics | M10 |
| Admin config | PUT /admin/config/{key} | M10 |
| Live updates | GET /events/stream | M3 |

---

## 18. Department Workspace, Workload & Queue APIs (Explicit Addition)

### GET /tasks/department-requests
**Auth required:** JWT (`dept_officer`, `coordinator`, `admin`)  
**Scope:** Department-scoped  
**Purpose:** View incoming tasks routed to the officer's department awaiting acceptance/rejection.  
**Response 200:** Array of tasks with `id`, `case_id`, `title_bn`, `priority`, `sla_hours`, `acceptance_status`, `prerequisites_completed`, and `ai_routing_rationale`.

### POST /tasks/{id}/accept
**Auth required:** JWT (`dept_officer`, `coordinator`, `admin`)  
**Purpose:** Department explicitly accepts responsibility for assigned task.  
**Response 200:** `{"status": "accepted", "task_id": "uuid", "message_bn": "দপ্তর কর্তৃক দায়িত্ব গৃহীত হয়েছে।"}`

### POST /tasks/{id}/reject
**Auth required:** JWT (`dept_officer`, `coordinator`, `admin`)  
**Request Body:** `{"reason_bn": "সড়কটি ওয়াসা খননের অধীনে থাকায় সড়ক বিভাগের এখতিয়ার বহির্ভূত।"}`  
**Purpose:** Department rejects task with mandatory explanation; case returns to coordinator review.  
**Response 200:** `{"status": "rejected", "task_id": "uuid", "message_bn": "দাপ্তরিক প্রত্যাখ্যান লিপিবদ্ধ এবং সমন্বয়কের নিকট পর্যালোচনার জন্য প্রেরিত।"}`

### GET /officers/availability
**Auth required:** JWT (`dept_officer`, `coordinator`, `admin`)  
**Purpose:** Retrieve officer availability, duty shift, active tasks, and capacity.

### PUT /officers/{id}/availability
**Auth required:** JWT (`dept_officer` for own record, or `coordinator`/`admin`)  
**Request Body:** `{"status": "available|busy|on_leave|offline|inactive", "max_concurrent_tasks": 4}`  
**Purpose:** Update availability state and workload ceiling.

### GET /tasks/{id}/recommendations
**Auth required:** JWT (`dept_officer`, `coordinator`, `admin`)  
**Purpose:** Return ranked list of eligible officers based on hard constraints and multi-factor scoring formula.  
**Response 200:**
```json
{
  "task_id": "uuid",
  "recommendations": [
    {
      "officer_id": "uuid",
      "officer_name_bn": "ইঞ্জিনিয়ার কামরুল হাসান",
      "designation_bn": "সহকারী প্রকৌশলী (ড্রেনেজ)",
      "score": 0.94,
      "current_active_tasks": 1,
      "max_capacity": 4,
      "ward_coverage_match": true,
      "eligibility_reasons": ["ওয়ার্ড ৩ সরাসরি এখতিয়ারভুক্ত", "বর্তমান লোড ২৫% (১/৪)", "কোনো এসএলএ লঙ্ঘন নেই"]
    }
  ]
}
```

### POST /tasks/{id}/assign
**Auth required:** JWT (`dept_officer`, `coordinator`, `admin`)  
**Request Body:** `{"officer_id": "uuid", "assignment_type": "recommended|manual|reassignment", "reason_bn": "ঐচ্ছিক কারণ"}`  
**Response 200:** `{"status": "assigned", "task_id": "uuid", "officer_id": "uuid"}`

### GET /tasks/waiting-queue
**Auth required:** JWT (`dept_officer`, `coordinator`, `admin`)  
**Purpose:** Return department-scoped persistent queue ordered by Priority and SLA deadline.

### POST /tasks/queue/auto-dispatch
**Auth required:** JWT (`coordinator`, `admin`, or scheduled worker)  
**Purpose:** Concurrency-safe atomic queue evaluation and dispatch of ready tasks to eligible officers.

