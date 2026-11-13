import httpx
import json

BASE_URL = "http://127.0.0.1:8000/api"

def test_full_dripverse_suite():
    client = httpx.Client(base_url=BASE_URL, timeout=30.0)
    print("=== DRIPVERSE E2E TEST SUITE ===")

    # 1. Health
    res = client.get("/health")
    assert res.status_code == 200, f"Health failed: {res.text}"
    print("✓ Health Check Passed:", res.json()["signature_experience"])

    # 2. Auth / Me
    res = client.get("/auth/me")
    assert res.status_code == 200
    user = res.json()
    print("✓ User Profile Loaded:", user["username"], "|", user["profile"]["display_name"])

    # 3. Wardrobe
    res = client.get("/wardrobe")
    assert res.status_code == 200
    items = res.json()
    print(f"✓ Wardrobe Items Loaded: {len(items)} items available in vault")
    assert len(items) >= 5, "Expected starter wardrobe items"
    upper = next(i for i in items if i["category"] == "UPPERWEAR")
    bottom = next(i for i in items if i["category"] == "BOTTOMWEAR")
    shoes = next(i for i in items if i["category"] == "FOOTWEAR")
    print(f"  Sample Upper: {upper['name']} ({upper['main_color']})")
    print(f"  Sample Bottom: {bottom['name']} ({bottom['main_color']})")

    # 4. Models Studio (The 6 models)
    res = client.get("/models")
    assert res.status_code == 200
    models_list = res.json()
    print(f"✓ Virtual Models Loaded: {len(models_list)} models")
    expected_ids = [
        "model_a_anime_male",
        "model_b_anime_female",
        "model_c_human_male",
        "model_d_human_female",
        "model_e_mannequin_male",
        "model_f_mannequin_female"
    ]
    for mid in expected_ids:
        assert any(m["id"] == mid for m in models_list), f"Missing model: {mid}"
    print("✓ All 6 Models verified: Anime Male/Female, Human Male/Female, Mannequin Male/Female")

    # 5. Virtual Try-On Generation (Signature Feature)
    print("-> Triggering Virtual Try-On with Garment Preservation Pipeline...")
    tryon_payload = {
        "upperwear_id": upper["id"],
        "bottomwear_id": bottom["id"],
        "footwear_id": shoes["id"],
        "accessory_ids": [],
        "model_type": "model_a_anime_male",
        "model_settings": {"skin_tone": "#d8b29c", "body_proportions": "regular"},
        "name": "E2E Verified Tokyo Streetwear Fit",
        "occasion": "Casual Outing"
    }
    res = client.post("/tryon/generate", json=tryon_payload)
    assert res.status_code == 200, f"Try-on failed: {res.text}"
    tryon_data = res.json()
    print(f"✓ Virtual Try-On Synthesized! Outfit ID: {tryon_data['outfit_id']}, Rating: {tryon_data['rating']}")
    views = tryon_data["views"]
    print("  Generated Views:", list(views.keys()))
    assert "FRONT" in views and "BACK" in views and "LEFT" in views and "RIGHT" in views, "All 4 views must be generated"

    # 6. MIRA Stylist Modes & Chat
    res = client.get("/stylist/modes")
    assert res.status_code == 200
    modes = res.json()
    print(f"✓ Stylist Modes Loaded: {len(modes)} personas (Casual, Streetwear, Formal, Date Night, Minimalist, Traditional)")

    chat_payload = {
        "message": "Does this black graphic tee go well with desert cargo pants?",
        "mode": "streetwear",
        "current_outfit_id": tryon_data["outfit_id"]
    }
    res = client.post("/stylist/chat", json=chat_payload)
    assert res.status_code == 200
    chat_resp = res.json()
    print("✓ MIRA Chat Response Generated:")
    print("  Appreciation:", chat_resp["appreciation"])
    assert "great" in chat_resp["appreciation"].lower() or "first of all" in chat_resp["appreciation"].lower() or "delightful" in chat_resp["appreciation"].lower(), "MIRA must appreciate first!"

    # 7. Surprise Me Generator
    res = client.post("/outfits/surprise-me", json={"excluded_item_ids": []})
    assert res.status_code == 200
    surprise = res.json()
    print("✓ Surprise Me Generator:", surprise["title"], "| Compatibility:", surprise["compatibility_score"])

    # 8. Outfit Battle
    battle_payload = {
        "outfit_a_ids": [upper["id"], bottom["id"]],
        "outfit_b_ids": [items[1]["id"], items[4]["id"]],
        "occasion": "Casual Outing"
    }
    res = client.post("/outfits/battle", json=battle_payload)
    assert res.status_code == 200
    battle = res.json()
    print("✓ Outfit Battle Verdict:", battle["winner_recommendation"])
    print("  Appreciation for both:", battle["appreciation_both"])

    # 9. Colour Match Lab
    res = client.post("/color-lab/analyze", json={"wardrobe_item_id": upper["id"]})
    assert res.status_code == 200
    col_data = res.json()
    print(f"✓ Colour Match Lab: {col_data['dominant_color']} ({col_data['dominant_hex']})")
    print("  Generated Palettes:", list(col_data["palettes"].keys()))

    # 10. Collections
    res = client.get("/collections")
    assert res.status_code == 200
    cols = res.json()
    print(f"✓ Saved Collections: {len(cols)} collections found")

    # 11. Weekly Planner
    planner_payload = {
        "outfit_id": tryon_data["outfit_id"],
        "scheduled_date": "Friday",
        "occasion": "Casual Friday",
        "weather_note": "Clear Sky 24°C"
    }
    res = client.post("/planner/assign", json=planner_payload)
    assert res.status_code == 200
    entry = res.json()
    print(f"✓ Planned Outfit for {entry['scheduled_date']}: {entry['occasion']}")

    # 12. Settings & Export
    res = client.get("/settings/export")
    assert res.status_code == 200
    export_data = res.json()
    print(f"✓ Wardrobe Backup Exported: {export_data['wardrobe_count']} garments, {export_data['outfit_count']} outfits")

    print("\n=== ALL E2E VERIFICATION CHECKS PASSED PERFECTLY! ===")

if __name__ == "__main__":
    test_full_dripverse_suite()
