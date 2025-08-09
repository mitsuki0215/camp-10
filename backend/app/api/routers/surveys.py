from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List

from app.models.schemas import SurveyList
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






