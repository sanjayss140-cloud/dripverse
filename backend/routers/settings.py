import os
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import Dict, Any

from database import get_db
import models
import schemas
from routers.auth import get_or_create_default_user
from services.ai_service import ai_service
from config import GEMINI_API_KEY

router = APIRouter(prefix="/api/settings", tags=["settings"])

@router.get("")
def get_settings(db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    profile = user.profile
    
    # Check if Gemini key is set in env or profile
    has_gemini = bool(ai_service.gemini_key or (profile and profile.api_keys.get("gemini")))
    
    masked_key = ""
    if has_gemini:
        k = ai_service.gemini_key or (profile.api_keys.get("gemini") if profile else "")
        if len(k) > 8:
            masked_key = f"{k[:4]}••••••••{k[-4:]}"
        else:
            masked_key = "••••••••"

    return {
        "status": "success",
        "active_ai_provider": "Gemini 1.5/2.0 Flash Vision" if has_gemini else "DRIPVERSE Neural Garment Compositor",
        "has_external_api_key": has_gemini,
        "masked_gemini_key": masked_key,
        "preferences": profile.preferences if profile else {},
        "avatar_settings": {
            "preferred_model_type": profile.preferred_model_type if profile else "model_a_anime_male",
            "skin_tone": profile.skin_tone if profile else "#d8b29c",
            "hair_style": profile.hair_style if profile else "Modern Textured",
            "hair_color": profile.hair_color if profile else "#241e1c",
            "body_proportions": profile.body_proportions if profile else "regular",
            "style_preference": profile.style_preference if profile else "Streetwear & Casual"
        }
    }

@router.post("/keys")
def update_api_keys(
    keys_payload: Dict[str, str] = Body(...),
    db: Session = Depends(get_db)
):
    user = get_or_create_default_user(db)
    profile = user.profile
    if not profile:
        profile = models.UserProfile(user_id=user.id)
        db.add(profile)
        
    current_keys = dict(profile.api_keys or {})
    if "gemini" in keys_payload:
        gemini_k = keys_payload["gemini"].strip()
        current_keys["gemini"] = gemini_k
        ai_service.set_user_api_key(gemini_k)
        
    profile.api_keys = current_keys
    db.commit()
    db.refresh(profile)
    
    return {
        "status": "success",
        "message": "AI credentials successfully updated. Provider is active.",
        "active_ai_provider": "Gemini 1.5/2.0 Flash Vision" if current_keys.get("gemini") else "DRIPVERSE Neural Garment Compositor"
    }

@router.get("/export")
def export_wardrobe_data(db: Session = Depends(get_db)):
    """Exports all user wardrobe items, outfits, and collections as a JSON backup."""
    user = get_or_create_default_user(db)
    wardrobe = db.query(models.WardrobeItem).filter(models.WardrobeItem.user_id == user.id).all()
    outfits = db.query(models.Outfit).filter(models.Outfit.user_id == user.id).all()
    collections = db.query(models.SavedCollection).filter(models.SavedCollection.user_id == user.id).all()

    return {
        "user": user.email,
        "wardrobe_count": len(wardrobe),
        "outfit_count": len(outfits),
        "wardrobe": [schemas.WardrobeItemResponse.model_validate(w).model_dump() for w in wardrobe],
        "outfits": [
            {
                "id": o.id,
                "name": o.name,
                "model_type": o.model_type,
                "occasion": o.occasion,
                "rating": o.rating,
                "created_at": str(o.created_at)
            }
            for o in outfits
        ],
        "collections": [{"id": c.id, "name": c.name, "description": c.description} for c in collections]
    }
