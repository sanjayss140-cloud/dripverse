import colorsys
from typing import List, Dict, Any, Tuple
from PIL import Image
import numpy as np

COLOR_NAME_MAP = {
    (0, 0, 0): ("Midnight Black", "#09090b"),
    (24, 24, 27): ("Charcoal", "#18181b"),
    (255, 255, 255): ("Crisp White", "#ffffff"),
    (245, 245, 240): ("Off-White / Cream", "#f5f5f0"),
    (139, 92, 246): ("Violet Purple", "#8b5cf6"),
    (168, 85, 247): ("Electric Violet", "#a855f7"),
    (30, 58, 138): ("Deep Navy", "#1e3a8a"),
    (59, 130, 246): ("Cobalt Blue", "#3b82f6"),
    (147, 197, 253): ("Sky Blue", "#93c5fd"),
    (16, 185, 129): ("Emerald Green", "#10b981"),
    (163, 230, 53): ("Lime Green", "#a3e635"),
    (74, 85, 104): ("Slate Grey", "#4a5568"),
    (217, 119, 6): ("Warm Ochre", "#d97706"),
    (239, 68, 68): ("Crimson Red", "#ef4444"),
    (214, 180, 157): ("Desert Beige", "#d6b49d"),
    (120, 53, 15): ("Mocha Brown", "#78350f"),
    (244, 114, 182): ("Blush Pink", "#f472b6"),
    (234, 179, 8): ("Golden Yellow", "#eab308"),
    (15, 118, 110): ("Teal Green", "#0f766e"),
    (249, 115, 22): ("Sunset Orange", "#f97316"),
}

def rgb_to_hex(r: int, g: int, b: int) -> str:
    return f"#{r:02x}{g:02x}{b:02x}"

def hex_to_rgb(hex_str: str) -> Tuple[int, int, int]:
    hex_str = hex_str.lstrip("#")
    if len(hex_str) == 3:
        hex_str = "".join([c * 2 for c in hex_str])
    return int(hex_str[0:2], 16), int(hex_str[2:4], 16), int(hex_str[4:6], 16)

def find_closest_color_name(r: int, g: int, b: int) -> Tuple[str, str]:
    min_dist = float("inf")
    best_name = "Midnight Black"
    best_hex = "#18181b"
    for ref_rgb, (name, hex_val) in COLOR_NAME_MAP.items():
        dist = (r - ref_rgb[0])**2 + (g - ref_rgb[1])**2 + (b - ref_rgb[2])**2
        if dist < min_dist:
            min_dist = dist
            best_name = name
            best_hex = hex_val
    return best_name, best_hex

def extract_image_palette(image_path: str, max_colors: int = 4) -> Dict[str, Any]:
    """
    Extracts dominant color and secondary palette from garment image.
    """
    try:
        img = Image.open(image_path).convert("RGBA")
        # Resize for speed
        img = img.resize((100, 100))
        arr = np.array(img)
        
        # Filter out transparent or near-white/near-black background border pixels
        alpha = arr[:, :, 3]
        visible_mask = alpha > 80
        pixels = arr[visible_mask][:, :3]
        
        if len(pixels) == 0:
            return {
                "dominant_name": "Midnight Black",
                "dominant_hex": "#18181b",
                "secondary_hexes": ["#8b5cf6", "#ffffff"]
            }
        
        # Quantize colors
        quantized = Image.fromarray(pixels.reshape(1, -1, 3)).quantize(colors=max_colors, method=Image.Quantize.FASTOCTREE)
        palette = quantized.getpalette()[:max_colors * 3]
        colors = []
        for i in range(0, len(palette), 3):
            r, g, b = palette[i], palette[i+1], palette[i+2]
            colors.append((r, g, b))
            
        dom_r, dom_g, dom_b = colors[0]
        name, canonical_hex = find_closest_color_name(dom_r, dom_g, dom_b)
        actual_hex = rgb_to_hex(dom_r, dom_g, dom_b)
        
        secondary_hexes = [rgb_to_hex(c[0], c[1], c[2]) for c in colors[1:]]
        
        return {
            "dominant_name": name,
            "dominant_hex": actual_hex,
            "canonical_hex": canonical_hex,
            "secondary_hexes": secondary_hexes
        }
    except Exception as e:
        print(f"Palette extraction error: {e}")
        return {
            "dominant_name": "Midnight Black",
            "dominant_hex": "#18181b",
            "canonical_hex": "#18181b",
            "secondary_hexes": ["#8b5cf6", "#f4f4f5"]
        }

def compute_color_harmonies(hex_code: str) -> Dict[str, Any]:
    """
    Calculates color theory harmonies: Complementary, Analogous, Triadic, Monochromatic, Neutrals.
    """
    r, g, b = hex_to_rgb(hex_code)
    h, l, s = colorsys.rgb_to_hls(r / 255.0, g / 255.0, b / 255.0)
    
    def hsl_to_hex(hue: float, lit: float, sat: float) -> str:
        hue = hue % 1.0
        lit = max(0.05, min(0.95, lit))
        sat = max(0.05, min(0.95, sat))
        cr, cg, cb = colorsys.hls_to_rgb(hue, lit, sat)
        return rgb_to_hex(int(cr * 255), int(cg * 255), int(cb * 255))
    
    # 1. Complementary (opposite 180 deg)
    comp_hex = hsl_to_hex(h + 0.5, l, s)
    comp_accent = hsl_to_hex(h + 0.5, min(0.8, l + 0.15), max(0.3, s * 0.9))
    
    # 2. Analogous (adjacent 30 deg)
    ana_1 = hsl_to_hex(h + (30.0 / 360.0), l, s)
    ana_2 = hsl_to_hex(h - (30.0 / 360.0), l, s)
    
    # 3. Triadic (120 deg and 240 deg)
    tri_1 = hsl_to_hex(h + (120.0 / 360.0), l, s)
    tri_2 = hsl_to_hex(h + (240.0 / 360.0), l, s)
    
    # 4. Monochromatic (shades and tints)
    mono_dark = hsl_to_hex(h, max(0.12, l - 0.25), s)
    mono_light = hsl_to_hex(h, min(0.88, l + 0.25), s * 0.8)
    
    # 5. Clean Neutrals
    neutrals = ["#18181b", "#f5f5f0", "#d6b49d", "#71717a"]
    
    return {
        "complementary": {
            "name": "Complementary Contrast",
            "description": "Bold, vibrant contrast that elevates visual presence without clashing.",
            "hex_colors": [hex_code, comp_hex, comp_accent]
        },
        "analogous": {
            "name": "Harmonious Flow",
            "description": "Neighboring shades creating an effortlessly coordinated, soothing aesthetic.",
            "hex_colors": [ana_2, hex_code, ana_1]
        },
        "triadic": {
            "name": "Creative Triad",
            "description": "Balanced high-energy color palette inspired by modern runway styling.",
            "hex_colors": [hex_code, tri_1, tri_2]
        },
        "monochromatic": {
            "name": "Architectural Tone-on-Tone",
            "description": "Clean luxury minimalist vibes by layering varying depths of the same hue.",
            "hex_colors": [mono_dark, hex_code, mono_light]
        },
        "neutral_pairing": {
            "name": "Streetwear & Everyday Neutrals",
            "description": "Foolproof anchor tones (Charcoal, Off-White, Desert Sand) that let your piece shine.",
            "hex_colors": [hex_code, neutrals[0], neutrals[1], neutrals[2]]
        }
    }
