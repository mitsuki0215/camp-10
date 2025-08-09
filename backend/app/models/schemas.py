from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# ベーススキーマ
class BaseSchema(BaseModel):
    class Config:
        from_attributes = True

# ユーザー関連スキーマ（Firebase Auth対応）
class UserBase(BaseSchema):
    email: EmailStr
    name: str
    grade: Optional[str] = None

class UserCreate(UserBase):
    firebase_uid: str
    avatar_url: Optional[str] = None
    provider: str = 'firebase'

class UserLogin(BaseSchema):
    firebase_token: str  # Firebase IDToken

class User(UserBase):
    id: int
    firebase_uid: str
    avatar_url: Optional[str] = None
    provider: str
    is_active: bool
    is_verified: bool
    rank: str
    experience: int
    experience_to_next: int
    points: int
    created_at: datetime

class UserProfile(User):
    """ユーザープロフィール詳細"""
    pass

# トークン関連スキーマ
class Token(BaseSchema):
    access_token: str
    refresh_token: str
    token_type: str

class TokenData(BaseSchema):
    username: Optional[str] = None

# メール認証関連スキーマ
class EmailVerificationCreate(BaseSchema):
    email: EmailStr

class EmailVerificationVerify(BaseSchema):
    token: str

# パスワードリセット関連スキーマ
class PasswordResetRequest(BaseSchema):
    email: EmailStr

class PasswordResetConfirm(BaseSchema):
    token: str
    new_password: str

# アンケート関連スキーマ（ハッカソン拡張版）
class QuestionBase(BaseSchema):
    text: str
    type: str  # 'short', 'paragraph', 'radio', 'checkbox'
    options: List[str] = []
    required: bool = False

class SurveyBase(BaseSchema):
    title: str
    description: Optional[str] = None

class SurveyCreate(SurveyBase):
    questions: List[QuestionBase]
    required_points: Optional[int] = Field(default=1000, alias='requiredPoints')
    reward_points: Optional[int] = Field(default=50, alias='rewardPoints')
    target_responses: Optional[int] = Field(default=50, alias='targetResponses')
    estimated_time: Optional[int] = Field(default=5, alias='estimatedTime')
    
    class Config:
        populate_by_name = True  # Allow both field name and alias

class SurveyUpdate(BaseSchema):
    title: Optional[str] = None
    description: Optional[str] = None
    questions: Optional[List[QuestionBase]] = None
    is_active: Optional[bool] = None

class Survey(SurveyBase):
    id: int
    questions: List[Dict[str, Any]]
    creator_id: int
    is_active: bool
    response_count: int
    created_at: datetime
    updated_at: datetime

class SurveyList(BaseSchema):
    """アンケート一覧表示用（シンプル版）"""
    id: int
    title: str
    description: Optional[str]
    response_count: int
    duration: Optional[str] = None
    created_at: datetime

# アンケート回答関連スキーマ（シンプル版）
class SurveyResponseCreate(BaseSchema):
    responses: Dict[str, Any]  # question_id -> answer
    firebase_uid: Optional[str] = None  # Firebase UIDを追加

class SurveyResponse(BaseSchema):
    id: int
    survey_id: int
    user_id: Optional[int]
    responses: Dict[str, Any]
    created_at: datetime

# ハッカソン関連機能は削除（アンケート基本機能のみ）

# レスポンス用スキーマ
class Message(BaseSchema):
    message: str

class ErrorResponse(BaseSchema):
    detail: str

# 統計情報スキーマ
class UserStats(BaseSchema):
    created_surveys: int
    active_surveys: int
    total_responses_received: int
    responses_given: int
    rank: str
    experience: int
    experience_to_next: int
    points: int