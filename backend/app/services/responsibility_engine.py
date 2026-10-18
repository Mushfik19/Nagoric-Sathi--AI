import math
from typing import Optional, Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.geography import Ward, Asset
from app.models.department import Department, Officer
from app.models.service import ResponsibilityRule
from app.config import settings

class ResponsibilityEngineService:
    """
    Deterministic & Explainable Department Recommendation Engine (R&D Section 10.3, Table 23).
    Evaluates: Ward Boundary + Asset Owner + Problem Category + Responsibility Rules.
    """

    @staticmethod
    def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Return distance in meters between two lat/lon coordinates."""
        R = 6371000 # Earth radius in meters
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)
        
        a = math.sin(delta_phi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    @classmethod
    async def match_responsibility(
        cls,
        db: AsyncSession,
        latitude: float,
        longitude: float,
        primary_category: str,
        secondary_categories: List[str] = None
    ) -> Dict[str, Any]:
        secondary_categories = secondary_categories or []
        
        # 1. Ward Lookup (Find nearest or matching ward center)
        stmt_wards = select(Ward)
        wards_res = await db.execute(stmt_wards)
        all_wards = wards_res.scalars().all()
        
        matched_ward = None
        min_ward_dist = float("inf")
        for w in all_wards:
            dist = cls.calculate_haversine_distance(latitude, longitude, w.center_latitude, w.center_longitude)
            if dist < min_ward_dist:
                min_ward_dist = dist
                matched_ward = w
        
        if not matched_ward and all_wards:
            matched_ward = all_wards[0]

        # 2. Asset Lookup (Find nearest physical asset in that ward)
        matched_asset = None
        if matched_ward:
            stmt_assets = select(Asset).where(Asset.ward_id == matched_ward.id)
            assets_res = await db.execute(stmt_assets)
            ward_assets = assets_res.scalars().all()
            
            min_asset_dist = float("inf")
            for a in ward_assets:
                dist = cls.calculate_haversine_distance(latitude, longitude, a.latitude, a.longitude)
                # If within 500 meters, associate asset
                if dist < 500 and dist < min_asset_dist:
                    min_asset_dist = dist
                    matched_asset = a

        # 3. Responsibility Rule Match
        stmt_rule = select(ResponsibilityRule).where(
            ResponsibilityRule.problem_category == primary_category,
            ResponsibilityRule.is_active == True
        )
        rule_res = await db.execute(stmt_rule)
        matched_rule = rule_res.scalars().first()

        # 4. Department determination
        department_id = None
        department_code = primary_category
        department_name_bn = "বর্জ্য ব্যবস্থাপনা বিভাগ"
        
        if matched_rule:
            department_id = matched_rule.department_id
            stmt_dept = select(Department).where(Department.id == department_id)
            dept_res = await db.execute(stmt_dept)
            dept_obj = dept_res.scalar_one_or_none()
            if dept_obj:
                department_code = dept_obj.code
                department_name_bn = dept_obj.name_bn
        else:
            # Fallback direct lookup
            stmt_dept = select(Department).where(Department.code == primary_category)
            dept_res = await db.execute(stmt_dept)
            dept_obj = dept_res.scalar_one_or_none()
            if dept_obj:
                department_id = dept_obj.id
                department_code = dept_obj.code
                department_name_bn = dept_obj.name_bn

        # 5. Responsible Officer Lookup
        matched_officer = None
        if department_id and matched_ward:
            stmt_officer = select(Officer).where(
                Officer.department_id == department_id,
                Officer.ward_id == matched_ward.id,
                Officer.is_active == True
            )
            officer_res = await db.execute(stmt_officer)
            matched_officer = officer_res.scalars().first()
            
            # Fallback to any active officer in that department if ward-specific is not set
            if not matched_officer:
                stmt_fallback_officer = select(Officer).where(
                    Officer.department_id == department_id,
                    Officer.is_active == True
                )
                off_fb = await db.execute(stmt_fallback_officer)
                matched_officer = off_fb.scalars().first()

        # 6. Build Explainable Reason in Bangla (R&D Section 10.3)
        reasons = []
        if matched_ward:
            reasons.append(f"• ঘটনাটি {matched_ward.ward_name_bn} ({matched_ward.ward_number} নং ওয়ার্ড) এর অন্তর্গত।")
        if matched_asset:
            reasons.append(f"• অবস্থানটি {matched_asset.name_bn} (কোড: {matched_asset.asset_code}) এর সন্নিকটে।")
        if matched_rule:
            reasons.append(f"• বিধিমালা '{matched_rule.name_bn}' অনুযায়ী এই কাজের প্রধান দায়িত্ব {department_name_bn} এর।")
        else:
            reasons.append(f"• প্রাথমিক ক্যাটাগরি '{primary_category}' ভিত্তিতে {department_name_bn} এর দায়িত্ব নির্ধারিত হয়েছে।")
            
        if secondary_categories:
            reasons.append(f"• বহুমাত্রিক কাজের সমন্বয়ের জন্য সহযোগী বিভাগসমূহ প্রস্তুত রাখা হয়েছে।")

        # 7. Confidence Calculation
        base_confidence = 0.88 if (matched_ward and matched_asset and matched_rule) else 0.82
        if not matched_asset:
            base_confidence -= 0.05
        if not matched_ward:
            base_confidence -= 0.15

        gate_threshold = settings.ROUTING_CONFIDENCE_GATE_DEFAULT
        passed_gate = (base_confidence >= gate_threshold)

        return {
            "department_id": department_id,
            "department_code": department_code,
            "department_name_bn": department_name_bn,
            "matched_ward_id": matched_ward.id if matched_ward else None,
            "matched_ward_name_bn": matched_ward.ward_name_bn if matched_ward else "অনির্ধারিত ওয়ার্ড",
            "matched_ward_number": matched_ward.ward_number if matched_ward else 0,
            "matched_asset_id": matched_asset.id if matched_asset else None,
            "matched_asset_code": matched_asset.asset_code if matched_asset else None,
            "matched_asset_name_bn": matched_asset.name_bn if matched_asset else None,
            "responsibility_rule_id": matched_rule.id if matched_rule else None,
            "responsibility_rule_code": matched_rule.rule_code if matched_rule else None,
            "responsibility_reason_bn": "\n".join(reasons),
            "assigned_officer_id": matched_officer.id if matched_officer else None,
            "assigned_officer_name_bn": matched_officer.name_bn if matched_officer else "দায়িত্বপ্রাপ্ত প্রকৌশলী",
            "assigned_officer_designation": matched_officer.designation if matched_officer else "সহকারী প্রকৌশলী",
            "assigned_officer_phone": matched_officer.official_phone if matched_officer else "০৩১-XXXXXX",
            "assigned_officer_email": matched_officer.official_email if matched_officer else "officer@ccc.gov.bd",
            "confidence_score": round(base_confidence, 2),
            "passed_gate": passed_gate,
            "requires_staff_verification": not passed_gate
        }
