from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List, Dict, Any
from app.models.user import UserRoleEnum

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    role: UserRoleEnum
    full_name: str
    preferred_language: str = "bn"
    requires_mfa: bool = False

class LoginRequest(BaseModel):
    phone_or_email: str
    password: Optional[str] = None

class OTPRequest(BaseModel):
    phone_or_email: str
    purpose: str = "login"

class OTPVerifyRequest(BaseModel):
    phone_or_email: str
    otp_code: str
    full_name: Optional[str] = None
    role: Optional[UserRoleEnum] = UserRoleEnum.CITIZEN

class UserProfileResponse(BaseModel):
    id: str
    full_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    role: UserRoleEnum
    is_active: bool
    is_verified: bool
    preferred_language: str
    accessibility_mode: Dict[str, Any]
    scopes: List[Dict[str, Any]] = []
    
    model_config = ConfigDict(from_attributes=True)
