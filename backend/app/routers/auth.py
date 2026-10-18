from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User, UserRoleEnum, CitizenProfile, StaffProfile
from app.core.security import verify_password, get_password_hash, create_access_token, generate_mock_otp
from app.core.audit import AuditLogger
from app.schemas.auth import LoginRequest, OTPRequest, OTPVerifyRequest, TokenResponse, UserProfileResponse
from app.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
async def login_with_password(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where((User.phone == req.phone_or_email) | (User.email == req.phone_or_email))
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ভুল ইমেইল/ফোন নম্বর অথবা পাসওয়ার্ড।"
        )
        
    access_token = create_access_token(data={"sub": user.id, "role": user.role.value})
    
    await AuditLogger.log_event(
        db=db,
        actor_user_id=user.id,
        actor_role=user.role.value,
        action="USER_LOGIN_PASSWORD",
        resource_type="USER",
        resource_id=user.id,
        after_state={"role": user.role.value}
    )
    await db.commit()

    return TokenResponse(
        access_token=access_token,
        user_id=user.id,
        role=user.role,
        full_name=user.full_name,
        preferred_language=user.preferred_language
    )

@router.post("/otp-request")
async def request_otp(req: OTPRequest, db: AsyncSession = Depends(get_db)):
    mock_code = "123456"  # Deterministic test code for seamless demo and local testing
    return {
        "message_bn": f"{req.phone_or_email} নম্বরে একটি ওটিপি পাঠানো হয়েছে।",
        "mock_otp_code": mock_code,
        "is_simulated": True
    }

@router.post("/otp-verify", response_model=TokenResponse)
async def verify_otp(req: OTPVerifyRequest, db: AsyncSession = Depends(get_db)):
    # In mock/development mode, accept 123456 or 6 digits
    if req.otp_code != "123456" and len(req.otp_code) != 6:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="অকার্যকর ওটিপি কোড।")

    stmt = select(User).where((User.phone == req.phone_or_email) | (User.email == req.phone_or_email))
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if not user:
        # Create new citizen account
        user = User(
            phone=req.phone_or_email if "@" not in req.phone_or_email else None,
            email=req.phone_or_email if "@" in req.phone_or_email else None,
            full_name=req.full_name or "নাগরিক ব্যবহারকারী",
            role=req.role or UserRoleEnum.CITIZEN,
            is_active=True,
            is_verified=True,
            preferred_language="bn"
        )
        db.add(user)
        await db.flush()

        profile = CitizenProfile(user_id=user.id)
        db.add(profile)
        await db.flush()

    access_token = create_access_token(data={"sub": user.id, "role": user.role.value})
    
    await AuditLogger.log_event(
        db=db,
        actor_user_id=user.id,
        actor_role=user.role.value,
        action="USER_LOGIN_OTP",
        resource_type="USER",
        resource_id=user.id
    )
    await db.commit()

    return TokenResponse(
        access_token=access_token,
        user_id=user.id,
        role=user.role,
        full_name=user.full_name,
        preferred_language=user.preferred_language
    )

@router.get("/me", response_model=UserProfileResponse)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    scopes_data = []
    if current_user.scopes:
        for s in current_user.scopes:
            scopes_data.append({
                "ward_id": s.ward_id,
                "department_id": s.department_id,
                "zone_code": s.jurisdiction_zone
            })
            
    return UserProfileResponse(
        id=current_user.id,
        full_name=current_user.full_name,
        phone=current_user.phone,
        email=current_user.email,
        role=current_user.role,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        preferred_language=current_user.preferred_language,
        accessibility_mode=current_user.accessibility_mode or {},
        scopes=scopes_data
    )
