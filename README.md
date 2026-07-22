# SmartLoan AI 🚀

> **Production-Ready AI-Powered Loan Default Prediction & Credit Risk Assessment Platform**

SmartLoan AI is an end-to-end, industry-grade financial risk assessment platform. It leverages ensemble machine learning (Logistic Regression, Random Forest, Gradient Boosting) to evaluate loan applicant data in real time, delivering instant default probability scores, risk classification, rule-based diagnostic explanations, and downloadable PDF reports.

---

## 🌟 Key Features

- **Machine Learning Pipeline**: Trained on 10,000 applicant financial records with automatic missing value imputation, IQR outlier removal, categorical encoding, and feature scaling.
- **Interactive Risk Analytics**: Dynamic SVG Risk Gauge, Default Probability Ring, Risk Distribution Pie Charts, and Monthly Prediction Trends.
- **Explainable AI & Recommendations**: Automated risk factor diagnostics and actionable suggestions to improve creditworthiness.
- **PDF Reports & CSV Exports**: One-click downloadable PDF summary reports and CSV export for history analysis.
- **Enterprise Security**: JWT authentication with Bearer tokens, password hashing with PBKDF2/SHA256, protected routes, and audit login logs.
- **Containerized Architecture**: Multi-stage Docker build with Nginx reverse proxy, FastAPI backend, and PostgreSQL database.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router v6, Axios, Recharts, Framer Motion, jsPDF
- **Backend**: Python 3.11, FastAPI, Pydantic v2, Uvicorn, SQLAlchemy ORM
- **Machine Learning**: Scikit-learn, Pandas, NumPy, Matplotlib, Seaborn, Joblib
- **Database**: PostgreSQL / SQLite
- **Deployment**: Docker, Docker Compose, GitHub Actions CI/CD

---

## 💻 Local Development Setup

### 1. Install Dependencies & Train ML Model
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install requirements
pip install -r model/requirements-ml.txt -r backend/requirements.txt

# Generate dataset and train models
python dataset/generate_dataset.py
python model/train.py
```

### 2. Start FastAPI Backend
```bash
cd backend
uvicorn main:app --reload --port 8000
```
Swagger API Documentation: `http://localhost:8000/docs`

### 3. Start React Frontend
```bash
cd frontend
npm install
npm run dev
```
Access Web App: `http://localhost:5173`

---

## 🐳 Docker Deployment

To launch the complete containerized stack (PostgreSQL + FastAPI + Nginx React Frontend):

```bash
docker-compose up --build
```
Access application at `http://localhost`

---

## 🧪 Testing

Run automated API test suite:
```bash
pytest backend/tests/
```
