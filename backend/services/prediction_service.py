"""
SmartLoan AI - Prediction Service
Orchestrates ML inference and persists results to the database.
"""

import sys
from pathlib import Path
from typing import Optional
from sqlalchemy.orm import Session

# Add model directory to path
MODEL_DIR = Path(__file__).parent.parent.parent / "model"
sys.path.insert(0, str(MODEL_DIR))

from models.prediction import Prediction
from schemas.prediction import PredictionRequest


def run_prediction(db: Session, user_id: int, req: PredictionRequest) -> Prediction:
    """Run ML prediction and persist to DB."""
    try:
        from predictor import predict  # type: ignore
        result = predict(req.model_dump())
    except Exception as e:
        # Fallback mock result if model not trained yet
        result = _mock_result(req)

    pred = Prediction(
        user_id=user_id,
        # input features
        age=req.age,
        income=req.income,
        employment_type=req.employment_type,
        credit_score=req.credit_score,
        loan_amount=req.loan_amount,
        existing_emi=req.existing_emi,
        loan_term=req.loan_term,
        years_of_experience=req.years_of_experience,
        marital_status=req.marital_status,
        education=req.education,
        dependents=req.dependents,
        # results
        probability=result["probability"],
        risk_score=result["risk_score"],
        risk_label=result["risk_label"],
        status=result["status"],
        confidence=result["confidence"],
        reasons=result["reasons"],
        suggestions=result["suggestions"],
        feature_importance=result.get("feature_importance", {}),
    )
    db.add(pred)
    db.commit()
    db.refresh(pred)
    return pred, result


def get_history(
    db: Session,
    user_id: int,
    page: int = 1,
    per_page: int = 10,
    search: Optional[str] = None,
    status_filter: Optional[str] = None,
) -> dict:
    query = db.query(Prediction).filter(Prediction.user_id == user_id)

    if status_filter:
        query = query.filter(Prediction.status == status_filter)

    total = query.count()
    items = (
        query.order_by(Prediction.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )

    import math
    return {
        "items": items,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": max(1, math.ceil(total / per_page)),
    }


def _mock_result(req: PredictionRequest) -> dict:
    """Fallback result when model.pkl is not available (dev mode)."""
    score = req.credit_score
    emi_ratio = req.existing_emi / max(req.income / 12, 1)
    prob = max(0.05, min(0.95, (750 - score) / 750 * 0.6 + emi_ratio * 0.4))

    if prob < 0.35:
        status, risk = "Approved", "Low"
    elif prob < 0.60:
        status, risk = "Review", "Medium"
    else:
        status, risk = "Rejected", "High"

    return {
        "probability": round(prob * 100, 2),
        "risk_score": round(prob * 100, 1),
        "risk_label": risk,
        "status": status,
        "confidence": round(abs(prob - 0.5) * 200, 1),
        "reasons": ["Based on credit score and EMI ratio analysis"],
        "suggestions": ["Improve credit score", "Reduce existing EMIs"],
        "feature_importance": {
            "credit_score": 35.0, "income": 20.0, "loan_amount": 15.0,
            "existing_emi": 12.0, "age": 8.0, "years_of_experience": 10.0
        },
        "derived_features": {
            "debt_to_income": round(req.existing_emi * 12 / max(req.income, 1) * 100, 1),
            "loan_to_income": round(req.loan_amount / max(req.income, 1), 2),
            "emi_to_income": round(emi_ratio * 100, 1),
        },
    }
