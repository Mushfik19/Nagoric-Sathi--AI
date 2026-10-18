import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_ai_intake_and_extraction(client: AsyncClient):
    resp = await client.post("/api/ai/analyze-intake", json={
        "raw_text_bn": "রাস্তার বাতি অচল হয়ে গেছে, রাতে অন্ধকার থাকে এবং তার ছিঁড়ে বিপদজনক অবস্থা সৃষ্টি হয়েছে।",
        "latitude": 22.3802,
        "longitude": 91.7905
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["primary_category"] == "street_light"
    assert data["proposed_priority"] == "emergency"  # Hazard detected: "তার ছিঁড়ে বিপদজনক"
    assert data["is_hazard"] == True
    assert data["requires_staff_verification"] == True  # Hazard triggers safety hard-stop

@pytest.mark.asyncio
async def test_explainable_responsibility_and_officer_lookup(client: AsyncClient):
    resp = await client.post("/api/ai/analyze-intake", json={
        "raw_text_bn": "নর্দমা উপচে পানি রাস্তায় জমে রয়েছে।",
        "latitude": 22.3650,
        "longitude": 91.8200
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["recommended_department_code"] == "drain"
    assert "ওয়ার্ড" in data["responsibility_reason_bn"]
    assert data["assigned_officer_name_bn"] is not None
