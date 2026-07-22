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
    allow_origins=[settings.frontend_url, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(prediction.router)
app.include_router(dashboard.router)
app.include_router(profile.router)
app.include_router(admin.router)


# ── Lifecycle ─────────────────────────────────────────────────────────────────
@app.on_event("startup")
def on_startup():
    """Create DB tables on startup."""
    create_tables()
    print(f"✅  SmartLoan AI API started — {settings.environment}")


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
    return {"status": "healthy"}
