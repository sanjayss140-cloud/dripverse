import os
import shutil
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from database import get_db
from config import UPLOAD_DIR
import models
import schemas
from routers.auth import get_or_create_default_user
from services.ai_service import ai_service

router = APIRouter(prefix="/api/wardrobe", tags=["wardrobe"])

ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
MAX_FILE_SIZE = 15 * 1024 * 1024 # 15 MB

@router.get("", response_model=List[schemas.WardrobeItemResponse])
def get_wardrobe_items(
    category: Optional[str] = Query(None),
    style: Optional[str] = Query(None),
    color: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    favorite_only: bool = Query(False),
    db: Session = Depends(get_db)
):
    user = get_or_create_default_user(db)
    query = db.query(models.WardrobeItem).filter(models.WardrobeItem.user_id == user.id)
    
    if category and category.upper() != "ALL":
        query = query.filter(models.WardrobeItem.category == category.upper())
    if style and style != "All":
        query = query.filter(models.WardrobeItem.style.ilike(f"%{style}%"))
    if color and color != "All":
        query = query.filter(models.WardrobeItem.main_color.ilike(f"%{color}%"))
    if favorite_only:
        query = query.filter(models.WardrobeItem.is_favorite == True)
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                models.WardrobeItem.name.ilike(term),
                models.WardrobeItem.subcategory.ilike(term),
                models.WardrobeItem.main_color.ilike(term),
                models.WardrobeItem.pattern.ilike(term),
                models.WardrobeItem.material.ilike(term)
            )
        )
        
    items = query.order_by(models.WardrobeItem.created_at.desc()).all()
    return items

@router.post("/upload", response_model=List[schemas.WardrobeItemResponse])
async def upload_clothing_items(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    user = get_or_create_default_user(db)
    created_items = []
    
    for file in files:
        if file.content_type not in ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported format '{file.content_type}'. Supported: JPG, JPEG, PNG, WEBP."
            )
            
        # Unique safe filename
        ext = file.filename.split(".")[-1].lower() if "." in file.filename else "jpg"
        clean_name = f"user_{user.id}_{int(os.times().elapsed * 1000)}_{len(created_items)}.{ext}"
        dest_path = UPLOAD_DIR / clean_name
        
        # Save upload to disk
        contents = await file.read()
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail=f"File {file.filename} exceeds 15MB limit.")
            
        with open(dest_path, "wb") as buffer:
            buffer.write(contents)
            
        # Run AI Vision Clothing Analysis + Background Cutout
        analysis = await ai_service.analyze_clothing_image(dest_path, clean_name)
        
        # Create database record
        item = models.WardrobeItem(
            user_id=user.id,
            name=analysis["name"],
            category=analysis["category"],
            subcategory=analysis["subcategory"],
            main_color=analysis["main_color"],
            main_color_hex=analysis["main_color_hex"],
            secondary_colors=analysis["secondary_colors"],
            pattern=analysis["pattern"],
            material=analysis["material"],
            style=analysis["style"],
            image_url=f"/api/media/uploads/{clean_name}",
            clean_image_url=analysis["clean_image_url"],
            match_tags=analysis["match_tags"],
            is_favorite=False
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        created_items.append(item)
        
    return created_items

@router.get("/{item_id}", response_model=schemas.WardrobeItemResponse)
def get_wardrobe_item(item_id: int, db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    item = db.query(models.WardrobeItem).filter(
        models.WardrobeItem.id == item_id,
        models.WardrobeItem.user_id == user.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Wardrobe item not found.")
    return item

@router.put("/{item_id}", response_model=schemas.WardrobeItemResponse)
def update_wardrobe_item(item_id: int, update_data: schemas.WardrobeItemUpdate, db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    item = db.query(models.WardrobeItem).filter(
        models.WardrobeItem.id == item_id,
        models.WardrobeItem.user_id == user.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Wardrobe item not found.")
        
    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        if value is not None:
            setattr(item, key, value)
            
    db.commit()
    db.refresh(item)
    return item

@router.delete("/{item_id}")
def delete_wardrobe_item(item_id: int, db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    item = db.query(models.WardrobeItem).filter(
        models.WardrobeItem.id == item_id,
        models.WardrobeItem.user_id == user.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Wardrobe item not found.")
        
    db.delete(item)
    db.commit()
    return {"status": "success", "message": f"Deleted '{item.name}'"}
