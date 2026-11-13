import os
import json
import base64
from typing import Dict, Any, List, Optional
from pathlib import Path
import httpx
from PIL import Image

from config import GEMINI_API_KEY, UPLOAD_DIR, PROCESSED_DIR
from services.background_remover import remove_background
from services.color_engine import extract_image_palette, compute_color_harmonies
from services.garment_engine import garment_engine, MODELS_CATALOG
from services.stylist_engine import mira_stylist

class AIServiceCoordinator:
    def __init__(self):
        self.gemini_key = GEMINI_API_KEY

    def set_user_api_key(self, key: str):
        if key and key.strip():
            self.gemini_key = key.strip()

    async def analyze_clothing_image(self, file_path: Path, filename: str) -> Dict[str, Any]:
        """
        Analyzes uploaded garment:
        1. Generates clean transparent cutout.
        2. Extracts dominant color and palette.
        3. Identifies category, subcategory, pattern, material, and style.
        4. If Gemini API is available, enriches with deep vision understanding.
        """
        clean_filename = f"clean_{filename.rsplit('.', 1)[0]}.png"
        clean_path = PROCESSED_DIR / clean_filename
        
        # 1. Background removal
        try:
            remove_background(str(file_path), str(clean_path))
            clean_url = f"/api/media/processed/{clean_filename}"
        except Exception as e:
            print(f"Cutout generation note: {e}")
            clean_url = f"/api/media/uploads/{filename}"

        # 2. Extract Palette
        palette_data = extract_image_palette(str(file_path))
        dom_name = palette_data["dominant_name"]
        dom_hex = palette_data["dominant_hex"]
        sec_hexes = palette_data["secondary_hexes"]

        # Default classification based on image heuristic / filename / color
        cat = "UPPERWEAR"
        subcat = "T-shirts"
        pattern = "Solid"
        material = "Cotton"
        style = "Casual"
        match_tags = ["Jeans", "Sneakers", "Minimal Watch"]

        fn_lower = filename.lower()
        if any(w in fn_lower for w in ["pant", "jean", "trouser", "cargo", "short", "skirt"]):
            cat = "BOTTOMWEAR"
            subcat = "Jeans" if "jean" in fn_lower else ("Cargo pants" if "cargo" in fn_lower else "Trousers")
            material = "Denim" if "jean" in fn_lower else "Cotton"
            match_tags = ["Hoodie", "Sneakers", "Graphic Tee"]
        elif any(w in fn_lower for w in ["jacket", "coat", "blazer", "hoodie", "sweater"]):
            if "hoodie" in fn_lower or "sweater" in fn_lower:
                cat = "UPPERWEAR"
                subcat = "Hoodies" if "hoodie" in fn_lower else "Sweaters"
                material = "Fleece" if "hoodie" in fn_lower else "Knit"
            else:
                cat = "OUTERWEAR"
                subcat = "Blazers" if "blazer" in fn_lower else ("Coats" if "coat" in fn_lower else "Jackets")
                material = "Leather" if "leather" in fn_lower else "Wool"
                style = "Formal" if "blazer" in fn_lower else "Streetwear"
            match_tags = ["Trousers", "Chelsea Boots", "T-shirt"]
        elif any(w in fn_lower for w in ["shoe", "sneaker", "boot", "sandal", "footwear"]):
            cat = "FOOTWEAR"
            subcat = "Sneakers" if "sneaker" in fn_lower else ("Boots" if "boot" in fn_lower else "Formal shoes")
            material = "Leather" if "boot" in fn_lower or "formal" in fn_lower else "Canvas"
            style = "Streetwear" if "sneaker" in fn_lower else "Formal"
            match_tags = ["Jeans", "Overshirt", "White Socks"]
        elif any(w in fn_lower for w in ["watch", "chain", "necklace", "ring", "sunglass", "cap", "bag", "belt"]):
            cat = "ACCESSORIES"
            if "watch" in fn_lower: subcat = "Watches"
            elif "chain" in fn_lower or "necklace" in fn_lower: subcat = "Chains"
            elif "sunglass" in fn_lower: subcat = "Sunglasses"
            elif "cap" in fn_lower: subcat = "Caps"
            elif "bag" in fn_lower: subcat = "Bags"
            else: subcat = "Accessories"
            material = "Metal / Alloy"
            match_tags = ["Tailored Fit", "Minimal Palette"]

        # 3. If Gemini Key is present, attempt multimodal classification
        if self.gemini_key:
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    with open(file_path, "rb") as f:
                        b64_image = base64.b64encode(f.read()).decode("utf-8")
                        
                    prompt = (
                        "Analyze this clothing/fashion item image carefully. "
                        "Return ONLY valid JSON with keys: category (UPPERWEAR, BOTTOMWEAR, OUTERWEAR, FOOTWEAR, ACCESSORIES, OTHER), "
                        "subcategory (e.g. T-shirts, Shirts, Hoodies, Jeans, Trousers, Sneakers, Boots, Watches), "
                        "pattern (Solid, Striped, Checked, Graphic, Printed, Floral, Textured), "
                        "material (Cotton, Denim, Leather, Knit, Silk, Linen, Synthetic), "
                        "style (Casual, Streetwear, Formal, Minimalist, Traditional, Athletic), "
                        "match_tags (list of 3 clothing items that pair well)."
                    )
                    
                    req_body = {
                        "contents": [{
                            "parts": [
                                {"text": prompt},
                                {"inline_data": {"mime_type": "image/jpeg", "data": b64_image}}
                            ]
                        }]
                    }
                    
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.gemini_key}"
                    resp = await client.post(url, json=req_body)
                    if resp.status_code == 200:
                        raw_text = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
                        # Strip backticks
                        raw_text = raw_text.replace("```json", "").replace("```", "").strip()
                        parsed = json.loads(raw_text)
                        cat = parsed.get("category", cat).upper()
                        subcat = parsed.get("subcategory", subcat)
                        pattern = parsed.get("pattern", pattern)
                        material = parsed.get("material", material)
                        style = parsed.get("style", style)
                        match_tags = parsed.get("match_tags", match_tags)
            except Exception as e:
                print(f"Gemini Vision call notice: {e}. Using deterministic vision analyzer.")

        # Derived name
        item_title = f"{dom_name} {subcat}"

        return {
            "name": item_title,
            "category": cat,
            "subcategory": subcat,
            "main_color": dom_name,
            "main_color_hex": dom_hex,
            "secondary_colors": sec_hexes,
            "pattern": pattern,
            "material": material,
            "style": style,
            "clean_image_url": clean_url,
            "match_tags": match_tags
        }

    async def generate_virtual_tryon(
        self,
        outfit_id: int,
        model_type: str,
        items: List[Dict[str, Any]],
        model_settings: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Coordinates the virtual try-on multi-angle view generation,
        faithfully preserving the user's actual uploaded garments.
        """
        # Call the high-fidelity garment engine
        views = garment_engine.generate_multi_view_outfit(
            outfit_id=outfit_id,
            model_type=model_type,
            items=items,
            model_settings=model_settings
        )
        
        # Evaluate fashion advice with MIRA
        eval_result = mira_stylist.evaluate_outfit_combination(
            items=items,
            mode=model_settings.get("style_mode", "casual") if model_settings else "casual"
        )

        return {
            "views": views,
            "primary_url": views.get("FRONT", list(views.values())[0]),
            "provider": "dripverse_neural_compositor",
            "rating": eval_result.get("rating", 9.2),
            "stylist_notes": eval_result.get("response", "Looking fresh!")
        }

ai_service = AIServiceCoordinator()
