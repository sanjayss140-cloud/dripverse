import random
from typing import List, Dict, Any, Optional

STYLIST_MODES = {
    "casual": {
        "title": "Casual Stylist",
        "vibe": "Relaxed, effortless, and comfortable everyday aesthetics",
        "focus": "Comfort, versatile layering, natural color balance, clean sneakers"
    },
    "streetwear": {
        "title": "Streetwear Expert",
        "vibe": "Bold silhouettes, oversized fits, graphic details, premium hype accents",
        "focus": "Sneaker synergy, proportional play, functional accessories, statement layering"
    },
    "formal": {
        "title": "Formal Fashion Consultant",
        "vibe": "Sharp tailoring, sartorial elegance, sophisticated polish",
        "focus": "Precision fit, collar structure, tonal coordination, refined footwear"
    },
    "date_night": {
        "title": "Date Night Stylist",
        "vibe": "Romantic, magnetic, effortlessly alluring yet comfortable",
        "focus": "Texture contrast, rich mood colors, subtle jewelry, clean fragrance ready look"
    },
    "minimalist": {
        "title": "Minimalist Fashion Expert",
        "vibe": "Architectural lines, neutral monochrome, quiet luxury",
        "focus": "High quality fabric draping, zero clutter, neutral palettes, subtle structural accents"
    },
    "traditional": {
        "title": "Traditional Indian Fashion Expert",
        "vibe": "Rich heritage textiles, elegant drapes, celebratory flair",
        "focus": "Kurta / Nehru jacket layering, silk/linen textures, footwear synergy (Mojari/Kolhapuri), festive grace"
    }
}

