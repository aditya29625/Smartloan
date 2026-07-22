"""
Admin Router — Admin-only endpoints for managing users and predictions.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from middleware.auth import get_admin_user
from models.user import User
from models.prediction import Prediction

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users")
def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    """List all registered users."""
    users = db.query(User).all()
    return [
        {
            "id": u.id, "full_name": u.full_name, "email": u.email,
            "is_active": u.is_active, "is_admin": u.is_admin,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        }
        for u in users
    ]


@router.get("/predictions")
def list_all_predictions(
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    """List all predictions across all users."""
    preds = db.query(Prediction).order_by(Prediction.created_at.desc()).limit(200).all()
    return [
        {
            "id": p.id, "user_id": p.user_id,
            "loan_amount": p.loan_amount, "credit_score": p.credit_score,
            "status": p.status, "risk_label": p.risk_label,
            "probability": p.probability,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        }
        for p in preds
    ]


@router.delete("/predictions/{prediction_id}")
def delete_prediction(
    prediction_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    """Delete a prediction record (admin only)."""
    pred = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not pred:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(pred)
    db.commit()
    return {"message": f"Prediction {prediction_id} deleted"}


@router.get("/analytics")
def analytics(
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    """Platform-wide analytics."""
    total_users = db.query(User).count()
    total_preds = db.query(Prediction).count()
    approved = db.query(Prediction).filter(Prediction.status == "Approved").count()
    rejected = db.query(Prediction).filter(Prediction.status == "Rejected").count()

    return {
        "total_users": total_users,
        "total_predictions": total_preds,
        "approved": approved,
        "rejected": rejected,
        "approval_rate": round(approved / max(total_preds, 1) * 100, 1),
    }
