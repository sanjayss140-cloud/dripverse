from pathlib import Path
from sqlalchemy.orm import Session
import models
from config import UPLOAD_DIR, PROCESSED_DIR

def ensure_luxury_clothing_image(filename: str) -> str:
    """Ensures high-end luxury studio product photography exists."""
    dest_path = UPLOAD_DIR / filename
    if not dest_path.exists():
        import generate_luxury_wardrobe
    return f"/api/media/uploads/{filename}"

SAMPLE_WARDROBE_CATALOG = [
    {
        "filename": "sample_oversized_tee.png",
        "title": "Oversized Acid-Wash Graphic Tee",
        "category": "UPPERWEAR",
        "subcategory": "T-shirts",
        "main_color": "Midnight Black",
        "main_color_hex": "#18181b",
        "secondary_colors": ["#8b5cf6", "#ffffff"],
        "pattern": "Graphic",
        "material": "Heavyweight Cotton",
        "style": "Streetwear",
        "match_tags": ["Cargo Pants", "Chunky Sneakers", "Titanium Watch"],
        "bg_color": (28, 28, 35),
        "fg_accent": (139, 92, 246)
    },
    {
        "filename": "sample_oxford_shirt.png",
        "title": "Tailored Oxford Shirt",
        "category": "UPPERWEAR",
        "subcategory": "Shirts",
        "main_color": "Crisp White",
        "main_color_hex": "#f8fafc",
        "secondary_colors": ["#e2e8f0"],
        "pattern": "Solid",
        "material": "Linen Cotton",
        "style": "Formal",
        "match_tags": ["Pleated Trousers", "Chelsea Boots", "Leather Belt"],
        "bg_color": (245, 245, 250),
        "fg_accent": (71, 85, 105)
    },
    {
        "filename": "sample_knit_sweater.png",
        "title": "Cobalt Blue Cable Sweater",
        "category": "UPPERWEAR",
        "subcategory": "Sweaters",
        "main_color": "Cobalt Blue",
        "main_color_hex": "#2563eb",
        "secondary_colors": ["#1e40af"],
        "pattern": "Textured",
        "material": "Merino Knit",
        "style": "Minimalist",
        "match_tags": ["Selvedge Jeans", "White Sneakers"],
        "bg_color": (37, 99, 235),
        "fg_accent": (30, 64, 175)
    },
    {
        "filename": "sample_cargo_pants.png",
        "title": "Relaxed Tactical Cargo Pants",
        "category": "BOTTOMWEAR",
        "subcategory": "Cargo pants",
        "main_color": "Desert Beige",
        "main_color_hex": "#d6b49d",
        "secondary_colors": ["#a88771"],
        "pattern": "Solid",
        "material": "Cotton Twill",
        "style": "Streetwear",
        "match_tags": ["Graphic Tee", "Chunky Sneakers", "Silver Chain"],
        "bg_color": (214, 180, 157),
        "fg_accent": (168, 135, 113)
    },
    {
        "filename": "sample_selvedge_jeans.png",
        "title": "Raw Indigo Selvedge Jeans",
        "category": "BOTTOMWEAR",
        "subcategory": "Jeans",
        "main_color": "Deep Navy",
        "main_color_hex": "#1e3a8a",
        "secondary_colors": ["#3b82f6"],
        "pattern": "Solid",
        "material": "Denim",
        "style": "Casual",
        "match_tags": ["Oxford Shirt", "Biker Jacket", "Boots"],
        "bg_color": (30, 58, 138),
        "fg_accent": (59, 130, 246)
    },
    {
        "filename": "sample_biker_jacket.png",
        "title": "Heritage Biker Leather Jacket",
        "category": "OUTERWEAR",
        "subcategory": "Jackets",
        "main_color": "Charcoal Black",
        "main_color_hex": "#121217",
        "secondary_colors": ["#a1a1aa"],
        "pattern": "Solid",
        "material": "Full-Grain Leather",
        "style": "Streetwear",
        "match_tags": ["Graphic Tee", "Jeans", "Boots"],
        "bg_color": (20, 20, 26),
        "fg_accent": (161, 161, 170)
    },
    {
        "filename": "sample_retro_sneakers.png",
        "title": "Retro Court Chunky Sneakers",
        "category": "FOOTWEAR",
        "subcategory": "Sneakers",
        "main_color": "Crisp White",
        "main_color_hex": "#ffffff",
        "secondary_colors": ["#8b5cf6", "#18181b"],
        "pattern": "Solid",
        "material": "Leather & Rubber",
        "style": "Streetwear",
        "match_tags": ["Cargo Pants", "Graphic Tee", "White Socks"],
        "bg_color": (240, 240, 245),
        "fg_accent": (139, 92, 246)
    },
    {
        "filename": "sample_chelsea_boots.png",
        "title": "Suede Chelsea Boots",
        "category": "FOOTWEAR",
        "subcategory": "Boots",
        "main_color": "Mocha Brown",
        "main_color_hex": "#78350f",
        "secondary_colors": ["#451a03"],
        "pattern": "Solid",
        "material": "Italian Suede",
        "style": "Casual",
        "match_tags": ["Selvedge Jeans", "Trench Blazer"],
        "bg_color": (120, 53, 15),
        "fg_accent": (69, 26, 3)
    },
    {
        "filename": "sample_titanium_watch.png",
        "title": "Brushed Titanium Chrono Watch",
        "category": "ACCESSORIES",
        "subcategory": "Watches",
        "main_color": "Silver Grey",
        "main_color_hex": "#94a3b8",
        "secondary_colors": ["#8b5cf6"],
        "pattern": "Solid",
        "material": "Titanium Alloy",
        "style": "Minimalist",
        "match_tags": ["Oxford Shirt", "Leather Jacket"],
        "bg_color": (71, 85, 105),
        "fg_accent": (139, 92, 246)
    },
    {
        "filename": "sample_geometric_sunglasses.png",
        "title": "Geometric Acetate Sunglasses",
        "category": "ACCESSORIES",
        "subcategory": "Sunglasses",
        "main_color": "Midnight Black",
        "main_color_hex": "#09090b",
        "secondary_colors": ["#8b5cf6"],
        "pattern": "Solid",
        "material": "Acetate",
        "style": "Streetwear",
        "match_tags": ["Graphic Tee", "Biker Jacket"],
        "bg_color": (15, 15, 20),
        "fg_accent": (139, 92, 246)
    }
]

def seed_starter_wardrobe_if_empty(db: Session, user: models.User):
    existing_count = db.query(models.WardrobeItem).filter(models.WardrobeItem.user_id == user.id).count()
    if existing_count > 0:
        return

    for item_def in SAMPLE_WARDROBE_CATALOG:
        img_url = ensure_luxury_clothing_image(item_def["filename"])
        clean_url = f"/api/media/processed/clean_{item_def['filename']}"

        item = models.WardrobeItem(
            user_id=user.id,
            name=item_def["title"],
            category=item_def["category"],
            subcategory=item_def["subcategory"],
            main_color=item_def["main_color"],
            main_color_hex=item_def["main_color_hex"],
            secondary_colors=item_def["secondary_colors"],
            pattern=item_def["pattern"],
            material=item_def["material"],
            style=item_def["style"],
            image_url=img_url,
            clean_image_url=clean_url,
            match_tags=item_def["match_tags"],
            is_favorite=(item_def["category"] in ["UPPERWEAR", "FOOTWEAR"])
        )
        db.add(item)
    db.commit()
    print("Seed data loaded successfully!")