class MiraStylistEngine:
    def __init__(self):
        pass

    def evaluate_outfit_combination(
        self,
        items: List[Dict[str, Any]],
        mode: str = "casual",
        occasion: str = "Casual Outing",
        user_wardrobe: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        mode_info = STYLIST_MODES.get(mode.lower(), STYLIST_MODES["casual"])
        
        # Analyze items
        categories = [it.get("category", "").upper() for it in items]
        item_names = [it.get("name", "Item") for it in items]
        colors = [it.get("main_color", "Neutral") for it in items]
        patterns = [it.get("pattern", "Solid") for it in items]
        styles = [it.get("style", "Casual") for it in items]
        
        # Identify strengths
        strengths = []
        if len(items) >= 2:
            strengths.append(f"Balanced harmony between your {item_names[0]} and {item_names[1]}.")
        if len(set(colors)) <= 3 and len(colors) > 0:
            strengths.append(f"Thoughtful tonal control with {', '.join(set(colors))}, keeping the palette coherent and polished.")
        else:
            strengths.append("Expressive, vibrant color pairing that shows great confidence.")
            
        if any("Streetwear" in s for s in styles) or mode == "streetwear":
            strengths.append("Strong silhouette balance with contemporary street-smart proportion.")
        else:
            strengths.append("Clean, timeless garment lines that highlight your natural posture.")

        # Build genuine appreciation (Rule #1)
        if len(items) == 0:
            appreciation = (
                f"Welcome! As your {mode_info['title']}, I'm thrilled to collaborate with you. "
                "Let's craft a look that amplifies your individuality and creativity!"
            )
        else:
            first_items_str = " and ".join(item_names[:2])
            appreciation = (
                f"First of all, great choice! Your {first_items_str} create an exceptionally clean and balanced combination. "
                f"I especially love how the {colors[0] if colors else 'palette'} sets an anchor tone for {occasion.lower()}."
            )

        # Practical suggestions tailored to what user owns
        suggestions = []
        suggested_owned_items = []
        
        # Check missing categories
        has_shoes = "FOOTWEAR" in categories
        has_outer = "OUTERWEAR" in categories
        has_accessory = "ACCESSORIES" in categories
        
        if user_wardrobe:
            owned_shoes = [it for it in user_wardrobe if it.get("category") == "FOOTWEAR" and it not in items]
            owned_outer = [it for it in user_wardrobe if it.get("category") == "OUTERWEAR" and it not in items]
            owned_acc = [it for it in user_wardrobe if it.get("category") == "ACCESSORIES" and it not in items]
            
            if not has_shoes and owned_shoes:
                chosen = owned_shoes[0]
                suggestions.append(f"Ground the silhouette with your {chosen['name']} for an effortless transition.")
                suggested_owned_items.append(chosen)
            elif not has_shoes:
                suggestions.append("A pair of clean minimalist sneakers or leather loafers will round off this look.")
                
            if not has_outer and owned_outer and mode in ["streetwear", "casual", "date_night"]:
                chosen = owned_outer[0]
                suggestions.append(f"Layering with your {chosen['name']} will add dimension and elevated edge.")
                suggested_owned_items.append(chosen)
                
            if not has_accessory and owned_acc:
                chosen = owned_acc[0]
                suggestions.append(f"Add a touch of refined personal flair with your {chosen['name']}.")
                suggested_owned_items.append(chosen)
            elif not has_accessory:
                suggestions.append("A minimal silver watch or brushed chain will tie the proportions together.")
        else:
            if not has_shoes:
                suggestions.append("Pair with neutral white sneakers or dark Chelsea boots for a solid foundation.")
            if not has_accessory:
                suggestions.append("A sleek watch or subtle pendant will introduce an intentional focal point.")
            if mode == "formal":
                suggestions.append("Ensure collar points stay crisp and leather finishes stay subtly buffed.")

        # Polished closing
        base_rating = 8.8 + min(1.0, len(items) * 0.25)
        rating = round(min(9.8, base_rating), 1)

        response_text = (
            f"{appreciation}\n\n"
            f"**What Works Well:**\n"
            + "\n".join([f"• {s}" for s in strengths]) + "\n\n"
            f"**My Fashion Recommendations for {mode_info['title']}:**\n"
            + "\n".join([f"• {s}" for s in suggestions]) + "\n\n"
            f"Your outfit already has a stellar foundation — remember, true style is all about wearing your look with confidence!"
        )

        return {
            "response": response_text,
            "appreciation": appreciation,
            "key_strengths": strengths,
            "practical_suggestions": suggestions,
            "suggested_wardrobe_items": suggested_owned_items,
            "mode_used": mode,
            "rating": rating,
            "color_balance_feedback": f"The dominant {colors[0] if colors else 'tone'} provides a sophisticated anchor for {mode_info['title'].lower()}.",
            "silhouette_feedback": "Relaxed upper with tapered contours creates an elongated, flattering profile.",
            "occasion_verdict": f"Highly suitable for {occasion}; delivers modern poise without feeling overdone."
        }

    def chat(
        self,
        message: str,
        mode: str = "casual",
        items: Optional[List[Dict[str, Any]]] = None,
        occasion: str = "Casual",
        user_wardrobe: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Processes conversational interaction with MIRA adhering to positive-first guidelines.
        """
        mode_info = STYLIST_MODES.get(mode.lower(), STYLIST_MODES["casual"])
        items = items or []
        
        # Sincere opening appreciation
        msg_lower = message.lower()
        if "hello" in msg_lower or "hi" in msg_lower or "hey" in msg_lower:
            appreciation = f"Hey there! It's delightful to style with you today in **{mode_info['title']}** mode."
        elif "rate" in msg_lower or "how does this look" in msg_lower:
            appreciation = "First of all, you've put together a really sharp concept with high creative potential!"
        elif "shoes" in msg_lower or "sneaker" in msg_lower:
            appreciation = "Great question! Footwear is the absolute anchor of every memorable silhouette."
        elif "color" in msg_lower or "colour" in msg_lower:
            appreciation = "Love that you're paying attention to the color spectrum — harmony in tones makes everything feel tailored."
        else:
            appreciation = "First of all, great instincts! I really appreciate how you're approaching this look."

        eval_data = self.evaluate_outfit_combination(items, mode=mode, occasion=occasion, user_wardrobe=user_wardrobe)
        
        chat_body = (
            f"{appreciation}\n\n"
            f"Regarding your question: \"*{message}*\"\n\n"
            f"Here is how I see it through my **{mode_info['title']}** lens:\n"
            f"• **Tone & Balance:** Keep the visual weight centered. Your current setup has great visual rhythm.\n"
            f"• **Texture Play:** Mixing textures (like matte cotton with structured denim or metallic hardware) instantly elevates perceived value.\n"
            f"• **Next Step:** Experiment with small details — unbuttoning a collar, rolling a cuff, or adding a signature watch makes all the difference.\n\n"
            f"Would you like me to suggest an alternate combination directly from your wardrobe?"
        )

        return {
            "response": chat_body,
            "appreciation": appreciation,
            "key_strengths": eval_data["key_strengths"],
            "practical_suggestions": eval_data["practical_suggestions"],
            "suggested_wardrobe_items": eval_data["suggested_wardrobe_items"],
            "mode_used": mode
        }

    def compare_outfits_battle(
        self,
        outfit_a_items: List[Dict[str, Any]],
        outfit_b_items: List[Dict[str, Any]],
        occasion: str = "Casual Outing"
    ) -> Dict[str, Any]:
        """
        Outfit Battle comparison without ever insulting either outfit.
        Always points out strengths in both, then politely recommends based on occasion.
        """
        names_a = [it.get("name", "Piece") for it in outfit_a_items] or ["Clean Minimal Ensemble"]
        names_b = [it.get("name", "Piece") for it in outfit_b_items] or ["Contemporary Layered Look"]
        
        appreciation = (
            f"Both outfits demonstrate wonderful fashion awareness and distinct aesthetic strengths! "
            f"There is no 'bad' choice here — each creates an inspiring mood for {occasion}."
        )

        analysis_a = {
            "title": "Outfit A — " + (" + ".join(names_a[:2])),
            "key_advantages": [
                "Clean structural proportion that creates an elongated silhouette",
                "Strong color coherence that looks intentional and polished",
                "Effortless versatility across morning-to-evening settings"
            ],
            "vibe": "Effortless & Sophisticated",
            "score": 9.3
        }

        analysis_b = {
            "title": "Outfit B — " + (" + ".join(names_b[:2])),
            "key_advantages": [
                "High visual dynamism with bold textural presence",
                "Contemporary street-smart energy that stands out in a crowd",
                "Expressive personality that encourages spontaneous style"
            ],
            "vibe": "Bold & Statement-Forward",
            "score": 9.1
        }

        verdict = (
            f"For **{occasion}**, I recommend **Outfit A** by a subtle margin because its streamlined balance "
            f"provides versatile elegance. However, if your goal is to make a bold personal statement, "
            f"**Outfit B** is an absolute stunner as well!"
        )

        upgrades = [
            "For Outfit A: A minimal silver chain or leather bracelet will add just the right amount of gleam.",
            "For Outfit B: Ensure sneaker lacing is clean and cuff the bottom hem once to show off footwear profile."
        ]

        return {
            "appreciation_both": appreciation,
            "outfit_a_analysis": analysis_a,
            "outfit_b_analysis": analysis_b,
            "winner_recommendation": "Outfit A (Recommended for balanced versatility)",
            "stylist_verdict": verdict,
            "actionable_upgrades": upgrades
        }

mira_stylist = MiraStylistEngine()
