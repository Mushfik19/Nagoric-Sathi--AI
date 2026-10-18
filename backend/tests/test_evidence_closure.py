import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_evidence_and_citizen_objection_reopen(client: AsyncClient):
    # 1. Citizen login
    cit_verify = await client.post("/api/auth/otp-verify", json={
        "phone_or_email": "01711000001",
        "otp_code": "123456"
    })
    token = cit_verify.json()["access_token"]
    cit_headers = {"Authorization": f"Bearer {token}"}

    # Fetch initial demo case
    cases_resp = await client.get("/api/cases", headers=cit_headers)
    assert cases_resp.status_code == 200
    cases = cases_resp.json()
    assert len(cases) > 0
    demo_case_id = cases[0]["id"]

    # 2. Get Before/After Evidence Pair
    ba_resp = await client.get(f"/api/evidence/before-after/{demo_case_id}")
    assert ba_resp.status_code == 200
    ba_data = ba_resp.json()
    assert len(ba_data["pairs"]) > 0

    # 3. Citizen submits Objection ("সমাধান হয়নি")
    obj_resp = await client.post("/api/evidence/submit-objection", json={
        "case_id": demo_case_id,
        "objection_reason_bn": "ড্রেন পুরোপুরি পরিষ্কার হয়নি, আবার পানি জমছে।",
        "attached_evidence_url": "https://example.com/objection_proof.jpg"
    }, headers=cit_headers)
    assert obj_resp.status_code == 200
    assert obj_resp.json()["case_status"] == "re_opened"

    # 4. Verify case status is updated to RE_OPENED
    c_detail = (await client.get(f"/api/cases/{demo_case_id}", headers=cit_headers)).json()
    assert c_detail["status"] == "re_opened"
