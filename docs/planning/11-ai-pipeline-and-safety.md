# 11 — AI Pipeline and Safety
## Nagorik Sathi AI — R&D Report v1.2

> AI pipeline derived from R&D §10.1–10.12 and §13 (safety rules). All evaluation targets are design targets, not claimed results.

---

## 1. Core AI Principle

**"AI proposes, people decide."**

AI is applied at every stage — registering the report, processing voice and media, priority triage, routing, duplicate merging, hotspot detection and report preparation — but an AI recommendation is shown as a pre-filled proposal only when its confidence reaches the routing gate and no critical flag exists; anything else falls back to ward-desk staff verification. The AI never closes a case and never declares a citizen satisfied.

---

## 2. AI Pipeline Stages

### Stage 1: Report Intake and Normalisation (M4, asynchronous)

**Trigger:** Report submitted (POST /reports → 202 Accepted)  
**Input:** Raw Bangla text, voice file (if provided), GPS coordinates, citizen metadata  
**Process:**
1. Voice-to-text (ASR): Bangla ASR model converts voice to text; original voice kept
2. Text normalisation: Handle colloquial Bangla, misspellings, incomplete addresses
3. Entity extraction:
   - Problem type classification: waste / drain / road / street_light / compound / unknown
   - Location entities: ward name, street, landmark (cross-reference with GPS pin)
   - Duration: "কতদিন ধরে?" (how long?)
   - Public vs. private: "সরকারি জায়গা না ব্যক্তিগত?" (public or private?)
4. Per-field confidence scoring
5. Critical flag detection: hazard keywords (open manhole, exposed wire, severe flooding)

**Output:** Structured fields + per-field confidence scores + critical flag  
**Rule:** Unknown is never safe — if entity cannot be extracted with confidence, field marked as unverified  
**Technology:** ONNX Runtime, quantised Bangla-capable Transformer model [PROPOSED: BanglaBERT or equivalent]

### Stage 2: Responsibility Determination (M5, deterministic + AI)

**Trigger:** Stage 1 complete with location confirmed  
**Input:** Classified problem type(s), ward boundary (PostGIS lookup), asset registry (database lookup), responsibility rules (D3)  
**Process:**
1. **Deterministic registry check:** GPS point-in-polygon → ward lookup; asset type → owner department lookup
2. **Rule engine:** Responsibility rules (D3) determine lead and supporting departments + prerequisite ordering
3. **AI confidence scoring:** ML model scores the assignment based on text features + rule consistency
4. **Confidence gate evaluation:** combined confidence >= 80%? No critical flags?

**Confidence calculation [PROPOSED]:**
```
overall_confidence = weighted_average(
  classification_confidence * 0.4,
  location_confidence * 0.35,
  rule_match_confidence * 0.25
)
Critical field minimum: location_confidence >= 0.85 for gate to pass [PROPOSED]
```

**Output:** Lead department, supporting departments, reasons (Bangla + English), confidence score, gate_passed boolean, critical_flag, critical_flag_type

**This is the distinction: AI classification vs. deterministic responsibility rules:**
| Component | Type | Role |
|-----------|------|------|
| Problem type classification | AI/ML | Classifies text/voice into problem categories |
| Ward lookup | Deterministic | PostGIS point-in-polygon — never AI |
| Asset ownership lookup | Deterministic | Database registry query — never AI |
| Responsibility rule application | Deterministic | Rules table → lead/supporting dept — never AI alone |
| Confidence scoring | AI/ML | Scores consistency of the overall assignment |
| Human verification | Human | Always required; AI cannot approve itself |

### Stage 3: Priority Triage (M5, AI)

**Trigger:** Responsibility classification complete  
**Input:** Text, transcription, metadata, location context, problem category  
**Triage factors (R&D Table 25):**
- Hazard cues in text: open manhole, exposed wire, deep flooding → Emergency
- Category and asset type: main drain vs. minor lane drain
- Duration and escalation: days unresolved; repeated objections
- Number of merged reports: many linked reports raise priority
- Location context: near school, hospital, main road, flood-prone zone
- Season: monsoon period for drainage [optional rule, configurable]

**Output:** Priority level (Emergency / High / Medium / Low) with reasons in Bangla  
**Safety rule S9:** If Emergency proposed OR hazard cues present → immediate escalation, regardless of gate  
**Staff override:** Staff may raise or lower AI priority with a recorded reason  
**Staff protection:** AI may never lower a level set by staff (enforced in backend, not AI worker)

### Stage 4: Duplicate Detection (M6, AI)

