from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.models import User
from app.core.database import get_db
from app.services.auth_service import auth_service

def get_current_user_optional(
    db: Session = Depends(get_db),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))
) -> Optional[User]:
    """
    現在のユーザーを取得（オプショナル）
    認証されていない場合はNoneを返す
    """
    if not credentials:
        return None
    
    try:
        token_data = auth_service.verify_token(credentials.credentials)
        if token_data is None:
            return None
        
        user = db.query(User).filter(User.email == token_data.username).first()
        return user if user and user.is_active else None
    except:
        return None

def get_current_user(
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())
) -> User:
    """
    現在のユーザーを取得（認証必須）
    認証されていない場合は401エラーを返す
    """
    try:
        token_data = auth_service.verify_token(credentials.credentials)
        if token_data is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="無効なトークンです",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        user = db.query(User).filter(User.email == token_data.username).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="ユーザーが見つかりません",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="非アクティブなユーザーです",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return user
        
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="認証エラーが発生しました",
            headers={"WWW-Authenticate": "Bearer"},
        )