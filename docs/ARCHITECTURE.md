# SmartLoan AI Architecture Documentation

## System Overview

SmartLoan AI is an end-to-end Machine Learning platform for predicting loan default risk.

```
+-------------------------------------------------------+
|                 React.js Frontend                     |
|  (Vite + Tailwind CSS + Framer Motion + Recharts)     |
+---------------------------+---------------------------+
                            | HTTP / REST (JWT)
                            v
+-------------------------------------------------------+
|                 FastAPI Backend Service               |
|  (Uvicorn + Pydantic v2 + SQLAlchemy ORM)             |
+-------------+-----------------------------+-----------+
              |                             |
              v                             v
+---------------------------+  +------------------------+
|   PostgreSQL / SQLite     |  | ML Inference Engine    |
| (Users, Predictions, Logs)|  | (scikit-learn Pipeline)|
+---------------------------+  +------------------------+
```

## Data Flow

1. User inputs applicant data (Age, Income, Credit Score, Loan Amount, Existing EMI, etc.).
2. React frontend sends `POST /predictions/predict` with Bearer JWT token.
3. FastAPI validates input via Pydantic schemas.
4. `predictor.py` computes derived ratios (Debt-to-Income, Loan-to-Income, EMI-to-Income).
5. Scaler and label encoders normalize and format features.
6. Ensemble model computes default probability and confidence score.
7. Rule engine determines risk factors and actionable suggestions.
8. Prediction result is logged in PostgreSQL / SQLite and returned to frontend.
