# 06 — Database ERD and Data Dictionary
## Nagorik Sathi AI — R&D Report v1.2

> Schema design derived from R&D §8 (data stores D1-D5), §6 (domain concepts), §10 (AI pipeline), §11 (RBAC).
> The ERD reflects the four key distinctions the R&D requires: Report ≠ Incident ≠ Case ≠ DeptTask.

---

## 1. Domain Model Conceptual Definitions

The R&D defines these as distinct concepts. They must not be implemented as one table.

| Concept | Definition |
|---------|-----------|
| **Report** | A single citizen's submission. One citizen, one submission. Contains raw Bangla text/voice/media, GPS pin, consent record. Private to the reporter unless merged. |
| **Incident** | A real-world problem. One or more citizen reports may be linked to one incident. Has a canonical status visible to all linked reporters. No single reporter's identity is visible to others. |
| **Coordinated Case** | The management record for a complex incident. Holds the lead officer, all departmental tasks in order, prerequisite dependencies, approved sequencing. One incident has one case. |
| **Department Task** | A unit of work assigned to one department for one case. Has its own lifecycle (assigned → in progress → resolved), its own evidence requirements, and may have prerequisites (other tasks that must complete first). |

---

## 2. ERD (Mermaid)

```mermaid
erDiagram
    %% === D1: Citizen Profiles and Consent ===
    users {
        uuid id PK
        varchar phone_hash UK "bcrypt-hashed phone"
        varchar email_encrypted "nullable, AES-256"
        varchar role "citizen|ward_desk|dept_officer|coordinator|admin"
        uuid department_id FK "null for citizens"
        uuid ward_id FK "null for admin/coord"
        boolean is_active
        boolean mfa_enabled
        varchar mfa_secret_encrypted
        timestamptz created_at
        timestamptz last_login_at
    }

    citizen_profiles {
        uuid id PK
        uuid user_id FK UK
        varchar display_name_encrypted "nullable"
        varchar preferred_language "bn|en"
        boolean large_text_mode
        timestamptz profile_updated_at
    }

    consent_records {
        uuid id PK
        uuid user_id FK
        varchar consent_type "location|notification_sms|notification_email|notification_push"
        boolean granted
        text consent_text_shown
        timestamptz granted_at
        timestamptz revoked_at "nullable"
        inet ip_address
    }

    notification_preferences {
        uuid id PK
        uuid user_id FK UK
        boolean sms_enabled
        boolean email_enabled
        boolean push_enabled
        varchar sms_number_encrypted
        varchar push_token_encrypted
    }

    %% === D4: Ward, Asset, Responsibility and Officer Directory ===
    wards {
        uuid id PK
        varchar ward_number UK
        varchar ward_name
        varchar ward_name_bn
        geometry boundary "PostGIS POLYGON, SRID 4326"
        uuid city_corporation_id
        boolean is_active
        timestamptz boundary_verified_at
        varchar boundary_source
    }

    city_corporations {
        uuid id PK
        varchar name
        varchar name_bn
        varchar code UK
    }

    departments {
        uuid id PK
        uuid city_corporation_id FK
        varchar name
        varchar name_bn
        varchar code UK
        varchar[] problem_types "waste|drain|road|street_light"
        boolean is_active
    }

    assets {
        uuid id PK
        uuid ward_id FK
        uuid owner_department_id FK
        varchar asset_type "drain|road|street_light|waste_point|etc"
        varchar asset_name
        geometry location "PostGIS POINT or LINESTRING"
        jsonb metadata "capacity, material, year_installed, etc"
        boolean is_public
        boolean is_active
        timestamptz registry_verified_at
    }

    officers {
        uuid id PK
        uuid user_id FK UK "links to users table"
        uuid department_id FK
        varchar full_name
        varchar full_name_bn
        varchar designation
        varchar designation_bn
        varchar official_phone "NOT personal numbers"
        varchar official_email
        boolean is_active
        uuid backup_officer_id FK "nullable, self-reference"
        timestamptz directory_last_verified
    }

    officer_ward_assignments {
        uuid id PK
        uuid officer_id FK
        uuid ward_id FK
        uuid department_id FK
        boolean is_lead
        date valid_from
        date valid_to "nullable = current"
    }

    responsibility_rules {
        uuid id PK
        varchar[] problem_types
        uuid lead_department_id FK
        uuid[] supporting_department_ids
        varchar[] prerequisite_problem_types
        text rule_description
        text rule_description_bn
        integer priority_order
        boolean requires_staff_verification
        boolean is_active
        uuid created_by FK
        timestamptz created_at
    }

    sla_policies {
        uuid id PK
        uuid city_corporation_id FK
        varchar priority_level "emergency|high|medium|low"
        integer first_response_hours
        integer resolution_hours
        integer escalation_hours "hours until escalation"
        boolean is_active
        timestamptz created_at
    }

    %% === D3: Verified Service Knowledge ===
    service_knowledge {
        uuid id PK
        varchar title
        varchar title_bn
        text content_en
        text content_bn
        vector embedding "pgvector 1536-dim, PROPOSED"
        varchar service_type
        varchar applicable_area "ward, city_corp, national"
        uuid[] applicable_ward_ids
        uuid[] applicable_city_corp_ids
        timestamptz source_verified_at
        uuid source_id FK
        boolean is_active
        integer display_order
    }

    knowledge_sources {
        uuid id PK
        varchar source_name
        varchar source_url
        varchar source_type "government_portal|official_circular|city_corp_notice"
        timestamptz last_fetched_at
        timestamptz last_verified_at
        varchar verified_by_role
    }

    %% === D2: Cases, Tasks and Evidence ===
    reports {
        uuid id PK
        uuid citizen_id FK "references users.id"
        uuid ward_id FK "resolved from GPS"
        uuid incident_id FK "nullable until linked"
        varchar submission_channel "web|sms|phone_assisted|ward_desk"
        text raw_text_bn "original Bangla text"
        varchar voice_file_key "MinIO object key, nullable"
        varchar transcription_text_bn "AI transcription, nullable"
        text location_description "citizen's address description"
        geometry reported_location "PostGIS POINT, GPS"
        boolean location_confirmed_by_citizen
        boolean is_public_place "null until answered"
        varchar reported_duration "e.g. 3 days"
        varchar citizen_priority_flag "urgent|normal"
        varchar status "draft|submitted|ai_processing|verified|merged"
        timestamptz submitted_at
        timestamptz ai_completed_at
    }

    report_media {
        uuid id PK
        uuid report_id FK
        varchar media_type "photo|video"
        varchar file_key "MinIO object key"
        varchar mime_type
        bigint file_size_bytes
        boolean client_compressed
        varchar upload_status "pending|complete|failed"
        timestamptz uploaded_at
    }

    incidents {
        uuid id PK
        uuid canonical_report_id FK "the primary/first report"
        uuid ward_id FK
        varchar[] problem_types "waste|drain|road|street_light"
        varchar status "submitted|verified|under_inspection|in_progress|resolved_proof_uploaded|closed|re_opened"
        varchar priority_level "emergency|high|medium|low"
        boolean priority_overridden_by_staff
        geometry location "PostGIS POINT"
        varchar location_description
        integer linked_report_count
        boolean is_hotspot
        timestamptz first_reported_at
        timestamptz verified_at
        timestamptz closed_at
        uuid lead_officer_id FK "nullable until verified"
    }

    duplicate_links {
        uuid id PK
        uuid parent_incident_id FK
        uuid child_report_id FK
        varchar link_status "candidate|confirmed|rejected"
        float ai_similarity_score
        uuid confirmed_by FK "nullable"
        timestamptz linked_at
        boolean is_reversible
    }

    priority_history {
        uuid id PK
        uuid incident_id FK
        varchar previous_level
        varchar new_level
        varchar changed_by_role
        uuid changed_by FK
        text reason "required for staff override"
        varchar source "ai|staff_override|staff_initial|system_escalation"
        timestamptz changed_at
    }

    status_history {
        uuid id PK
        uuid incident_id FK
        uuid dept_task_id FK "nullable"
        varchar previous_status
        varchar new_status
        uuid changed_by FK
        varchar changed_by_role
        text waiting_reason "shown to citizen if blocked"
        timestamptz changed_at
    }

    cases {
        uuid id PK
        uuid incident_id FK UK
        uuid lead_officer_id FK
        boolean plan_approved
        uuid plan_approved_by FK
        timestamptz plan_approved_at
        varchar plan_approved_by_role
        timestamptz created_at
        timestamptz closed_at
    }

    dept_tasks {
        uuid id PK
        uuid case_id FK
        uuid department_id FK
        uuid assigned_officer_id FK "nullable"
        varchar problem_type "waste|drain|road|street_light"
        integer task_order "1, 2, 3..."
        varchar status "pending_prerequisites|assigned|accepted|rejected|under_inspection|in_progress|resolved_proof_uploaded|done"
        text waiting_reason "shown to citizen if blocked"
        varchar rejection_reason "if dept rejects"
        boolean evidence_required
        timestamptz assigned_at
        timestamptz accepted_at
        timestamptz completed_at
    }

    task_prerequisites {
        uuid id PK
        uuid task_id FK "the task that is blocked"
        uuid required_task_id FK "the task that must complete first"
    }

    evidence_files {
        uuid id PK
        uuid dept_task_id FK
        uuid uploaded_by FK
        varchar evidence_type "before_photo|after_photo|video|inspection_note"
        varchar file_key "MinIO object key"
        varchar mime_type
        bigint file_size_bytes
        boolean is_masked "faces/plates masked"
        varchar masking_status "not_needed|pending|complete|failed"
        boolean visible_to_citizen
        timestamptz uploaded_at
    }

    ai_jobs {
        uuid id PK
        uuid report_id FK
        varchar job_type "full_analysis|voice_transcription|duplicate_check|hotspot_analysis|rag_query"
        varchar status "queued|processing|complete|failed|timeout"
        integer attempt_count
        text error_message "nullable"
        timestamptz enqueued_at
        timestamptz started_at
        timestamptz completed_at
    }

    ai_results {
        uuid id PK
        uuid job_id FK UK
        uuid report_id FK
        varchar problem_type_classified "waste|drain|road|street_light|compound"
        float classification_confidence
        jsonb entity_extraction "problem type, location, duration, public/private"
        uuid proposed_lead_dept_id FK
        uuid[] proposed_supporting_dept_ids
        float responsibility_confidence
        varchar proposed_priority "emergency|high|medium|low"
        float priority_confidence
        text responsibility_reasons_en
        text responsibility_reasons_bn
        jsonb duplicate_candidates "list of {incident_id, score}"
        boolean critical_flag
        varchar critical_flag_type "ownership_conflict|unknown_location|hazard|none"
        boolean gate_passed
        timestamptz computed_at
    }

    resolution_reviews {
        uuid id PK
        uuid case_id FK UK
        uuid reviewed_by FK
        varchar review_status "pending|approved|rejected"
        text reviewer_notes
        timestamptz reviewed_at
    }

    citizen_responses {
        uuid id PK
        uuid case_id FK
        uuid citizen_id FK
        varchar response "accepts|objects"
        text objection_reason "if objects"
        timestamptz responded_at
    }

    %% === D5: Audit Log ===
    audit_events {
        bigserial id PK
        uuid entity_type_ref "report|incident|case|dept_task|user|config"
        uuid entity_id
        varchar action "created|updated|status_changed|viewed|deleted_soft|config_changed|gate_changed|evidence_uploaded"
        uuid performed_by FK "nullable for system actions"
        varchar performed_by_role
        jsonb before_state "nullable for creates"
        jsonb after_state "nullable for deletes"
        inet ip_address
        varchar request_id
        timestamptz event_at
        bigint partition_key "for monthly partitioning"
    }

    sla_timers {
        uuid id PK
        uuid incident_id FK
        uuid case_id FK
        varchar priority_level
        timestamptz started_at
        timestamptz response_deadline
        timestamptz resolution_deadline
        boolean response_met
        boolean resolution_met
        integer escalation_count
        timestamptz last_escalated_at
    }

    hotspot_zones {
        uuid id PK
        uuid ward_id FK
        uuid asset_id FK "nullable"
        geometry zone_polygon "PostGIS POLYGON"
        integer recurrence_count
        timestamptz first_occurrence
        timestamptz last_occurrence
        text ai_review_note
        boolean engineer_reviewed
        timestamptz engineer_reviewed_at
        uuid reviewed_by FK "nullable"
    }

    system_config {
        uuid id PK
        varchar config_key UK
        text config_value
        text previous_value
        varchar changed_by_role
        uuid changed_by FK
        boolean requires_dual_approval
        uuid approved_by_second FK "nullable"
        timestamptz approved_at
        text change_reason
        timestamptz updated_at
    }

    %% === Relationships ===
    users ||--o| citizen_profiles : "has"
    users ||--o{ consent_records : "gives"
    users ||--o| notification_preferences : "has"
    users ||--o| officers : "is"

    city_corporations ||--o{ wards : "contains"
    city_corporations ||--o{ departments : "has"
    wards ||--o{ assets : "contains"
    departments ||--o{ assets : "owns"
    officers ||--o{ officer_ward_assignments : "assigned to"
    wards ||--o{ officer_ward_assignments : "covered by"

    users ||--o{ reports : "submits"
    wards ||--o{ reports : "located in"
    incidents ||--o{ reports : "aggregates"
    reports ||--o{ report_media : "has"

    incidents ||--o{ duplicate_links : "is parent of"
    reports ||--o{ duplicate_links : "is child of"
    incidents ||--o{ priority_history : "tracks"
    incidents ||--o{ status_history : "tracks"

    incidents ||--|| cases : "managed by"
    cases ||--o{ dept_tasks : "has"
    dept_tasks ||--o{ task_prerequisites : "requires"
    dept_tasks ||--o{ evidence_files : "requires"
    dept_tasks ||--o{ status_history : "tracks"

    reports ||--o{ ai_jobs : "triggers"
    ai_jobs ||--o| ai_results : "produces"

    cases ||--o| resolution_reviews : "has"
    cases ||--o{ citizen_responses : "receives"

    incidents ||--o| sla_timers : "has"
    wards ||--o{ hotspot_zones : "contains"
```

