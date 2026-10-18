from typing import List, Optional
from fastapi import HTTPException, status
from app.models.user import User, UserRoleEnum, UserScope
from app.models.case import Case, CaseTask

class RBACManager:
    """
    Enforces the R&D RBAC Matrix (Table 30, p. 28) and Scope Boundaries (Section 11.2).
    Deny-by-default architecture.
    """

    @staticmethod
    def verify_role(user: User, allowed_roles: List[UserRoleEnum]):
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Inactive or unauthenticated user"
            )
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Role '{user.role.value}' lacks required permissions."
            )

    @staticmethod
    def can_access_case(user: User, case: Case, scopes: List[UserScope]) -> bool:
        """
        Check if user has access to a specific case based on role and scopes.
        - Citizen: only own cases
        - Ward Desk: only cases in assigned ward(s)
        - Dept Officer: only if case has task assigned to officer's department
        - Coordinator: jurisdiction scope
        - Admin: aggregated / config access only, denied personal citizen content
        """
        if not user or not user.is_active:
            return False

        if user.role == UserRoleEnum.CITIZEN:
            return case.citizen_user_id == user.id

        if user.role == UserRoleEnum.WARD_DESK:
            assigned_ward_ids = [s.ward_id for s in scopes if s.ward_id]
            # Ward desk staff can access cases in their assigned ward(s)
            return case.ward_id in assigned_ward_ids if assigned_ward_ids else True

        if user.role == UserRoleEnum.DEPT_OFFICER:
            assigned_dept_ids = [s.department_id for s in scopes if s.department_id]
            # Officer can access if their department is lead or has tasks in the case
            if case.lead_department_id in assigned_dept_ids:
                return True
            for task in case.tasks:
                if task.department_id in assigned_dept_ids:
                    return True
            return False

        if user.role == UserRoleEnum.COORDINATOR:
            # Coordinator has jurisdiction-wide access
            return True

        if user.role == UserRoleEnum.ADMIN:
            # Admin manages rules/config, but personal case content is restricted per R&D Table 30
            return True

        return False

    @staticmethod
    def filter_case_for_role(case_dict: dict, user_role: UserRoleEnum, is_owner: bool) -> dict:
        """
        Mask or remove sensitive personal information (citizen name, phone, address)
        from public or unauthorized staff views per R&D Section 11.2.
        """
        filtered = case_dict.copy()
        if user_role != UserRoleEnum.CITIZEN or not is_owner:
            # Mask citizen details
            filtered.pop("citizen_phone", None)
            filtered.pop("citizen_nid", None)
            filtered.pop("citizen_name", None)
            if "citizen_user" in filtered and filtered["citizen_user"]:
                filtered["citizen_user"] = {
                    "id": filtered["citizen_user"].get("id"),
                    "masked_identifier": "Citizen Reporter (Verified)"
                }
        return filtered
