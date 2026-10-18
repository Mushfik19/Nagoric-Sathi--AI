import datetime
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.case import Case, CaseStatusEnum
from app.models.geography import Asset, Ward
from app.models.duplicate_hotspot import Hotspot

class HotspotAnalyzerService:
    """
    Repeat-Issue & Chronic Hotspot Analyzer (R&D Section 10.8, 10.12).
    Detects recurrent failures around the same asset or coordinate cluster within 90 days.
    Generates advisory engineering review notes and alternative maintenance solutions.
    """

    @classmethod
    async def evaluate_hotspots(cls, db: AsyncSession) -> List[Dict[str, Any]]:
        cutoff_date = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=90)
        
        # 1. Check cases grouped by asset_id
        stmt = select(
            Case.asset_id,
            Case.primary_category,
            Case.ward_id,
            func.count(Case.id).label("incident_count"),
            func.avg(Case.latitude).label("avg_lat"),
            func.avg(Case.longitude).label("avg_lon")
        ).where(
            Case.created_at >= cutoff_date
        ).group_by(
            Case.asset_id, Case.primary_category, Case.ward_id
        ).having(
            func.count(Case.id) >= 2 # Recurrence threshold
        )
        
        res = await db.execute(stmt)
        clusters = res.all()
        
        detected_hotspots = []
        for row in clusters:
            asset_id, category, ward_id, count, avg_lat, avg_lon = row
            
            # Fetch asset info if available
            asset_name = "নির্দিষ্ট এলাকা"
            if asset_id:
                stmt_a = select(Asset).where(Asset.id == asset_id)
                res_a = await db.execute(stmt_a)
                asset_obj = res_a.scalar_one_or_none()
                if asset_obj:
                    asset_name = f"{asset_obj.name_bn} ({asset_obj.asset_code})"

            # Advisory notes & alternative solutions per R&D Section 10.8
            if category == "drain":
                note = f"{asset_name} এলাকায় গত ৯০ দিনে {count} বার নর্দমা বন্ধ ও জলাবদ্ধতার অভিযোগ রেকর্ড করা হয়েছে। নর্দমার পলি জমা ও প্রবাহ বিঘ্নিত হচ্ছে।"
                solutions = [
                    "ড্রেনের ধারণক্ষমতা ১২ ইঞ্চি থেকে বৃদ্ধি করে ২৪ ইঞ্চি করা",
                    "দ্বি-সাপ্তাহিক রুটিন পলি অপসারণ ও স্ল্যাব সংস্কার",
                    "ড্রেনের সংযোগমুখে মেটাল ট্র্যাশ গার্ড স্থাপন"
                ]
            elif category == "waste":
                note = f"{asset_name} পয়েন্টে গত ৯০ দিনে {count} বার অবৈধ বর্জ্য স্তূপীকরণ দেখা গেছে।"
                solutions = [
                    "সেকেন্ডারি ট্রান্সফার স্টেশন (STS) স্থাপন বা কনটেইনারের আকার দ্বিগুণ করা",
                    "রাত্রিকালীন বর্জ্য সংগ্রহ নিশ্চিতকরণ ও ওয়ার্ড পর্যায়ে জনসচেতনতামূলক ক্যাম্পেইন"
                ]
            elif category == "road":
                note = f"{asset_name} সড়ক অংশে গত ৯০ দিনে {count} বার গর্ত ও পিচ ক্ষয়ের অভিযোগ পাওয়া গেছে।"
                solutions = [
                    "সাব-বেস ড্রেনেজ শক্তিশালীকরণ ও আরসিসি (RCC) ঢালাই বাস্তবায়ন",
                    "ভারী যানবাহন চলাচল নিয়ন্ত্রণ এবং পানি নিষ্কাশন নালার সাথে সংযোগ নিশ্চিতকরণ"
                ]
            else:
                note = f"{asset_name} পয়েন্টে বারবার সড়কবাতি অচল হওয়ার ঘটনা ঘটেছে।"
                solutions = [
                    "সার্জ প্রটেক্টর ও ওয়াটারপ্রুফ এলইডি ফিটিংস প্রতিস্থাপন",
                    "সার্বক্ষণিক ভোল্টেজ মনিটরিং ও আন্ডারগ্রাউন্ড ক্যাবল চেকিং"
                ]

            detected_hotspots.append({
                "ward_id": ward_id,
                "asset_id": asset_id,
                "category": category,
                "center_latitude": avg_lat,
                "center_longitude": avg_lon,
                "incident_count_last_90_days": count,
                "severity_level": "chronic" if count >= 4 else "high",
                "advisory_review_note_bn": note,
                "suggested_alternative_solutions": solutions
            })

        return detected_hotspots
