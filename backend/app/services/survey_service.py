from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models import Survey, SurveyResponse, User
from app.models.schemas import SurveyCreate, SurveyUpdate

class SurveyService:
    """アンケートサービス"""
    
    def get_active_surveys(self, db: Session, skip: int = 0, limit: int = 100) -> List[Survey]:
        """アクティブなアンケート一覧を取得"""
        return db.query(Survey).filter(
            Survey.is_active == True
        ).offset(skip).limit(limit).all()
    
    def get_survey_by_id(self, db: Session, survey_id: int) -> Optional[Survey]:
        """IDでアンケートを取得"""
        return db.query(Survey).filter(
            Survey.id == survey_id,
            Survey.is_active == True
        ).first()
    
    def create_survey(self, db: Session, survey: SurveyCreate, creator: User) -> Survey:
        """アンケートを作成"""
        questions_dict = [q.dict() for q in survey.questions]
        
        db_survey = Survey(
            title=survey.title,
            description=survey.description,
            questions=questions_dict,
            creator_id=creator.id
        )
        
        db.add(db_survey)
        db.commit()
        db.refresh(db_survey)
        
        # ユーザーにポイントと経験値を付与
        self._award_points_for_creation(db, creator)
        
        return db_survey
    
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
    
    def submit_response(
        self, 
        db: Session, 
        survey_id: int, 
        responses: dict, 
        user: Optional[User] = None
    ) -> None:
        """アンケートに回答"""
        survey = self.get_survey_by_id(db, survey_id)
        if not survey:
            raise HTTPException(status_code=404, detail="アンケートが見つかりません")
        
        # ユーザーが既に回答済みかチェック（ログイン済みの場合）
        if user:
            existing_response = db.query(SurveyResponse).filter(
                SurveyResponse.survey_id == survey_id,
                SurveyResponse.user_id == user.id
            ).first()
            
            if existing_response:
                raise HTTPException(status_code=400, detail="既にこのアンケートに回答済みです")
        
        # 回答を保存
        db_response = SurveyResponse(
            survey_id=survey_id,
            user_id=user.id if user else None,
            responses=responses
        )
        
        db.add(db_response)
        
        # アンケートの回答数を更新
        survey.response_count += 1
        
        # ユーザーにポイントと経験値を付与（ログイン済みの場合）
        if user:
            self._award_points_for_response(db, user)
        
        db.commit()
    
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
    
    def _award_points_for_creation(self, db: Session, user: User):
        """アンケート作成時のポイント・経験値付与"""
        user.points += 10
        user.experience += 50
        self._check_rank_upgrade(user)
        db.commit()
    
    def _award_points_for_response(self, db: Session, user: User):
        """アンケート回答時のポイント・経験値付与"""
        user.points += 5
        user.experience += 20
        self._check_rank_upgrade(user)
        db.commit()
    
    def _check_rank_upgrade(self, user: User):
        """ランクアップのチェック"""
        if user.experience >= user.experience_to_next:
            user.experience -= user.experience_to_next
            user.experience_to_next = int(user.experience_to_next * 1.5)
            
            # ランクアップ判定
            if user.rank == "Bronze" and user.experience_to_next >= 150:
                user.rank = "Silver"
            elif user.rank == "Silver" and user.experience_to_next >= 300:
                user.rank = "Gold"
            elif user.rank == "Gold" and user.experience_to_next >= 600:
                user.rank = "Platinum"

# グローバルアンケートサービスインスタンス
survey_service = SurveyService()