"""
SmartLoan AI - ML Training Pipeline
Trains multiple models, compares metrics, selects the best, and saves artifacts.
"""

import sys
import json
import warnings
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")  # non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score, classification_report,
    confusion_matrix, roc_curve
)
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer

warnings.filterwarnings("ignore")

# ── Paths ──────────────────────────────────────────────────────────────────────
ROOT = Path(__file__).parent
DATASET_PATH = ROOT.parent / "dataset" / "loan_data.csv"
MODEL_DIR = ROOT
PLOTS_DIR = ROOT / "plots"
PLOTS_DIR.mkdir(exist_ok=True)

CATEGORICAL_COLS = ["employment_type", "marital_status", "education"]
NUMERICAL_COLS = [
    "age", "income", "credit_score", "loan_amount", "existing_emi",
    "loan_term", "years_of_experience", "dependents",
    "debt_to_income", "loan_to_income", "emi_to_income",
]
TARGET = "default"
FEATURE_COLS = NUMERICAL_COLS + [f"{c}_encoded" for c in CATEGORICAL_COLS]


# ── Step 1-2: Load & Handle Missing Values ─────────────────────────────────────
def load_and_clean(path: Path) -> pd.DataFrame:
    print("\n[1/10] Loading dataset...")
    df = pd.read_csv(path)
    print(f"       Shape: {df.shape}  |  Default rate: {df[TARGET].mean():.2%}")

    print("[2/10] Handling missing values...")
    # Re-compute or fill NaNs in all numerical columns
    for col in NUMERICAL_COLS:
        if col in df.columns:
            median_val = df[col].median()
            df[col] = df[col].fillna(median_val if pd.notnull(median_val) else 0)

    # Recompute derived ratio features to ensure consistency
    df["debt_to_income"] = ((df["existing_emi"] * 12) / np.maximum(df["income"], 1)).round(4)
    df["loan_to_income"] = (df["loan_amount"] / np.maximum(df["income"], 1)).round(4)
    df["emi_to_income"] = (df["existing_emi"] / np.maximum(df["income"] / 12, 1)).round(4)

    return df


# ── Step 3: Remove Outliers (IQR) ─────────────────────────────────────────────
def remove_outliers(df: pd.DataFrame) -> pd.DataFrame:
    print("[3/10] Removing outliers (IQR)...")
    before = len(df)
    for col in ["income", "loan_amount", "existing_emi"]:
        Q1, Q3 = df[col].quantile(0.01), df[col].quantile(0.99)
        df = df[(df[col] >= Q1) & (df[col] <= Q3)]
    print(f"       Removed {before - len(df)} rows → {len(df)} remaining")
    return df.reset_index(drop=True)


# ── Step 4: Encode Categoricals ────────────────────────────────────────────────
def encode_features(df: pd.DataFrame) -> tuple[pd.DataFrame, dict]:
    print("[4/10] Encoding categorical features...")
    encoders = {}
    for col in CATEGORICAL_COLS:
        le = LabelEncoder()
        df[f"{col}_encoded"] = le.fit_transform(df[col].astype(str))
        encoders[col] = le
        df.drop(columns=[col], inplace=True)
    return df, encoders


# ── Step 5-6: Scale & Split ────────────────────────────────────────────────────
def prepare_data(df: pd.DataFrame) -> tuple:
    print("[5/10] Feature scaling...")
    X = df[FEATURE_COLS]
    y = df[TARGET]

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    print("[6/10] Train-test split (80/20)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"       Train: {len(X_train)}  |  Test: {len(X_test)}")
    return X_train, X_test, y_train, y_test, scaler


# ── Step 7: Train Multiple Models ─────────────────────────────────────────────
def train_models(X_train, y_train) -> dict:
    print("\n[7/10] Training models...")
    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
        "Decision Tree":       DecisionTreeClassifier(max_depth=8, random_state=42),
        "Random Forest":       RandomForestClassifier(n_estimators=200, max_depth=10, random_state=42, n_jobs=-1),
        "Gradient Boosting":   GradientBoostingClassifier(n_estimators=200, learning_rate=0.1, max_depth=5, random_state=42),
    }
    trained = {}
    for name, model in models.items():
        print(f"       Training {name}...")
        model.fit(X_train, y_train)
        trained[name] = model
    return trained


