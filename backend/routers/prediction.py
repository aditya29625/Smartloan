"""
Prediction Router — POST /predict, GET /history, GET /history/{id}, GET /history/export
"""

import io
import csv
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from database import get_db
from middleware.auth import get_current_user
from models.user import User
from models.prediction import Prediction
from schemas.prediction import (
    PredictionRequest, PredictionResponse, PaginatedHistory, PredictionHistoryItem
)
from services import prediction_service

router = APIRouter(prefix="/predictions", tags=["Predictions"])


@router.post("/predict", response_model=dict, status_code=status.HTTP_201_CREATED)
def predict(
    req: PredictionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Run AI prediction for a loan application."""
    pred, result = prediction_service.run_prediction(db, current_user.id, req)
    return {
        "id": pred.id,
        "result": result,
        "created_at": pred.created_at.isoformat(),
    }


@router.get("/history", response_model=PaginatedHistory)
def get_history(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    status_filter: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get paginated prediction history for the current user."""
    data = prediction_service.get_history(
        db, current_user.id, page, per_page, status_filter=status_filter
    )
    data["items"] = [PredictionHistoryItem.model_validate(p) for p in data["items"]]
    return data


@router.get("/history/{prediction_id}")
def get_single(
    prediction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a single prediction by ID."""
    pred = db.query(Prediction).filter(
        Prediction.id == prediction_id,
        Prediction.user_id == current_user.id,
    ).first()
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction not found")
    return {
        "id": pred.id,
        "inputs": {
            "age": pred.age, "income": pred.income,
            "employment_type": pred.employment_type,
            "credit_score": pred.credit_score, "loan_amount": pred.loan_amount,
            "existing_emi": pred.existing_emi, "loan_term": pred.loan_term,
            "years_of_experience": pred.years_of_experience,
            "marital_status": pred.marital_status, "education": pred.education,
            "dependents": pred.dependents,
        },
        "result": {
            "probability": pred.probability, "risk_score": pred.risk_score,
            "risk_label": pred.risk_label, "status": pred.status,
            "confidence": pred.confidence, "reasons": pred.reasons,
            "suggestions": pred.suggestions,
            "feature_importance": pred.feature_importance,
        },
        "created_at": pred.created_at.isoformat() if pred.created_at else None,
    }


@router.get("/history/export/csv")
def export_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Export prediction history as CSV (Excel-compatible)."""
    preds = (
        db.query(Prediction)
        .filter(Prediction.user_id == current_user.id)
        .order_by(Prediction.created_at.desc())
        .all()
    )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "Date", "Age", "Income", "Credit Score", "Loan Amount",
        "Employment", "Education", "Status", "Risk", "Probability (%)", "Confidence (%)"
    ])
    for p in preds:
        writer.writerow([
            p.id,
            p.created_at.strftime("%Y-%m-%d %H:%M") if p.created_at else "",
            p.age, p.income, p.credit_score, p.loan_amount,
            p.employment_type, p.education,
            p.status, p.risk_label,
            p.probability, p.confidence,
        ])

    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8-sig")),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=predictions.csv"},
    )
