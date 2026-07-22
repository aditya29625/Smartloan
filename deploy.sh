#!/usr/bin/env bash
# SmartLoan AI Deployment Script

set -e

echo "🚀 Preparing SmartLoan AI for Production Deployment..."

# 1. Generate Dataset & Train ML Model
echo "🧠 Step 1: Training ML Pipeline & Exporting Model Artifacts..."
./venv/bin/python dataset/generate_dataset.py
./venv/bin/python model/train.py

# 2. Build Frontend Production Assets
echo "📦 Step 2: Compiling React Production Bundle..."
cd frontend
npm run build
cd ..

# 3. Docker Production Deployment (Optional)
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
  echo "🐳 Step 3: Launching Docker Compose Stack..."
  docker-compose up --build -d
  echo "✅ Application deployed via Docker Compose on http://localhost"
else
  echo "✅ Application assets built successfully!"
  echo "   Start backend: cd backend && ../venv/bin/uvicorn main:app --port 8000"
  echo "   Start frontend: cd frontend && npm run dev"
fi