---

## 3. Data Dictionary (Key Tables)

### users

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Surrogate key |
| phone_hash | VARCHAR | UNIQUE, NOT NULL | bcrypt hash of phone number; never store raw phone |
| email_encrypted | VARCHAR | NULL | AES-256 encrypted; optional |
| role | VARCHAR | NOT NULL, CHECK | One of: citizen, ward_desk, dept_officer, coordinator, admin |
| department_id | UUID | FK → departments, NULL | Null for citizens and admin |
| ward_id | UUID | FK → wards, NULL | Null for admin and coordinator |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Soft disable accounts |
| mfa_enabled | BOOLEAN | NOT NULL | Required true for all staff |
| mfa_secret_encrypted | VARCHAR | NULL | TOTP secret, AES-256 |

### reports

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Surrogate key |
| citizen_id | UUID FK → users | The submitting citizen; never exposed to others |
| incident_id | UUID FK → incidents NULL | Set when linked to an incident (may be null during draft/processing) |
| raw_text_bn | TEXT | Original Bangla text as typed |
| voice_file_key | VARCHAR NULL | MinIO key; never public URL |
| transcription_text_bn | TEXT NULL | AI transcription; original voice kept |
| reported_location | GEOMETRY(POINT,4326) | GPS pin confirmed by citizen |
| location_confirmed_by_citizen | BOOLEAN | Must be true before AI routing |
| status | VARCHAR | draft → submitted → ai_processing → verified → merged |

