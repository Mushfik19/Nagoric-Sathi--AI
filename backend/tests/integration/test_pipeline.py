import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_health_and_observability(client: AsyncClient):
    res_health = await client.get("/health")
    assert res_health.status_code == 200
    assert res_health.json()["status"] == "healthy"

    res_ready = await client.get("/ready")
    assert res_ready.status_code == 200
    assert res_ready.json()["ready"] is True

    res_metrics = await client.get("/metrics")
    assert res_metrics.status_code == 200
