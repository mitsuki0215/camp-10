from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, DECIMAL
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    """ユーザーモデル（Firebase Auth対応）"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    firebase_uid = Column(String(128), unique=True, nullable=False, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    grade = Column(String, nullable=True)
    avatar_url = Column(Text, nullable=True)
    provider = Column(String(50), nullable=False, default='firebase')
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    rank = Column(String, default="Bronze")
    experience = Column(Integer, default=0)
    experience_to_next = Column(Integer, default=2000)  # Next rank Silver at 2000
    points = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # リレーション
    surveys = relationship("Survey", back_populates="creator")

class EmailVerification(Base):
    """メール認証モデル"""
    __tablename__ = "email_verifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # リレーション  
    user = relationship("User")

class PasswordReset(Base):
    """パスワードリセットモデル"""
    __tablename__ = "password_resets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # リレーション
    user = relationship("User")

# ハッカソン関連のモデル（PointTransaction, RankSetting, UserAuthLog）は削除
# アンケート基本機能に集中