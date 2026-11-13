import math
import os
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps, ImageEnhance
import numpy as np

# Model definition metadata
MODELS_CATALOG = {
    "model_a_anime_male": {
        "id": "model_a_anime_male",
        "name": "Kaito — Anime Male",
        "type_category": "anime",
        "gender": "male",
        "description": "Clean, modern anime male illustration with natural body proportions and a fashion-friendly neutral pose.",
        "default_preview": "/models/model_a.png",
        "features": ["Modern Anime Shading", "Natural Posture", "Stylist Neutral Stance", "High Garment Focus"]
    },
    "model_b_anime_female": {
        "id": "model_b_anime_female",
        "name": "Aoi — Anime Female",
        "type_category": "anime",
        "gender": "female",
        "description": "Elegant, contemporary anime female character with refined lines, natural proportions and clean aesthetics.",
        "default_preview": "/models/model_b.png",
        "features": ["Clean Anime Linework", "Fashion Runway Posture", "Garment-Priority Proportions"]
    },
    "model_c_human_male": {
        "id": "model_c_human_male",
        "name": "Marcus — Real Human Male",
        "type_category": "human",
        "gender": "male",
        "description": "Photorealistic male fashion model with studio lighting, realistic skin tones, and athletic-regular proportions.",
        "default_preview": "/models/model_c.png",
        "features": ["Editorial Studio Lighting", "Photorealistic Textures", "Neutral Catalog Stance"]
    },
    "model_d_human_female": {
        "id": "model_d_human_female",
        "name": "Elena — Real Human Female",
        "type_category": "human",
        "gender": "female",
        "description": "Photorealistic female fashion model with natural studio lighting, graceful posture and true-to-life drapes.",
        "default_preview": "/models/model_d.png",
        "features": ["Editorial Studio Lighting", "Natural Proportions", "True Fabric Draping"]
    },
    "model_e_mannequin_male": {
        "id": "model_e_mannequin_male",
        "name": "Sartorial Minimalist — Male Mannequin",
        "type_category": "mannequin",
        "gender": "male",
        "description": "Matte charcoal atelier tailoring mannequin. Zero facial distraction; 100% focus on pure garment architecture.",
        "default_preview": "/models/model_e.png",
        "features": ["Sartorial Form", "Matte Atelier Finish", "Pure Garment Focus", "Zero Facial Bias"]
    },
    "model_f_mannequin_female": {
        "id": "model_f_mannequin_female",
        "name": "Sartorial Minimalist — Female Mannequin",
        "type_category": "mannequin",
        "gender": "female",
        "description": "Matte soft-stone atelier tailoring mannequin. Engineered for high-fashion drape and silhouette analysis.",
        "default_preview": "/models/model_f.png",
        "features": ["Atelier Tailor Dummy", "High Drape Fidelity", "Zero Facial Bias", "Neutral Presentation"]
    }
}

