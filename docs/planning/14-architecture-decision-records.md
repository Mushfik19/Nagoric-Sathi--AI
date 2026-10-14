# 14 — Architecture Decision Records
## Nagorik Sathi AI — R&D Report v1.2

> Each ADR captures a significant architectural decision, its rationale, alternatives considered, and consequences.
> Source: R&D = specified by the R&D document; PROPOSED = implementation decision not mandated by R&D.

---

## ADR-001: Modular Monolith over Microservices

**Status:** Accepted (R&D specified)  
**Decision:** Use a modular monolith (Python FastAPI) for transactional case workflows, with separate AI worker services.  
**Context:** System serves a small development team; complex operational requirements of full microservices are unnecessary at this stage.  
**Rationale (R&D §7.1):** "A modular monolith is preferred over microservices at this stage because it reduces operational complexity and attack surface for a small team, while the clear module boundaries (M1-M10) allow later extraction into services."  
**Alternatives considered:**
- Full microservices: rejected — too much operational overhead for team size; network complexity; no benefit for current scale
- Serverless: rejected — latency requirements and stateful AI workers incompatible  
**Consequences:**
- (+) Simpler deployment, debugging, and transaction management
- (+) Single database transaction boundary across modules
- (-) Risk of module coupling if boundaries are not enforced; discipline required in code reviews
- (-) Performance bottleneck possible if a single module becomes very hot; mitigated by async AI workers

---

## ADR-002: Redis Streams for AI Job Queue (RabbitMQ Optional)

**Status:** Accepted (PROPOSED)  
**Decision:** Use Redis Streams as the AI job queue. RabbitMQ is available as an optional upgrade.  
**Context:** R&D specifies Redis as required and RabbitMQ as optional.  
**Rationale:** Redis is already required for caching. Redis Streams provide persistent, consumer-group-based job queuing with exactly-once processing semantics sufficient for v1. Adding RabbitMQ adds another infrastructure component with operational cost.  
**Alternatives considered:**
- RabbitMQ: available as option; not needed for v1 scale; can replace Redis Streams without backend API change
- Celery + Redis: PROPOSED alternative if job orchestration complexity grows  
**Consequences:**
- (+) Single Redis instance for cache + queue; simpler ops
- (-) Redis Streams less battle-tested than RabbitMQ for high-volume enterprise queue; acceptable for v1 prototype scale

---

## ADR-003: MapLibre GL JS (Leaflet as Alternative)

**Status:** Proposed (R&D lists both)  
**Decision:** Use MapLibre GL JS as the primary map library.  
**Context:** R&D §7.2 lists "Leaflet/MapLibre with OpenStreetMap base map" as the specification.  
**Rationale:** MapLibre supports WebGL rendering (better performance for many incident pins on mobile PWA); supports vector tiles (smaller data transfer on weak networks); active open-source fork of Mapbox GL JS.  
**Alternatives considered:**
- Leaflet: lighter-weight; simpler API; better support for older devices; no WebGL required. If MapLibre causes compatibility issues on target devices, Leaflet is the fallback.  
**Consequences:**
- (+) Better performance on modern mobile browsers
- (-) Higher JS bundle size; slower on very old devices
- **Mitigation:** Code split map component; lazy-load only on map screens; test on Bangladesh market devices

---

## ADR-004: SSE as Primary Real-Time Channel (WebSocket for Staff)

**Status:** Proposed (PROPOSED)  
**Decision:** Use Server-Sent Events (SSE) for citizen status updates; WebSocket for staff consoles.  
**Rationale:** SSE is simpler to implement, firewall-friendly (one-directional, HTTP), and sufficient for citizen status watching (read-only updates). WebSocket provides bidirectional communication needed for the interactive staff map (multiple updates, presence). SSE falls back to polling if blocked.  
**Alternatives considered:**
- WebSocket everywhere: more complex; firewalls may block; overkill for citizen status watch
- Long polling everywhere: less efficient; higher server load  
**Consequences:**
- (+) Simpler implementation for citizen interface
- (-) Two technologies to maintain (SSE + WebSocket); mitigated by shared event bus in backend

---

## ADR-005: MinIO for Object Storage (S3-Compatible)

**Status:** Accepted (R&D specified)  
**Decision:** MinIO for object storage in prototype; S3-compatible API enables migration to AWS S3 or equivalent.  
**Context:** R&D §7.2: "MinIO / S3-compatible, encrypted"  
**Rationale:** Self-hosted MinIO for prototype reduces cloud costs; S3-compatible API means storage client code works with any provider; AES-256 encryption available.  
**Consequences:**
- (+) No cloud vendor lock-in; migration transparent to application code
- (-) Self-hosted MinIO requires ops maintenance (backup, availability); acceptable for prototype

---

## ADR-006: Asynchronous AI Pipeline (Jobs Never in Request Path)

**Status:** Accepted (R&D specified)  
**Decision:** All AI inference runs in dedicated worker processes; the HTTP request path returns 202 Accepted immediately.  
**Context:** R&D §10.9: "the API returns 202 Accepted with a job ID immediately; the interface shows progress and receives the result by push or polling."  
**Rationale:** Model latency (potentially seconds) must not block the user interface; weak-connection users would experience timeouts; asynchronous processing allows retry without re-submission.  
**Consequences:**
- (+) UI always responsive; users get immediate feedback
- (-) More complex state management; requires job status tracking; SSE for result delivery

---

## ADR-007: ONNX Runtime for AI Inference (GPU Optional)

