import math
import datetime
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.case import Case, CaseStatusEnum
from app.models.duplicate_hotspot import DuplicateCandidate, DuplicateLink
from app.services.responsibility_engine import ResponsibilityEngineService

class DuplicateDetectorService:
    """
    Duplicate Detection & Reversible Linking Engine (R&D Section 10.8).
    Evaluates: GPS Distance (radius <= 200m) + Category Match + Time Window (<= 7 days) + Text Similarity.
    """

    @classmethod
    def calculate_text_jaccard_similarity(cls, text1: str, text2: str) -> float:
        set1 = set(text1.split())
        set2 = set(text2.split())
        if not set1 or not set2:
            return 0.0
        intersection = len(set1.intersection(set2))
        union = len(set1.union(set2))
        return intersection / union if union > 0 else 0.0

    @classmethod
    async def find_duplicate_candidates(
        cls,
        db: AsyncSession,
        case: Case,
        max_distance_meters: float = 250.0,
        max_days: int = 7
    ) -> List[Dict[str, Any]]:
        # Query existing active/open cases in same category
        cutoff_date = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=max_days)
        stmt = select(Case).where(
            Case.id != case.id,
            Case.primary_category == case.primary_category,
            Case.status.in_([
                CaseStatusEnum.SUBMITTED,
                CaseStatusEnum.VERIFIED,
                CaseStatusEnum.UNDER_INSPECTION,
                CaseStatusEnum.IN_PROGRESS
            ]),
            Case.created_at >= cutoff_date
        )
        res = await db.execute(stmt)
        other_cases = res.scalars().all()

        candidates = []
        for other in other_cases:
            distance = ResponsibilityEngineService.calculate_haversine_distance(
                case.latitude, case.longitude, other.latitude, other.longitude
            )
            if distance <= max_distance_meters:
                text_sim = cls.calculate_text_jaccard_similarity(case.description_bn, other.description_bn)
                time_diff_hours = abs((case.created_at - other.created_at).total_seconds()) / 3600.0
                
                # Combined similarity score
                dist_score = max(0.0, 1.0 - (distance / max_distance_meters))
                sim_score = (0.6 * dist_score) + (0.4 * text_sim)
                
                if sim_score >= 0.45 or distance <= 100.0:
                    candidates.append({
                        "target_case_id": other.id,
                        "target_tracking_number": other.tracking_number,
                        "target_title_bn": other.title_bn,
                        "distance_meters": round(distance, 1),
                        "time_diff_hours": round(time_diff_hours, 1),
                        "similarity_score": round(sim_score, 2),
                        "category": other.primary_category,
                        "status": other.status.value
                    })

        return candidates
