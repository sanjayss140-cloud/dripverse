from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import CORS_ORIGINS, UPLOAD_DIR, PROCESSED_DIR, GENERATED_DIR
from database import engine, Base, SessionLocal
import models
from seed_data import seed_starter_wardrobe_if_empty
from routers.auth import get_or_create_default_user

# Routers
from routers.auth import router as auth_router
from routers.wardrobe import router as wardrobe_router
from routers.models_studio import router as models_router
from routers.tryon import router as tryon_router
from routers.stylist import router as stylist_router
from routers.outfits import router as outfits_router
from routers.color_lab import router as color_lab_router
from routers.collections import router as collections_router
from routers.planner import router as planner_router
from routers.settings import router as settings_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        user = get_or_create_default_user(db)
        seed_starter_wardrobe_if_empty(db, user)
    finally:
        db.close()
    yield

app = FastAPI(
    title="DRIPVERSE AI Fashion Studio API",
    version="1.0.0",
    description="Backend engine for AI Personal Fashion Stylist, Wardrobe Management & Virtual Try-On",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static Media Mounts
app.mount("/api/media/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")
app.mount("/api/media/processed", StaticFiles(directory=str(PROCESSED_DIR)), name="processed")
app.mount("/api/media/generated", StaticFiles(directory=str(GENERATED_DIR)), name="generated")

# Include Routers
app.include_router(auth_router)
app.include_router(wardrobe_router)
app.include_router(models_router)
app.include_router(tryon_router)
app.include_router(stylist_router)
app.include_router(outfits_router)
app.include_router(color_lab_router)
app.include_router(collections_router)
app.include_router(planner_router)
app.include_router(settings_router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": "DRIPVERSE AI Fashion Studio",
        "version": "1.0.0",
        "signature_experience": "Upload -> Select Model -> Create Outfit -> Virtual Try-On -> MIRA Advice -> Save Look"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
