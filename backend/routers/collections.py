from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models
import schemas
from routers.auth import get_or_create_default_user
from routers.tryon import format_outfit_response

router = APIRouter(prefix="/api/collections", tags=["collections"])

DEFAULT_COLLECTIONS = [
    ("Streetwear Rotation", "Heavyweight tees, cargo silhouettes, statement sneakers."),
    ("Office & Smart Casual", "Refined overshirts, tailored trousers, clean minimalism."),
    ("Weekend & Everyday", "Relaxed fit basics, comfort layering, versatile tones."),
    ("Date Night & Evening", "Mood lighting palettes, texture depth, subtle jewelry accents."),
    ("College Fits", "Casual layering, everyday backpacks, durable essentials.")
]

def ensure_default_collections(user: models.User, db: Session):
    existing = db.query(models.SavedCollection).filter(models.SavedCollection.user_id == user.id).all()
    if not existing:
        for name, desc in DEFAULT_COLLECTIONS:
            col = models.SavedCollection(
                user_id=user.id,
                name=name,
                description=desc
            )
            db.add(col)
        db.commit()

@router.get("", response_model=List[schemas.SavedCollectionResponse])
def get_collections(db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    ensure_default_collections(user, db)
    
    collections = db.query(models.SavedCollection).filter(
        models.SavedCollection.user_id == user.id
    ).all()

    resp = []
    for c in collections:
        outfits = [format_outfit_response(item.outfit, db) for item in c.items if item.outfit]
        resp.append(
            schemas.SavedCollectionResponse(
                id=c.id,
                user_id=c.user_id,
                name=c.name,
                description=c.description,
                outfit_count=len(outfits),
                outfits=outfits,
                created_at=c.created_at
            )
        )
    return resp

@router.post("", response_model=schemas.SavedCollectionResponse)
def create_collection(req: schemas.SavedCollectionCreate, db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    col = models.SavedCollection(
        user_id=user.id,
        name=req.name,
        description=req.description
    )
    db.add(col)
    db.commit()
    db.refresh(col)
    return schemas.SavedCollectionResponse(
        id=col.id,
        user_id=col.user_id,
        name=col.name,
        description=col.description,
        outfit_count=0,
        outfits=[],
        created_at=col.created_at
    )

@router.post("/{collection_id}/add/{outfit_id}")
def add_to_collection(collection_id: int, outfit_id: int, db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    col = db.query(models.SavedCollection).filter(
        models.SavedCollection.id == collection_id,
        models.SavedCollection.user_id == user.id
    ).first()
    if not col:
        raise HTTPException(status_code=404, detail="Collection not found.")
        
    outfit = db.query(models.Outfit).filter(
        models.Outfit.id == outfit_id,
        models.Outfit.user_id == user.id
    ).first()
    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit not found.")

    # Avoid duplicate
    existing = db.query(models.SavedCollectionItem).filter(
        models.SavedCollectionItem.collection_id == collection_id,
        models.SavedCollectionItem.outfit_id == outfit_id
    ).first()
    
    if not existing:
        item = models.SavedCollectionItem(collection_id=collection_id, outfit_id=outfit_id)
        db.add(item)
        db.commit()

    return {"status": "success", "message": f"Added '{outfit.name}' to '{col.name}'"}

@router.delete("/{collection_id}/remove/{outfit_id}")
def remove_from_collection(collection_id: int, outfit_id: int, db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    item = db.query(models.SavedCollectionItem).join(models.SavedCollection).filter(
        models.SavedCollectionItem.collection_id == collection_id,
        models.SavedCollectionItem.outfit_id == outfit_id,
        models.SavedCollection.user_id == user.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not in collection.")
    db.delete(item)
    db.commit()
    return {"status": "success", "message": "Outfit removed from collection"}

@router.delete("/{collection_id}")
def delete_collection(collection_id: int, db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    col = db.query(models.SavedCollection).filter(
        models.SavedCollection.id == collection_id,
        models.SavedCollection.user_id == user.id
    ).first()
    if not col:
        raise HTTPException(status_code=404, detail="Collection not found.")
    db.delete(col)
    db.commit()
    return {"status": "success", "message": "Collection deleted"}
