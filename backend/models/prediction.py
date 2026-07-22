"""Prediction ORM model."""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, JSON, ForeignKey
from database import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id               = Column(Integer, primary_key=True, index=True)
    user_id          = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Input features
    age              = Column(Integer)
    income           = Column(Integer)
    employment_type  = Column(String(50))
    credit_score     = Column(Integer)
    loan_amount      = Column(Integer)
    existing_emi     = Column(Integer)
    loan_term        = Column(Integer)
    years_of_experience = Column(Integer)
    marital_status   = Column(String(30))
    education        = Column(String(50))
    dependents       = Column(Integer)

    # Results
    probability      = Column(Float)
    risk_score       = Column(Float)
    risk_label       = Column(String(20))
    status           = Column(String(20))   # Approved / Review / Rejected
    confidence       = Column(Float)
    reasons          = Column(JSON)
    suggestions      = Column(JSON)
    feature_importance = Column(JSON)

    created_at       = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    def __repr__(self) -> str:
        return f"<Prediction id={self.id} status={self.status} prob={self.probability}>"
