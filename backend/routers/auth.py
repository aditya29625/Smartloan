"""
Auth Router — POST /auth/register, POST /auth/login
"""

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from database import get_db
from schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from services import auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user account."""
    if auth_service.get_user_by_email(db, req.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    user = auth_service.create_user(db, req.full_name, req.email, req.password)
    token = auth_service.create_access_token({"sub": str(user.id)})
    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, request: Request, db: Session = Depends(get_db)):
    """Authenticate and receive a JWT access token."""
    user = auth_service.authenticate_user(db, req.email, req.password)
    ip = request.client.host if request.client else ""
    ua = request.headers.get("user-agent", "")

    if not user:
        auth_service.log_login(db, req.email, success=False, ip_address=ip, user_agent=ua)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    auth_service.log_login(db, req.email, success=True, user_id=user.id, ip_address=ip, user_agent=ua)
    token = auth_service.create_access_token({"sub": str(user.id)})
    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )
