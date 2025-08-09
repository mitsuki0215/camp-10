from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.models import User
from app.models.schemas import UserProfile, UserBase, Survey, UserStats
from app.core.database import get_db
from app.services.auth_service import auth_service
from app.services.user_service import user_service

router = APIRouter(prefix="/api/user", tags=["ユーザー"])

@router.get("/profile", response_model=UserProfile, summary="ユーザープロフィール取得")
async def get_user_profile(
    current_user: User = Depends(auth_service.get_current_verified_user)
):
    """
    現在のユーザーのプロフィール情報を取得します
    """
    return current_user

@router.put("/profile", response_model=UserProfile, summary="ユーザープロフィール更新")
async def update_user_profile(
    profile_update: UserBase,
    current_user: User = Depends(auth_service.get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    ユーザープロフィールを更新します
    
    - **name**: 氏名
    - **grade**: 学年（任意）
    """
    return user_service.update_profile(db, current_user, profile_update)

@router.get("/surveys", response_model=List[Survey], summary="作成したアンケート一覧")
async def get_user_surveys(
    current_user: User = Depends(auth_service.get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    現在のユーザーが作成したアンケート一覧を取得します
    """
    return user_service.get_user_surveys(db, current_user)

@router.get("/stats", response_model=UserStats, summary="ユーザー統計情報")
async def get_user_stats(
    current_user: User = Depends(auth_service.get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    ユーザーの統計情報を取得します
    
    - 作成したアンケート数
    - アクティブなアンケート数  
    - 受け取った回答総数
    - 自分が回答したアンケート数
    - ランク・経験値・ポイント情報
    """
    return user_service.get_user_stats(db, current_user)