import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_open311_service_discovery(client: AsyncClient):
    response = await client.get("/api/open311/v2/services.json")
    assert response.status_code == 200
    services = response.json()
    assert isinstance(services, list)
    assert len(services) > 0
    first_service = services[0]
    assert "service_code" in first_service
    assert "service_name" in first_service
    assert "description" in first_service
    assert first_service["type"] == "realtime"

@pytest.mark.asyncio
async def test_open311_service_requests(client: AsyncClient):
    response = await client.get("/api/open311/v2/requests.json")
    assert response.status_code == 200
    requests = response.json()
    assert isinstance(requests, list)
    if len(requests) > 0:
        req = requests[0]
        assert "service_request_id" in req
        assert "status" in req
        assert req["status"] in ["open", "closed"]
        assert "lat" in req
        assert "long" in req