### incidents

| Column | Type | Description |
|--------|------|-------------|
| canonical_report_id | UUID FK → reports | The first/primary report; used for display (no identity exposed) |
| status | VARCHAR | 8-value lifecycle: submitted → verified → under_inspection → in_progress → resolved_proof_uploaded → closed → re_opened; plus merged for duplicate |
| priority_level | VARCHAR | emergency / high / medium / low; AI proposed, staff overridable |
| priority_overridden_by_staff | BOOLEAN | True if staff changed AI proposal |
| location | GEOMETRY(POINT,4326) | Canonical incident location; used for map pin |
| linked_report_count | INTEGER | Count of merged duplicate reports |
| is_hotspot | BOOLEAN | Set by M6 hotspot analysis |

### dept_tasks

| Column | Type | Description |
|--------|------|-------------|
| task_order | INTEGER | Position in dependency chain (1, 2, 3...) |
| status | VARCHAR | pending_prerequisites → assigned → accepted → rejected → under_inspection → in_progress → resolved_proof_uploaded → done |
| waiting_reason | TEXT | Shown to citizen if task is blocked |
| rejection_reason | VARCHAR | If department rejects the task |
| evidence_required | BOOLEAN | Set by responsibility rules; closure blocked if true and no evidence |

### task_prerequisites

