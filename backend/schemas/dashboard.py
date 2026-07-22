"""Dashboard schemas — aggregated statistics and chart data."""

from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_predictions: int
    approved: int
    rejected: int
    review: int
    avg_risk_score: float
    avg_probability: float
    approval_rate: float


class MonthlyDataPoint(BaseModel):
    month: str
    total: int
    approved: int
    rejected: int
    review: int


class RiskDistributionItem(BaseModel):
    label: str
    value: int
    percentage: float


class DashboardResponse(BaseModel):
    stats: DashboardStats
    monthly_data: list[MonthlyDataPoint]
    risk_distribution: list[RiskDistributionItem]
    recent_predictions: list[dict]
    model_metrics: dict
