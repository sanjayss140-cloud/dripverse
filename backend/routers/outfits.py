import random
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from database import get_db
import models
import schemas
from routers.auth import get_or_create_default_user
from services.stylist_engine import mira_stylist

router = APIRouter(prefix="/api/outfits", tags=["outfits"])

@router.post("/surprise-me")
def surprise_me_outfit(req: schemas.SurpriseMeRequest, db: Session = Depends(get_db)):
    """
    SPECIAL "SURPRISE ME" BUTTON FEATURE:
    Generates a creative outfit using available wardrobe items,
    avoiding repetitive patterns and respecting user exclusions.
    """
    user = get_or_create_default_user(db)
    all_items = db.query(models.WardrobeItem).filter(
        models.WardrobeItem.user_id == user.id,
        ~models.WardrobeItem.id.in_(req.excluded_item_ids) if req.excluded_item_ids else True
    ).all()
    
    if not all_items:
        raise HTTPException(
            status_code=400,
            detail="Your wardrobe needs more items to build combinations. Please upload a few pieces!"
        )

    # Bucket by category
    uppers = [i for i in all_items if i.category == "UPPERWEAR"]
    bottoms = [i for i in all_items if i.category == "BOTTOMWEAR"]
    outers = [i for i in all_items if i.category == "OUTERWEAR"]
    shoes = [i for i in all_items if i.category == "FOOTWEAR"]
    accessories = [i for i in all_items if i.category == "ACCESSORIES"]

    chosen_items = []
    
    # 1. Select Upper
    if uppers:
        chosen_upper = random.choice(uppers)
        chosen_items.append(chosen_upper)
    
    # 2. Select Bottom (prefer contrasting or matching color)
    if bottoms:
        if chosen_items:
            # Color contrast preference
            up_color = chosen_items[0].main_color.lower()
            contrasting = [b for b in bottoms if b.main_color.lower() != up_color]
            chosen_bottom = random.choice(contrasting) if contrasting else random.choice(bottoms)
        else:
            chosen_bottom = random.choice(bottoms)
        chosen_items.append(chosen_bottom)
        
    # 3. Optional Outerwear (40% chance if available)
    if outers and random.random() > 0.5:
        chosen_items.append(random.choice(outers))
        
    # 4. Footwear
    if shoes:
        chosen_items.append(random.choice(shoes))
        
    # 5. Accessory
    if accessories and random.random() > 0.4:
        chosen_items.append(random.choice(accessories))

    if not chosen_items:
        # Fallback: grab random 2-3 items
        chosen_items = random.sample(all_items, min(3, len(all_items)))

    # Evaluate compatibility
    items_dict = [{"name": it.name, "category": it.category, "main_color": it.main_color, "style": it.style} for it in chosen_items]
    eval_data = mira_stylist.evaluate_outfit_combination(items_dict, mode="casual", occasion=req.preferred_occasion or "Weekend Vibe")

    return {
        "status": "success",
        "title": f"Surprise Look: {chosen_items[0].name} Edit",
        "selected_items": [schemas.WardrobeItemResponse.model_validate(it) for it in chosen_items],
        "suggested_model_type": req.preferred_model_type or "model_a_anime_male",
        "occasion": req.preferred_occasion or "Casual Day Out",
        "compatibility_score": eval_data["rating"],
        "stylist_appreciation": eval_data["appreciation"],
        "stylist_suggestions": eval_data["practical_suggestions"],
        "color_harmony": eval_data["color_balance_feedback"]
    }

@router.post("/battle", response_model=schemas.OutfitBattleResponse)
def outfit_battle(req: schemas.OutfitBattleRequest, db: Session = Depends(get_db)):
    """
    OUTFIT BATTLE:
    Side-by-side comparison of Outfit A vs Outfit B.
    MIRA evaluates styling, silhouette, color balance, and provides an encouraging verdict.
    """
    user = get_or_create_default_user(db)
    
    items_a = db.query(models.WardrobeItem).filter(
        models.WardrobeItem.id.in_(req.outfit_a_ids),
        models.WardrobeItem.user_id == user.id
    ).all()
    
    items_b = db.query(models.WardrobeItem).filter(
        models.WardrobeItem.id.in_(req.outfit_b_ids),
        models.WardrobeItem.user_id == user.id
    ).all()

    dict_a = [{"name": i.name, "category": i.category, "main_color": i.main_color, "style": i.style} for i in items_a]
    dict_b = [{"name": i.name, "category": i.category, "main_color": i.main_color, "style": i.style} for i in items_b]

    battle_result = mira_stylist.compare_outfits_battle(
        outfit_a_items=dict_a,
        outfit_b_items=dict_b,
        occasion=req.occasion
    )

    return schemas.OutfitBattleResponse(
        appreciation_both=battle_result["appreciation_both"],
        outfit_a_analysis=battle_result["outfit_a_analysis"],
        outfit_b_analysis=battle_result["outfit_b_analysis"],
        winner_recommendation=battle_result["winner_recommendation"],
        stylist_verdict=battle_result["stylist_verdict"],
        actionable_upgrades=battle_result["actionable_upgrades"]
    )
