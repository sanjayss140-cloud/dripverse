from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from database import get_db
import models
import schemas
from routers.auth import get_or_create_default_user
from services.stylist_engine import mira_stylist, STYLIST_MODES

router = APIRouter(prefix="/api/stylist", tags=["stylist"])

@router.get("/modes")
def get_stylist_modes():
    """
    Returns the SIX specialized stylist modes:
    - Casual Stylist
    - Streetwear Expert
    - Formal Fashion Consultant
    - Date Night Stylist
    - Minimalist Fashion Expert
    - Traditional Indian Fashion Expert
    """
    return [
        {"id": k, **v} for k, v in STYLIST_MODES.items()
    ]

@router.post("/chat", response_model=schemas.StylistChatResponse)
def chat_with_mira(req: schemas.StylistChatRequest, db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    
    # Fetch all user wardrobe items so MIRA recommends only clothes they own!
    all_wardrobe = db.query(models.WardrobeItem).filter(
        models.WardrobeItem.user_id == user.id
    ).all()
    user_wardrobe_dict = [
        {
            "id": it.id,
            "name": it.name,
            "category": it.category,
            "subcategory": it.subcategory,
            "main_color": it.main_color,
            "style": it.style,
            "clean_image_url": it.clean_image_url or it.image_url,
            "image_url": it.image_url
        }
        for it in all_wardrobe
    ]

    # Selected items if provided
    selected_items_dict = []
    if req.selected_wardrobe_ids:
        selected_items = [w for w in all_wardrobe if w.id in req.selected_wardrobe_ids]
        selected_items_dict = [
            {
                "id": it.id,
                "name": it.name,
                "category": it.category,
                "subcategory": it.subcategory,
                "main_color": it.main_color,
                "style": it.style
            }
            for it in selected_items
        ]
    elif req.current_outfit_id:
        outfit = db.query(models.Outfit).filter(models.Outfit.id == req.current_outfit_id).first()
        if outfit:
            selected_items_dict = [
                {
                    "id": oi.wardrobe_item.id,
                    "name": oi.wardrobe_item.name,
                    "category": oi.wardrobe_item.category,
                    "subcategory": oi.wardrobe_item.subcategory,
                    "main_color": oi.wardrobe_item.main_color,
                    "style": oi.wardrobe_item.style
                }
                for oi in outfit.items if oi.wardrobe_item
            ]

    result = mira_stylist.chat(
        message=req.message,
        mode=req.mode,
        items=selected_items_dict,
        occasion=req.occasion or "Casual",
        user_wardrobe=user_wardrobe_dict
    )

    # Convert suggested wardrobe items back to schema
    suggested_schemas = []
    for s in result.get("suggested_wardrobe_items", []):
        matching_db_item = next((w for w in all_wardrobe if w.id == s["id"]), None)
        if matching_db_item:
            suggested_schemas.append(schemas.WardrobeItemResponse.model_validate(matching_db_item))

    return schemas.StylistChatResponse(
        response=result["response"],
        appreciation=result["appreciation"],
        key_strengths=result["key_strengths"],
        practical_suggestions=result["practical_suggestions"],
        suggested_wardrobe_items=suggested_schemas,
        mode_used=req.mode
    )

@router.post("/audit", response_model=schemas.StylistAuditResponse)
def audit_outfit(req: schemas.StylistAuditRequest, db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    items = db.query(models.WardrobeItem).filter(
        models.WardrobeItem.id.in_(req.wardrobe_item_ids),
        models.WardrobeItem.user_id == user.id
    ).all()
    
    items_dict = [
        {
            "id": it.id,
            "name": it.name,
            "category": it.category,
            "subcategory": it.subcategory,
            "main_color": it.main_color,
            "style": it.style,
            "pattern": it.pattern
        }
        for it in items
    ]

    all_wardrobe = db.query(models.WardrobeItem).filter(
        models.WardrobeItem.user_id == user.id
    ).all()
    user_wardrobe_dict = [
        {"id": it.id, "name": it.name, "category": it.category} for it in all_wardrobe
    ]

    eval_data = mira_stylist.evaluate_outfit_combination(
        items=items_dict,
        mode=req.mode,
        occasion=req.occasion,
        user_wardrobe=user_wardrobe_dict
    )

    return schemas.StylistAuditResponse(
        appreciation=eval_data["appreciation"],
        rating=eval_data["rating"],
        strengths=eval_data["key_strengths"],
        suggestions=eval_data["practical_suggestions"],
        color_balance_feedback=eval_data["color_balance_feedback"],
        silhouette_feedback=eval_data["silhouette_feedback"],
        occasion_verdict=eval_data["occasion_verdict"]
    )