**Trigger:** New report with confirmed location  
**Input:** GPS coordinates, problem type, timestamp, Bangla text embedding  
**Matching criteria (R&D §10.8):**
- GPS distance: within configurable radius (e.g. 100 m) [PROPOSED threshold]
- Problem type: same type(s)
- Time window: within configurable window (e.g. 72 hours) [PROPOSED]
- Text similarity: cosine similarity of Bangla embeddings (pgvector query)
- Photo/video similarity: **phase 2 only**

**Output:** List of duplicate candidates with similarity scores; no automatic merge  
**Staff action required:** Ward desk confirms merge; merge is reversible  
**Privacy:** No reporter identity in similarity computation; only text embeddings and GPS

### Stage 5: RAG Service Guidance (M2, AI + retrieval)

**Trigger:** Citizen asks a service question  
**Input:** Bangla query text, ward context  
**Process:**
1. Query embedding computation
2. pgvector similarity search over service_knowledge (D3)
3. Keyword search fallback (hybrid retrieval)
4. Filter by applicable_ward_ids or applicable_city_corp_ids
5. Compose answer from retrieved chunks only (LLM with strict grounding)
6. No model-memory answers for fees, eligibility, or legal requirements

**Output:** Answer text (Bangla) + source references + last-verified date + disclaimer  
**Failure mode:** If no verified source retrieved → system says so; hands over to staff  
**Hallucination prevention:** LLM is prompted to answer only from retrieved chunks; if context insufficient → explicit "not found" response

### Stage 6: Hotspot Analysis (M6, AI)

**Trigger:** Background job after case closures accumulate  
**Input:** Historical incidents at same asset/place; closure and return history  
**Threshold:** N recurrences within T time window (configured by city corporation) [NEEDS CLARIFICATION: specific values]  
**Output:**
- Hotspot zone polygon
- AI review note for engineer: history of earlier fixes, before/after photos/video references, possible alternative solutions from verified maintenance guidance
- All suggestions are advisory; engineer decides

---

## 3. Confidence Gate Policy (R&D §10.11)

```
Gate value: 80% initial design value (configurable)
Gate governance:
  - Raise: administrator only
  - Lower: requires dual admin approval + re-validation on held-out data + versioned audit

Proposal rules:
  - confidence >= gate AND no critical flag → pre-filled proposal shown to staff
  - confidence >= gate BUT critical flag present → HARD STOP (S3)
  - confidence < gate → manual verification queue (S1)
  - unknown/unverifiable item → treated as below gate (S4)

The gate may be calibrated on held-out data after initial deployment.
The 80% value is a starting point, not a validated threshold.
```

---

## 4. Human Verification Chain

**All six barriers must fail for a wrong assignment to reach action (R&D §12.1):**

| Barrier | Actor | Mechanism |
|---------|-------|-----------|
| 1. Confidence gate | System | Uncertain proposals never shown as recommendations |
| 2. Registry check | Deterministic | Ward and asset must exist in registry with known owner |
| 3. Rule-engine check | Deterministic | Ownership, mandate and sequencing rules |
| 4. Citizen confirmation | Citizen | Sees problem type, location, proposed dept with reasons |
| 5. Staff approval | Ward desk / Coordinator | Approves plan; mismatch reassigned with reason |
| 6. Department acceptance | Department officer | Can reject with reason; re-routed, not dropped |

**After case closure if error found:** Case re-opened; department and citizen notified; added to model-improvement set; rule corrected; model can be rolled back or gate raised.

---

## 5. Safety Rules (R&D Table 33)

| Rule | Condition | System Behaviour |
|------|-----------|-----------------|
| S1 | Overall confidence < gate | Route to manual verification queue; ward desk determines responsibility |
| S2 | Confidence >= gate AND no critical flag | Pre-filled proposal with reasons; citizen confirms; staff still approve |
| S3 | Critical flag at any confidence level | Hard stop; plan blocked until staff resolve; urgent escalation for hazards |
| S4 | Owner, location or source not verifiable | Treated as below gate; manual queue |
| S5 | Always | No auto-approval; no auto-closure; no declared satisfaction |
| S6 | AI timeout or error | Automatic manual mode; user told clearly |
| S7 | Gate change (lower) | Dual admin approval + re-validation; versioned and audited |
| S8 | Closure | Evidence + staff review + citizen response or documented reason |
| S9 | Emergency signal OR hazard cues present | Immediate escalation; AI cannot lower staff-set level |
| S10 | Any display of report or media | Citizen identity hidden; media masked where feasible |

---

## 6. AI vs. Human Decision Boundaries

