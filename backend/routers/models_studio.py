from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models
import schemas
from routers.auth import get_or_create_default_user
from services.garment_engine import MODELS_CATALOG

router = APIRouter(prefix="/api/models", tags=["models"])

@router.get("", response_model=List[schemas.VirtualModelOption])
def list_virtual_models():
    """
    Returns the SIX selectable virtual fashion model options:
    - Model A: Anime Male
    - Model B: Anime Female
    - Model C: Real Human Male
    - Model D: Real Human Female
    - Model E: Male Mannequin
    - Model F: Female Mannequin
    """
    return list(MODELS_CATALOG.values())

@router.get("/{model_id}", response_model=schemas.VirtualModelOption)
def get_model(model_id: str):
    if model_id not in MODELS_CATALOG:
        raise HTTPException(status_code=404, detail="Virtual model not found.")
    return MODELS_CATALOG[model_id]

@router.post("/customize", response_model=schemas.UserProfileResponse)
def customize_avatar(
    custom_data: schemas.ModelCustomization,
    db: Session = Depends(get_db)
):
    user = get_or_create_default_user(db)
    profile = user.profile
    if not profile:
        profile = models.UserProfile(user_id=user.id)
        db.add(profile)
        
    profile.preferred_model_type = custom_data.model_type
    profile.skin_tone = custom_data.skin_tone
    profile.hair_style = custom_data.hair_style
    profile.hair_color = custom_data.hair_color
    profile.body_proportions = custom_data.body_proportions
    
    db.commit()
    db.refresh(profile)
    return profile
