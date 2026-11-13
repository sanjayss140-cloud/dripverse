from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float, JSON
)
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    wardrobe_items = relationship("WardrobeItem", back_populates="user", cascade="all, delete-orphan")
    outfits = relationship("Outfit", back_populates="user", cascade="all, delete-orphan")
    collections = relationship("SavedCollection", back_populates="user", cascade="all, delete-orphan")
    calendar_entries = relationship("OutfitCalendar", back_populates="user", cascade="all, delete-orphan")
    jobs = relationship("AIGenerationJob", back_populates="user", cascade="all, delete-orphan")

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    display_name = Column(String(150), default="Fashionista")
    gender_presentation = Column(String(50), default="all") # male, female, neutral, all
    skin_tone = Column(String(50), default="#d8b29c")
    hair_style = Column(String(50), default="Modern Textured")
    hair_color = Column(String(50), default="#2a2321")
    body_proportions = Column(String(50), default="regular") # slim, athletic, regular, tall
    preferred_model_type = Column(String(50), default="model_a_anime_male")
    style_preference = Column(String(100), default="Streetwear & Casual")
    preferences = Column(JSON, default=dict)
    api_keys = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="profile")

class WardrobeItem(Base):
    __tablename__ = "wardrobe_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    category = Column(String(50), nullable=False, index=True) # UPPERWEAR, BOTTOMWEAR, OUTERWEAR, FOOTWEAR, ACCESSORIES, OTHER
    subcategory = Column(String(100), nullable=False) # e.g. T-shirts, Jeans, Sneakers
    main_color = Column(String(50), nullable=False) # e.g. Midnight Black, Navy, Off-White
    main_color_hex = Column(String(10), default="#18181b")
    secondary_colors = Column(JSON, default=list) # e.g. ["#ffffff", "#8b5cf6"]
    pattern = Column(String(50), default="Solid") # Solid, Striped, Graphic, Checked, Floral, Textured
    material = Column(String(50), default="Cotton") # Cotton, Denim, Leather, Knit, Silk, Linen, Synthetic
    style = Column(String(50), default="Casual") # Casual, Streetwear, Formal, Minimalist, Traditional, Athletic
    image_url = Column(String(500), nullable=False)
    clean_image_url = Column(String(500), nullable=True) # cutout/no-bg image
    match_tags = Column(JSON, default=list)
    is_favorite = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="wardrobe_items")
    outfit_items = relationship("OutfitItem", back_populates="wardrobe_item", cascade="all, delete-orphan")

class Outfit(Base):
    __tablename__ = "outfits"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    model_type = Column(String(50), nullable=False) # model_a_anime_male, model_b_anime_female, etc.
    model_settings = Column(JSON, default=dict)
    generated_image_url = Column(String(500), nullable=True)
    occasion = Column(String(100), default="Casual")
    rating = Column(Float, default=9.2)
    stylist_notes = Column(Text, nullable=True)
    is_favorite = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="outfits")
    items = relationship("OutfitItem", back_populates="outfit", cascade="all, delete-orphan")
    views = relationship("GeneratedView", back_populates="outfit", cascade="all, delete-orphan")
    collection_items = relationship("SavedCollectionItem", back_populates="outfit", cascade="all, delete-orphan")
    calendar_entries = relationship("OutfitCalendar", back_populates="outfit", cascade="all, delete-orphan")

class OutfitItem(Base):
    __tablename__ = "outfit_items"

    id = Column(Integer, primary_key=True, index=True)
    outfit_id = Column(Integer, ForeignKey("outfits.id", ondelete="CASCADE"), nullable=False, index=True)
    wardrobe_item_id = Column(Integer, ForeignKey("wardrobe_items.id", ondelete="CASCADE"), nullable=False, index=True)
    slot_type = Column(String(50), nullable=False) # UPPERWEAR, BOTTOMWEAR, OUTERWEAR, FOOTWEAR, ACCESSORY

    outfit = relationship("Outfit", back_populates="items")
    wardrobe_item = relationship("WardrobeItem", back_populates="outfit_items")

class GeneratedView(Base):
    __tablename__ = "generated_views"

    id = Column(Integer, primary_key=True, index=True)
    outfit_id = Column(Integer, ForeignKey("outfits.id", ondelete="CASCADE"), nullable=False, index=True)
    view_type = Column(String(50), nullable=False) # FRONT, BACK, LEFT, RIGHT
    image_url = Column(String(500), nullable=False)

    outfit = relationship("Outfit", back_populates="views")

class SavedCollection(Base):
    __tablename__ = "saved_collections"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    description = Column(String(300), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="collections")
    items = relationship("SavedCollectionItem", back_populates="collection", cascade="all, delete-orphan")

class SavedCollectionItem(Base):
    __tablename__ = "saved_collection_items"

    id = Column(Integer, primary_key=True, index=True)
    collection_id = Column(Integer, ForeignKey("saved_collections.id", ondelete="CASCADE"), nullable=False, index=True)
    outfit_id = Column(Integer, ForeignKey("outfits.id", ondelete="CASCADE"), nullable=False, index=True)

    collection = relationship("SavedCollection", back_populates="items")
    outfit = relationship("Outfit", back_populates="collection_items")

class OutfitCalendar(Base):
    __tablename__ = "outfit_calendar"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    outfit_id = Column(Integer, ForeignKey("outfits.id", ondelete="CASCADE"), nullable=False, index=True)
    scheduled_date = Column(String(50), nullable=False, index=True) # YYYY-MM-DD or Day Name (Monday, etc.)
    occasion = Column(String(100), default="Casual")
    weather_note = Column(String(150), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="calendar_entries")
    outfit = relationship("Outfit", back_populates="calendar_entries")

class AIGenerationJob(Base):
    __tablename__ = "ai_generation_jobs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(50), default="PENDING") # PENDING, PROCESSING, COMPLETED, FAILED
    provider = Column(String(100), default="dripverse_neural_compositor")
    error_message = Column(Text, nullable=True)
    result_urls = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="jobs")
