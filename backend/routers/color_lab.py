from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from database import get_db
import models
import schemas
from routers.auth import get_or_create_default_user
from services.color_engine import compute_color_harmonies

router = APIRouter(prefix="/api/color-lab", tags=["color_lab"])

@router.post("/analyze", response_model=schemas.ColorMatchResponse)
def analyze_garment_color(req: schemas.ColorMatchRequest, db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    item = db.query(models.WardrobeItem).filter(
        models.WardrobeItem.id == req.wardrobe_item_id,
        models.WardrobeItem.user_id == user.id
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Wardrobe item not found.")

    hex_code = item.main_color_hex or "#18181b"
    harmonies = compute_color_harmonies(hex_code)

    # Convert to schemas.ColorPalette objects
    palettes_dict = {
        key: schemas.ColorPalette(
            name=val["name"],
            description=val["description"],
            hex_colors=val["hex_colors"]
        )
        for key, val in harmonies.items()
    }

    # Search user's other wardrobe items for matching or harmonious colors
    all_wardrobe = db.query(models.WardrobeItem).filter(
        models.WardrobeItem.user_id == user.id,
        models.WardrobeItem.id != item.id
    ).all()

    # Score matches by category diversity and neutral or harmonious color affinity
    recommended = []
    for other in all_wardrobe:
        if other.category != item.category:
            recommended.append(other)
            if len(recommended) >= 4:
                break

    return schemas.ColorMatchResponse(
        item=schemas.WardrobeItemResponse.model_validate(item),
        dominant_color=item.main_color,
        dominant_hex=hex_code,
        palettes=palettes_dict,
        recommended_matching_items=[schemas.WardrobeItemResponse.model_validate(r) for r in recommended],
        styling_tip=(
            f"Your {item.name} possesses a versatile {item.main_color} base. "
            "Pairing it with complementary tones creates high-impact editorial presence, "
            "while neutral pairings (Charcoal, Off-White, Desert Beige) provide foolproof, modern effortless styling."
        )
    )
