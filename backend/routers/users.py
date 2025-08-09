from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.models.user_models import User
from app.models.survey_models import Survey
from app.models.schemas import UserProfile, UserBase, Survey as SurveySchema
from app.core.database import get_db
from auth import get_current_verified_user

router = APIRouter(prefix="/api/user", tags=["users"])

@router.get("/profile", response_model=UserProfile)
async def get_user_profile(
    current_user: User = Depends(get_current_verified_user)
):
    """Get current user's profile"""
    return current_user

@router.put("/profile", response_model=UserProfile)
async def update_user_profile(
    profile_update: UserBase,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """Update current user's profile"""
    # Update fields
    current_user.name = profile_update.name
    current_user.grade = profile_update.grade
    
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.get("/surveys", response_model=List[SurveySchema])
async def get_user_surveys(db: Session = Depends(get_db)):
    """Get all surveys (no authentication required)"""
    surveys = db.query(Survey).all()
    return surveys


@router.get("/stats", response_model=dict)
async def get_user_stats(
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """Get user statistics"""
    created_surveys = db.query(Survey).filter(
        Survey.creator_id == current_user.id
    ).count()
    
    active_surveys = db.query(Survey).filter(
        Survey.creator_id == current_user.id,
        Survey.is_active == True
    ).count()
    
    # Calculate total responses received on user's surveys
    user_surveys = db.query(Survey).filter(
        Survey.creator_id == current_user.id
    ).all()
    total_responses_received = sum(survey.response_count for survey in user_surveys)
    
    # Count responses given by user
    from app.models.survey_models import SurveyResponse
    responses_given = db.query(SurveyResponse).filter(
        SurveyResponse.user_id == current_user.id
    ).count()
    
    return {
        "created_surveys": created_surveys,
        "active_surveys": active_surveys,
        "total_responses_received": total_responses_received,
        "responses_given": responses_given,
        "rank": current_user.rank,
        "experience": current_user.experience,
        "experience_to_next": current_user.experience_to_next,
        "points": current_user.points
    }