# ── Step 8: Compare Metrics ────────────────────────────────────────────────────
def evaluate_models(models: dict, X_test, y_test) -> pd.DataFrame:
    print("\n[8/10] Comparing model metrics...")
    rows = []
    for name, model in models.items():
        y_pred = model.predict(X_test)
        y_prob = model.predict_proba(X_test)[:, 1]
        rows.append({
            "Model":     name,
            "Accuracy":  round(accuracy_score(y_test, y_pred), 4),
            "Precision": round(precision_score(y_test, y_pred, zero_division=0), 4),
            "Recall":    round(recall_score(y_test, y_pred, zero_division=0), 4),
            "F1":        round(f1_score(y_test, y_pred, zero_division=0), 4),
            "ROC-AUC":   round(roc_auc_score(y_test, y_prob), 4),
        })
    results = pd.DataFrame(rows).sort_values("ROC-AUC", ascending=False)
    print(results.to_string(index=False))
    return results


# ── Step 9: Select Best Model ──────────────────────────────────────────────────
def select_best(models: dict, results: pd.DataFrame):
    best_name = results.iloc[0]["Model"]
    print(f"\n[9/10] Best model → {best_name}")
    return best_name, models[best_name]


# ── Step 10: Save Artifacts ────────────────────────────────────────────────────
def save_artifacts(model, scaler, encoders, results, feature_cols):
    print("[10/10] Saving model artifacts...")
    joblib.dump(model,   MODEL_DIR / "model.pkl")
    joblib.dump(scaler,  MODEL_DIR / "scaler.pkl")
    joblib.dump(encoders, MODEL_DIR / "encoders.pkl")
    joblib.dump(feature_cols, MODEL_DIR / "feature_cols.pkl")

    # Save metrics JSON for API
    metrics = results.set_index("Model").to_dict(orient="index")
    with open(MODEL_DIR / "metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)

    # Feature importance
    if hasattr(model, "feature_importances_"):
        importance = dict(zip(feature_cols, model.feature_importances_.tolist()))
        importance = dict(sorted(importance.items(), key=lambda x: x[1], reverse=True))
        with open(MODEL_DIR / "feature_importance.json", "w") as f:
            json.dump(importance, f, indent=2)

    print(f"       Artifacts saved → {MODEL_DIR}")


# ── Plots ──────────────────────────────────────────────────────────────────────
def generate_plots(model, X_test, y_test, results, feature_cols):
    """Generate evaluation plots for documentation."""

    # Confusion matrix
    y_pred = model.predict(X_test)
    cm = confusion_matrix(y_test, y_pred)
    fig, ax = plt.subplots(figsize=(5, 4))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", ax=ax)
    ax.set_title("Confusion Matrix")
    ax.set_xlabel("Predicted")
    ax.set_ylabel("Actual")
    plt.tight_layout()
    plt.savefig(PLOTS_DIR / "confusion_matrix.png", dpi=120)
    plt.close()

    # Feature importance
    if hasattr(model, "feature_importances_"):
        fi = pd.Series(model.feature_importances_, index=feature_cols).sort_values()
        fig, ax = plt.subplots(figsize=(8, 6))
        fi.tail(12).plot(kind="barh", ax=ax, color="#667eea")
        ax.set_title("Top Feature Importances")
        plt.tight_layout()
        plt.savefig(PLOTS_DIR / "feature_importance.png", dpi=120)
        plt.close()

    # Model comparison bar chart
    fig, ax = plt.subplots(figsize=(8, 4))
    results.set_index("Model")[["Accuracy", "F1", "ROC-AUC"]].plot(kind="bar", ax=ax, rot=20)
    ax.set_title("Model Comparison")
    ax.set_ylim(0.5, 1.0)
    plt.tight_layout()
    plt.savefig(PLOTS_DIR / "model_comparison.png", dpi=120)
    plt.close()

    print(f"       Plots saved → {PLOTS_DIR}")


# ── Main ───────────────────────────────────────────────────────────────────────
def main():
    if not DATASET_PATH.exists():
        print(f"Dataset not found at {DATASET_PATH}")
        print("Run: python dataset/generate_dataset.py first")
        sys.exit(1)

    df = load_and_clean(DATASET_PATH)
    df = remove_outliers(df)
    df, encoders = encode_features(df)
    X_train, X_test, y_train, y_test, scaler = prepare_data(df)
    models = train_models(X_train, y_train)
    results = evaluate_models(models, X_test, y_test)
    best_name, best_model = select_best(models, results)
    save_artifacts(best_model, scaler, encoders, results, FEATURE_COLS)
    generate_plots(best_model, X_test, y_test, results, FEATURE_COLS)

    print("\n✅  Training complete!")
    print(f"   Best model: {best_name}")
    print(f"   ROC-AUC:    {results.iloc[0]['ROC-AUC']:.4f}")


if __name__ == "__main__":
    main()
