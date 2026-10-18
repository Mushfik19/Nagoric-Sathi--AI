import asyncio
import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import AsyncSessionLocal, Base, async_engine
from app.models.user import User, UserRoleEnum, UserScope, CitizenProfile, StaffProfile
from app.models.geography import Ward, Asset, AssetTypeEnum
from app.models.department import Department, Officer
from app.models.service import ServiceCatalog, ServiceDocument, ServiceDocumentChunk, ResponsibilityRule
from app.models.case import Case, CaseReport, CaseTask, CaseStatusEnum, PriorityEnum, TaskStatusEnum, CaseStatusHistory
from app.models.evidence import CaseEvidence, EvidenceTypeEnum, CaseFeedback
from app.models.sla import SLAPolicy, SLAStepEnum
from app.models.system import SystemConfig
from app.core.security import get_password_hash
from app.core.audit import AuditLogger

async def seed_all(engine=None, session_maker=None):
    target_engine = engine or async_engine
    target_session = session_maker or AsyncSessionLocal

    async with target_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with target_session() as db:
        # Check if already seeded
        res = await db.execute(select(User).limit(1))
        if res.scalar_one_or_none():
            print("Database already contains records. Skipping initial seed.")
            return

        print("Seeding Nagorik Sathi AI database with R&D specification data...")

        # 1. System Config: Routing Confidence Gate (0.80)
        gate_cfg = SystemConfig(
            config_key="routing_confidence_gate",
            config_value_json={"threshold": 0.80},
            description="AI Routing Confidence Gate (Section 10.11)"
        )
        db.add(gate_cfg)

        # 2. SLA Policies (Table 12 & 13)
        sla_emergency = SLAPolicy(priority=PriorityEnum.EMERGENCY, response_target_hours=2, resolution_target_hours=6, reminder_lead_hours=1, escalation_1_hours=4, escalation_2_hours=8)
        sla_high = SLAPolicy(priority=PriorityEnum.HIGH, response_target_hours=12, resolution_target_hours=24, reminder_lead_hours=2, escalation_1_hours=18, escalation_2_hours=36)
        sla_medium = SLAPolicy(priority=PriorityEnum.MEDIUM, response_target_hours=48, resolution_target_hours=72, reminder_lead_hours=6, escalation_1_hours=60, escalation_2_hours=96)
        sla_low = SLAPolicy(priority=PriorityEnum.LOW, response_target_hours=120, resolution_target_hours=168, reminder_lead_hours=12, escalation_1_hours=144, escalation_2_hours=240)
        db.add_all([sla_emergency, sla_high, sla_medium, sla_low])

        # 3. Wards (3-5 Wards of CCC)
        w1 = Ward(ward_number=1, ward_name_bn="১ নং দক্ষিণ পাহাড়তলী ওয়ার্ড", ward_name_en="Ward 01 - South Pahartali", zone_code="ZONE-A", councillor_name="জনাব গাজী জাফর উল্লাহ", ward_office_address="পাহাড়তলী মোড়, চট্টগ্রাম", contact_phone="০৩১-৭২০০০১", center_latitude=22.3800, center_longitude=91.7900)
        w2 = Ward(ward_number=2, ward_name_bn="২ নং জালালাবাদ ওয়ার্ড", ward_name_en="Ward 02 - Jalalabad", zone_code="ZONE-A", councillor_name="জনাব মোস্তফা কামাল", ward_office_address="হাতেম আলী রোড, চট্টগ্রাম", contact_phone="০৩১-৭২০০০২", center_latitude=22.3750, center_longitude=91.8050)
        w3 = Ward(ward_number=3, ward_name_bn="৩ নং পাঁচলাইশ ওয়ার্ড", ward_name_en="Ward 03 - Panchlaish", zone_code="ZONE-B", councillor_name="জনাব শফিকুল ইসলাম", ward_office_address="পাঁচলাইশ আবাসিক এলাকা, চট্টগ্রাম", contact_phone="০৩১-৭২০০০৩", center_latitude=22.3650, center_longitude=91.8200)
        w4 = Ward(ward_number=4, ward_name_bn="৪ নং চান্দগাঁও ওয়ার্ড", ward_name_en="Ward 04 - Chandgaon", zone_code="ZONE-B", councillor_name="জনাব এহসানুল হক", ward_office_address="চান্দগাঁও থানা সংলগ্ন, চট্টগ্রাম", contact_phone="০৩১-৭২০০০৪", center_latitude=22.3850, center_longitude=91.8500)
        w5 = Ward(ward_number=5, ward_name_bn="৫ নং মোহরা ওয়ার্ড", ward_name_en="Ward 05 - Mohra", zone_code="ZONE-C", councillor_name="জনাব নুরুল আমিন", ward_office_address="কালুরঘাট মোড়, মোহরা, চট্টগ্রাম", contact_phone="০৩১-৭২০০০৫", center_latitude=22.3950, center_longitude=91.8700)
        db.add_all([w1, w2, w3, w4, w5])
        await db.flush()

        # 4. Departments (4 Core civic departments)
        d_waste = Department(code="waste", name_bn="বর্জ্য ব্যবস্থাপনা বিভাগ", name_en="Waste Management Department", description="শহরের সার্বিক বর্জ্য অপসারণ ও এসটিএস ব্যবস্থাপনা", head_officer_name="প্রধান পরিচ্ছন্নতা কর্মকর্তা", hotline_number="০৩১-৬২০১১১", official_email="waste@ccc.gov.bd")
        d_drain = Department(code="drain", name_bn="ড্রেনেজ ও নর্দমা প্রকৌশল বিভাগ", name_en="Drainage Engineering Department", description="নর্দমা খনন, পলি অপসারণ ও জলাবদ্ধতা নিরসন", head_officer_name="তত্ত্বাবধায়ক প্রকৌশলী (ড্রেনেজ)", hotline_number="০৩১-৬২০২২২", official_email="drainage@ccc.gov.bd")
        d_road = Department(code="road", name_bn="সড়ক ও অবকাঠামো বিভাগ", name_en="Roads & Infrastructure Department", description="রাস্তা সংস্কার, পিচঢালাই ও ফুটপাত মেরামত", head_officer_name="নির্বাহী প্রকৌশলী (সড়ক)", hotline_number="০৩১-৬২০৩৩৩", official_email="roads@ccc.gov.bd")
        d_light = Department(code="street_light", name_bn="বিদ্যুৎ ও সড়কবাতি বিভাগ", name_en="Electrical & Street Lighting Department", description="সড়কবাতি স্থাপন, সংস্কার ও বৈদ্যুতিক নিরাপত্তা", head_officer_name="সহকারী প্রকৌশলী (বিদ্যুৎ)", hotline_number="০৩১-৬২০৪৪৪", official_email="lighting@ccc.gov.bd")
        db.add_all([d_waste, d_drain, d_road, d_light])
        await db.flush()

        # 5. Assets (Physical registry)
        a_drain1 = Asset(asset_code="D-102", name_bn="হাতেম আলী লেইন প্রধান ড্রেন", name_en="Hatem Ali Lane Main Drain", asset_type="drain", ward_id=w3.id, department_id=d_drain.id, latitude=22.3655, longitude=91.8210, location_description="পাঁচলাইশ ২ নং রোড সংযোগস্থল")
        a_road1 = Asset(asset_code="RD-301", name_bn="পাঁচলাইশ আবাসিক সংযোগ সড়ক", name_en="Panchlaish Residential Access Road", asset_type="road", ward_id=w3.id, department_id=d_road.id, latitude=22.3654, longitude=91.8212, location_description="হাতেম আলী লেইন মোড়")
        a_waste1 = Asset(asset_code="STS-05", name_bn="চান্দগাঁও সেকেন্ডারি ট্রান্সফার স্টেশন (STS)", name_en="Chandgaon STS", asset_type="waste_bin", ward_id=w4.id, department_id=d_waste.id, latitude=22.3852, longitude=91.8510, location_description="চান্দগাঁও থানা মোড়")
        a_light1 = Asset(asset_code="LP-88", name_bn="পাহাড়তলী প্রধান সড়ক সড়কবাতি পোস্ট-৮৮", name_en="Pahartali Pole 88", asset_type="street_light", ward_id=w1.id, department_id=d_light.id, latitude=22.3802, longitude=91.7905, location_description="পাহাড়তলী রেলগেট মোড়")
        db.add_all([a_drain1, a_road1, a_waste1, a_light1])
        await db.flush()

        off_waste = Officer(name_bn="প্রকৌশলী রফিকুল ইসলাম", name_en="Engr. Rafiqul Islam", designation="সহকারী প্রকৌশলী (বর্জ্য ব্যবস্থাপনা)", department_id=d_waste.id, ward_id=w3.id, zone_code="ZONE-B", official_phone="০৩১-৬২০১১৪", official_email="rafiq.waste@ccc.gov.bd", availability_status="available", max_concurrent_tasks=4, current_active_tasks=0)
        off_drain = Officer(name_bn="প্রকৌশলী তানভীর আহমেদ", name_en="Engr. Tanveer Ahmed", designation="সহকারী প্রকৌশলী (ড্রেনেজ ও নর্দমা)", department_id=d_drain.id, ward_id=w3.id, zone_code="ZONE-B", official_phone="০৩১-৬২০২২৫", official_email="tanveer.drain@ccc.gov.bd", availability_status="available", max_concurrent_tasks=4, current_active_tasks=0)
        off_drain_busy = Officer(name_bn="প্রকৌশলী সাজ্জাদ হোসেন", name_en="Engr. Sajjad Hossain", designation="উপ-সহকারী প্রকৌশলী (ড্রেন)", department_id=d_drain.id, ward_id=w3.id, zone_code="ZONE-B", official_phone="০৩১-৬২০২২৬", official_email="sajjad.drain@ccc.gov.bd", availability_status="busy", max_concurrent_tasks=3, current_active_tasks=3)
        off_drain_leave = Officer(name_bn="প্রকৌশলী মোর্শেদ আলম", name_en="Engr. Morshed Alam", designation="সহকারী প্রকৌশলী (ড্রেনেজ)", department_id=d_drain.id, ward_id=w3.id, zone_code="ZONE-B", official_phone="০৩১-৬২০২২৭", official_email="morshed.drain@ccc.gov.bd", availability_status="on_leave", max_concurrent_tasks=4, current_active_tasks=0)
        off_road = Officer(name_bn="প্রকৌশলী মাহমুদুল হাসান", name_en="Engr. Mahmudul Hasan", designation="সহকারী প্রকৌশলী (সড়ক ও অবকাঠামো)", department_id=d_road.id, ward_id=w3.id, zone_code="ZONE-B", official_phone="০৩১-৬২০৩৩৬", official_email="mahmud.roads@ccc.gov.bd", availability_status="available", max_concurrent_tasks=4, current_active_tasks=0)
        off_light = Officer(name_bn="প্রকৌশলী মেজবাহ উদ্দিন", name_en="Engr. Mezbah Uddin", designation="উপ-সহকারী প্রকৌশলী (বিদ্যুৎ)", department_id=d_light.id, ward_id=w1.id, zone_code="ZONE-A", official_phone="০৩১-৬২০৪৪৭", official_email="mezbah.light@ccc.gov.bd", availability_status="available", max_concurrent_tasks=4, current_active_tasks=0)
        db.add_all([off_waste, off_drain, off_drain_busy, off_drain_leave, off_road, off_light])
        await db.flush()

        # 7. Responsibility Rules (Table 23)
        r_waste = ResponsibilityRule(rule_code="RULE-WASTE-01", name_bn="সড়ক ও লেনের উন্মুক্ত বর্জ্য অপসারণ বিধিমালা", problem_category="waste", target_asset_type="waste_bin", department_id=d_waste.id, priority_level_default="medium", lead_rule_description_bn="উন্মুক্ত স্থানে আবর্জনা স্তূপীকৃত থাকলে বর্জ্য ব্যবস্থাপনা বিভাগ ২৪ ঘণ্টার মধ্যে অপসারণ করবে।")
        r_drain = ResponsibilityRule(rule_code="RULE-DRAIN-01", name_bn="ড্রেন ব্লকেজ ও পলি নিষ্কাশন বিধিমালা", problem_category="drain", target_asset_type="drain", department_id=d_drain.id, priority_level_default="high", lead_rule_description_bn="ড্রেনে ময়লা জমে পানি আটকে থাকলে ড্রেনেজ বিভাগ প্রথমে বর্জ্য অপসারণ সমন্বয় করবে এবং ড্রেন পরিষ্কার করবে।", supporting_departments=["waste", "road"])
        r_road = ResponsibilityRule(rule_code="RULE-ROAD-01", name_bn="ক্ষতিগ্রস্ত সড়ক ও গর্ত সংস্কার বিধিমালা", problem_category="road", target_asset_type="road", department_id=d_road.id, priority_level_default="medium", lead_rule_description_bn="জলাবদ্ধতার ফলে সড়ক ক্ষতিগ্রস্ত হলে ড্রেন ক্লিয়ারেন্সের পর সড়ক বিভাগ পিচঢালাই বা আরসিসি মেরামত করবে।", supporting_departments=["drain"])
        r_light = ResponsibilityRule(rule_code="RULE-LIGHT-01", name_bn="সড়কবাতি মেরামত ও বৈদ্যুতিক লাইন নিরাপত্তা বিধিমালা", problem_category="street_light", target_asset_type="street_light", department_id=d_light.id, priority_level_default="medium", lead_rule_description_bn="সড়কবাতি অচল বা তার ছিঁড়ে থাকলে বিদ্যুৎ বিভাগ তাৎক্ষণিক মেরামত করবে।")
        db.add_all([r_waste, r_drain, r_road, r_light])
        await db.flush()

        # 8. Verified Service Knowledge & RAG Documents (Citizen Charter)
        doc_charter = ServiceDocument(
            document_title_bn="চট্টগ্রাম সিটি কর্পোরেশন নাগরিক সেবা সনদ ও গাইডলাইন ২০২৬",
            document_title_en="CCC Citizen Charter 2026",
            source_agency="চট্টগ্রাম সিটি কর্পোরেশন প্রশাসন বিভাগ",
            applicable_area="সকল ওয়ার্ড (১-৪১ নং ওয়ার্ড)",
            document_type="citizen_charter",
            version="2026.1",
            is_active=True,
            last_verified_date=datetime.datetime.now(datetime.timezone.utc)
        )
        db.add(doc_charter)
        await db.flush()

        chunk1 = ServiceDocumentChunk(
            document_id=doc_charter.id,
            chunk_index=1,
            section_title="বর্জ্য ও পরিচ্ছন্নতা সেবা",
            content_bn="১. গৃহস্থালি বর্জ্য প্রতিদিন সকাল ৬:০০ টা থেকে দুপুর ২:০০ টার মধ্যে ওয়ার্ডের নির্ধারিত এসটিএস বা ডাস্টবিনে স্থানান্তর করতে হবে।\n২. সড়ক ও নর্দমায় আবর্জনা ফেলা বাংলাদেশ পরিবেশ সংরক্ষণ আইন ও পৌরবিধি অনুযায়ী দণ্ডনীয় অপরাধ।\n৩. বর্জ্য অপসারণে ব্যর্থতায় ওয়ার্ড সচিব বা হটলাইনে অভিযোগ করা যাবে। কোনো ফি প্রযোজ্য নয়।",
            keywords=["বর্জ্য", "ময়লা", "এসটিএস", "ডাস্টবিন", "ফি"]
        )
        chunk2 = ServiceDocumentChunk(
            document_id=doc_charter.id,
            chunk_index=2,
            section_title="ড্রেন ও জলাবদ্ধতা নিরসন",
            content_bn="১. নর্দমায় পলি বা বর্জ্য জমে পানি নিষ্কাশন বাধাগ্রস্ত হলে সিটি কর্পোরেশনের ড্রেনেজ উইং জরুরি ভিত্তিতে কাজ সম্পন্ন করবে।\n২. জরুরি ক্ষেত্রে খোলা ম্যানহোল বা নর্দমার স্ল্যাব ভাঙা থাকলে অগ্রাধিকার ভিত্তিতে ১২ ঘণ্টার মধ্যে অস্থায়ী সুরক্ষা বেষ্টনী দেওয়া হবে।\n৩. নর্দমা সংস্কার সেবা সম্পূর্ণ বিনামূল্যে প্রদান করা হয়।",
            keywords=["ড্রেন", "জলাবদ্ধতা", "পানি", "ম্যানহোল", "স্ল্যাব"]
        )
        chunk3 = ServiceDocumentChunk(
            document_id=doc_charter.id,
            chunk_index=3,
            section_title="সড়ক খনন ও পুনঃমেরামত (Road Cutting Permit)",
            content_bn="১. ওয়াসা, তিতাস গ্যাস বা ডেসকো কর্তৃক সড়ক খননের জন্য সিটি কর্পোরেশন থেকে পূর্বানুমতি ও নির্ধারিত রোড কাটিং ফি জমা দিতে হয়।\n২. বর্ষা মৌসুমে (১ জুন থেকে ৩১ আগস্ট) জরুরি মেরামত ব্যতীত সাধারণ সড়ক খনন সম্পূর্ণ নিষিদ্ধ।\n৩. অনুমোদনহীন সড়ক খননের ক্ষেত্রে সংশ্লিষ্ট সংস্থা বা ব্যক্তির বিরুদ্ধে আইনানুগ ব্যবস্থা নেওয়া হবে।",
            keywords=["সড়ক", "কাটিং", "খনন", "বর্ষা", "ফি", "অনুমোদন"]
        )
        db.add_all([chunk1, chunk2, chunk3])
        await db.flush()

        # 9. Service Catalog
        sc_waste = ServiceCatalog(service_code="SRV-WASTE", title_bn="উন্মুক্ত বর্জ্য অপসারণ সেবা", title_en="Public Waste Removal Service", category="waste", department_id=d_waste.id, description_bn="পাবলিক স্থান থেকে আবর্জনা ও পচা বর্জ্য অপসারণ", fee_amount=0.0, sla_hours=24, required_documents=[{"name_bn": "সমস্যার ছবি ও অবস্থান", "is_mandatory": True}])
        sc_drain = ServiceCatalog(service_code="SRV-DRAIN", title_bn="ড্রেন পরিষ্কার ও নিষ্কাশন সেবা", title_en="Drain Desilting & Cleaning", category="drain", department_id=d_drain.id, description_bn="বন্ধ ড্রেন খোলা ও পানি নিষ্কাশন নিশ্চিতকরণ", fee_amount=0.0, sla_hours=48, required_documents=[{"name_bn": "সমস্যার বিবরণ ও ছবি", "is_mandatory": True}])
        sc_license = ServiceCatalog(service_code="SRV-TRADE-LICENSE", title_bn="ই-ট্রেড লাইসেন্স ইস্যু ও নবায়ন", title_en="E-Trade License Issuance & Renewal", category="license", department_id=d_road.id, description_bn="ব্যবসা প্রতিষ্ঠানের ডিজিটাল ট্রেড লাইসেন্স প্রদান", fee_amount=1500.0, sla_hours=72, official_portal_url="https://etradelicense.ccc.gov.bd", required_documents=[{"name_bn": "জাতীয় পরিচয়পত্র (NID)", "is_mandatory": True}, {"name_bn": "ভাড়ার চুক্তিপত্র / মালিকানার দলিল", "is_mandatory": True}, {"name_bn": "ট্যাক্স সার্টিফিকেট (TIN)", "is_mandatory": False}])
        db.add_all([sc_waste, sc_drain, sc_license])
        await db.flush()

        # 10. Demo Users (All 5 Roles per R&D Section 11.2)
        pwd_hash = get_password_hash("Pass1234!")
        admin_pwd_hash = get_password_hash("AdminPass1234!")

        u_citizen = User(phone="01711000001", email="citizen@nagoriksathi.gov.bd", hashed_password=pwd_hash, full_name="কাজী মুশফিকুর রহমান", role=UserRoleEnum.CITIZEN, is_active=True, is_verified=True, preferred_language="bn")
        u_warddesk = User(phone="01711000002", email="warddesk@nagoriksathi.gov.bd", hashed_password=pwd_hash, full_name="মোহাম্মদ আবুল কালাম (ওয়ার্ড ডেস্ক কর্মকর্তা)", role=UserRoleEnum.WARD_DESK, is_active=True, is_verified=True, preferred_language="bn")
        u_officer_drain = User(phone="01711000003", email="officer_drain@nagoriksathi.gov.bd", hashed_password=pwd_hash, full_name="প্রকৌশলী তানভীর আহমেদ", role=UserRoleEnum.DEPT_OFFICER, is_active=True, is_verified=True, preferred_language="bn")
        u_officer_waste = User(phone="01711000004", email="officer_waste@nagoriksathi.gov.bd", hashed_password=pwd_hash, full_name="প্রকৌশলী রফিকুল ইসলাম", role=UserRoleEnum.DEPT_OFFICER, is_active=True, is_verified=True, preferred_language="bn")
        u_coordinator = User(phone="01711000005", email="coordinator@nagoriksathi.gov.bd", hashed_password=pwd_hash, full_name="ড. ফারহানা হক (প্রধান সমন্বয়কারী)", role=UserRoleEnum.COORDINATOR, is_active=True, is_verified=True, preferred_language="bn")
        u_admin = User(phone="01711000006", email="admin@nagoriksathi.gov.bd", hashed_password=admin_pwd_hash, full_name="মো. হাসিবুল হাসান (সিস্টেম অ্যাডমিনিস্ট্রেটর)", role=UserRoleEnum.ADMIN, is_active=True, is_verified=True, preferred_language="bn")
        
        db.add_all([u_citizen, u_warddesk, u_officer_drain, u_officer_waste, u_coordinator, u_admin])
        await db.flush()

        # Link Scopes
        s_warddesk = UserScope(user_id=u_warddesk.id, ward_id=w3.id, jurisdiction_zone="ZONE-B")
        s_off_drain = UserScope(user_id=u_officer_drain.id, department_id=d_drain.id, ward_id=w3.id)
        s_off_waste = UserScope(user_id=u_officer_waste.id, department_id=d_waste.id, ward_id=w3.id)
        s_coordinator = UserScope(user_id=u_coordinator.id, jurisdiction_zone="ALL_ZONES")
        db.add_all([s_warddesk, s_off_drain, s_off_waste, s_coordinator])

        # Citizen Profile
        cp = CitizenProfile(user_id=u_citizen.id, address_line="হাতেম আলী লেইন, পাঁচলাইশ, চট্টগ্রাম", ward_id=w3.id)
        db.add(cp)

        # 11. Demo Worked Scenario Case (R&D Section 8.3, 42)
        demo_case = Case(
            tracking_number="NS-2026-W03-1001",
            title_bn="ড্রেনেজ ও বর্জ্য অপসারণ সমন্বিত কেস",
            description_bn="আমাদের গলির সামনে অনেক ময়লা জমে ড্রেন বন্ধ হয়ে গেছে। পানি জমে রাস্তা নষ্ট হচ্ছে।",
            primary_category="waste",
            secondary_categories=["drain", "road"],
            latitude=22.3655,
            longitude=91.8210,
            address_text="হাতেম আলী লেইন, ৩ নং পাঁচলাইশ ওয়ার্ড",
            landmark="পাঁচলাইশ আবাসিক মোড়",
            is_public_property=True,
            ward_id=w3.id,
            asset_id=a_drain1.id,
            status=CaseStatusEnum.IN_PROGRESS,
            priority=PriorityEnum.HIGH,
            ai_proposed_priority=PriorityEnum.HIGH,
            is_hazard=False,
            lead_department_id=d_waste.id,
            lead_officer_id=off_waste.id,
            assigned_rule_id=r_drain.id,
            responsibility_reason_bn="• ঘটনাটি ৩ নং পাঁচলাইশ ওয়ার্ড এর অন্তর্গত।\n• অবস্থানটি হাতেম আলী লেইন প্রধান ড্রেন (কোড: D-102) এর সন্নিকটে।\n• ড্রেন ব্লকেজ ও পলি নিষ্কাশন বিধিমালা অনুযায়ী বর্জ্য অপসারণ ও ড্রেন ক্লিয়ারেন্স সমন্বিত কর্মপরিকল্পনা সক্রিয়।",
            responsibility_confidence=0.91,
            requires_staff_verification=False,
            citizen_user_id=u_citizen.id,
            intake_channel="web_pwa"
        )
        db.add(demo_case)
        await db.flush()

        # Tasks Sequence for Demo Case
        t1 = CaseTask(case_id=demo_case.id, department_id=d_waste.id, assigned_officer_id=off_waste.id, title_bn="১. উন্মুক্ত স্তূপীকৃত বর্জ্য অপসারণ", description_bn="ড্রেনের মুখ থেকে সমস্ত কঠিন বর্জ্য ও প্লাস্টিক অপসারণ", sequence_order=1, is_lead_task=True, status=TaskStatusEnum.COMPLETED_AWAITING_REVIEW)
        t2 = CaseTask(case_id=demo_case.id, department_id=d_drain.id, assigned_officer_id=off_drain.id, title_bn="২. ড্রেনের পলি ও স্ল্যাব পরিষ্কার", description_bn="নর্দমার ভেতর থেকে পলি ও স্ল্যাব সরিয়ে পানির স্বাভাবিক প্রবাহ ফিরিয়ে আনা", sequence_order=2, is_lead_task=False, status=TaskStatusEnum.IN_PROGRESS, waiting_reason_bn=None)
        t3 = CaseTask(case_id=demo_case.id, department_id=d_road.id, assigned_officer_id=off_road.id, title_bn="৩. জলাবদ্ধতায় ক্ষতিগ্রস্ত সড়ক মেরামত", description_bn="ড্রেন নিষ্কাশন নিশ্চিত হওয়ার পর খানাখন্দ পিচঢালাই মেরামত", sequence_order=3, is_lead_task=False, status=TaskStatusEnum.WAITING_PREREQUISITE, waiting_reason_bn="ড্রেন পরিষ্কারের কাজ সমাপ্তির অপেক্ষায় (ধাপ ২)")
        db.add_all([t1, t2, t3])
        await db.flush()

        # Evidence: Before and After Proofs
        ev_before = CaseEvidence(case_id=demo_case.id, task_id=t1.id, uploaded_by_user_id=u_citizen.id, uploader_role="citizen", evidence_type=EvidenceTypeEnum.BEFORE, media_url="https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800&q=80", is_verified_by_staff=True, staff_notes="প্রাথমিক নাগরিক অভিযোগের সাথে প্রাপ্ত প্রমাণক")
        ev_after = CaseEvidence(case_id=demo_case.id, task_id=t1.id, uploaded_by_user_id=u_officer_waste.id, uploader_role="dept_officer", evidence_type=EvidenceTypeEnum.AFTER, media_url="https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800&q=80", is_verified_by_staff=True, staff_notes="বর্জ্য ব্যবস্থাপনা টিম কর্তৃক বর্জ্য সম্পূর্ণ অপসারণ করা হয়েছে।")
        db.add_all([ev_before, ev_after])

        # Status History
        sh1 = CaseStatusHistory(case_id=demo_case.id, from_status=None, to_status=CaseStatusEnum.SUBMITTED, changed_by_user_id=u_citizen.id, actor_role="citizen", reason_bn="নাগরিক অভিযোগ দাখিল")
        sh2 = CaseStatusHistory(case_id=demo_case.id, from_status=CaseStatusEnum.SUBMITTED, to_status=CaseStatusEnum.IN_PROGRESS, changed_by_user_id=u_coordinator.id, actor_role="coordinator", reason_bn="৩-ধাপের বহু-বিভাগীয় সমন্বয় পরিকল্পনা অনুমোদিত")
        db.add_all([sh1, sh2])

        # Initial Audit Log
        await AuditLogger.log_event(
            db=db,
            actor_user_id=u_admin.id,
            actor_role="admin",
            action="SYSTEM_INIT_SEED",
            resource_type="DATABASE",
            resource_id="INITIAL_SEED_2026",
            after_state={"wards_count": 5, "departments_count": 4}
        )

        await db.commit()
        print("Database seeded successfully with all wards, assets, officers, knowledge, and demo accounts!")

if __name__ == "__main__":
    asyncio.run(seed_all())
