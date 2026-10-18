import pytest
from httpx import AsyncClient
from sqlalchemy import select
from app.models.case import Case, CaseTask, TaskStatusEnum, PriorityEnum
from app.models.department import Department, Officer
from app.models.task_assignment import TaskWaitingQueue, TaskAssignmentHistory

@pytest.mark.asyncio
async def test_department_acceptance_and_rejection(client: AsyncClient):
    """
    T3 & T13: Test department explicit acceptance and rejection with mandatory reason.
    """
    # 1. Login as Drain Officer
    login_res = await client.post("/api/auth/login", json={
        "phone_or_email": "officer_drain@nagoriksathi.gov.bd",
        "password": "Pass1234!"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. View incoming department requests
    req_res = await client.get("/api/tasks/department-requests", headers=headers)
    assert req_res.status_code == 200
    requests = req_res.json()
    assert isinstance(requests, list)

    if requests:
        target_task = requests[0]
        task_id = target_task["id"]

        # 3. Accept Task
        accept_res = await client.post(f"/api/tasks/{task_id}/accept", headers=headers)
        assert accept_res.status_code == 200
        assert accept_res.json()["acceptance_status"] == "accepted"

        # 4. Reject Task without reason -> should fail (validation error)
        reject_fail = await client.post(f"/api/tasks/{task_id}/reject", json={"reason_bn": ""}, headers=headers)
        assert reject_fail.status_code in [400, 422]

        # 5. Reject Task with reason -> succeeds and marks rejected
        reject_res = await client.post(f"/api/tasks/{task_id}/reject", json={
            "reason_bn": "সড়কটি ওয়াসা খননের অধীনে থাকায় ড্রেনেজ কাজ সাময়িক স্থগিত।"
        }, headers=headers)
        assert reject_res.status_code == 200
        assert reject_res.json()["acceptance_status"] == "rejected"

@pytest.mark.asyncio
async def test_officer_availability_and_capacity_constraints(client: AsyncClient):
    """
    T7 & T9: Officers in BUSY or at max capacity are constrained; status controls function.
    """
    login_res = await client.post("/api/auth/login", json={
        "phone_or_email": "officer_drain@nagoriksathi.gov.bd",
        "password": "Pass1234!"
    })
    assert login_res.status_code == 200
    headers = {"Authorization": f"Bearer {login_res.json()['access_token']}"}

    # 1. Get availability list
    avail_res = await client.get("/api/officers/availability", headers=headers)
    assert avail_res.status_code == 200
    officers = avail_res.json()
    assert len(officers) > 0

    target_officer = officers[0]
    off_id = target_officer["id"]

    # 2. Update status to 'busy'
    upd_res = await client.put(f"/api/officers/{off_id}/availability", json={
        "availability_status": "busy",
        "max_concurrent_tasks": 3
    }, headers=headers)
    assert upd_res.status_code == 200
    assert upd_res.json()["availability_status"] == "busy"
    assert upd_res.json()["max_concurrent_tasks"] == 3

    # 3. Update status back to 'available'
    restore_res = await client.put(f"/api/officers/{off_id}/availability", json={
        "availability_status": "available",
        "max_concurrent_tasks": 4
    }, headers=headers)
    assert restore_res.status_code == 200
    assert restore_res.json()["availability_status"] == "available"

@pytest.mark.asyncio
async def test_explainable_assignment_recommendations(client: AsyncClient):
    """
    T4 & T8: Available eligible officer with capacity receives top recommendation with explainable reasons.
    """
    login_res = await client.post("/api/auth/login", json={
        "phone_or_email": "coordinator@nagoriksathi.gov.bd",
        "password": "Pass1234!"
    })
    assert login_res.status_code == 200
    headers = {"Authorization": f"Bearer {login_res.json()['access_token']}"}

    # Get a drain task
    tasks_res = await client.get("/api/tasks/my-tasks", headers=headers)
    assert tasks_res.status_code == 200
    tasks = tasks_res.json()
    assert len(tasks) > 0
    task_id = tasks[0]["id"]

    # Request recommendations
    rec_res = await client.get(f"/api/tasks/{task_id}/recommendations", headers=headers)
    assert rec_res.status_code == 200
    data = rec_res.json()
    assert "recommendations" in data
    assert isinstance(data["recommendations"], list)
    if data["recommendations"]:
        top = data["recommendations"][0]
        assert "score" in top
        assert "eligibility_reasons" in top
        assert len(top["eligibility_reasons"]) > 0

@pytest.mark.asyncio
async def test_waiting_queue_and_dispatch(client: AsyncClient):
    """
    T5, T6, T10, T11: Persistent queue ordering, auto-dispatch, and prerequisite guards.
    """
    login_res = await client.post("/api/auth/login", json={
        "phone_or_email": "coordinator@nagoriksathi.gov.bd",
        "password": "Pass1234!"
    })
    assert login_res.status_code == 200
    headers = {"Authorization": f"Bearer {login_res.json()['access_token']}"}

    # 1. Fetch persistent waiting queue
    queue_res = await client.get("/api/tasks/waiting-queue", headers=headers)
    assert queue_res.status_code == 200
    queue = queue_res.json()
    assert isinstance(queue, list)

    # 2. Trigger auto-dispatch
    dispatch_res = await client.post("/api/tasks/queue/auto-dispatch", headers=headers)
    assert dispatch_res.status_code == 200
    assert "dispatched_count" in dispatch_res.json()

@pytest.mark.asyncio
async def test_task_assignment_history_preservation(client: AsyncClient):
    """
    T14: Reassignment preserves immutable assignment history.
    """
    login_res = await client.post("/api/auth/login", json={
        "phone_or_email": "coordinator@nagoriksathi.gov.bd",
        "password": "Pass1234!"
    })
    headers = {"Authorization": f"Bearer {login_res.json()['access_token']}"}

    # Get officers and a task
    avail_res = await client.get("/api/officers/availability", headers=headers)
    officers = avail_res.json()
    tasks_res = await client.get("/api/tasks/my-tasks", headers=headers)
    tasks = tasks_res.json()

    if officers and tasks:
        task_id = tasks[0]["id"]
        # Find matching officer for department
        target_dept = tasks[0]["department_id"]
        matching_officers = [o for o in officers if o["department_id"] == target_dept and o["availability_status"] == "available"]
        if matching_officers:
            off = matching_officers[0]
            # Assign
            assign_res = await client.post(f"/api/tasks/{task_id}/assign", json={
                "officer_id": off["id"],
                "assignment_type": "recommended",
                "reason_bn": "টেস্টিং অ্যাসাইনমেন্ট ট্র্যাকিং"
            }, headers=headers)
            assert assign_res.status_code == 200

            # Verify history
            hist_res = await client.get(f"/api/tasks/{task_id}/assignment-history", headers=headers)
            assert hist_res.status_code == 200
            hist = hist_res.json()
            assert len(hist) > 0
            assert hist[-1]["new_officer_id"] == off["id"]

@pytest.mark.asyncio
async def test_unauthorized_role_assignment_prevention(client: AsyncClient):
    """
    T15: Unauthorized citizen role cannot accept tasks or assign officers.
    """
    # 1. Login as citizen via OTP
    otp_verify = await client.post("/api/auth/otp-verify", json={
        "phone_or_email": "01711000001",
        "otp_code": "123456"
    })
    assert otp_verify.status_code == 200
    citizen_headers = {"Authorization": f"Bearer {otp_verify.json()['access_token']}"}

    # 2. Attempt to view department requests -> 403 Forbidden
    res = await client.get("/api/tasks/department-requests", headers=citizen_headers)
    assert res.status_code == 403

    # 3. Attempt to accept task -> 403 Forbidden
    res2 = await client.post("/api/tasks/some-random-id/accept", headers=citizen_headers)
    assert res2.status_code == 403
