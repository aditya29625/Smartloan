"""
Vercel serverless entrypoint for SmartLoan AI FastAPI backend.
Sets up correct Python paths before importing the app.
"""
import sys
from pathlib import Path

# Root of the project (one level above api/)
ROOT = Path(__file__).parent.parent

# Add backend/ and model/ to sys.path so bare imports like
# `from config import get_settings` and `import predictor` work correctly.
sys.path.insert(0, str(ROOT / "backend"))
sys.path.insert(0, str(ROOT / "model"))

from main import app          # noqa: E402  (backend/main.py)
from mangum import Mangum     # noqa: E402

handler = Mangum(app, lifespan="off")
