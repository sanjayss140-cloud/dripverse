from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from database import get_db
import models
import schemas
from routers.auth import get_or_create_default_user
from services.ai_service import ai_service
from services.garment_engine import MODELS_CATALOG

router = APIRouter(prefix="/api/tryon", tags=["tryon"])

def format_outfit_response(outfit: models.Outfit, db: Session) -> schemas.TryOnResponse:
    # Gather views map
    views_map = {}
    for v in outfit.views:
        views_map[v.view_type] = v.image_url
        
    # If FRONT missing, use primary
    if "FRONT" not in views_map and outfit.generated_image_url:
        views_map["FRONT"] = outfit.generated_image_url
        
    # Gather wardrobe items
    wardrobe_items = []
    for oi in outfit.items:
        if oi.wardrobe_item:
            wardrobe_items.append(schemas.WardrobeItemResponse.model_validate(oi.wardrobe_item))
            
    return schemas.TryOnResponse(
        outfit_id=outfit.id,
        name=outfit.name,
        model_type=outfit.model_type,
        model_settings=outfit.model_settings or {},
        generated_image_url=outfit.generated_image_url or (views_map.get("FRONT", "")),
        views=views_map,
        occasion=outfit.occasion or "Casual",
        rating=outfit.rating or 9.0,
        stylist_notes=outfit.stylist_notes or "Stunning aesthetic synergy!",
        wardrobe_items=wardrobe_items,
        is_favorite=outfit.is_favorite or False,
        created_at=outfit.created_at
    )

@router.post("/generate", response_model=schemas.TryOnResponse)
async def generate_virtual_tryon(
    req: schemas.TryOnRequest,
    db: Session = Depends(get_db)
):
    user = get_or_create_default_user(db)
    
    # Collect requested wardrobe item IDs
    item_ids = []
    slot_map = {}
    
    if req.upperwear_id:
        item_ids.append(req.upperwear_id)
        slot_map[req.upperwear_id] = "UPPERWEAR"
    if req.bottomwear_id:
        item_ids.append(req.bottomwear_id)
        slot_map[req.bottomwear_id] = "BOTTOMWEAR"
    if req.outerwear_id:
        item_ids.append(req.outerwear_id)
        slot_map[req.outerwear_id] = "OUTERWEAR"
    if req.footwear_id:
        item_ids.append(req.footwear_id)
        slot_map[req.footwear_id] = "FOOTWEAR"
    for acc_id in req.accessory_ids:
        item_ids.append(acc_id)
        slot_map[acc_id] = "ACCESSORY"
        
    if not item_ids:
        raise HTTPException(
            status_code=400,
            detail="Please select at least one garment or accessory to try on."
        )
        
    # Fetch wardrobe items from DB
    db_items = db.query(models.WardrobeItem).filter(
        models.WardrobeItem.id.in_(item_ids),
        models.WardrobeItem.user_id == user.id
    ).all()
    
    if not db_items:
        raise HTTPException(status_code=404, detail="Selected wardrobe items could not be found.")

    # Create Outfit record
    model_type = req.model_type if req.model_type in MODELS_CATALOG else "model_a_anime_male"
    
    outfit = models.Outfit(
        user_id=user.id,
        name=req.name or f"Drip Ensemble #{len(user.outfits) + 1}",
        model_type=model_type,
        model_settings=req.model_settings or {
            "skin_tone": user.profile.skin_tone if user.profile else "#d8b29c",
            "body_proportions": user.profile.body_proportions if user.profile else "regular"
        },
        occasion=req.occasion or "Casual Outing",
        is_favorite=False
    )
    db.add(outfit)
    db.commit()
    db.refresh(outfit)

    # Attach OutfitItems
    for it in db_items:
        slot = slot_map.get(it.id, it.category)
        oi = models.OutfitItem(
            outfit_id=outfit.id,
            wardrobe_item_id=it.id,
            slot_type=slot
        )
        db.add(oi)
    db.commit()

    # Convert items to dicts for AI service
    items_payload = [
        {
            "id": it.id,
            "name": it.name,
            "category": it.category,
            "subcategory": it.subcategory,
            "main_color": it.main_color,
            "main_color_hex": it.main_color_hex,
            "secondary_colors": it.secondary_colors,
            "pattern": it.pattern,
            "material": it.material,
            "style": it.style,
            "clean_image_url": it.clean_image_url,
            "image_url": it.image_url
        }
        for it in db_items
    ]

    # Generate multi-view try-on
    result = await ai_service.generate_virtual_tryon(
        outfit_id=outfit.id,
        model_type=model_type,
        items=items_payload,
        model_settings=outfit.model_settings
    )

    # Save GeneratedView records
    for view_type, img_url in result["views"].items():
        gv = models.GeneratedView(
            outfit_id=outfit.id,
            view_type=view_type,
            image_url=img_url
        )
        db.add(gv)

    # Update outfit record with primary image and stylist notes
    outfit.generated_image_url = result["primary_url"]
    outfit.rating = result["rating"]
    outfit.stylist_notes = result["stylist_notes"]
    db.commit()
    db.refresh(outfit)

    return format_outfit_response(outfit, db)

@router.get("/history", response_model=List[schemas.TryOnResponse])
def get_tryon_history(db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    outfits = db.query(models.Outfit).filter(
        models.Outfit.user_id == user.id
    ).order_by(models.Outfit.created_at.desc()).all()
    
    return [format_outfit_response(o, db) for o in outfits]

@router.get("/{outfit_id}", response_model=schemas.TryOnResponse)
def get_outfit(outfit_id: int, db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    outfit = db.query(models.Outfit).filter(
        models.Outfit.id == outfit_id,
        models.Outfit.user_id == user.id
    ).first()
    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit not found.")
    return format_outfit_response(outfit, db)

@router.post("/{outfit_id}/favorite")
def toggle_favorite_outfit(outfit_id: int, db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    outfit = db.query(models.Outfit).filter(
        models.Outfit.id == outfit_id,
        models.Outfit.user_id == user.id
    ).first()
    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit not found.")
    outfit.is_favorite = not outfit.is_favorite
    db.commit()
    return {"status": "success", "is_favorite": outfit.is_favorite}

@router.delete("/{outfit_id}")
def delete_outfit(outfit_id: int, db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    outfit = db.query(models.Outfit).filter(
        models.Outfit.id == outfit_id,
        models.Outfit.user_id == user.id
    ).first()
    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit not found.")
    db.delete(outfit)
    db.commit()
    return {"status": "success", "message": "Outfit removed from lookbook"}
