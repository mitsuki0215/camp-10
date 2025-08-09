from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.models import User, EmailVerification
from app.core.database import get_db
from app.services.auth_service import auth_service

router = APIRouter(prefix="/auth", tags=["認証"])




@router.get("/verify-email", summary="メールアドレス認証（URL経由）")
async def verify_email_via_url(
    token: str,
    db: Session = Depends(get_db)
):
    """
    メールのURLからアクセスして認証を行います
    
    - **token**: 認証トークン（URLパラメータ）
    """
    db_verification = db.query(EmailVerification).filter(
        EmailVerification.token == token,
        EmailVerification.is_used == False
    ).first()
    
    if not db_verification:
        return {
            "success": False,
            "message": "無効な認証トークンです"
        }
    
    if db_verification.expires_at < datetime.now(timezone.utc).replace(tzinfo=None):
        return {
            "success": False,
            "message": "認証トークンの有効期限が切れています"
        }
    
    # ユーザーの認証状態を更新
    user = db.query(User).filter(User.id == db_verification.user_id).first()
    user.is_verified = True
    
    # 認証トークンを使用済みにする
    db_verification.is_used = True
    
    db.commit()
    
    # アクセストークンも発行してログイン状態にする
    access_token = auth_service.create_access_token(data={"sub": user.email})
    refresh_token = auth_service.create_refresh_token(data={"sub": user.email})
    
    return {
        "success": True,
        "message": "メールアドレスの認証が完了しました！自動的にログインします。",
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "grade": user.grade
        }
    }





