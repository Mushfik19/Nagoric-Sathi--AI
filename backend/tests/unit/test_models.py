import pytest
from app.models.case import CaseStatusEnum, PriorityEnum, TaskStatusEnum
from app.models.sla import SLAStepEnum

def test_enums_integrity():
    assert CaseStatusEnum.SUBMITTED.value == "submitted"
    assert CaseStatusEnum.IN_PROGRESS.value == "in_progress"
    assert CaseStatusEnum.CLOSED.value == "closed"
    assert PriorityEnum.EMERGENCY.value == "emergency"
    assert TaskStatusEnum.WAITING_PREREQUISITE.value == "waiting_prerequisite"
    assert SLAStepEnum.EMERGENCY_ALERT.value == "emergency_alert"
