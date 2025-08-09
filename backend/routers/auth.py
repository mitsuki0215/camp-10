from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
import models
import schemas
from database import get_db
from auth import (
    authenticate_user, get_password_hash, create_access_token, 
    create_refresh_token, verify_token, get_current_user,
    generate_verification_token, generate_password_reset_token
)
from email_utils import send_verification_email, send_password_reset_email

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register", response_model=schemas.Message)
async def register(
    user: schemas.UserCreate, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Register a new user"""
    # Check if user already exists
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        name=user.name,
        grade=user.grade,
        hashed_password=hashed_password,
        is_active=True,  # User is active but not verified
        is_verified=False
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create email verification token
    verification_token = generate_verification_token()
    expires_at = datetime.now(timezone.utc) + timedelta(hours=24)
    
    db_verification = models.EmailVerification(
        user_id=db_user.id,
        token=verification_token,
        expires_at=expires_at
    )
    
    db.add(db_verification)
    db.commit()
    
    # Send verification email
    background_tasks.add_task(
        send_verification_email,
        user.email,
        user.name,
        verification_token
    )
    
    return {"message": "User registered successfully. Please check your email to verify your account."}

@router.post("/login", response_model=schemas.Token)
async def login(
    user_credentials: schemas.UserLogin,
    db: Session = Depends(get_db)
):
    """Login user"""
    user = authenticate_user(db, user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is deactivated",
        )
    
    # Create tokens
    access_token = create_access_token(data={"sub": user.email})
    refresh_token = create_refresh_token(data={"sub": user.email})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/refresh", response_model=schemas.Token)
async def refresh_token(
    refresh_token: str,
    db: Session = Depends(get_db)
):
    """Refresh access token"""
    token_data = verify_token(refresh_token, token_type="refresh")
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )
    
    user = db.query(models.User).filter(models.User.email == token_data.username).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )
    
    # Create new tokens
    new_access_token = create_access_token(data={"sub": user.email})
    new_refresh_token = create_refresh_token(data={"sub": user.email})
    
    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }

@router.post("/verify-email", response_model=schemas.Message)
async def verify_email(
    verification: schemas.EmailVerificationVerify,
    db: Session = Depends(get_db)
):
    """Verify email address"""
    db_verification = db.query(models.EmailVerification).filter(
        models.EmailVerification.token == verification.token,
        models.EmailVerification.is_used == False
    ).first()
    
    if not db_verification:
        raise HTTPException(
            status_code=400,
            detail="Invalid verification token"
        )
    
    if db_verification.expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=400,
            detail="Verification token has expired"
        )
    
    # Update user verification status
    user = db.query(models.User).filter(models.User.id == db_verification.user_id).first()
    user.is_verified = True
    
    # Mark verification as used
    db_verification.is_used = True
    
    db.commit()
    
    return {"message": "Email verified successfully"}

@router.post("/resend-verification", response_model=schemas.Message)
async def resend_verification(
    email_request: schemas.EmailVerificationCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Resend email verification"""
    user = db.query(models.User).filter(models.User.email == email_request.email).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    if user.is_verified:
        raise HTTPException(
            status_code=400,
            detail="Email already verified"
        )
    
    # Create new verification token
    verification_token = generate_verification_token()
    expires_at = datetime.now(timezone.utc) + timedelta(hours=24)
    
    db_verification = models.EmailVerification(
        user_id=user.id,
        token=verification_token,
        expires_at=expires_at
    )
    
    db.add(db_verification)
    db.commit()
    
    # Send verification email
    background_tasks.add_task(
        send_verification_email,
        user.email,
        user.name,
        verification_token
    )
    
    return {"message": "Verification email sent"}

@router.post("/forgot-password", response_model=schemas.Message)
async def forgot_password(
    password_request: schemas.PasswordResetRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Request password reset"""
    user = db.query(models.User).filter(models.User.email == password_request.email).first()
    if not user:
        # Don't reveal if user exists
        return {"message": "If an account exists with that email, a reset link has been sent."}
    
    # Create password reset token
    reset_token = generate_password_reset_token()
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
    
    db_reset = models.PasswordReset(
        user_id=user.id,
        token=reset_token,
        expires_at=expires_at
    )
    
    db.add(db_reset)
    db.commit()
    
    # Send reset email
    background_tasks.add_task(
        send_password_reset_email,
        user.email,
        user.name,
        reset_token
    )
    
    return {"message": "If an account exists with that email, a reset link has been sent."}

@router.post("/reset-password", response_model=schemas.Message)
async def reset_password(
    password_reset: schemas.PasswordResetConfirm,
    db: Session = Depends(get_db)
):
    """Reset password"""
    db_reset = db.query(models.PasswordReset).filter(
        models.PasswordReset.token == password_reset.token,
        models.PasswordReset.is_used == False
    ).first()
    
    if not db_reset:
        raise HTTPException(
            status_code=400,
            detail="Invalid reset token"
        )
    
    if db_reset.expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=400,
            detail="Reset token has expired"
        )
    
    # Update user password
    user = db.query(models.User).filter(models.User.id == db_reset.user_id).first()
    user.hashed_password = get_password_hash(password_reset.new_password)
    
    # Mark reset token as used
    db_reset.is_used = True
    
    db.commit()
    
    return {"message": "Password reset successfully"}

@router.get("/me", response_model=schemas.User)
async def get_current_user_info(current_user: models.User = Depends(get_current_user)):
    """Get current user information"""
    return current_user