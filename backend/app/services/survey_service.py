from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from fastapi import HTTPException

from app.models import Survey, SurveyResponse, User
from app.models.schemas import SurveyCreate, SurveyUpdate

class SurveyService:
    """アンケートサービス"""
    
    def get_active_surveys(self, db: Session, skip: int = 0, limit: int = 100) -> List[Survey]:
        """アクティブなアンケート一覧を取得（シンプル版）"""
        return db.query(Survey).filter(
            Survey.is_active == True
        ).order_by(
            desc(Survey.created_at)
        ).offset(skip).limit(limit).all()
    
    def get_survey_by_id(self, db: Session, survey_id: int) -> Optional[Survey]:
        """IDでアンケートを取得"""
        return db.query(Survey).filter(
            Survey.id == survey_id,
            Survey.is_active == True
        ).first()
    
# ハッカソン版のcreate_surveyは削除 - create_survey_simpleのみ残す
    
    def create_survey_simple(self, db: Session, survey: SurveyCreate) -> Survey:
        """アンケートを作成（シンプル版：認証なし）"""
        questions_dict = [q.dict() for q in survey.questions]
        
        db_survey = Survey(
            title=survey.title,
            description=survey.description,
            questions=questions_dict,
            creator_id=1  # テスト用固定値
        )
        
        db.add(db_survey)
        db.commit()
        db.refresh(db_survey)
        
        return db_survey
    
    def delete_survey_simple(self, db: Session, survey_id: int) -> None:
        """アンケートを削除（シンプル版：認証なし）"""
        survey = db.query(Survey).filter(Survey.id == survey_id).first()
        
        if not survey:
            raise HTTPException(status_code=404, detail="アンケートが見つかりません")
        
        # 関連する回答を先に削除
        db.query(SurveyResponse).filter(
            SurveyResponse.survey_id == survey_id
        ).delete()
        
        # アンケートを削除
        db.delete(survey)
        db.commit()
    
    def get_surveys_by_creator(self, db: Session, creator_id: int) -> List[Survey]:
        """指定したユーザーが作成したアンケート一覧を取得"""
        return db.query(Survey).filter(
            Survey.creator_id == creator_id,
            Survey.is_active == True
        ).order_by(
            desc(Survey.created_at)
        ).all()
    
    def update_survey(
        self, 
        db: Session, 
        survey_id: int, 
        survey_update: SurveyUpdate, 
        current_user: User
    ) -> Survey:
        """アンケートを更新"""
        survey = db.query(Survey).filter(Survey.id == survey_id).first()
        
        if not survey:
            raise HTTPException(status_code=404, detail="アンケートが見つかりません")
        
        if survey.creator_id != current_user.id:
            raise HTTPException(status_code=403, detail="このアンケートを更新する権限がありません")
        
        update_data = survey_update.dict(exclude_unset=True)
        
        if "questions" in update_data:
            update_data["questions"] = [q.dict() for q in survey_update.questions]
        
        for field, value in update_data.items():
            setattr(survey, field, value)
        
        db.commit()
        db.refresh(survey)
        
        return survey
    
    def delete_survey(self, db: Session, survey_id: int, current_user: User) -> None:
        """アンケートを削除"""
        survey = db.query(Survey).filter(Survey.id == survey_id).first()
        
        if not survey:
            raise HTTPException(status_code=404, detail="アンケートが見つかりません")
        
        if survey.creator_id != current_user.id:
            raise HTTPException(status_code=403, detail="このアンケートを削除する権限がありません")
        
        # 関連する回答を先に削除
        db.query(SurveyResponse).filter(
            SurveyResponse.survey_id == survey_id
        ).delete()
        
        # アンケートを削除
        db.delete(survey)
        db.commit()
    
# submit_response機能も削除 - アンケート基本機能に集中
    
    def get_survey_responses(self, db: Session, survey_id: int, current_user: User) -> List[SurveyResponse]:
        """アンケートの回答一覧を取得（作成者のみ）"""
        survey = db.query(Survey).filter(Survey.id == survey_id).first()
        
        if not survey:
            raise HTTPException(status_code=404, detail="アンケートが見つかりません")
        
        if survey.creator_id != current_user.id:
            raise HTTPException(status_code=403, detail="このアンケートの回答を閲覧する権限がありません")
        
        return db.query(SurveyResponse).filter(
            SurveyResponse.survey_id == survey_id
        ).all()
    
# ハッカソン関連の複雑な機能（ポイント取引、優先度計算、ランク機能、分析機能）は削除
# アンケート基本機能に集中

# グローバルアンケートサービスインスタンス
survey_service = SurveyService()