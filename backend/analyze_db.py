"""
SmartLoan AI - Database Inspector & Analytics Utility
Queries smartloan.db to inspect records, compute summary statistics, and analyze risk trends.
"""

import sqlite3
from pathlib import Path
import pandas as pd

DB_PATH = Path(__file__).parent / "smartloan.db"

def inspect_database():
    if not DB_PATH.exists():
        print(f"❌ Database not found at {DB_PATH.resolve()}")
        print("Run the FastAPI server or predictions first to create the database.")
        return

    print(f"📊 Analyzing Database: {DB_PATH.resolve()}\n" + "=" * 50)
    conn = sqlite3.connect(DB_PATH)

    # 1. Users Table
    users_df = pd.read_sql_query("SELECT id, full_name, email, is_admin, created_at FROM users", conn)
    print(f"\n👤 Users Table ({len(users_df)} records):")
    print(users_df.to_string(index=False) if not users_df.empty else "No users registered yet.")

    # 2. Predictions Summary
    preds_df = pd.read_sql_query("""
        SELECT id, user_id, age, income, credit_score, loan_amount, existing_emi,
               status, risk_label, probability, risk_score, created_at
        FROM predictions
    """, conn)

    print(f"\n🎯 Predictions Table ({len(preds_df)} records):")
    if not preds_df.empty:
        print(preds_df.tail(10).to_string(index=False))
        print("\n📈 Statistical Summary of Predictions:")
        print(preds_df[["income", "credit_score", "loan_amount", "probability", "risk_score"]].describe().round(2))

        print("\n🏷️ Decision Status Breakdown:")
        print(preds_df["status"].value_counts(normalize=True).map("{:.1%}".format))

        print("\n⚠️ Risk Level Breakdown:")
        print(preds_df["risk_label"].value_counts(normalize=True).map("{:.1%}".format))
    else:
        print("No prediction records yet. Make a prediction at http://localhost:5173/predict")

    # 3. Login Audit Logs
    logs_df = pd.read_sql_query("SELECT id, email, success, created_at FROM login_logs ORDER BY id DESC LIMIT 5", conn)
    print(f"\n🔐 Recent Login Logs (Top 5):")
    print(logs_df.to_string(index=False) if not logs_df.empty else "No login logs yet.")

    conn.close()

if __name__ == "__main__":
    inspect_database()
