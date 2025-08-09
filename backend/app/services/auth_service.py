from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import secrets

from app.models import User
from app.models.schemas import TokenData
from app.core.database import get_db
from app.core.config import settings

class AuthService:
    """認証サービス"""
    
    def __init__(self):
        self.security = HTTPBearer()
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """パスワードを検証"""
        return self.pwd_context.verify(plain_password, hashed_password)
    
    def get_password_hash(self, password: str) -> str:
        """パスワードをハッシュ化"""
        return self.pwd_context.hash(password)
    
    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """アクセストークンを作成"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire, "type": "access"})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt
    
    def create_refresh_token(self, data: dict) -> str:
        """リフレッシュトークンを作成"""
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        to_encode.update({"exp": expire, "type": "refresh"})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt
    
    def verify_token(self, token: str, token_type: str = "access") -> Optional[TokenData]:
        """トークンを検証"""
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            username: str = payload.get("sub")
            token_type_in_payload: str = payload.get("type")
            
            if username is None or token_type_in_payload != token_type:
                return None
                
            return TokenData(username=username)
        except JWTError:
            return None
    
    def authenticate_user(self, db: Session, email: str, password: str) -> Optional[User]:
        """ユーザーを認証"""
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return None
        if not self.verify_password(password, user.hashed_password):
            return None
        return user
    
    def get_current_user(
        self,
        credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer()),
        db: Session = Depends(get_db)
    ) -> User:
        """現在のユーザーを取得"""
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="認証情報を確認できませんでした",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
        token_data = self.verify_token(credentials.credentials)
        if token_data is None:
            raise credentials_exception
        
        user = db.query(User).filter(User.email == token_data.username).first()
        if user is None:
            raise credentials_exception
        
        return user
    
    def get_current_active_user(self, current_user: User = Depends(get_current_user)) -> User:
        """アクティブなユーザーを取得"""
        if not current_user.is_active:
            raise HTTPException(status_code=400, detail="非アクティブなユーザーです")
        return current_user
    
    def get_current_verified_user(self, current_user: User = Depends(get_current_active_user)) -> User:
        """認証済みユーザーを取得"""
        if not current_user.is_verified:
            raise HTTPException(status_code=400, detail="メールアドレスが認証されていません")
        return current_user
    
    def generate_verification_token(self) -> str:
        """認証トークンを生成"""
        return secrets.token_urlsafe(32)
    
    def generate_password_reset_token(self) -> str:
        """パスワードリセットトークンを生成"""
        return secrets.token_urlsafe(32)

# グローバル認証サービスインスタンス
auth_service = AuthService()