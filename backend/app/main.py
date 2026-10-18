from fastapi import FastAPI, Depends, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from prometheus_client import make_asgi_app, Counter, Histogram
import time
import os

from app.config import settings
from app.database import Base, async_engine
from app.seeds.seed_data import seed_all
from app.routers import (
    auth, cases, tasks, evidence, ai,
    duplicates, hotspots, services, knowledge,
    officers, departments, wards, assets,
    notifications, audit, admin, public, open311
)

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # In development, auto-create tables and run seed if needed
    try:
        async with async_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        await seed_all()
    except Exception as e:
        print(f"Startup DB init warning: {e}")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="Nagorik Sathi AI — An AI-Assisted Civic Service and Multi-Department Case Coordination Platform for City Corporations (R&D v1.2)",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prometheus Metrics
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from starlette.responses import Response

@app.get("/metrics", tags=["Health & Observability"])
async def metrics_endpoint():
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)


# Include All Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(cases.router, prefix=settings.API_V1_STR)
app.include_router(tasks.router, prefix=settings.API_V1_STR)
app.include_router(evidence.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)
app.include_router(duplicates.router, prefix=settings.API_V1_STR)
app.include_router(hotspots.router, prefix=settings.API_V1_STR)
app.include_router(services.router, prefix=settings.API_V1_STR)
app.include_router(knowledge.router, prefix=settings.API_V1_STR)
app.include_router(officers.router, prefix=settings.API_V1_STR)
app.include_router(departments.router, prefix=settings.API_V1_STR)
app.include_router(wards.router, prefix=settings.API_V1_STR)
app.include_router(assets.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(audit.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(public.router, prefix=settings.API_V1_STR)
app.include_router(open311.router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["Health & Observability"])
async def health_check():
    return {"status": "healthy", "service": settings.PROJECT_NAME, "version": settings.PROJECT_VERSION}

@app.get("/ready", tags=["Health & Observability"])
async def readiness_check():
    return {"ready": True, "environment": settings.ENVIRONMENT}

@app.get("/")
async def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "description": "নাগরিক সাথী এআই — সিটি কর্পোরেশনের বহু-বিভাগীয় নাগরিক সেবা ও সমন্বয় প্ল্যাটফর্ম",
        "docs": "/docs",
        "api_v1": settings.API_V1_STR
    }
