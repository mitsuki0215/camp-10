from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import csv
import io
from app.models.user_models import User
from app.models.survey_models import Survey, SurveyResponse
from app.models.schemas import SurveyList, Survey as SurveySchema, SurveyCreate, SurveyUpdate, SurveyResponseCreate, SurveyResponse as SurveyResponseSchema, Message
from app.core.database import get_db
from auth import get_current_verified_user, get_current_user

router = APIRouter(prefix="/api/surveys", tags=["surveys"])

@router.get("/", response_model=List[SurveyList])
async def get_surveys(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get list of active surveys"""
    surveys = db.query(Survey).filter(
        Survey.is_active == True
    ).offset(skip).limit(limit).all()
    
    # Convert to SurveyList format
    survey_list = []
    for survey in surveys:
        duration = f"約{len(survey.questions) * 2}分"  # Estimate 2 minutes per question
        survey_data = {
            "id": survey.id,
            "title": survey.title,
            "description": survey.description,
            "response_count": survey.response_count,
            "duration": duration,
            "created_at": survey.created_at
        }
        survey_list.append(SurveyList(**survey_data))
    
    return survey_list

@router.get("/{survey_id}", response_model=SurveySchema)
async def get_survey(
    survey_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific survey by ID"""
    survey = db.query(Survey).filter(
        Survey.id == survey_id,
        Survey.is_active == True
    ).first()
    
    if not survey:
        raise HTTPException(
            status_code=404,
            detail="Survey not found"
        )
    
    return survey

@router.post("/", response_model=SurveySchema)
async def create_survey(
    survey: SurveyCreate,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """Create a new survey"""
    # Convert questions to dict format for JSON storage
    questions_dict = [q.dict() for q in survey.questions]
    
    db_survey = Survey(
        title=survey.title,
        description=survey.description,
        questions=questions_dict,
        creator_id=current_user.id,
        required_points=getattr(survey, 'required_points', 1000),
        reward_points=getattr(survey, 'reward_points', 50),
        target_responses=getattr(survey, 'target_responses', 50),
        estimated_time=getattr(survey, 'estimated_time', 5)
    )
    
    db.add(db_survey)
    db.commit()
    db.refresh(db_survey)
    
    # Award points to user for creating survey
    current_user.points += 10
    current_user.experience += 50
    
    # Check for rank upgrade
    if current_user.experience >= current_user.experience_to_next:
        current_user.experience -= current_user.experience_to_next
        current_user.experience_to_next = int(current_user.experience_to_next * 1.5)
        
        # Simple rank system
        if current_user.rank == "Bronze" and current_user.experience_to_next >= 150:
            current_user.rank = "Silver"
        elif current_user.rank == "Silver" and current_user.experience_to_next >= 300:
            current_user.rank = "Gold"
        elif current_user.rank == "Gold" and current_user.experience_to_next >= 600:
            current_user.rank = "Platinum"
    
    db.commit()
    
    return db_survey

@router.put("/{survey_id}", response_model=SurveySchema)
async def update_survey(
    survey_id: int,
    survey_update: SurveyUpdate,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """Update a survey (only by creator)"""
    survey = db.query(Survey).filter(
        Survey.id == survey_id
    ).first()
    
    if not survey:
        raise HTTPException(
            status_code=404,
            detail="Survey not found"
        )
    
    if survey.creator_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to update this survey"
        )
    
    # Update fields
    update_data = survey_update.dict(exclude_unset=True)
    
    if "questions" in update_data:
        update_data["questions"] = [q.dict() for q in survey_update.questions]
    
    for field, value in update_data.items():
        setattr(survey, field, value)
    
    db.commit()
    db.refresh(survey)
    
    return survey

@router.patch("/{survey_id}/toggle-status", response_model=Message)
async def toggle_survey_status(
    survey_id: int,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """Toggle survey status (active/inactive) - only by creator"""
    survey = db.query(Survey).filter(
        Survey.id == survey_id
    ).first()
    
    if not survey:
        raise HTTPException(
            status_code=404,
            detail="Survey not found"
        )
    
    if survey.creator_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to modify this survey"
        )
    
    # Toggle status
    if survey.is_active:
        survey.is_active = False
        survey.status = 'completed'
        message = "Survey ended successfully"
    else:
        survey.is_active = True
        survey.status = 'active'
        message = "Survey reactivated successfully"
    
    db.commit()
    
    return {"message": message}

@router.delete("/{survey_id}", response_model=Message)
async def delete_survey(
    survey_id: int,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """Delete a survey (only by creator)"""
    survey = db.query(Survey).filter(
        Survey.id == survey_id
    ).first()
    
    if not survey:
        raise HTTPException(
            status_code=404,
            detail="Survey not found"
        )
    
    if survey.creator_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to delete this survey"
        )
    
    # Delete associated responses first
    db.query(SurveyResponse).filter(
        SurveyResponse.survey_id == survey_id
    ).delete()
    
    # Delete survey
    db.delete(survey)
    db.commit()
    
    return {"message": "Survey deleted successfully"}

def get_current_user_optional(
    db: Session = Depends(get_db),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))
) -> Optional[User]:
    """Get current user if authenticated, otherwise return None"""
    if not credentials:
        return None
    
    try:
        from auth import verify_token
        token_data = verify_token(credentials.credentials)
        if token_data is None:
            return None
        
        user = db.query(User).filter(User.firebase_uid == token_data.username).first()
        return user if user and user.is_active else None
    except:
        return None