| Decision | AI Role | Human Role |
|----------|---------|-----------|
| Problem type classification | Proposes | Staff can override |
| Ward determination | Zero (deterministic PostGIS) | Staff corrects if citizen confirms wrong location |
| Asset ownership | Zero (deterministic registry) | Staff corrects if asset unknown |
| Lead department | Proposes with confidence + reasons | Staff verifies and approves |
| Supporting departments | Proposes | Staff approves |
| Task sequence | Proposes ordering | Coordinator approves final sequence |
| Priority level | Proposes | Staff overrides with reason; AI cannot lower staff-set level |
| Case creation | Never | Ward desk creates by verifying |
| Task assignment | Proposes (officer directory lookup) | Department accepts or rejects |
| Evidence sufficiency | Zero | Staff reviews evidence |
| Resolution | Proposes (all tasks done) | Staff reviews; citizen responds |
| Case closure | Never | Coordinator only |
| Citizen satisfaction | Never | Citizen responds |
| Duplicate confirmation | Proposes candidates | Staff confirms merge |
| Alternative solutions (hotspot) | Advisory suggestions | Engineer decides |

---

## 7. Asynchronous Pipeline and Latency (R&D §10.9)

- API returns 202 Accepted with job ID immediately; interface shows progress
- Videos and voice files upload in resumable chunks; transcoded/transcribed by background workers
- Case is registered immediately; media analysis completes afterwards
- Jobs run on dedicated AI workers through Redis queue with retries, timeouts, and circuit breaker
- Models exported to ONNX, quantised, served with dynamic batching; GPU optional
- Redis caches rule sets and registry lookups; deterministic rule engine runs in memory (target ≤ 300 ms)
- AI service down or timeout > 10 s → automatic manual mode; user told clearly

### Retry Policy [PROPOSED]
| Attempt | Delay | Max |
|---------|-------|-----|
| 1 | Immediate | — |
| 2 | 5 seconds | — |
| 3 | 30 seconds | — |
| Dead-letter | Alert raised | Ops review |

---

## 8. RAG Source Requirements

For a service knowledge item to be added to D3:
1. Source must be a verifiable government URL
2. Source type: government_portal / official_circular / city_corp_notice
3. Last-verified date must be set by an administrator
4. Applicable area (ward, city corporation, national) must be set
5. Content must not contain model-generated text; only transcribed/copied from the source

**RAG never answers:**
- Fees (amounts may change; official source is authoritative)
- Eligibility (legal determination)
- Legal requirements (legal authority is the relevant department)
From model memory on any of the above.

---

## 9. Evaluation Methodology (R&D §10.10)

**Fair comparison plan:**
- Simple baseline evaluated first; then add location info, then (phase 2) photo info
- Compare: text-only, text+location, text+location+photo
- Near-duplicate complaints about the same incident are not split across training and test sets
- Results for formal Bangla, colloquial speech, misspellings and incomplete addresses reported separately
- Outcome of sending uncertain proposals to human review recorded
- Improvements, failures and missing information that limited results — all reported

| Metric | Target (design) | Note |
|--------|----------------|------|
| Problem type Macro-F1 | >= 0.80 | Not a claimed result |
| Responsibility: correct dept rate | >= 90% | Not a claimed result |
| Responsibility: wrong hand-off rate | <= 5% | Not a claimed result |
| Service answers correctness | >= 95% | Not a claimed result |
| Same-incident detection precision / recall | >= 0.85 / >= 0.80 | Not a claimed result |
| Confidence calibration (ECE) | <= 0.05 | Not a claimed result |
| Priority Emergency/High recall | >= 0.95 | Not a claimed result |
| Priority weighted kappa | >= 0.70 | Not a claimed result |
| Voice WER (Bangla) | <= 20% | Not a claimed result |
| AI pipeline p95 latency | <= 8 s | Not a claimed result |
| Rule engine p95 latency | <= 300 ms | Not a claimed result |

---

## 10. Phase 2 AI Features (NOT in v1)

| Feature | Status |
|---------|--------|
| AI-based photo content analysis | Phase 2 |
| AI-based video content analysis | Phase 2 |
| Photo/video duplicate similarity | Phase 2 |
| Key-frame extraction for analysis | Phase 2 |
| Seasonal risk forecasting | Phase 2 |
| Pre-monsoon inspection list | Phase 2 (when enough history) |
| Native Android client | Phase 2 |
| Read-aloud text mode | Phase 2 |

---

## 11. AI Model Governance

- All models version-controlled alongside the codebase
- Model can be rolled back if misclassification pattern detected
- Gate can be raised immediately by administrator; lowering requires dual approval
- Shadow mode: AI runs silently beside the manual process on approved data to measure agreement rate before gate is activated
- Model improvement: wrong proposals and staff corrections added to improvement set
- No model is described as accurate until evaluation has been run on held-out data