| Column | Description |
|--------|-------------|
| task_id | The blocked task |
| required_task_id | The task that must reach "done" status before task_id can begin |

**Constraint**: No circular prerequisites (enforced by application logic check on insert).

### ai_results

| Column | Description |
|--------|-------------|
| classification_confidence | Float 0.0–1.0 for problem type classification |
| responsibility_confidence | Float 0.0–1.0 for lead dept recommendation |
| gate_passed | Boolean: responsibility_confidence >= current gate threshold AND no critical flag |
| critical_flag | Boolean: if true, workflow is hard-stopped |
| critical_flag_type | Enum: ownership_conflict / unknown_location / hazard / none |
| duplicate_candidates | JSONB array of {incident_id, similarity_score} |

### audit_events

| Column | Description |
|--------|-------------|
| id | BIGSERIAL — append-only; no UPDATE or DELETE |
| entity_type_ref | What was acted on (report / incident / case / dept_task / user / config) |
| before_state | JSONB snapshot before change |
| after_state | JSONB snapshot after change |
| performed_by | NULL for system (AI worker) actions |
| partition_key | Monthly partition key for performance |

**Constraint**: Postgres trigger BEFORE UPDATE/DELETE ON audit_events RAISES EXCEPTION (immutable).

---

## 4. Spatial Indexes

