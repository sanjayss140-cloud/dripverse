# DRIPVERSE — AI Personal Fashion Stylist & Virtual Try-On Studio

> **"Your Wardrobe. Your Creativity. Your Style."**

DRIPVERSE is a full-stack, AI-powered personal fashion studio and virtual try-on platform built with modern fashion-tech aesthetics. It empowers users to digitize their wardrobe, mix and match garments, render multi-angle visualizations on 6 customizable virtual models, receive constructive styling advice from MIRA (an AI stylist that always starts with genuine appreciation), and organize their looks into collections and weekly schedules.

---

## 🌟 Key Application Modules

1. **Dashboard / Home**:
   - Welcome greeting & wardrobe health statistics (Vault count, Try-on looks, Stylist harmony score, Signature style).
   - MIRA's Daily Fashion Insight with positive morning style tips.
   - Recently uploaded clothes grid and recent 4-view try-on showcases.
   - Quick launchpad to Try-On Studio, Outfit Creator, Outfit Battle, and Colour Lab.

2. **Digital Wardrobe**:
   - Drag & drop multi-image upload supporting JPG, PNG, and WEBP.
   - AI vision clothing analysis extracting category, subcategory, primary color & hex, secondary colors, pattern, material, style, and pairing tags.
   - Automated edge-aware transparent background removal for product-grade cutouts.
   - Filter by category (Upperwear, Bottomwear, Outerwear, Footwear, Accessories, Other), style, color, favorites, and live search.
   - Manual classification editor and item removal.

3. **Virtual Try-On Engine (Signature Feature)**:
   - High-fidelity **Garment Preservation Pipeline**: Preserves uploaded garment colors, textures, patterns, logos, and proportions without randomly replacing items.
   - **Multi-Angle Studio Synthesis**: Generates coordinated `FRONT`, `BACK`, `LEFT`, and `RIGHT` views.
   - **Interactive 3D Studio Orbit (Three.js)**: Full 360-degree interactive orbital rotation, zoom, lighting adjustment, and mannequin inspection.
   - High-resolution download, bookmarking, and 1-click consultation with MIRA.

4. **Avatar Studio (6 Selectable Virtual Models)**:
   - **Model A: Anime Male (Kaito)** — Clean, modern anime illustration with natural proportions and fashion neutral pose.
   - **Model B: Anime Female (Aoi)** — Clean, contemporary anime character with natural proportions.
   - **Model C: Real Human Male (Marcus)** — Photorealistic male fashion model with neutral studio lighting.
   - **Model D: Real Human Female (Elena)** — Photorealistic female fashion model with natural studio lighting.
   - **Model E: Male Mannequin (Sartorial Atelier)** — Minimalist tailoring mannequin focusing purely on garment architecture.
   - **Model F: Female Mannequin (Sartorial Atelier)** — Minimalist tailoring dummy with neutral presentation.
   - Customizations: Skin tone swatches, hairstyles, hair colors, and body proportions (Slim, Regular, Athletic, Tall).

5. **AI Fashion Stylist — MIRA**:
   - **Golden Rule**: Always starts with genuine, polite appreciation before offering suggestions.
   - Never insults the user, never body shames, never judges budget or personal style.
   - **6 Specialized Modes**:
     1. Casual Stylist
     2. Streetwear Expert
     3. Formal Fashion Consultant
     4. Date Night Stylist
     5. Minimalist Fashion Expert
     6. Traditional Indian Fashion Expert
   - **Wardrobe-Aware**: Suggests complementary pieces the user *already owns* in their vault.
   - Interactive chat consultation and comprehensive Outfit Audit scoring.

6. **Outfit Creator & "SURPRISE ME"**:
   - Visual outfit-building canvas with real-time color harmony and style coherence scoring.
   - **"SURPRISE ME" Button**: Algorithmic creative outfit generator with anti-repetition logic.
   - Per-item exclusion list.
   - 1-click transfer to Virtual Try-On Studio.

7. **Outfit Battle**:
   - Side-by-side comparison of Outfit A vs Outfit B.
   - Evaluates styling advantages, proportion balance, accessory synergy, and occasion fit.
   - Friendly verdict that highlights the beauty of both looks (never calling either outfit ugly or bad).

8. **Colour Match Lab**:
   - Select any piece in your closet to calculate 5 color harmonies:
     - Complementary Contrast
     - Harmonious Flow (Analogous)
     - Creative Triad
     - Architectural Tone-on-Tone (Monochromatic)
     - Streetwear & Everyday Neutrals
   - Automatically cross-references and displays matching items from your own wardrobe.

