import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_multi_dept_compound_case_sequencing(client: AsyncClient):
    # 1. Citizen submits multimodal intake in Bangla
    intake_payload = {
        "raw_text_bn": "আমাদের গলির সামনে অনেক ময়লা জমে ড্রেন বন্ধ হয়ে গেছে। পানি জমে রাস্তা নষ্ট হচ্ছে।",
        "latitude": 22.3655,
        "longitude": 91.8210,
        "address_text": "হাতেম আলী লেইন, পাঁচলাইশ",
        "landmark": "পাঁচলাইশ আবাসিক মোড়",
        "is_public_property": True,
        "photo_urls": ["https://example.com/demo_before_photo.jpg"]
    }
    
    resp = await client.post("/api/cases/intake", json=intake_payload)
    assert resp.status_code == 200
    intake_data = resp.json()
    case_id = intake_data["case_id"]
    assert "tracking_number" in intake_data
    assert intake_data["ai_analysis"]["primary_category"] in ["waste", "drain"]
    assert "road" in intake_data["ai_analysis"]["detected_categories"]
    assert intake_data["responsibility"]["confidence_score"] >= 0.80

    # 2. Coordinator Login & Approves 3-Task Sequence (Waste -> Drain -> Road)
    coord_login = await client.post("/api/auth/login", json={
        "phone_or_email": "coordinator@nagoriksathi.gov.bd",
        "password": "Pass1234!"
    })
    coord_token = coord_login.json()["access_token"]
    coord_headers = {"Authorization": f"Bearer {coord_token}"}

    # Fetch departments to get IDs
    depts_resp = await client.get("/api/departments")
    depts = {d["code"]: d["id"] for d in depts_resp.json()}

    approval_payload = {
        "case_id": case_id,
        "approval_notes": "৩টি বিভাগের সমন্বিত কর্মপরিকল্পনা অনুমোদিত হলো।",
        "approved_tasks": [
            {
                "department_id": depts["waste"],
                "title_bn": "১. বর্জ্য অপসারণ",
                "description_bn": "ড্রেনের মুখ ও সড়কের আবর্জনা অপসারণ",
                "sequence_order": 1,
                "is_lead_task": True,
                "sla_hours": 24
            },
            {
                "department_id": depts["drain"],
                "title_bn": "২. ড্রেন পরিষ্কার ও স্ল্যাব প্রতিস্থাপন",
                "description_bn": "ড্রেন পলি অপসারণ",
                "sequence_order": 2,
                "is_lead_task": False,
                "sla_hours": 48
            },
            {
                "department_id": depts["road"],
                "title_bn": "৩. রাস্তা মেরামত",
                "description_bn": "ক্ষতিগ্রস্ত রাস্তা পিচঢালাই",
                "sequence_order": 3,
                "is_lead_task": False,
                "sla_hours": 72
            }
        ]
    }

    seq_resp = await client.post(f"/api/cases/{case_id}/approve-sequence", json=approval_payload, headers=coord_headers)
    assert seq_resp.status_code == 200

    # 3. Verify case detail shows tasks in proper order
    case_detail = await client.get(f"/api/cases/{case_id}")
    assert case_detail.status_code == 200
    cd = case_detail.json()
    assert len(cd["tasks"]) == 3
    assert cd["tasks"][0]["status"] == "in_progress"
    assert cd["tasks"][1]["status"] == "waiting_prerequisite"

    # 4. Officer Waste completes Task 1 with evidence
    waste_officer_login = await client.post("/api/auth/login", json={
        "phone_or_email": "officer_waste@nagoriksathi.gov.bd",
        "password": "Pass1234!"
    })
    waste_token = waste_officer_login.json()["access_token"]
    waste_headers = {"Authorization": f"Bearer {waste_token}"}

    task1_id = cd["tasks"][0]["id"]
    update_resp = await client.post(f"/api/tasks/{task1_id}/update-status", json={
        "status": "completed_awaiting_review",
        "evidence_url": "https://example.com/demo_after_waste.jpg",
        "notes": "বর্জ্য সম্পূর্ণরূপে পরিষ্কার করা হয়েছে।"
    }, headers=waste_headers)
    assert update_resp.status_code == 200

    # 5. Check that Task 2 is automatically unlocked to IN_PROGRESS
    cd_after = (await client.get(f"/api/cases/{case_id}")).json()
    assert cd_after["tasks"][1]["status"] == "in_progress"
