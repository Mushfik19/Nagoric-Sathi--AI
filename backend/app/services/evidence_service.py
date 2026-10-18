from typing import Dict, Any, List, Optional
from app.models.evidence import CaseEvidence, EvidenceTypeEnum

class EvidenceService:
    """
    Evidence & Before/After Comparison Service (R&D Section 6.7, 11.2, Module 8).
    Handles before-and-after photo pairing, metadata stamping, and automatic face/license masking markers.
    """

    @staticmethod
    def pair_before_after_evidence(evidence_items: List[CaseEvidence]) -> Dict[str, Any]:
        before_items = [e for e in evidence_items if e.evidence_type == EvidenceTypeEnum.BEFORE]
        after_items = [e for e in evidence_items if e.evidence_type == EvidenceTypeEnum.AFTER]
        during_items = [e for e in evidence_items if e.evidence_type == EvidenceTypeEnum.DURING]

        paired = []
        for i in range(max(len(before_items), len(after_items))):
            before = before_items[i] if i < len(before_items) else None
            after = after_items[i] if i < len(after_items) else None
            paired.append({
                "pair_index": i + 1,
                "before": {
                    "id": before.id,
                    "url": before.media_url,
                    "timestamp": before.timestamp.isoformat() if before else None,
                    "is_masked": before.is_masked if before else False
                } if before else None,
                "after": {
                    "id": after.id,
                    "url": after.media_url,
                    "timestamp": after.timestamp.isoformat() if after else None,
                    "is_masked": after.is_masked if after else False,
                    "is_verified": after.is_verified_by_staff if after else False,
                    "staff_notes": after.staff_notes if after else None
                } if after else None
            })

        return {
            "has_before_evidence": len(before_items) > 0,
            "has_after_evidence": len(after_items) > 0,
            "can_resolve": len(before_items) > 0 and len(after_items) > 0,
            "pairs": paired,
            "during_items": [
                {"id": d.id, "url": d.media_url, "timestamp": d.timestamp.isoformat()} for d in during_items
            ]
        }
