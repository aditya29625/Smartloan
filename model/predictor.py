"""
SmartLoan AI - Inference Engine
Loads trained artifacts and produces rich predictions with explanations.
"""

import json
from pathlib import Path
from typing import Any

import joblib
import numpy as np

ROOT = Path(__file__).parent

# ── Lazy-loaded singletons ─────────────────────────────────────────────────────
_model = None
_scaler = None
_encoders = None
_feature_cols = None
_feature_importance = None


def _load_artifacts():
    global _model, _scaler, _encoders, _feature_cols, _feature_importance
    if _model is None:
        _model = joblib.load(ROOT / "model.pkl")
        _scaler = joblib.load(ROOT / "scaler.pkl")
        _encoders = joblib.load(ROOT / "encoders.pkl")
        _feature_cols = joblib.load(ROOT / "feature_cols.pkl")
        fi_path = ROOT / "feature_importance.json"
        if fi_path.exists():
            with open(fi_path) as f:
                _feature_importance = json.load(f)


CATEGORICAL_COLS = ["employment_type", "marital_status", "education"]
NUMERICAL_COLS = [
    "age", "income", "credit_score", "loan_amount", "existing_emi",
    "loan_term", "years_of_experience", "dependents",
    "debt_to_income", "loan_to_income", "emi_to_income",
]


def _derive_features(data: dict) -> dict:
    """Compute derived ratio features from raw inputs."""
    income = max(data.get("income", 1), 1)
    existing_emi = data.get("existing_emi", 0)
    loan_amount = data.get("loan_amount", 0)

    data["debt_to_income"] = round((existing_emi * 12) / income, 4)
    data["loan_to_income"] = round(loan_amount / income, 4)
    data["emi_to_income"] = round(existing_emi / max(income / 12, 1), 4)
    data["loan_term"] = data.get("loan_term", 36)
    return data


def _build_reasons(data: dict, prob: float) -> tuple[list[str], list[str]]:
    """Rule-based reasoning for the prediction result."""
    reasons = []
    suggestions = []

    credit_score = data.get("credit_score", 650)
    existing_emi = data.get("existing_emi", 0)
    income = max(data.get("income", 1), 1)
    loan_amount = data.get("loan_amount", 0)
    employment_type = data.get("employment_type", "")
    emi_ratio = existing_emi / max(income / 12, 1)

    if credit_score < 580:
        reasons.append("Very low credit score (below 580)")
        suggestions.append("Work on improving your credit score to at least 700")
    elif credit_score < 650:
        reasons.append("Below-average credit score")
        suggestions.append("Increase credit score by paying bills on time for 6+ months")

    if emi_ratio > 0.5:
        reasons.append("High existing EMI burden (>50% of monthly income)")
        suggestions.append("Reduce existing debt obligations before applying")
    elif emi_ratio > 0.35:
        reasons.append("Moderate EMI burden")
        suggestions.append("Try to close at least one existing loan first")

    if loan_amount > income * 5:
        reasons.append("Loan amount is very high relative to income")
        suggestions.append("Consider a smaller loan amount or longer tenure")

    if employment_type == "Unemployed":
        reasons.append("Currently unemployed — high income risk")
        suggestions.append("Secure stable employment before applying")
    elif employment_type == "Freelancer":
        reasons.append("Freelance income is considered irregular")
        suggestions.append("Provide 2+ years of consistent income proof")

    if not reasons:
        if prob < 0.3:
            reasons.append("Strong financial profile")
            suggestions.append("Maintain your current financial discipline")
        else:
            reasons.append("Moderate risk indicators detected")
            suggestions.append("Review your financial commitments before applying")

    return reasons[:4], suggestions[:4]


def predict(input_data: dict) -> dict[str, Any]:
    """
    Run prediction on a single applicant's data.

    Args:
        input_data: dict with keys matching the feature schema

    Returns:
        dict with probability, risk_score, status, reasons, suggestions, confidence
    """
    _load_artifacts()

    data = _derive_features(dict(input_data))

    # Encode categoricals
    for col in CATEGORICAL_COLS:
        le = _encoders.get(col)
        raw_val = str(data.get(col, ""))
        if le and raw_val in le.classes_:
            data[f"{col}_encoded"] = int(le.transform([raw_val])[0])
        else:
            data[f"{col}_encoded"] = 0

    # Build feature vector
    feat_vector = np.array([[data.get(f, 0) for f in _feature_cols]])
    feat_scaled = _scaler.transform(feat_vector)

    # Prediction
    prob = float(_model.predict_proba(feat_scaled)[0][1])
    pred_class = int(_model.predict(feat_scaled)[0])

    # Risk score: 0–100 (higher = riskier)
    risk_score = round(prob * 100, 1)

    # Confidence: distance from decision boundary (0.5)
    confidence = round(abs(prob - 0.5) * 2 * 100, 1)

    # Approval status
    if prob < 0.35:
        status = "Approved"
        risk_label = "Low"
    elif prob < 0.60:
        status = "Review"
        risk_label = "Medium"
    else:
        status = "Rejected"
        risk_label = "High"

    reasons, suggestions = _build_reasons(data, prob)

    # Feature importance for this prediction
    feature_importance = {}
    if _feature_importance:
        top_features = list(_feature_importance.items())[:8]
        feature_importance = {k: round(v * 100, 2) for k, v in top_features}

    return {
        "probability": round(prob * 100, 2),
        "risk_score": risk_score,
        "risk_label": risk_label,
        "status": status,
        "confidence": confidence,
        "reasons": reasons,
        "suggestions": suggestions,
        "feature_importance": feature_importance,
        "derived_features": {
            "debt_to_income": round(data["debt_to_income"] * 100, 1),
            "loan_to_income": round(data["loan_to_income"], 2),
            "emi_to_income": round(data["emi_to_income"] * 100, 1),
        },
    }


def predict_batch(records: list[dict]) -> list[dict]:
    """Predict for multiple applicants (CSV upload)."""
    return [predict(r) for r in records]


def get_model_metrics() -> dict:
    """Return saved model comparison metrics."""
    metrics_path = ROOT / "metrics.json"
    if metrics_path.exists():
        with open(metrics_path) as f:
            return json.load(f)
    return {}
