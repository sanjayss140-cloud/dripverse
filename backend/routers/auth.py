from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/auth", tags=["auth"])

def get_or_create_default_user(db: Session) -> models.User:
    user = db.query(models.User).filter_by(email="creator@dripverse.studio").first()
    if not user:
        user = models.User(
            email="creator@dripverse.studio",
            username="style_creator"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        profile = models.UserProfile(
            user_id=user.id,
            display_name="Alex Rivera",
            gender_presentation="all",
            skin_tone="#d8b29c",
            hair_style="Modern Textured Quiff",
            hair_color="#241e1c",
            body_proportions="regular",
            preferred_model_type="model_a_anime_male",
            style_preference="Streetwear & Contemporary Casual",
            preferences={
                "notifications": True,
                "auto_cutout": True,
                "high_contrast_mode": False
            },
            api_keys={}
        )
        db.add(profile)
        db.commit()
        db.refresh(user)
    return user

@router.get("/me", response_model=schemas.UserResponse)
def get_current_user(db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    return user

@router.put("/profile", response_model=schemas.UserProfileResponse)
def update_profile(update_data: schemas.UserProfileUpdate, db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    profile = user.profile
    if not profile:
        profile = models.UserProfile(user_id=user.id)
        db.add(profile)
    
    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        if value is not None:
            setattr(profile, key, value)
            
    db.commit()
    db.refresh(profile)
    return profile
