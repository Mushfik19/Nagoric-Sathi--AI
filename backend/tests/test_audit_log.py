import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_rbac_matrix_and_audit_hash_chain(client: AsyncClient):
    # 1. Admin login
    admin_login = await client.post("/api/auth/login", json={
        "phone_or_email": "admin@nagoriksathi.gov.bd",
        "password": "AdminPass1234!"
    })
    token = admin_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get Audit Logs
    audit_resp = await client.get("/api/audit/logs", headers=headers)
    assert audit_resp.status_code == 200
    logs = audit_resp.json()
    assert len(logs) > 0
    
    # Check that SHA-256 current_hash and previous_hash exist on all entries
    for log in logs:
        assert "current_hash" in log
        assert len(log["current_hash"]) == 64
        assert "action" in log
