# SmartLoan AI API Documentation

Base URL: `http://localhost:8000` (Direct) or `http://localhost/api` (Docker Nginx)

## Authentication Endpoints

### `POST /auth/register`
Registers a new user account.
- **Request Body:**
  ```json
  {
    "full_name": "Jane Smith",
    "email": "jane@example.com",
    "password": "password123"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "full_name": "Jane Smith",
      "email": "jane@example.com",
      "is_admin": false
    }
  }
  ```

### `POST /auth/login`
Authenticates a user and returns a JWT access token.
- **Request Body:**
  ```json
  {
    "email": "jane@example.com",
    "password": "password123"
  }
  ```

---

## Prediction Endpoints (Protected)

### `POST /predictions/predict`
Calculates default risk for a loan applicant.
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "age": 32,
    "income": 750000,
    "employment_type": "Salaried",
    "credit_score": 720,
    "loan_amount": 300000,
    "existing_emi": 8000,
    "loan_term": 36,
    "years_of_experience": 8,
    "marital_status": "Married",
    "education": "Bachelor",
    "dependents": 1
  }
  ```

### `GET /predictions/history`
Returns paginated prediction history.
- **Query Params:** `page` (default 1), `per_page` (default 10), `status_filter` (Approved/Review/Rejected)

### `GET /predictions/history/export/csv`
Downloads prediction history as a CSV file.

---

## Dashboard Endpoints (Protected)

### `GET /dashboard`
Returns aggregated stats, risk distribution, monthly chart data, and recent predictions.
