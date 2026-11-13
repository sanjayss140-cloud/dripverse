from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models
import schemas
from routers.auth import get_or_create_default_user
from routers.tryon import format_outfit_response

router = APIRouter(prefix="/api/planner", tags=["planner"])

DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

@router.get("", response_model=List[schemas.CalendarEntryResponse])
def get_weekly_planner(db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    entries = db.query(models.OutfitCalendar).filter(
        models.OutfitCalendar.user_id == user.id
    ).all()
    
    resp = []
    for e in entries:
        outfit_resp = format_outfit_response(e.outfit, db) if e.outfit else None
        resp.append(
            schemas.CalendarEntryResponse(
                id=e.id,
                user_id=e.user_id,
                outfit_id=e.outfit_id,
                scheduled_date=e.scheduled_date,
                occasion=e.occasion or "Casual",
                weather_note=e.weather_note or "Pleasant 22°C",
                outfit=outfit_resp,
                created_at=e.created_at
            )
        )
    return resp

@router.post("/assign", response_model=schemas.CalendarEntryResponse)
def assign_outfit_to_day(req: schemas.CalendarEntryCreate, db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    outfit = db.query(models.Outfit).filter(
        models.Outfit.id == req.outfit_id,
        models.Outfit.user_id == user.id
    ).first()
    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit not found.")

    # Remove existing assignment for this day if any
    existing = db.query(models.OutfitCalendar).filter(
        models.OutfitCalendar.user_id == user.id,
        models.OutfitCalendar.scheduled_date == req.scheduled_date
    ).first()
    if existing:
        db.delete(existing)
        db.commit()

    entry = models.OutfitCalendar(
        user_id=user.id,
        outfit_id=req.outfit_id,
        scheduled_date=req.scheduled_date,
        occasion=req.occasion,
        weather_note=req.weather_note
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)

    outfit_resp = format_outfit_response(entry.outfit, db)
    return schemas.CalendarEntryResponse(
        id=entry.id,
        user_id=entry.user_id,
        outfit_id=entry.outfit_id,
        scheduled_date=entry.scheduled_date,
        occasion=entry.occasion,
        weather_note=entry.weather_note,
        outfit=outfit_resp,
        created_at=entry.created_at
    )

@router.delete("/{entry_id}")
def remove_planner_entry(entry_id: int, db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    entry = db.query(models.OutfitCalendar).filter(
        models.OutfitCalendar.id == entry_id,
        models.OutfitCalendar.user_id == user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Calendar entry not found.")
    db.delete(entry)
    db.commit()
    return {"status": "success", "message": "Outfit removed from calendar"}