| Table | Column | Index Type | Purpose |
|-------|--------|-----------|---------|
| wards | boundary | GIST | Point-in-polygon lookups for ward determination |
| assets | location | GIST | Spatial queries for asset ownership |
| incidents | location | GIST | Duplicate candidate distance search |
| hotspot_zones | zone_polygon | GIST | Hotspot overlap queries |

---

## 5. Key Uniqueness Constraints

| Table | Constraint | Rule |
|-------|-----------|------|
| users | phone_hash UNIQUE | One account per phone number |
| incidents | canonical_report_id UNIQUE | One incident per primary report |
| cases | incident_id UNIQUE | One case per incident |
| officer_ward_assignments | (officer_id, ward_id, dept_id, valid_from) UNIQUE | No duplicate current assignments |
| system_config | config_key UNIQUE | One record per config parameter |

---

## 6. Transaction Boundaries

| Operation | Tables Touched | Isolation |
|-----------|---------------|-----------|
| Report submission | reports, report_media, ai_jobs, audit_events | READ COMMITTED |
| AI result apply + gate check | reports, incidents (create or update), ai_results, audit_events | REPEATABLE READ |
| Staff verification + case creation | incidents, cases, dept_tasks, task_prerequisites, status_history, audit_events | SERIALIZABLE |
| Task status update | dept_tasks, status_history, sla_timers, audit_events | READ COMMITTED |
| Case closure | cases, incidents, citizen_responses, resolution_reviews, audit_events | SERIALIZABLE |
| Config change | system_config, audit_events | SERIALIZABLE |

---

## 7. Proposed Entities Requiring Confirmation

| Entity / Field | Status | Question |
|---------------|--------|---------|
| knowledge_sources.source_url | PROPOSED | Must be verified government URLs; list TBD with city corporation |
| hotspot_zones.recurrence_count threshold | NEEDS CLARIFICATION | What threshold triggers hotspot? Set by city corporation |
| service_knowledge.embedding dimension (1536) | PROPOSED | Depends on embedding model chosen |
| officer.backup_officer_id | SPECIFIED (R&D Table 24) | Included |
| citizen_profiles.display_name_encrypted | PROPOSED | R&D does not specify citizen name storage; proposed optional encrypted field |
| reports.reported_duration | PROPOSED | R&D says system asks "how long"; stored as citizen's text description |
