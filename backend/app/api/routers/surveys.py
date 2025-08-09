from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.models import User
from app.models.schemas import (
    SurveyList, Survey, SurveyCreate, SurveyUpdate,
    SurveyResponseCreate, SurveyResponse, Message
)
from app.core.database import get_db
from app.services.auth_service import auth_service
from app.services.survey_service import survey_service
from app.utils.dependencies import get_current_user_optional

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

@router.get("/{survey_id}", response_model=Survey, summary="アンケート詳細取得")
async def get_survey(
    survey_id: int,
    db: Session = Depends(get_db)
):
    """
    指定されたIDのアンケート詳細を取得します
    
    - **survey_id**: アンケートID
    """
    survey = survey_service.get_survey_by_id(db, survey_id)
    if not survey:
        raise HTTPException(
            status_code=404,
            detail="アンケートが見つかりません"
        )
    
    return survey

@router.post("/", response_model=Survey, summary="アンケート作成")
async def create_survey(
    survey: SurveyCreate,
    current_user: User = Depends(auth_service.get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    新しいアンケートを作成します
    
    - **title**: アンケートタイトル
    - **description**: アンケート説明（任意）
    - **questions**: 質問リスト
    """
    return survey_service.create_survey(db, survey, current_user)

@router.put("/{survey_id}", response_model=Survey, summary="アンケート更新")
async def update_survey(
    survey_id: int,
    survey_update: SurveyUpdate,
    current_user: User = Depends(auth_service.get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    アンケートを更新します（作成者のみ）
    
    - **survey_id**: アンケートID
    - **title**: アンケートタイトル（任意）
    - **description**: アンケート説明（任意）
    - **questions**: 質問リスト（任意）
    - **is_active**: アクティブ状態（任意）
    """
    return survey_service.update_survey(db, survey_id, survey_update, current_user)

@router.delete("/{survey_id}", response_model=Message, summary="アンケート削除")
async def delete_survey(
    survey_id: int,
    current_user: User = Depends(auth_service.get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    アンケートを削除します（作成者のみ）
    
    - **survey_id**: アンケートID
    """
    survey_service.delete_survey(db, survey_id, current_user)
    return {"message": "アンケートを削除しました"}

@router.post("/{survey_id}/responses", response_model=Message, summary="アンケート回答")
async def submit_survey_response(
    survey_id: int,
    response: SurveyResponseCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    アンケートに回答します
    
    - **survey_id**: アンケートID
    - **responses**: 回答内容（question_id -> answer の形式）
    """
    survey_service.submit_response(db, survey_id, response.responses, current_user)
    return {"message": "回答を送信しました"}

@router.get("/{survey_id}/responses", response_model=List[SurveyResponse], summary="アンケート回答一覧")
async def get_survey_responses(
    survey_id: int,
    current_user: User = Depends(auth_service.get_current_verified_user),
    db: Session = Depends(get_db)
):
    """
    アンケートの回答一覧を取得します（作成者のみ）
    
    - **survey_id**: アンケートID
    """
    return survey_service.get_survey_responses(db, survey_id, current_user)