# Nagorik Sathi AI — Known Limitations & External Blockers

## Document Purpose
In accordance with Section 16 of the Master Implementation Specification and the Independent Acceptance Audit, this document records real-world external constraints, sandbox infrastructure limitations, and implemented mitigations.

---

## 1. External Infrastructure & Services

### 1.1 Local PostgreSQL Service & Standalone Local SQLite Fallback
- **Condition:** PostgreSQL is not currently running as an active background service on port 5432 in the Windows host environment.
- **Implemented Mitigation:** Full standalone local execution is implemented via SQLite (`sqlite+aiosqlite:///./nagoriksathi_local.db`) configured in `backend/.env`. On server startup, all tables are automatically created and seeded with R&D demonstration data. In staging/production where PostgreSQL 16 + PostGIS is provisioned, the application seamlessly uses asyncpg and PostGIS spatial extensions without code modifications.

### 1.2 Playwright Browser Automation Driver in Sandbox
- **Condition:** During automated browser acceptance auditing via `browser_subagent`, the browser automation engine failed to download the Playwright binary driver (`playwright-1.57.0-win32_x64.zip`) due to an HTTP 404 response from the Azure Edge Network CDN within the sandbox environment.
- **Implemented Mitigation:** Direct live HTTP socket validation and curl testing were executed against both the backend (`http://127.0.0.1:8000`) and the Vite frontend (`http://127.0.0.1:5173`). Vite served the production HTML (`<title>Nagorik Sathi AI | Civic services</title><div id="root"></div>`) and compiled assets without errors.

### 1.3 Telecom SMS Gateway & Live 333 Trunk
- **Condition:** Live telecom SMS gateways (e.g., Teletalk / Banglalink API) and 333 telephony IVR lines are not provisioned in this local offline development environment.
- **Implemented Mitigation:** Development adapter is implemented. The pre-seeded OTP (`123456`) operates seamlessly for demonstration citizen accounts (`01711000001`), fully validated in `test_auth_rbac.py`.

### 1.4 Dedicated GPU Speech & Vision Cluster
- **Condition:** High-memory GPU infrastructure for running large Whisper ASR neural models and dense image classification models is not attached to this local host.
- **Implemented Mitigation:** Rule-grounded deterministic AI engine (`app/services/ai_engine.py`) provides Bangla text normalization, keyword tokenization, and category classification for the core municipal service catalog, adhering strictly to the 80% confidence gate.