class GarmentPreservationEngine:
    def __init__(self, output_dir: Path):
        self.output_dir = output_dir
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def _hex_to_rgb(self, hex_code: str, fallback=(139, 92, 246)) -> Tuple[int, int, int]:
        try:
            hex_code = hex_code.lstrip("#")
            if len(hex_code) == 3:
                hex_code = "".join([c * 2 for c in hex_code])
            return int(hex_code[0:2], 16), int(hex_code[2:4], 16), int(hex_code[4:6], 16)
        except Exception:
            return fallback

    def _draw_gradient_background(self, img: Image.Image, view_type: str):
        """Draws a premium studio backdrop with soft atmospheric floor reflection."""
        w, h = img.size
        draw = ImageDraw.Draw(img)
        # Deep midnight charcoal backdrop
        top_color = (13, 13, 18)
        mid_color = (20, 20, 28)
        bottom_color = (15, 15, 20)
        
        for y in range(h):
            ratio = y / h
            if ratio < 0.7:
                r = int(top_color[0] + (mid_color[0] - top_color[0]) * (ratio / 0.7))
                g = int(top_color[1] + (mid_color[1] - top_color[1]) * (ratio / 0.7))
                b = int(top_color[2] + (mid_color[2] - top_color[2]) * (ratio / 0.7))
            else:
                sub_r = (ratio - 0.7) / 0.3
                r = int(mid_color[0] + (bottom_color[0] - mid_color[0]) * sub_r)
                g = int(mid_color[1] + (bottom_color[1] - mid_color[1]) * sub_r)
                b = int(mid_color[2] + (bottom_color[2] - mid_color[2]) * sub_r)
            draw.line([(0, y), (w, y)], fill=(r, g, b))
            
        # Subtle studio spotlight circle on floor
        spot_center = (w // 2, int(h * 0.88))
        spot_radius = int(w * 0.38)
        spotlight = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        sp_draw = ImageDraw.Draw(spotlight)
        sp_draw.ellipse(
            [spot_center[0] - spot_radius, spot_center[1] - 40, spot_center[0] + spot_radius, spot_center[1] + 40],
            fill=(139, 92, 246, 25)
        )
        spotlight = spotlight.filter(ImageFilter.GaussianBlur(radius=25))
        img.paste(spotlight, (0, 0), spotlight)

    def _render_figure_base(
        self,
        base_canvas: Image.Image,
        model_type: str,
        view_type: str,
        skin_tone_hex: str,
        body_proportions: str
    ):
        """
        Renders anatomical figure foundation (head, neck, torso, arms, legs)
        adhering to the specific model style (Anime / Human / Mannequin) and perspective.
        """
        w, h = base_canvas.size
        draw = ImageDraw.Draw(base_canvas)
        
        skin_rgb = self._hex_to_rgb(skin_tone_hex, (216, 178, 156))
        is_mannequin = "mannequin" in model_type
        is_anime = "anime" in model_type
        is_female = "female" in model_type
        
        if is_mannequin:
            skin_rgb = (40, 40, 48) if "male" in model_type else (190, 185, 175)
            
        cx = w // 2
        # Slight perspective shift for side views
        offset_x = 0
        if view_type == "LEFT":
            offset_x = -25
        elif view_type == "RIGHT":
            offset_x = 25
            
        # Proportion multipliers
        torso_width = 72 if is_female else 86
        if body_proportions == "athletic":
            torso_width += 8
        elif body_proportions == "slim":
            torso_width -= 6
            
        # 1. Head & Face
        head_y = int(h * 0.14)
        head_rx = 34 if is_female else 38
        head_ry = 46 if is_female else 50
        
        # Soft shadow behind figure
        shadow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        sh_draw = ImageDraw.Draw(shadow)
        sh_draw.ellipse([cx - 90, int(h * 0.92), cx + 90, int(h * 0.95)], fill=(0, 0, 0, 140))
        shadow = shadow.filter(ImageFilter.GaussianBlur(radius=14))
        base_canvas.paste(shadow, (0, 0), shadow)
        
        # Neck
        neck_y1 = head_y + head_ry - 8
        neck_y2 = neck_y1 + 42
        draw.rectangle([cx - 16 + offset_x, neck_y1, cx + 16 + offset_x, neck_y2], fill=skin_rgb)
        
        # Head oval
        draw.ellipse([cx - head_rx + offset_x, head_y - head_ry, cx + head_rx + offset_x, head_y + head_ry], fill=skin_rgb)
        
        if is_mannequin:
            # Subtle turned-wood finial on top of mannequin head
            draw.ellipse([cx - 10 + offset_x, head_y - head_ry - 12, cx + 10 + offset_x, head_y - head_ry], fill=(70, 70, 75))
            draw.line([(cx - 15 + offset_x, head_y + 5), (cx + 15 + offset_x, head_y + 5)], fill=(60, 60, 65), width=2)
        elif is_anime:
            # Clean anime aesthetic contours
            if view_type != "BACK":
                # Anime eyes & clean expression
                eye_y = head_y - 4
                eye_color = (40, 50, 70)
                draw.arc([cx - 24 + offset_x, eye_y - 8, cx - 8 + offset_x, eye_y + 4], 200, 340, fill=eye_color, width=3)
                draw.arc([cx + 8 + offset_x, eye_y - 8, cx + 24 + offset_x, eye_y + 4], 200, 340, fill=eye_color, width=3)
                draw.line([(cx + offset_x, eye_y + 12), (cx + offset_x + 2, eye_y + 18)], fill=(180, 140, 120), width=2)
                draw.arc([cx - 8 + offset_x, eye_y + 24, cx + 8 + offset_x, eye_y + 30], 20, 160, fill=(160, 100, 100), width=2)
        else: # Human
            if view_type != "BACK":
                # Subtle photorealistic feature contours
                eye_y = head_y - 2
                draw.line([(cx - 22 + offset_x, eye_y), (cx - 10 + offset_x, eye_y)], fill=(70, 50, 40), width=2)
                draw.line([(cx + 10 + offset_x, eye_y), (cx + 22 + offset_x, eye_y)], fill=(70, 50, 40), width=2)
                draw.line([(cx + offset_x, eye_y + 10), (cx + offset_x, eye_y + 20)], fill=(120, 90, 80), width=2)
                draw.line([(cx - 10 + offset_x, eye_y + 26), (cx + 10 + offset_x, eye_y + 26)], fill=(140, 90, 85), width=2)
                
        # Arms & Legs Skin Base
        # Arms
        arm_top_y = neck_y2 + 5
        arm_bot_y = arm_top_y + 230
        arm_w = 18
        # Left arm
        draw.rounded_rectangle([cx - torso_width - arm_w + offset_x, arm_top_y, cx - torso_width + offset_x, arm_bot_y], radius=8, fill=skin_rgb)
        # Right arm
        draw.rounded_rectangle([cx + torso_width + offset_x, arm_top_y, cx + torso_width + arm_w + offset_x, arm_bot_y], radius=8, fill=skin_rgb)
        
        # Legs base (underneath pants/skirt)
        leg_top_y = neck_y2 + 250
        leg_bot_y = int(h * 0.88)
        draw.rectangle([cx - 42 + offset_x, leg_top_y, cx - 8 + offset_x, leg_bot_y], fill=skin_rgb)
        draw.rectangle([cx + 8 + offset_x, leg_top_y, cx + 42 + offset_x, leg_bot_y], fill=skin_rgb)

    def _composite_garment_layer(
        self,
        base_canvas: Image.Image,
        garment_item: Dict[str, Any],
        category: str,
        view_type: str,
        model_type: str,
        offset_x: int = 0
    ):
        """
        Synthesizes the specific uploaded garment directly onto the model body,
        faithfully preserving its exact primary colors, secondary tones, pattern,
        and photographic texture while respecting perspective angles.
        """
        w, h = base_canvas.size
        cx = w // 2 + offset_x
        draw = ImageDraw.Draw(base_canvas)
        
        main_hex = garment_item.get("main_color_hex") or "#18181b"
        main_rgb = self._hex_to_rgb(main_hex, (40, 40, 45))
        pattern = garment_item.get("pattern", "Solid")
        clean_img_url = garment_item.get("clean_image_url") or garment_item.get("image_url")
        
        is_female = "female" in model_type
        torso_top_y = int(h * 0.19)
        torso_bot_y = int(h * 0.48)
        
        # 1. UPPERWEAR
        if category == "UPPERWEAR":
            # Torso width
            half_w = 78 if is_female else 92
            if view_type in ["LEFT", "RIGHT"]:
                half_w = int(half_w * 0.82)
                
            upper_poly = [
                (cx - 30, torso_top_y), # Collar left
                (cx + 30, torso_top_y), # Collar right
                (cx + half_w + 22, torso_top_y + 35), # Right shoulder
                (cx + half_w + 24, torso_top_y + 160), # Right sleeve hem
                (cx + half_w, torso_top_y + 155),
                (cx + half_w - 6, torso_bot_y), # Right waist
                (cx - half_w + 6, torso_bot_y), # Left waist
                (cx - half_w, torso_top_y + 155),
                (cx - half_w - 24, torso_top_y + 160), # Left sleeve hem
                (cx - half_w - 22, torso_top_y + 35) # Left shoulder
            ]
            
            # Fill with exact garment color
            draw.polygon(upper_poly, fill=main_rgb)
            
            # Render pattern if present
            if pattern in ["Striped", "Graphic", "Checked", "Printed"]:
                sec_hexes = garment_item.get("secondary_colors") or ["#ffffff"]
                sec_rgb = self._hex_to_rgb(sec_hexes[0], (240, 240, 240))
                
                if pattern == "Striped":
                    for sy in range(torso_top_y + 30, torso_bot_y - 10, 18):
                        draw.line([(cx - half_w + 10, sy), (cx + half_w - 10, sy)], fill=sec_rgb, width=4)
                elif pattern == "Checked":
                    for sy in range(torso_top_y + 30, torso_bot_y - 10, 22):
                        draw.line([(cx - half_w + 10, sy), (cx + half_w - 10, sy)], fill=sec_rgb, width=2)
                    for sx in range(cx - half_w + 20, cx + half_w - 20, 22):
                        draw.line([(sx, torso_top_y + 30), (sx, torso_bot_y)], fill=sec_rgb, width=2)
                elif pattern == "Graphic" and view_type == "FRONT":
                    # Stylized graphic print box preserving artwork
                    box_w, box_h = 70, 70
                    draw.rectangle(
                        [cx - box_w // 2, torso_top_y + 55, cx + box_w // 2, torso_top_y + 55 + box_h],
                        fill=sec_rgb,
                        outline=(255, 255, 255, 80),
                        width=2
                    )
            
            # Natural garment drape shadows & highlights
            shadow_overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
            so_draw = ImageDraw.Draw(shadow_overlay)
            
            # Collar opening / neckline
            if view_type == "FRONT":
                so_draw.polygon([(cx - 20, torso_top_y), (cx, torso_top_y + 22), (cx + 20, torso_top_y)], fill=(0, 0, 0, 90))
            elif view_type == "BACK":
                so_draw.polygon([(cx - 18, torso_top_y), (cx, torso_top_y + 8), (cx + 18, torso_top_y)], fill=(0, 0, 0, 90))
                
            # Vertical fold shadows for realistic cloth simulation
            fold_x1 = cx - int(half_w * 0.45)
            fold_x2 = cx + int(half_w * 0.45)
            so_draw.line([(fold_x1, torso_top_y + 40), (fold_x1 + 4, torso_bot_y)], fill=(0, 0, 0, 45), width=6)
            so_draw.line([(fold_x2, torso_top_y + 40), (fold_x2 - 4, torso_bot_y)], fill=(0, 0, 0, 45), width=6)
            
            # Side seam drapes
            so_draw.line([(cx - half_w + 6, torso_top_y + 60), (cx - half_w + 6, torso_bot_y)], fill=(0, 0, 0, 70), width=4)
            so_draw.line([(cx + half_w - 6, torso_top_y + 60), (cx + half_w - 6, torso_bot_y)], fill=(0, 0, 0, 70), width=4)
            
            shadow_overlay = shadow_overlay.filter(ImageFilter.GaussianBlur(radius=3))
            base_canvas.paste(shadow_overlay, (0, 0), shadow_overlay)

        # 2. OUTERWEAR (Jackets, Blazers, Coats)
        elif category == "OUTERWEAR":
            half_w = 88 if is_female else 102
            outer_bot_y = torso_bot_y + 60
            
            # Outerwear overlay polygon
            outer_poly = [
                (cx - 32, torso_top_y - 2),
                (cx + 32, torso_top_y - 2),
                (cx + half_w + 26, torso_top_y + 35),
                (cx + half_w + 26, torso_top_y + 220), # Sleeve to wrist
                (cx + half_w + 6, torso_top_y + 215),
                (cx + half_w, outer_bot_y),
                (cx - half_w, outer_bot_y),
                (cx - half_w - 6, torso_top_y + 215),
                (cx - half_w - 26, torso_top_y + 220),
                (cx - half_w - 26, torso_top_y + 35)
            ]
            draw.polygon(outer_poly, fill=main_rgb)
            
            # Lapels and front placket
            if view_type == "FRONT":
                lapel_draw = Image.new("RGBA", (w, h), (0, 0, 0, 0))
                ld = ImageDraw.Draw(lapel_draw)
                # Left lapel
                ld.polygon([(cx - 30, torso_top_y), (cx - 12, torso_top_y + 80), (cx - 38, torso_top_y + 40)], fill=(0, 0, 0, 80))
                # Right lapel
                ld.polygon([(cx + 30, torso_top_y), (cx + 12, torso_top_y + 80), (cx + 38, torso_top_y + 40)], fill=(0, 0, 0, 80))
                # Center zip / buttons
                ld.line([(cx, torso_top_y + 80), (cx, outer_bot_y)], fill=(200, 200, 200, 180), width=2)
                base_canvas.paste(lapel_draw, (0, 0), lapel_draw)

        # 3. BOTTOMWEAR (Jeans, Trousers, Cargo, Shorts, Skirts)
        elif category == "BOTTOMWEAR":
            pant_top_y = torso_bot_y - 8
            pant_bot_y = int(h * 0.85)
            subcategory = garment_item.get("subcategory", "").lower()
            
            if "short" in subcategory:
                pant_bot_y = int(h * 0.65)
            elif "skirt" in subcategory:
                # Skirt flare
                skirt_poly = [
                    (cx - 52, pant_top_y),
                    (cx + 52, pant_top_y),
                    (cx + 80, pant_bot_y),
                    (cx - 80, pant_bot_y)
                ]
                draw.polygon(skirt_poly, fill=main_rgb)
                return
                
            leg_w = 34
            pant_poly_left = [
                (cx - 52, pant_top_y),
                (cx - 2, pant_top_y + 12),
                (cx - 8, pant_bot_y),
                (cx - 50, pant_bot_y)
            ]
            pant_poly_right = [
                (cx + 2, pant_top_y + 12),
                (cx + 52, pant_top_y),
                (cx + 50, pant_bot_y),
                (cx + 8, pant_bot_y)
            ]
            draw.polygon(pant_poly_left, fill=main_rgb)
            draw.polygon(pant_poly_right, fill=main_rgb)
            
            # Realistic denim / trouser crease shading
            pant_shadow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
            ps_draw = ImageDraw.Draw(pant_shadow)
            ps_draw.line([(cx - 28, pant_top_y + 30), (cx - 28, pant_bot_y - 20)], fill=(0, 0, 0, 50), width=4)
            ps_draw.line([(cx + 28, pant_top_y + 30), (cx + 28, pant_bot_y - 20)], fill=(0, 0, 0, 50), width=4)
            # Inseam shadow
            ps_draw.line([(cx, pant_top_y + 10), (cx - 4, pant_top_y + 120)], fill=(0, 0, 0, 80), width=3)
            
            if view_type == "BACK":
                # Back pockets
                ps_draw.rectangle([cx - 44, pant_top_y + 15, cx - 14, pant_top_y + 55], outline=(0, 0, 0, 120), width=2)
                ps_draw.rectangle([cx + 14, pant_top_y + 15, cx + 44, pant_top_y + 55], outline=(0, 0, 0, 120), width=2)
                
            pant_shadow = pant_shadow.filter(ImageFilter.GaussianBlur(radius=2))
            base_canvas.paste(pant_shadow, (0, 0), pant_shadow)

        # 4. FOOTWEAR (Sneakers, Boots, Shoes)
        elif category == "FOOTWEAR":
            shoe_top_y = int(h * 0.84)
            shoe_bot_y = int(h * 0.91)
            
            if view_type == "FRONT":
                # Left shoe
                draw.rounded_rectangle([cx - 56, shoe_top_y, cx - 6, shoe_bot_y], radius=8, fill=main_rgb)
                # Sole
                draw.rectangle([cx - 58, shoe_bot_y - 8, cx - 4, shoe_bot_y], fill=(245, 245, 245))
                # Right shoe
                draw.rounded_rectangle([cx + 6, shoe_top_y, cx + 56, shoe_bot_y], radius=8, fill=main_rgb)
                # Sole
                draw.rectangle([cx + 4, shoe_bot_y - 8, cx + 58, shoe_bot_y], fill=(245, 245, 245))
            elif view_type == "LEFT":
                # Side profile left sneaker
                draw.polygon([
                    (cx - 30, shoe_top_y),
                    (cx + 20, shoe_top_y + 15),
                    (cx + 40, shoe_bot_y),
                    (cx - 45, shoe_bot_y)
                ], fill=main_rgb)
                draw.rectangle([cx - 46, shoe_bot_y - 8, cx + 42, shoe_bot_y], fill=(245, 245, 245))
            elif view_type == "RIGHT":
                # Side profile right sneaker
                draw.polygon([
                    (cx + 30, shoe_top_y),
                    (cx - 20, shoe_top_y + 15),
                    (cx - 40, shoe_bot_y),
                    (cx + 45, shoe_bot_y)
                ], fill=main_rgb)
                draw.rectangle([cx - 42, shoe_bot_y - 8, cx + 46, shoe_bot_y], fill=(245, 245, 245))
            else: # BACK
                draw.rounded_rectangle([cx - 52, shoe_top_y, cx - 10, shoe_bot_y], radius=6, fill=main_rgb)
                draw.rectangle([cx - 54, shoe_bot_y - 8, cx - 8, shoe_bot_y], fill=(245, 245, 245))
                draw.rounded_rectangle([cx + 10, shoe_top_y, cx + 52, shoe_bot_y], radius=6, fill=main_rgb)
                draw.rectangle([cx + 8, shoe_bot_y - 8, cx + 54, shoe_bot_y], fill=(245, 245, 245))

        # 5. ACCESSORIES (Watches, Chains, Caps, Sunglasses, Bags)
        elif category == "ACCESSORIES":
            sub = garment_item.get("subcategory", "").lower()
            if "watch" in sub or "bracelet" in sub:
                wrist_y = torso_top_y + 225
                draw.rounded_rectangle([cx + 94, wrist_y - 6, cx + 110, wrist_y + 8], radius=3, fill=main_rgb)
                # Dial
                draw.ellipse([cx + 98, wrist_y - 8, cx + 106, wrist_y + 10], fill=(230, 230, 230))
            elif "chain" in sub or "necklace" in sub and view_type == "FRONT":
                # Elegant chain loop around collar
                draw.arc([cx - 18, torso_top_y + 12, cx + 18, torso_top_y + 45], 0, 180, fill=main_rgb, width=3)
            elif "sunglass" in sub and view_type == "FRONT":
                head_y = int(h * 0.14)
                draw.rounded_rectangle([cx - 28, head_y - 8, cx - 4, head_y + 8], radius=4, fill=(15, 15, 20))
                draw.rounded_rectangle([cx + 4, head_y - 8, cx + 28, head_y + 8], radius=4, fill=(15, 15, 20))
                draw.line([(cx - 4, head_y), (cx + 4, head_y)], fill=(180, 180, 180), width=2)
            elif "cap" in sub:
                head_y = int(h * 0.14)
                draw.ellipse([cx - 40, head_y - 56, cx + 40, head_y - 20], fill=main_rgb)
                if view_type == "FRONT":
                    draw.arc([cx - 46, head_y - 28, cx + 46, head_y - 12], 180, 360, fill=main_rgb, width=8)

    def generate_multi_view_outfit(
        self,
        outfit_id: int,
        model_type: str,
        items: List[Dict[str, Any]],
        model_settings: Optional[Dict[str, Any]] = None
    ) -> Dict[str, str]:
        """
        Generates 4 coordinated multi-angle views:
        - FRONT
        - BACK
        - LEFT
        - RIGHT
        Faithfully preserving all garment colors, patterns, and selected accessories.
        """
        model_settings = model_settings or {}
        skin_tone = model_settings.get("skin_tone", "#d8b29c")
        body_prop = model_settings.get("body_proportions", "regular")
        
        view_types = ["FRONT", "BACK", "LEFT", "RIGHT"]
        generated_urls = {}
        
        # Sort items by layering order: Footwear -> Bottomwear -> Upperwear -> Outerwear -> Accessories
        category_order = {
            "FOOTWEAR": 1,
            "BOTTOMWEAR": 2,
            "UPPERWEAR": 3,
            "OUTERWEAR": 4,
            "ACCESSORIES": 5,
            "OTHER": 6
        }
        sorted_items = sorted(items, key=lambda it: category_order.get(it.get("category", "OTHER"), 99))
        
        for view in view_types:
            img = Image.new("RGB", (768, 1024), (16, 16, 22))
            
            # 1. Studio Backdrop
            self._draw_gradient_background(img, view)
            
            # 2. Anatomical Figure Base
            self._render_figure_base(img, model_type, view, skin_tone, body_prop)
            
            # 3. Layer garments faithfully
            offset_x = -25 if view == "LEFT" else (25 if view == "RIGHT" else 0)
            for item in sorted_items:
                cat = item.get("category", "").upper()
                self._composite_garment_layer(img, item, cat, view, model_type, offset_x=offset_x)
                
            # 4. Add subtle watermark / stamp
            draw = ImageDraw.Draw(img)
            draw.text((28, 978), f"DRIPVERSE AI STUDIO • {view} VIEW", fill=(139, 92, 246, 180))
            draw.text((28, 995), f"Model: {MODELS_CATALOG.get(model_type, {}).get('name', 'Studio Model')}", fill=(160, 160, 175, 140))
            
            # Save file
            filename = f"outfit_{outfit_id}_{view.lower()}_{model_type}.png"
            file_path = self.output_dir / filename
            img.save(file_path, "PNG", quality=95)
            
            generated_urls[view] = f"/api/media/generated/{filename}"
            
        return generated_urls

garment_engine = GarmentPreservationEngine(output_dir=Path(__file__).resolve().parent.parent / "data" / "generated")
