from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# ベーススキーマ
class BaseSchema(BaseModel):
    class Config:
        from_attributes = True

# ユーザー関連スキーマ
class UserBase(BaseSchema):
    email: EmailStr
    name: str
    grade: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseSchema):
    email: EmailStr
    password: str

class User(UserBase):
    id: int
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

# アンケート関連スキーマ
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
    """アンケート一覧表示用"""
    id: int
    title: str
    description: Optional[str]
    response_count: int
    duration: Optional[str] = None
    created_at: datetime

# アンケート回答関連スキーマ
class SurveyResponseCreate(BaseSchema):
    responses: Dict[str, Any]  # question_id -> answer

class SurveyResponse(BaseSchema):
    id: int
    survey_id: int
    user_id: Optional[int]
    responses: Dict[str, Any]
    created_at: datetime

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