9. **Saved Looks & Collections**:
   - Categorize looks into collections: College, Streetwear, Everyday, Formal, Date Night, or custom collections.
   - 4-view multi-angle inspection modal and high-res export.

10. **Outfit Planner**:
    - Weekly schedule (Monday through Sunday) for stress-free morning dressing.
    - Day assignments with occasion tags and weather cues.

11. **Profile & Settings**:
    - AI Engine Architecture: Clear status display of the active provider (Local Neural Garment Compositor vs Google Gemini Flash Vision).
    - API Key management with masked storage and validation.
    - JSON backup export of wardrobe and looks.
    - Privacy controls: all user garments remain private and secure.

---

## 🏗️ Technical Architecture

```
dripverse/
├── backend/
│   ├── main.py                  # FastAPI server entry point & static media mounts
│   ├── config.py                # App configuration, directories & API keys
│   ├── database.py              # SQLAlchemy engine & session maker
│   ├── models.py                # Database ORM models (Users, Wardrobe, Outfits, etc.)
│   ├── schemas.py               # Pydantic request/response schemas
│   ├── seed_data.py             # Pre-populated high-fashion starter wardrobe generator
│   ├── services/
│   │   ├── ai_service.py        # Provider-independent AI coordinator
│   │   ├── garment_engine.py    # Garment preservation & 4-view multi-angle renderer
│   │   ├── stylist_engine.py    # MIRA intelligence engine with 6 modes
│   │   ├── color_engine.py      # Color harmony calculation & palette extraction
│   │   └── background_remover.py# Transparent background cutout processor
│   └── routers/
│       ├── auth.py              # User profiles & avatar settings
│       ├── wardrobe.py          # Clothing CRUD, multi-upload & vision classifier
│       ├── models_studio.py     # 6 virtual models & customizations
│       ├── tryon.py             # Virtual try-on pipeline & history
│       ├── stylist.py           # MIRA chat & audit endpoints
│       ├── outfits.py           # Outfit builder, Surprise Me & Battle
│       ├── color_lab.py         # Color harmony analyzer
│       ├── collections.py       # Saved looks & collections
│       ├── planner.py           # Weekly schedule planner
│       └── settings.py          # API keys & JSON export
│
└── frontend/
    ├── src/
    │   ├── api.ts               # Typed API client
    │   ├── types.ts             # TypeScript domain interfaces
    │   ├── App.tsx              # Root container & navigation state
    │   ├── components/
    │   │   ├── Navbar.tsx       # Top brand header & status indicators
    │   │   ├── Sidebar.tsx      # Responsive sidebar with 11 navigation modules
    │   │   ├── ThreeDViewer.tsx # Three.js interactive 3D orbit & zoom canvas
    │   │   ├── UploadModal.tsx  # Multi-image drag & drop upload with AI review
    │   │   └── EditItemModal.tsx# Manual classification fine-tuner
    │   └── views/
    │       ├── DashboardView.tsx
    │       ├── WardrobeView.tsx
    │       ├── TryOnView.tsx
    │       ├── AvatarStudioView.tsx
    │       ├── StylistView.tsx
    │       ├── OutfitCreatorView.tsx
    │       ├── OutfitBattleView.tsx
    │       ├── ColorLabView.tsx
    │       ├── SavedLooksView.tsx
    │       ├── PlannerView.tsx
    │       └── SettingsView.tsx
    ├── tailwind.config.js       # Midnight-charcoal & violet styling palette
    └── vite.config.ts           # Proxy config to FastAPI backend (:8000)
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Python 3.10+** (FastAPI, SQLAlchemy, Pillow, NumPy)
- **Node.js 18+** & **npm**

### 2. Backend Server
```bash
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```
- API Docs: `http://127.0.0.1:8000/docs`
- Health: `http://127.0.0.1:8000/api/health`

### 3. Frontend Dev Server
```bash
cd frontend
npm run dev
```
- Application UI: `http://localhost:5173`

---

## 🔑 External AI Provider Configuration (Optional)
DRIPVERSE is fully functional out-of-the-box using the built-in **Neural Garment Compositing Engine**. To enable external Google Gemini Vision API for multimodal clothing analysis:
1. Open the application.
2. Navigate to **Profile & Settings** in the sidebar.
3. Paste your Gemini API key under **AI Engine Architecture** and click **Connect Key**.
4. The system immediately toggles to **Gemini 1.5/2.0 Flash Vision Active**.
