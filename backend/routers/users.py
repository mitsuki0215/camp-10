from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import models
import schemas
from database import get_db
from auth import get_current_verified_user

router = APIRouter(prefix="/api/user", tags=["users"])

@router.get("/profile", response_model=schemas.UserProfile)
async def get_user_profile(
    current_user: models.User = Depends(get_current_verified_user)
):
    """Get current user's profile"""
    return current_user

@router.put("/profile", response_model=schemas.UserProfile)
async def update_user_profile(
    profile_update: schemas.UserBase,
    current_user: models.User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """Update current user's profile"""
    # Update fields
    current_user.name = profile_update.name
    current_user.grade = profile_update.grade
    
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.get("/surveys", response_model=List[schemas.Survey])
async def get_user_surveys(
    current_user: models.User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """Get current user's created surveys"""
    surveys = db.query(models.Survey).filter(
        models.Survey.creator_id == current_user.id
    ).all()
    
    return surveys

@router.get("/stats", response_model=dict)
async def get_user_stats(
    current_user: models.User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """Get current user's statistics"""
    # Count created surveys
    created_surveys = db.query(models.Survey).filter(
        models.Survey.creator_id == current_user.id
    ).count()
    
    # Count active surveys
    active_surveys = db.query(models.Survey).filter(
        models.Survey.creator_id == current_user.id,
        models.Survey.is_active == True
    ).count()
    
    # Count responses to user's surveys
    total_responses = db.query(models.SurveyResponse).join(
        models.Survey
    ).filter(
        models.Survey.creator_id == current_user.id
    ).count()
    
    # Count user's responses to other surveys
    responses_given = db.query(models.SurveyResponse).filter(
        models.SurveyResponse.user_id == current_user.id
    ).count()
    
    return {
        "created_surveys": created_surveys,
        "active_surveys": active_surveys,
        "total_responses_received": total_responses,
        "responses_given": responses_given,
        "rank": current_user.rank,
        "experience": current_user.experience,
        "experience_to_next": current_user.experience_to_next,
        "points": current_user.points
    }