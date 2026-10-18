from app.database import Base
from app.models.base import BaseModel
from app.models.user import User, UserRoleEnum, UserScope, CitizenProfile, StaffProfile
from app.models.geography import Ward, Asset, AssetTypeEnum
from app.models.department import Department, Officer
from app.models.service import ServiceCatalog, ServiceDocument, ServiceDocumentChunk, ResponsibilityRule
from app.models.case import Case, CaseReport, CaseTask, TaskDependency, CaseStatusHistory, CasePriorityHistory, CaseStatusEnum, PriorityEnum, TaskStatusEnum
from app.models.evidence import CaseEvidence, EvidenceTypeEnum, CaseFeedback, CaseObjection
from app.models.ai import AIJob, AIJobStatusEnum, AIPrediction
from app.models.duplicate_hotspot import DuplicateCandidate, DuplicateLink, Hotspot
from app.models.sla import SLAPolicy, SLAEvent, SLAStepEnum
from app.models.notification import Consent, Notification, SMSMockLog
from app.models.audit import AuditLog
from app.models.task_assignment import TaskAssignmentHistory, TaskWaitingQueue
from app.models.system import SystemConfig, ApprovalRequest, ApprovalStatusEnum

__all__ = [
    "BaseModel",
    "User", "UserRoleEnum", "UserScope", "CitizenProfile", "StaffProfile",
    "Ward", "Asset", "AssetTypeEnum",
    "Department", "Officer",
    "ServiceCatalog", "ServiceDocument", "ServiceDocumentChunk", "ResponsibilityRule",
    "Case", "CaseReport", "CaseTask", "TaskDependency", "CaseStatusHistory", "CasePriorityHistory", "CaseStatusEnum", "PriorityEnum", "TaskStatusEnum",
    "TaskAssignmentHistory", "TaskWaitingQueue",
    "CaseEvidence", "EvidenceTypeEnum", "CaseFeedback", "CaseObjection",
    "AIJob", "AIJobStatusEnum", "AIPrediction",
    "DuplicateCandidate", "DuplicateLink", "Hotspot",
    "SLAPolicy", "SLAEvent", "SLAStepEnum",
    "Consent", "Notification", "SMSMockLog",
    "AuditLog",
    "SystemConfig", "ApprovalRequest", "ApprovalStatusEnum"
]
