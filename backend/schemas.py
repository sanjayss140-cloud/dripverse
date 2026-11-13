from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

# User Schemas
class UserProfileBase(BaseModel):
    display_name: str = "Fashionista"
    gender_presentation: str = "all"
    skin_tone: str = "#d8b29c"
    hair_style: str = "Modern Textured"
    hair_color: str = "#2a2321"
    body_proportions: str = "regular"
    preferred_model_type: str = "model_a_anime_male"
    style_preference: str = "Streetwear & Casual"
    preferences: Dict[str, Any] = Field(default_factory=dict)
    api_keys: Dict[str, str] = Field(default_factory=dict)

class UserProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    gender_presentation: Optional[str] = None
    skin_tone: Optional[str] = None
    hair_style: Optional[str] = None
    hair_color: Optional[str] = None
    body_proportions: Optional[str] = None
    preferred_model_type: Optional[str] = None
    style_preference: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None
    api_keys: Optional[Dict[str, str]] = None

class UserProfileResponse(UserProfileBase):
    id: int
    user_id: int
    created_at: datetime
    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    profile: Optional[UserProfileResponse] = None
    created_at: datetime
    class Config:
        from_attributes = True

# Wardrobe Schemas
class WardrobeItemBase(BaseModel):
    name: str
    category: str # UPPERWEAR, BOTTOMWEAR, OUTERWEAR, FOOTWEAR, ACCESSORIES, OTHER
    subcategory: str
    main_color: str
    main_color_hex: str = "#18181b"
    secondary_colors: List[str] = Field(default_factory=list)
    pattern: str = "Solid"
    material: str = "Cotton"
    style: str = "Casual"
    match_tags: List[str] = Field(default_factory=list)
    is_favorite: bool = False

class WardrobeItemCreate(WardrobeItemBase):
    image_url: str
    clean_image_url: Optional[str] = None

class WardrobeItemUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    main_color: Optional[str] = None
    main_color_hex: Optional[str] = None
    secondary_colors: Optional[List[str]] = None
    pattern: Optional[str] = None
    material: Optional[str] = None
    style: Optional[str] = None
    match_tags: Optional[List[str]] = None
    is_favorite: Optional[bool] = None

class WardrobeItemResponse(WardrobeItemBase):
    id: int
    user_id: int
    image_url: str
    clean_image_url: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

# Virtual Model Schemas
class VirtualModelOption(BaseModel):
    id: str # model_a_anime_male, model_b_anime_female, etc.
    name: str
    type_category: str # anime, human, mannequin
    gender: str # male, female, neutral
    description: str
    default_preview: str
    features: List[str]

class ModelCustomization(BaseModel):
    model_type: str = "model_a_anime_male"
    skin_tone: str = "#d8b29c"
    hair_style: str = "Modern Textured"
    hair_color: str = "#2a2321"
    body_proportions: str = "regular"

# Virtual Try-On Schemas
class TryOnRequest(BaseModel):
    upperwear_id: Optional[int] = None
    bottomwear_id: Optional[int] = None
    outerwear_id: Optional[int] = None
    footwear_id: Optional[int] = None
    accessory_ids: List[int] = Field(default_factory=list)
    model_type: str = "model_a_anime_male"
    model_settings: Dict[str, Any] = Field(default_factory=dict)
    name: Optional[str] = "My Custom Look"
    occasion: Optional[str] = "Casual"

class GeneratedViewResponse(BaseModel):
    id: int
    view_type: str # FRONT, BACK, LEFT, RIGHT
    image_url: str
    class Config:
        from_attributes = True

class TryOnResponse(BaseModel):
    outfit_id: int
    name: str
    model_type: str
    model_settings: Dict[str, Any]
    generated_image_url: str
    views: Dict[str, str] # {"FRONT": url, "BACK": url, "LEFT": url, "RIGHT": url}
    occasion: str
    rating: float
    stylist_notes: str
    wardrobe_items: List[WardrobeItemResponse]
    is_favorite: bool
    created_at: datetime

# MIRA Stylist Schemas
class StylistChatRequest(BaseModel):
    message: str
    mode: str = "casual" # casual, streetwear, formal, date_night, minimalist, traditional
    current_outfit_id: Optional[int] = None
    selected_wardrobe_ids: List[int] = Field(default_factory=list)
    occasion: Optional[str] = "Casual"

class StylistChatResponse(BaseModel):
    response: str
    appreciation: str
    key_strengths: List[str]
    practical_suggestions: List[str]
    suggested_wardrobe_items: List[WardrobeItemResponse] = Field(default_factory=list)
    mode_used: str

class StylistAuditRequest(BaseModel):
    wardrobe_item_ids: List[int]
    mode: str = "casual"
    occasion: str = "Casual"

class StylistAuditResponse(BaseModel):
    appreciation: str
    rating: float
    strengths: List[str]
    suggestions: List[str]
    color_balance_feedback: str
    silhouette_feedback: str
    occasion_verdict: str

# Outfit Creator & Surprise Me
class SurpriseMeRequest(BaseModel):
    excluded_item_ids: List[int] = Field(default_factory=list)
    preferred_style: Optional[str] = None
    preferred_occasion: Optional[str] = None
    preferred_model_type: Optional[str] = "model_a_anime_male"

# Outfit Battle Schemas
class OutfitBattleRequest(BaseModel):
    outfit_a_ids: List[int]
    outfit_b_ids: List[int]
    occasion: str = "Casual Outing"
    battle_criteria: Optional[str] = "Overall Style & Balance"

class OutfitBattleResponse(BaseModel):
    appreciation_both: str
    outfit_a_analysis: Dict[str, Any]
    outfit_b_analysis: Dict[str, Any]
    winner_recommendation: str # Outfit A or Outfit B with respectful why
    stylist_verdict: str
    actionable_upgrades: List[str]

# Colour Match Lab Schemas
class ColorMatchRequest(BaseModel):
    wardrobe_item_id: int

class ColorPalette(BaseModel):
    name: str
    description: str
    hex_colors: List[str]

class ColorMatchResponse(BaseModel):
    item: WardrobeItemResponse
    dominant_color: str
    dominant_hex: str
    palettes: Dict[str, ColorPalette]
    recommended_matching_items: List[WardrobeItemResponse]
    styling_tip: str

# Saved Collection Schemas
class SavedCollectionCreate(BaseModel):
    name: str
    description: Optional[str] = None

class SavedCollectionResponse(BaseModel):
    id: int
    user_id: int
    name: str
    description: Optional[str] = None
    outfit_count: int
    outfits: List[TryOnResponse] = Field(default_factory=list)
    created_at: datetime
    class Config:
        from_attributes = True

# Outfit Planner Schemas
class CalendarEntryCreate(BaseModel):
    outfit_id: int
    scheduled_date: str # e.g. "Monday", "2026-11-16"
    occasion: str = "Casual"
    weather_note: Optional[str] = "Sunny 22°C"

class CalendarEntryResponse(BaseModel):
    id: int
    user_id: int
    outfit_id: int
    scheduled_date: str
    occasion: str
    weather_note: Optional[str]
    outfit: Optional[TryOnResponse] = None
    created_at: datetime
    class Config:
        from_attributes = True
