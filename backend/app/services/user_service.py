from typing import List
from sqlalchemy.orm import Session

from app.models import User, Survey, SurveyResponse
from app.models.schemas import UserBase, UserStats

class UserService:
    """ユーザーサービス"""
    
    def update_profile(self, db: Session, user: User, profile_update: UserBase) -> User:
        """ユーザープロフィールを更新"""
        user.name = profile_update.name
        user.grade = profile_update.grade
        
        db.commit()
        db.refresh(user)
        
        return user
    
    def get_user_surveys(self, db: Session, user: User) -> List[Survey]:
        """ユーザーが作成したアンケート一覧を取得"""
        return db.query(Survey).filter(
            Survey.creator_id == user.id
        ).all()
    
    def get_user_stats(self, db: Session, user: User) -> UserStats:
        """ユーザー統計情報を取得"""
        # 作成したアンケート数
        created_surveys = db.query(Survey).filter(
            Survey.creator_id == user.id
        ).count()
        
        # アクティブなアンケート数
        active_surveys = db.query(Survey).filter(
            Survey.creator_id == user.id,
            Survey.is_active == True
        ).count()
        
        # 自分のアンケートへの回答総数
        total_responses = db.query(SurveyResponse).join(
            Survey
        ).filter(
            Survey.creator_id == user.id
        ).count()
        
        # 自分が他のアンケートに回答した数
        responses_given = db.query(SurveyResponse).filter(
            SurveyResponse.user_id == user.id
        ).count()
        
        return UserStats(
            created_surveys=created_surveys,
            active_surveys=active_surveys,
            total_responses_received=total_responses,
            responses_given=responses_given,
            rank=user.rank,
            experience=user.experience,
            experience_to_next=user.experience_to_next,
            points=user.points
        )

# グローバルユーザーサービスインスタンス
user_service = UserService()