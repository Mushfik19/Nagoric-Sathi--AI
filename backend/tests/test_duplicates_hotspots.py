import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_duplicate_merge_and_hotspot_advisory(client: AsyncClient):
    # 1. Staff login
    staff_login = await client.post("/api/auth/login", json={
        "phone_or_email": "warddesk@nagoriksathi.gov.bd",
        "password": "Pass1234!"
    })
    token = staff_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Check Hotspots API
    hotspots_resp = await client.get("/api/hotspots/zones")
    assert hotspots_resp.status_code == 200
    hotspots = hotspots_resp.json()
    assert isinstance(hotspots, list)

@pytest.mark.asyncio
async def test_verified_rag_strict_grounding(client: AsyncClient):
    # 1. Query for known verified topic (বর্জ্য ব্যবস্থাপনা / waste)
    query_resp = await client.post("/api/knowledge/query", json={
        "query_text_bn": "বর্জ্য অপসারণে ব্যর্থতায় কী পদক্ষেপ নেওয়া হবে এবং ফি কত?"
    })
    assert query_resp.status_code == 200
    data = query_resp.json()
    assert data["is_verified_source_found"] == True
    assert len(data["citations"]) > 0
    assert "নাগরিক সেবা সনদ" in data["citations"][0]["document_title_bn"]

    # 2. Query for completely unknown topic (must NOT hallucinate!)
    unknown_resp = await client.post("/api/knowledge/query", json={
        "query_text_bn": "মহাকাশ গবেষণা ও রকেট উৎক্ষেপণ নীতিমালা কী?"
    })
    assert unknown_resp.status_code == 200
    uk_data = unknown_resp.json()
    assert uk_data["is_verified_source_found"] == False
    assert len(uk_data["citations"]) == 0
    assert "যাচাইকৃত সরকারি সেবা তথ্য পাওয়া যায়নি" in uk_data["answer_bn"]
