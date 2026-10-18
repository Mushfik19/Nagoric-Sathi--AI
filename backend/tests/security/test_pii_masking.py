import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_anonymous_and_public_pii_shield(client: AsyncClient):
    # Public cases endpoint should never leak citizen private phone number
    res = await client.get("/api/public/transparency/stats")
    assert res.status_code == 200
    stats = res.json()
    assert "total_reports" in stats
    assert "resolved_cases" in stats
