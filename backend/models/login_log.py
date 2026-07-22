"""Login Log ORM model — audit trail for authentication events."""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from database import Base


class LoginLog(Base):
    __tablename__ = "login_logs"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=True)
    email      = Column(String(200))
    ip_address = Column(String(50))
    user_agent = Column(String(300))
    success    = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
