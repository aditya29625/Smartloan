"""
Profile Router — GET /profile, PUT /profile
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from middleware.auth import get_current_user
from models.user import User
from models.prediction import Prediction

router = APIRouter(prefix="/profile", tags=["Profile"])


class ProfileUpdateRequest(BaseModel):
    full_name: str


@router.get("")
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the authenticated user's profile with prediction summary."""
    total = db.query(Prediction).filter(Prediction.user_id == current_user.id).count()
    approved = db.query(Prediction).filter(
        Prediction.user_id == current_user.id,
        Prediction.status == "Approved"
    ).count()

    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "is_admin": current_user.is_admin,
        "member_since": current_user.created_at.isoformat() if current_user.created_at else None,
        "stats": {
            "total_predictions": total,
            "approved_predictions": approved,
            "approval_rate": round(approved / max(total, 1) * 100, 1),
        },
    }


@router.put("")
def update_profile(
    body: ProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update the user's display name."""
    if not body.full_name.strip():
        raise HTTPException(status_code=400, detail="Name cannot be empty")
    current_user.full_name = body.full_name.strip()
    db.commit()
    db.refresh(current_user)
    return {"message": "Profile updated", "full_name": current_user.full_name}
