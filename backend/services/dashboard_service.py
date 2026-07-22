"""
SmartLoan AI - Dashboard Service
Aggregates prediction statistics for dashboard charts and KPIs.
"""

from collections import defaultdict
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from models.prediction import Prediction


def get_dashboard_data(db: Session, user_id: int) -> dict:
    """Compute all dashboard KPIs and chart data for a user."""

    preds = (
        db.query(Prediction)
        .filter(Prediction.user_id == user_id)
        .order_by(Prediction.created_at.desc())
        .all()
    )

    total = len(preds)
    approved = sum(1 for p in preds if p.status == "Approved")
    rejected = sum(1 for p in preds if p.status == "Rejected")
    review   = sum(1 for p in preds if p.status == "Review")
    avg_risk = round(sum(p.risk_score or 0 for p in preds) / max(total, 1), 1)
    avg_prob = round(sum(p.probability or 0 for p in preds) / max(total, 1), 1)
    approval_rate = round(approved / max(total, 1) * 100, 1)

    # Monthly breakdown (last 6 months)
    monthly: dict[str, dict] = defaultdict(lambda: {"total": 0, "approved": 0, "rejected": 0, "review": 0})
    for p in preds:
        key = p.created_at.strftime("%b %Y") if p.created_at else "Unknown"
        monthly[key]["total"] += 1
        monthly[key][p.status.lower()] += 1

    monthly_data = [
        {"month": k, **v}
        for k, v in list(monthly.items())[-6:]
    ]

    # Risk distribution
    low    = sum(1 for p in preds if p.risk_label == "Low")
    medium = sum(1 for p in preds if p.risk_label == "Medium")
    high   = sum(1 for p in preds if p.risk_label == "High")

    risk_distribution = [
        {"label": "Low Risk",    "value": low,    "percentage": round(low    / max(total, 1) * 100, 1)},
        {"label": "Medium Risk", "value": medium, "percentage": round(medium / max(total, 1) * 100, 1)},
        {"label": "High Risk",   "value": high,   "percentage": round(high   / max(total, 1) * 100, 1)},
    ]

    # Recent predictions (5)
    recent = [
        {
            "id": p.id,
            "loan_amount": p.loan_amount,
            "credit_score": p.credit_score,
            "status": p.status,
            "risk_label": p.risk_label,
            "probability": p.probability,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        }
        for p in preds[:5]
    ]

    # Model metrics (from JSON file if available)
    model_metrics = _get_model_metrics()

    return {
        "stats": {
            "total_predictions": total,
            "approved": approved,
            "rejected": rejected,
            "review": review,
            "avg_risk_score": avg_risk,
            "avg_probability": avg_prob,
            "approval_rate": approval_rate,
        },
        "monthly_data": monthly_data,
        "risk_distribution": risk_distribution,
        "recent_predictions": recent,
        "model_metrics": model_metrics,
    }


def _get_model_metrics() -> dict:
    import json
    from pathlib import Path
    metrics_path = Path(__file__).parent.parent.parent / "model" / "metrics.json"
    if metrics_path.exists():
        with open(metrics_path) as f:
            return json.load(f)
    return {}
