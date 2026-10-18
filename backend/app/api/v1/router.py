from fastapi import APIRouter
from app.routers import (
    auth, cases, tasks, evidence, ai,
    duplicates, hotspots, services, knowledge,
    officers, departments, wards, assets,
    notifications, audit, admin, public, open311
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(cases.router)
api_router.include_router(tasks.router)
api_router.include_router(evidence.router)
api_router.include_router(ai.router)
api_router.include_router(duplicates.router)
api_router.include_router(hotspots.router)
api_router.include_router(services.router)
api_router.include_router(knowledge.router)
api_router.include_router(officers.router)
api_router.include_router(departments.router)
api_router.include_router(wards.router)
api_router.include_router(assets.router)
api_router.include_router(notifications.router)
api_router.include_router(audit.router)
api_router.include_router(admin.router)
api_router.include_router(public.router)
api_router.include_router(open311.router)
