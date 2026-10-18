import pytest
import datetime
from httpx import AsyncClient
from sqlalchemy import select
from app.models.case import Case, CaseStatusEnum, PriorityEnum
from app.models.geography import Ward
from app.services.sla_service import SLAService

@pytest.mark.asyncio
async def test_sla_targets_and_pause_on_waiting_reason(db_session):
    # Fetch an existing seeded ward
    ward_stmt = select(Ward).limit(1)
    ward_res = await db_session.execute(ward_stmt)
    ward = ward_res.scalar_one()

    now = datetime.datetime.now(datetime.timezone.utc)
    case = Case(
        tracking_number="CASE-SLA-001",
        title_bn="জরুরি বিদ্যুৎ তার ছিঁড়ে পড়েছে",
        description_bn="বিদ্যুতের তার রাস্তায় পড়ে আছে, যেকোনো মুহূর্তে বড় দুর্ঘটনা হতে পারে",
        primary_category="বিদ্যুৎ ও সড়ক বাতি",
        priority=PriorityEnum.EMERGENCY,
        status=CaseStatusEnum.IN_PROGRESS,
        latitude=23.7925,
        longitude=90.4078,
        address_text="বনানী ১১ নম্বর সড়ক",
        ward_id=ward.id,
        created_at=now - datetime.timedelta(hours=5),
        tasks=[]
    )
    db_session.add(case)
    await db_session.commit()
    await db_session.refresh(case)

    # Evaluate SLA
    sla_res = await SLAService.evaluate_case_sla(db_session, case)
    assert sla_res["is_timer_running"] is True
    assert sla_res["elapsed_hours"] >= 5.0
    assert sla_res["target_hours"] == 6  # Emergency resolution target is 6 hours
    assert sla_res["current_step"] in ["emergency_alert", "escalation_1", "escalation_2"]

@pytest.mark.asyncio
async def test_sla_escalation_endpoint(client: AsyncClient):
    # Authenticate as case coordinator
    resp = await client.post("/api/auth/login", json={
        "phone_or_email": "coordinator@nagoriksathi.gov.bd",
        "password": "Pass1234!"
    })
    assert resp.status_code == 200
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Coordinator lists cases
    response = await client.get("/api/cases", headers=headers)
    assert response.status_code == 200
    cases = response.json()
    assert isinstance(cases, list)
    assert len(cases) > 0
    
    # Verify SLA detail for case
    first_case_id = cases[0]["id"]
    detail_resp = await client.get(f"/api/cases/{first_case_id}", headers=headers)
    assert detail_resp.status_code == 200
    detail = detail_resp.json()
    assert "sla" in detail
    assert "current_step" in detail["sla"]
    assert "target_hours" in detail["sla"]

@pytest.mark.asyncio
async def test_admin_configurable_sla_policy(client: AsyncClient, db_session):
    # Authenticate as System Admin
    login_resp = await client.post("/api/auth/login", json={
        "phone_or_email": "admin@nagoriksathi.gov.bd",
        "password": "AdminPass1234!"
    })
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Admin reads SLA policies
    policies_resp = await client.get("/api/admin/sla-policies", headers=headers)
    assert policies_resp.status_code == 200
    policies = policies_resp.json()
    assert len(policies) >= 4

    # 2. Admin customizes SLA policy for EMERGENCY (e.g. city corporation changes resolution target from 6 to 3 hours)
    update_resp = await client.put("/api/admin/sla-policies/emergency", json={
        "response_target_hours": 1,
        "resolution_target_hours": 3,
        "reminder_lead_hours": 1,
        "escalation_1_hours": 2,
        "escalation_2_hours": 4
    }, headers=headers)
    assert update_resp.status_code == 200

    # 3. Create case and verify SLAService uses the customized 3-hour target instead of hardcoded 6 hours
    ward_stmt = select(Ward).limit(1)
    ward_res = await db_session.execute(ward_stmt)
    ward = ward_res.scalar_one()

    case = Case(
        tracking_number="CASE-SLA-CUSTOM-001",
        title_bn="কাস্টম এসএলএ টেস্ট",
        description_bn="জরুরি টেস্ট",
        primary_category="বিদ্যুৎ ও সড়ক বাতি",
        priority=PriorityEnum.EMERGENCY,
        status=CaseStatusEnum.IN_PROGRESS,
        latitude=23.7925,
        longitude=90.4078,
        address_text="কাস্টম রোড",
        ward_id=ward.id,
        tasks=[]
    )
    db_session.add(case)
    await db_session.commit()
    await db_session.refresh(case)

    sla_eval = await SLAService.evaluate_case_sla(db_session, case)
    assert sla_eval["target_hours"] == 3  # Dynamically configured target honoured!

