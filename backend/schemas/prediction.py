"""Prediction schemas — request/response models for ML prediction endpoints."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator


class PredictionRequest(BaseModel):
    age: int
    income: int
    employment_type: str
    credit_score: int
    loan_amount: int
    existing_emi: int
    loan_term: int = 36
    years_of_experience: int
    marital_status: str
    education: str
    dependents: int

    @field_validator("age")
    @classmethod
    def validate_age(cls, v: int) -> int:
        if not (18 <= v <= 80):
            raise ValueError("Age must be between 18 and 80")
        return v

    @field_validator("credit_score")
    @classmethod
    def validate_credit(cls, v: int) -> int:
        if not (300 <= v <= 850):
            raise ValueError("Credit score must be between 300 and 850")
        return v

    @field_validator("income", "loan_amount")
    @classmethod
    def positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("Value must be positive")
        return v


class DerivedFeatures(BaseModel):
    debt_to_income: float
    loan_to_income: float
    emi_to_income: float


class PredictionResult(BaseModel):
    probability: float
    risk_score: float
    risk_label: str
    status: str
    confidence: float
    reasons: list[str]
    suggestions: list[str]
    feature_importance: dict[str, float]
    derived_features: DerivedFeatures


class PredictionResponse(BaseModel):
    id: int
    result: PredictionResult
    created_at: datetime

    model_config = {"from_attributes": True}


class PredictionHistoryItem(BaseModel):
    id: int
    loan_amount: int
    income: int
    credit_score: int
    probability: float
    risk_label: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class PaginatedHistory(BaseModel):
    items: list[PredictionHistoryItem]
    total: int
    page: int
    per_page: int
    pages: int
