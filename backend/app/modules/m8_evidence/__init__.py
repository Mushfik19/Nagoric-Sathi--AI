"""
Module 8: Resolution Evidence & Citizen Objection (R&D Section 6.7).
Officer proof upload, Before/After side-by-side comparison, and objection reopening.
"""
from app.services.evidence_service import EvidenceService
from app.models.evidence import CaseEvidence, EvidenceTypeEnum, CaseFeedback, CaseObjection

__all__ = ["EvidenceService", "CaseEvidence", "EvidenceTypeEnum", "CaseFeedback", "CaseObjection"]
