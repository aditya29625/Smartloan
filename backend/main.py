"""
SmartLoan AI - FastAPI Application Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from database import create_tables
from routers import auth, prediction, dashboard, profile, admin

settings = get_settings()

app = FastAPI(
    title="SmartLoan AI API",
    description="AI-Powered Loan Default Prediction Platform",
    version=settings.app_version,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,   # Must be False when allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

import os
from pathlib import Path

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(prediction.router)
app.include_router(dashboard.router)
app.include_router(profile.router)
app.include_router(admin.router)


# ── Health & Root ─────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy", "environment": settings.environment}


# ── Lifecycle ─────────────────────────────────────────────────────────────────
@app.on_event("startup")
def on_startup():
    """Create DB tables on startup."""
    create_tables()
    print(f"✅  SmartLoan AI API started — {settings.environment}")


# ── Mount Frontend (local dev only — Vercel handles static files separately) ──
if not os.environ.get("VERCEL"):
    from fastapi.staticfiles import StaticFiles
    FRONTEND_DIST = Path(__file__).parent.parent / "frontend" / "dist"
    if FRONTEND_DIST.exists():
        app.mount("/", StaticFiles(directory=str(FRONTEND_DIST), html=True), name="frontend")
