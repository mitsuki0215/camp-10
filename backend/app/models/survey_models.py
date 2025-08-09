from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Survey(Base):
    """アンケートモデル（ハッカソン拡張版）"""
    __tablename__ = "surveys"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    questions = Column(JSON, nullable=False)  # 質問をJSONで保存
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    response_count = Column(Integer, default=0)
    # ハッカソン拡張フィールド
    required_points = Column(Integer, default=1000)  # 作成に必要なポイント
    reward_points = Column(Integer, default=50)      # 回答者への報酬ポイント
    deadline = Column(DateTime(timezone=True), nullable=True)  # 回答締切
    target_responses = Column(Integer, default=50)    # 目標回答数
    estimated_time = Column(Integer, default=5)       # 推定回答時間（分）
    priority_score = Column(Integer, default=0)       # 表示優先度スコア
    status = Column(String(50), default='active')     # 'active', 'completed', 'expired'
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # リレーション
    creator = relationship("User", back_populates="surveys")
    responses = relationship("SurveyResponse", back_populates="survey")

class SurveyResponse(Base):
    """アンケート回答モデル（ハッカソン拡張版）"""
    __tablename__ = "survey_responses"

    id = Column(Integer, primary_key=True, index=True)
    survey_id = Column(Integer, ForeignKey("surveys.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # 匿名回答を許可
    responses = Column(JSON, nullable=False)  # 回答をJSONで保存
    points_earned = Column(Integer, default=0)  # この回答で獲得したポイント
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # リレーション
    survey = relationship("Survey", back_populates="responses")
    user = relationship("User")