@router.post("/{survey_id}/responses", response_model=Message)
async def submit_survey_response(
    survey_id: int,
    response: SurveyResponseCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Submit a response to a survey"""
    survey = db.query(Survey).filter(
        Survey.id == survey_id,
        Survey.is_active == True
    ).first()
    
    if not survey:
        raise HTTPException(
            status_code=404,
            detail="Survey not found"
        )
    
    # Check if user already responded (if logged in)
    if current_user:
        existing_response = db.query(SurveyResponse).filter(
            SurveyResponse.survey_id == survey_id,
            SurveyResponse.user_id == current_user.id
        ).first()
        
        if existing_response:
            raise HTTPException(
                status_code=400,
                detail="You have already responded to this survey"
            )
    
    # Create response
    points_earned = survey.reward_points if current_user else 0
    db_response = SurveyResponse(
        survey_id=survey_id,
        user_id=current_user.id if current_user else None,
        responses=response.responses,
        points_earned=points_earned
    )
    
    db.add(db_response)
    
    # Update survey response count
    survey.response_count += 1
    
    # Award points to user for responding (if logged in)
    if current_user:
        current_user.points += points_earned
        current_user.experience += points_earned
        
        # Check for rank upgrade
        if current_user.experience >= current_user.experience_to_next:
            current_user.experience -= current_user.experience_to_next
            current_user.experience_to_next = int(current_user.experience_to_next * 1.5)
            
            if current_user.rank == "Bronze" and current_user.experience_to_next >= 150:
                current_user.rank = "Silver"
            elif current_user.rank == "Silver" and current_user.experience_to_next >= 300:
                current_user.rank = "Gold"
            elif current_user.rank == "Gold" and current_user.experience_to_next >= 600:
                current_user.rank = "Platinum"
    
    db.commit()
    
    return {"message": "Response submitted successfully"}

@router.get("/{survey_id}/responses", response_model=List[SurveyResponseSchema])
async def get_survey_responses(
    survey_id: int,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """Get responses for a survey (only by survey creator)"""
    survey = db.query(Survey).filter(
        Survey.id == survey_id
    ).first()
    
    if not survey:
        raise HTTPException(
            status_code=404,
            detail="Survey not found"
        )
    
    if survey.creator_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to view responses for this survey"
        )
    
    responses = db.query(SurveyResponse).filter(
        SurveyResponse.survey_id == survey_id
    ).all()
    
    return responses

@router.get("/{survey_id}/export-csv", response_class=StreamingResponse)
async def export_survey_csv(
    survey_id: int,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db)
):
    """Export survey responses as CSV (only by survey creator)"""
    survey = db.query(Survey).filter(
        Survey.id == survey_id
    ).first()
    
    if not survey:
        raise HTTPException(
            status_code=404,
            detail="Survey not found"
        )
    
    if survey.creator_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to export responses for this survey"
        )
    
    responses = db.query(SurveyResponse).filter(
        SurveyResponse.survey_id == survey_id
    ).all()
    
    # Create CSV content
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Get question texts from survey
    questions = survey.questions
    headers = ['Response ID', 'User ID', 'Created At']
    
    # Add question headers
    for i, question in enumerate(questions):
        headers.append(f"Q{i+1}: {question.get('text', 'Question')[:50]}")
    
    writer.writerow(headers)
    
    # Write response data
    for response in responses:
        row = [
            response.id,
            response.user_id or 'Anonymous',
            response.created_at.strftime('%Y-%m-%d %H:%M:%S')
        ]
        
        # Add response answers
        response_data = response.responses
        for i, question in enumerate(questions):
            question_key = str(i)
            answer = response_data.get(question_key, '')
            if isinstance(answer, list):
                answer = ', '.join(map(str, answer))
            row.append(str(answer))
        
        writer.writerow(row)
    
    # Prepare response
    output.seek(0)
    filename = f"survey_{survey_id}_{survey.title.replace(' ', '_')}_responses.csv"
    
    return StreamingResponse(
        io.StringIO(output.getvalue()),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )