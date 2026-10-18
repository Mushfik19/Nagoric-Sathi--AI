"""
Module 9: Identity, Consent & Five-Role RBAC (R&D Section 11).
Citizen passwordless OTP, staff authentication, role scoping, and PII protection.
"""
from app.core.security import create_access_token, verify_password, get_password_hash
from app.core.rbac import check_role_permission, UserRoleEnum
from app.models.user import User, UserScope, CitizenProfile, StaffProfile

__all__ = ["create_access_token", "verify_password", "get_password_hash", "check_role_permission", "UserRoleEnum", "User", "UserScope", "CitizenProfile", "StaffProfile"]
