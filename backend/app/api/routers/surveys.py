from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.models.schemas import (
    SurveyList, SurveyCreate, Survey, Message
)
from app.core.database import get_db
from app.services.survey_service import survey_service

router = APIRouter(prefix="/api/surveys", tags=["アンケート"])

@router.get("/", response_model=List[SurveyList], summary="アンケート一覧取得")
async def get_surveys(
    skip: int = Query(0, ge=0, description="スキップする件数"),
    limit: int = Query(100, ge=1, le=100, description="取得する件数"),
    db: Session = Depends(get_db)
):
    """
    アクティブなアンケート一覧を取得します
    
    - **skip**: スキップする件数（デフォルト: 0）
    - **limit**: 取得する件数（デフォルト: 100、最大: 100）
    """
    surveys = survey_service.get_active_surveys(db, skip, limit)
    
    # SurveyList形式に変換
    survey_list = []
    for survey in surveys:
        duration = f"約{len(survey.questions) * 2}分"  # 1問あたり2分と仮定
        survey_data = {
            "id": survey.id,
            "title": survey.title,
            "description": survey.description,
            "response_count": survey.response_count,
            "duration": duration,
            "created_at": survey.created_at
        }
        survey_list.append(survey_data)
    
    return survey_list

@router.get("/my-surveys/{creator_id}", response_model=List[SurveyList], summary="自分の作成したアンケート取得")
async def get_my_surveys(
    creator_id: int,
    db: Session = Depends(get_db)
):
    """
    指定したユーザーが作成したアンケート一覧を取得します（Profile用）
    """
    surveys = survey_service.get_surveys_by_creator(db, creator_id)
    
    # SurveyList形式に変換
    survey_list = []
    for survey in surveys:
        duration = f"約{len(survey.questions) * 2}分"
        survey_data = {
            "id": survey.id,
            "title": survey.title,
            "description": survey.description,
            "response_count": survey.response_count,
            "duration": duration,
            "created_at": survey.created_at
        }
        survey_list.append(survey_data)
    
    return survey_list

@router.post("/", response_model=Survey, summary="アンケート作成")
async def create_survey(
    survey: SurveyCreate,
    db: Session = Depends(get_db)
):
    """
    アンケートを作成します（シンプル版：認証なし）
    """
    return survey_service.create_survey_simple(db, survey)

@router.get("/{survey_id}", response_model=Survey, summary="アンケート詳細取得")
async def get_survey(
    survey_id: int,
    db: Session = Depends(get_db)
):
    """
    指定したアンケートの詳細を取得します
    """
    survey = survey_service.get_survey_by_id(db, survey_id)
    if not survey:
        raise HTTPException(status_code=404, detail="アンケートが見つかりません")
    return survey

@router.delete("/{survey_id}", response_model=Message, summary="アンケート削除")
async def delete_survey(
    survey_id: int,
    db: Session = Depends(get_db)
):
    """
    指定したアンケートを削除します（シンプル版：認証なし）
    """
    survey_service.delete_survey_simple(db, survey_id)
    return {"message": "アンケートが削除されました"}

# アンケート回答機能とAnalytics機能は削除（シンプル版のため基本機能のみ）






