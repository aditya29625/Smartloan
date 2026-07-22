"""
SmartLoan AI - Synthetic Dataset Generator
Generates realistic loan applicant data with default labels.
"""

import numpy as np
import pandas as pd
from pathlib import Path

np.random.seed(42)
N = 10_000


def generate_dataset(n: int = N, output_path: str = "dataset/loan_data.csv") -> pd.DataFrame:
    """Generate a synthetic loan dataset with realistic feature distributions."""

    # --- Demographics ---
    age = np.random.randint(21, 65, n)
    marital_status = np.random.choice(
        ["Single", "Married", "Divorced", "Widowed"],
        n,
        p=[0.35, 0.45, 0.15, 0.05],
    )
    education = np.random.choice(
        ["High School", "Bachelor", "Master", "PhD"],
        n,
        p=[0.30, 0.45, 0.20, 0.05],
    )
    dependents = np.random.choice([0, 1, 2, 3, 4, 5], n, p=[0.25, 0.25, 0.25, 0.15, 0.07, 0.03])

    # --- Employment ---
    employment_type = np.random.choice(
        ["Salaried", "Self-Employed", "Business", "Freelancer", "Unemployed"],
        n,
        p=[0.50, 0.20, 0.15, 0.10, 0.05],
    )
    years_of_experience = np.clip(
        np.random.normal(8, 5, n).astype(int), 0, 40
    )

    # --- Financials ---
    # Income varies by employment type
    base_income = np.where(
        employment_type == "Salaried", np.random.normal(60000, 20000, n),
        np.where(
            employment_type == "Business", np.random.normal(90000, 40000, n),
            np.where(
                employment_type == "Unemployed", np.random.normal(15000, 5000, n),
                np.random.normal(50000, 25000, n),
            ),
        ),
    )
    income = np.clip(base_income, 10000, 500000).astype(int)

    # Credit score: 300-850
    credit_score_base = np.random.normal(650, 100, n)
    credit_score = np.clip(credit_score_base, 300, 850).astype(int)

    # Loan amount: correlated with income
    loan_amount = np.clip(
        (income * np.random.uniform(0.5, 5, n)).astype(int), 5000, 2000000
    )

    # Existing EMI: monthly obligation
    existing_emi = np.clip(
        (income * np.random.uniform(0, 0.6, n) / 12).astype(int), 0, 50000
    )

    # Loan term (months)
    loan_term = np.random.choice([12, 24, 36, 48, 60, 84, 120], n)

    # --- Derived risk features ---
    debt_to_income = (existing_emi * 12) / np.maximum(income, 1)
    loan_to_income = loan_amount / np.maximum(income, 1)
    emi_to_income = existing_emi / np.maximum(income / 12, 1)

    # Target: Default (1 = default, 0 = no default)
    # Risk score formula — higher → more likely to default
    risk_score = (
        -0.006 * credit_score            # credit score weight
        + 1.8 * emi_to_income            # high EMI load
        + 1.2 * loan_to_income           # large loan vs income
        + 0.8 * debt_to_income           # debt load
        + 0.5 * (age < 25).astype(int)
        + 1.2 * (employment_type == "Unemployed").astype(int)
        + 0.6 * (employment_type == "Freelancer").astype(int)
        - 0.4 * (education == "PhD").astype(int)
        - 0.2 * (education == "Master").astype(int)
        + 2.0                            # baseline shift
        + np.random.normal(0, 0.5, n)
    )

    # Sigmoid to get probability
    prob_default = 1 / (1 + np.exp(-risk_score))
    default = (np.random.uniform(0, 1, n) < prob_default).astype(int)

    df = pd.DataFrame({
        "age": age,
        "income": income,
        "employment_type": employment_type,
        "credit_score": credit_score,
        "loan_amount": loan_amount,
        "existing_emi": existing_emi,
        "loan_term": loan_term,
        "years_of_experience": years_of_experience,
        "marital_status": marital_status,
        "education": education,
        "dependents": dependents,
        "debt_to_income": debt_to_income.round(4),
        "loan_to_income": loan_to_income.round(4),
        "emi_to_income": emi_to_income.round(4),
        "default": default,
    })

    # Introduce ~3% missing values in some columns (realistic messiness)
    for col in ["credit_score", "existing_emi", "years_of_experience"]:
        mask = np.random.random(n) < 0.03
        df.loc[mask, col] = np.nan

    out = Path(output_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out, index=False)
    print(f"[✓] Dataset saved → {out.resolve()}  ({n} rows)")
    print(f"    Default rate: {df['default'].mean():.2%}")
    return df


if __name__ == "__main__":
    generate_dataset(output_path="dataset/loan_data.csv")
