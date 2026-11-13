from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
from sqlalchemy.orm import Session
import models
from config import UPLOAD_DIR, PROCESSED_DIR

def generate_sample_clothing_image(
    filename: str,
    title: str,
    category: str,
    bg_color: tuple,
    fg_accent: tuple,
    pattern: str = "Solid"
) -> str:
    """Generates an aesthetic product photography mockup PNG with shadow and studio lighting."""
    w, h = 600, 600
    img = Image.new("RGBA", (w, h), (18, 18, 24, 0)) # transparent background
    draw = ImageDraw.Draw(img)

    cx, cy = w // 2, h // 2

    # Drop shadow
    shadow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    sh_draw = ImageDraw.Draw(shadow)
    sh_draw.ellipse([cx - 160, cy + 140, cx + 160, cy + 220], fill=(0, 0, 0, 90))
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=16))
    img.paste(shadow, (0, 0), shadow)

    # Draw garment shape based on category
    if category == "UPPERWEAR":
        # T-shirt / Hoodie silhouette
        poly = [
            (cx - 70, cy - 140), # Collar L
            (cx + 70, cy - 140), # Collar R
            (cx + 200, cy - 70), # Shoulder R
            (cx + 210, cy + 30), # Sleeve end R
            (cx + 140, cy + 20),
            (cx + 130, cy + 170), # Hem R
            (cx - 130, cy + 170), # Hem L
            (cx - 140, cy + 20),
            (cx - 210, cy + 30), # Sleeve end L
            (cx - 200, cy - 70)  # Shoulder L
        ]
        draw.polygon(poly, fill=bg_color)
        # Collar cut
        draw.arc([cx - 40, cy - 150, cx + 40, cy - 110], 0, 180, fill=(30, 30, 35), width=6)
        
        if pattern == "Graphic":
            draw.rectangle([cx - 50, cy - 40, cx + 50, cy + 50], fill=fg_accent)
            draw.line([(cx - 30, cy - 10), (cx + 30, cy + 20)], fill=(255, 255, 255), width=3)
        elif pattern == "Striped":
            for y_line in range(cy - 90, cy + 140, 28):
                draw.line([(cx - 110, y_line), (cx + 110, y_line)], fill=fg_accent, width=5)

    elif category == "BOTTOMWEAR":
        # Pants / Jeans silhouette
        poly_l = [
            (cx - 100, cy - 160),
            (cx - 8, cy - 130),
            (cx - 18, cy + 180),
            (cx - 85, cy + 180)
        ]
        poly_r = [
            (cx + 8, cy - 130),
            (cx + 100, cy - 160),
            (cx + 85, cy + 180),
            (cx + 18, cy + 180)
        ]
        draw.polygon(poly_l, fill=bg_color)
        draw.polygon(poly_r, fill=bg_color)
        # Seam lines
        draw.line([(cx - 50, cy - 100), (cx - 50, cy + 150)], fill=(0, 0, 0, 60), width=3)
        draw.line([(cx + 50, cy - 100), (cx + 50, cy + 150)], fill=(0, 0, 0, 60), width=3)

    elif category == "OUTERWEAR":
        # Jacket
        poly = [
            (cx - 80, cy - 150),
            (cx + 80, cy - 150),
            (cx + 220, cy - 60),
            (cx + 210, cy + 140),
            (cx + 150, cy + 130),
            (cx + 140, cy + 180),
            (cx - 140, cy + 180),
            (cx - 150, cy + 130),
            (cx - 210, cy + 140),
            (cx - 220, cy - 60)
        ]
        draw.polygon(poly, fill=bg_color)
        # Lapels / zipper
        draw.line([(cx, cy - 60), (cx, cy + 180)], fill=fg_accent, width=4)
        draw.polygon([(cx - 70, cy - 150), (cx - 20, cy - 50), (cx - 80, cy - 60)], fill=(40, 40, 45))
        draw.polygon([(cx + 70, cy - 150), (cx + 20, cy - 50), (cx + 80, cy - 60)], fill=(40, 40, 45))

    elif category == "FOOTWEAR":
        # Sneaker side silhouette
        poly_shoe = [
            (cx - 150, cy + 60),
            (cx - 70, cy - 40),
            (cx + 40, cy - 10),
            (cx + 130, cy + 60),
            (cx + 160, cy + 110),
            (cx - 150, cy + 110)
        ]
        draw.polygon(poly_shoe, fill=bg_color)
        # White Sole
        draw.rounded_rectangle([cx - 160, cy + 90, cx + 170, cy + 125], radius=8, fill=(245, 245, 250))
        # Swoosh / accent wave
        draw.arc([cx - 80, cy + 10, cx + 80, cy + 80], 20, 160, fill=fg_accent, width=6)

    elif category == "ACCESSORIES":
        # Watch or glasses
        if "Watch" in title:
            # Strap
            draw.rectangle([cx - 24, cy - 150, cx + 24, cy + 150], fill=bg_color)
            # Dial casing
            draw.ellipse([cx - 65, cy - 65, cx + 65, cy + 65], fill=(35, 35, 42), outline=fg_accent, width=5)
            draw.ellipse([cx - 50, cy - 50, cx + 50, cy + 50], fill=(22, 22, 28))
            draw.line([(cx, cy), (cx + 25, cy - 15)], fill=(255, 255, 255), width=3)
            draw.line([(cx, cy), (cx, cy - 35)], fill=fg_accent, width=2)
        elif "Sunglasses" in title:
            draw.rounded_rectangle([cx - 140, cy - 35, cx - 15, cy + 35], radius=10, fill=(18, 18, 22), outline=fg_accent, width=4)
            draw.rounded_rectangle([cx + 15, cy - 35, cx + 140, cy + 35], radius=10, fill=(18, 18, 22), outline=fg_accent, width=4)
            draw.line([(cx - 15, cy - 15), (cx + 15, cy - 15)], fill=fg_accent, width=5)
        else:
            # Minimal Chain
            draw.arc([cx - 110, cy - 80, cx + 110, cy + 100], 10, 170, fill=fg_accent, width=8)

    dest_path = UPLOAD_DIR / filename
    img.save(dest_path, "PNG")

    # Also save as clean cutout
    clean_dest = PROCESSED_DIR / f"clean_{filename}"
    img.save(clean_dest, "PNG")

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
        img_url = generate_sample_clothing_image(
            filename=item_def["filename"],
            title=item_def["title"],
            category=item_def["category"],
            bg_color=item_def["bg_color"],
            fg_accent=item_def["fg_accent"],
            pattern=item_def["pattern"]
        )
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