**Status:** Accepted (R&D specified)  
**Decision:** Export AI models to ONNX format; serve with ONNX Runtime with dynamic batching; GPU optional.  
**Context:** R&D §10.9: "Models are exported to ONNX, quantised and served with dynamic batching; a GPU is optional."  
**Rationale:** ONNX Runtime provides efficient CPU inference; quantisation reduces model size and latency; GPU adds cost and complexity but is not required to meet design targets.  
**Consequences:**
- (+) Runs on standard server hardware; portable across cloud providers
- (-) ONNX export requires compatible model architectures; some models (e.g. custom heads) require verification

---

## ADR-008: PostgreSQL 16 with PostGIS and pgvector (Single Database)

**Status:** Accepted (R&D specified)  
**Decision:** Single PostgreSQL 16 instance with PostGIS extension for spatial data and pgvector for RAG retrieval.  
**Context:** R&D §7.2: "PostgreSQL 16 with PostGIS"; RAG: "pgvector plus keyword search"  
**Rationale:** PostGIS is the authoritative spatial database for ward boundary and asset queries. pgvector enables semantic search within the same database, avoiding a separate vector store. ACID transactions across case data and spatial lookups in a single DB simplify consistency.  
**Alternatives considered:**
- Separate vector database (Pinecone, Weaviate): rejected — adds operational complexity; pgvector sufficient for 10-15 service knowledge items
- MongoDB: rejected — ACID transactions required for case workflow  
**Consequences:**
- (+) Single database to maintain; ACID across all tables; spatial + vector in one query
- (-) pgvector has scaling limits for very large embedding collections; acceptable for 10-15 items at v1

---

## ADR-009: JWT with MFA for All Staff (Phone OTP for Citizens)

**Status:** Proposed (PROPOSED, security controls specified by R&D)  
**Decision:** Citizens authenticate with phone + SMS OTP; staff authenticate with password + TOTP MFA.  
**Context:** R&D Table 29: "MFA for staff accounts"  
**Rationale:** Citizens in Bangladesh primarily use phone numbers; no email required; OTP is familiar. Staff require stronger authentication due to access to case management functions.  
**Alternatives considered:**
- NID-based authentication for citizens: R&D does not require NID for v1; adds friction [NEEDS CLARIFICATION for pilot phase]  
**Consequences:**
- (+) Low friction for citizens; strong security for staff
- (-) SMS OTP for citizens depends on SMS gateway availability

---

## ADR-010: Append-Only Audit Log via Postgres Trigger

**Status:** Proposed (PROPOSED implementing R&D requirement)  
**Decision:** Audit log implemented as a Postgres table with a BEFORE UPDATE/DELETE trigger that raises an exception.  
**Context:** R&D §11 specifies "immutable audit log"  
**Rationale:** Database-level enforcement is more robust than application-level enforcement; prevents any code path (including bugs, direct DB access) from modifying audit records.  
**Consequences:**
- (+) Immutability enforced at lowest level; cannot be bypassed by application code
- (-) Schema changes to audit_events require migration with care; partitioning needed for large log volumes

---

## ADR-011: React + Vite PWA (Single Codebase for All Roles)

**Status:** Accepted (R&D specified)  
**Decision:** Single React + Vite codebase serving all five role interfaces plus the public interface.  
**Context:** R&D §7.3: "Web-first (React PWA with a FastAPI back end)"  
**Rationale (R&D Table 16):** One codebase; instant updates for all users; smaller security surface; works on any device with a browser; same REST API when native Android is added later.  
**Consequences:**
- (+) No separate apps to maintain; role-specific views via routing + RBAC
- (-) Bundle size must be managed; lazy-load role-specific code paths

---

## ADR-012: Bangla-First Typography (Hind Siliguri)

**Status:** Proposed (PROPOSED design decision)  
**Decision:** Use Hind Siliguri as the primary Bangla typeface; Inter for English; JetBrains Mono for identifiers.  
**Context:** R&D §7.2: "Bangla-first UI with a Bengali web font"  
**Rationale:** Hind Siliguri is a well-designed, open-source Bengali typeface with good Latin compatibility for mixed-script interfaces; available on Google Fonts; good rendering on mobile screens.  
**Alternatives considered:**
- Noto Sans Bengali: good fallback; slightly less readable at small sizes
- System font stack: inconsistent across Android devices; unacceptable for professional civic interface  
**Consequences:**
- (+) Consistent, professional Bangla rendering across devices
- (-) Font loading adds ~50-80 KB; mitigated by subsetting and font-display: swap

---

## ADR-013: Confidence Gate at 80% (Configurable)

**Status:** Accepted (R&D specified)  
**Decision:** Initial routing-confidence gate value is 80%; configurable by admin; lowering requires dual approval + re-validation.  
**Context:** R&D §10.11: "The operating gate is a configurable value with an initial design value of 80%"  
**Rationale:** 80% is a design starting point to be calibrated on held-out data. The gate governs whether an AI proposal is presented as a recommendation or routed to manual verification.  
**Consequences:**
- (+) Clear, auditable gate governance
- (-) 80% is not validated; some correct proposals will fall below gate initially; staff workload higher until calibrated
- **Calibration plan:** Run shadow mode; measure agreement rate; adjust gate on held-out data

---

## ADR-014: Illustrative Departments for Demo (Not Real Connections)

**Status:** Accepted (R&D specified)  
**Decision:** All departments and cases in the prototype demo are illustrative and clearly marked, unless a real department connection has been approved.  
**Context:** R&D §7.4: "the first demo, departments and cases without a real connection are marked experimental"  
**Rationale:** Prevents confusion between demonstration results and real service outcomes. Protects against premature claims.  
**Consequences:**
- (+) Honest representation; no misleading claims
- (-) Demo data is not real; prototype results cannot be generalised to real service performance
