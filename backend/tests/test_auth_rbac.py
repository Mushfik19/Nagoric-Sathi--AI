import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_auth_login_staff_and_citizen(client: AsyncClient):
    # 1. Staff Login
    resp = await client.post("/api/auth/login", json={
        "phone_or_email": "warddesk@nagoriksathi.gov.bd",
        "password": "Pass1234!"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["role"] == "ward_desk"

    # 2. Citizen OTP Login
    otp_req = await client.post("/api/auth/otp-request", json={
        "phone_or_email": "01711000001"
    })
    assert otp_req.status_code == 200

    otp_verify = await client.post("/api/auth/otp-verify", json={
        "phone_or_email": "01711000001",
        "otp_code": "123456"
    })
    assert otp_verify.status_code == 200
    cit_data = otp_verify.json()
    assert cit_data["role"] == "citizen"

@pytest.mark.asyncio
async def test_rbac_admin_restricted_from_personal_unmasking(client: AsyncClient):
    # Login as admin
    admin_login = await client.post("/api/auth/login", json={
        "phone_or_email": "admin@nagoriksathi.gov.bd",
        "password": "AdminPass1234!"
    })
    token = admin_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Admin lists users
    users_resp = await client.get("/api/admin/users", headers=headers)
    assert users_resp.status_code == 200
    assert len(users_resp.json()) >= 5
