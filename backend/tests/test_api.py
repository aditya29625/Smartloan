"""
SmartLoan AI - API Tests
Unit and integration tests for all endpoints.
"""

import pytest
from fastapi.testclient import TestClient

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from main import app
from database import create_tables

# Ensure DB tables exist before tests
create_tables()

client = TestClient(app)

TEST_USER = {
    "full_name": "Test User",
    "email": "test@smartloan.ai",
    "password": "test1234",
}

_token = None


def test_root():
    r = client.get("/")
    assert r.status_code == 200
    assert r.json()["status"] == "running"


def test_health():
    r = client.get("/health")
    assert r.status_code == 200


def test_register():
    global _token
    r = client.post("/auth/register", json=TEST_USER)
    assert r.status_code in (201, 400)
    if r.status_code == 201:
        _token = r.json()["access_token"]


def test_login():
    global _token
    r = client.post("/auth/login", json={
        "email": TEST_USER["email"],
        "password": TEST_USER["password"],
    })
    assert r.status_code == 200
    _token = r.json()["access_token"]
    assert _token


def test_login_wrong_password():
    r = client.post("/auth/login", json={
        "email": TEST_USER["email"],
        "password": "wrongpass",
    })
    assert r.status_code == 401


def _auth_headers():
    return {"Authorization": f"Bearer {_token}"}


def test_profile():
    if not _token:
        test_login()
    r = client.get("/profile", headers=_auth_headers())
    assert r.status_code == 200
    assert "email" in r.json()


def test_dashboard():
    if not _token:
        test_login()
    r = client.get("/dashboard", headers=_auth_headers())
    assert r.status_code == 200
    assert "stats" in r.json()


def test_predict():
    if not _token:
        test_login()
    payload = {
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
        "dependents": 1,
    }
    r = client.post("/predictions/predict", json=payload, headers=_auth_headers())
    assert r.status_code == 201
    data = r.json()
    assert "result" in data
    assert "status" in data["result"]


def test_history():
    if not _token:
        test_login()
    r = client.get("/predictions/history", headers=_auth_headers())
    assert r.status_code == 200
    assert "items" in r.json()


def test_protected_without_token():
    r = client.get("/dashboard")
    assert r.status_code == 401
