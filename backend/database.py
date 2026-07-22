"""
SmartLoan AI - Database Engine & Session
Supports SQLite (dev) and PostgreSQL (production).
"""

from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from config import get_settings

settings = get_settings()

# SQLite needs check_same_thread=False
connect_args = {}
if settings.database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.database_url,
    connect_args=connect_args,
    echo=settings.debug,
)

# Enable WAL mode for SQLite concurrency
if settings.database_url.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def _set_wal(dbapi_con, _):
        dbapi_con.execute("PRAGMA journal_mode=WAL")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """FastAPI dependency that yields a DB session and closes it after use."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Create all tables defined in ORM models."""
    # Import models so Base knows about them
    from models import user, prediction, login_log  # noqa: F401
    Base.metadata.create_all(bind=engine)
