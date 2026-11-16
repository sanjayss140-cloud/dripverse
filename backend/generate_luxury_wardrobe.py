import math
import numpy as np
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

base_dir = Path(__file__).resolve().parent
uploads_dir = base_dir / "data" / "uploads"
processed_dir = base_dir / "data" / "processed"
uploads_dir.mkdir(parents=True, exist_ok=True)
processed_dir.mkdir(parents=True, exist_ok=True)

def apply_fabric_texture(img: Image.Image, roughness: float = 0.06) -> Image.Image:
    """Adds realistic micro-fabric texture grain to prevent flat vector appearance."""
    w, h = img.size
    arr = np.array(img).astype(float)
    noise = (np.random.rand(h, w, 1) - 0.5) * 255 * roughness
    alpha = arr[:, :, 3] / 255.0
    for c in range(3):
        arr[:, :, c] = np.clip(arr[:, :, c] + noise[:, :, 0] * alpha, 0, 255)
    return Image.fromarray(arr.astype(np.uint8))

def add_studio_contact_shadow(base: Image.Image, w: int, h: int, cx: int, cy: int, spread_x=160, spread_y=28, y_offset=190, opacity=60):
    sh = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(sh)
    d.ellipse([cx - spread_x, cy + y_offset - spread_y, cx + spread_x, cy + y_offset + spread_y], fill=(0, 0, 0, opacity))
    d.ellipse([cx - spread_x*0.6, cy + y_offset - spread_y*0.6, cx + spread_x*0.6, cy + y_offset + spread_y*0.6], fill=(0, 0, 0, opacity+35))
    sh = sh.filter(ImageFilter.GaussianBlur(radius=16))
    base.alpha_composite(sh)

def create_photorealistic_tshirt(filename: str, color=(24, 24, 28), graphic=False):
    w, h = 600, 600
    cx, cy = w // 2, h // 2
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    add_studio_contact_shadow(img, w, h, cx, cy, spread_x=170, spread_y=26, y_offset=210)

    # Torso and sleeves with natural curves and draped folds
    d = ImageDraw.Draw(img)
    body_poly = [
        (cx - 75, cy - 170), (cx + 75, cy - 170), # Collar
        (cx + 215, cy - 90),                      # Shoulder R
        (cx + 235, cy + 30), (cx + 155, cy + 50), # Sleeve R
        (cx + 140, cy + 200), (cx - 140, cy + 200),# Hem R, L
        (cx - 155, cy + 50), (cx - 235, cy + 30), # Sleeve L
        (cx - 215, cy - 90)                       # Shoulder L
    ]
    d.polygon(body_poly, fill=color)

    # Natural lighting gradient & fold creases
    fold_sh = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    fd = ImageDraw.Draw(fold_sh)
    # Underarm shadows
    fd.polygon([(cx - 155, cy + 50), (cx - 135, cy + 55), (cx - 130, cy + 130)], fill=(0, 0, 0, 45))
    fd.polygon([(cx + 155, cy + 50), (cx + 135, cy + 55), (cx + 130, cy + 130)], fill=(0, 0, 0, 45))
    # Vertical fabric drape folds
    fd.line([(cx - 60, cy - 100), (cx - 85, cy + 180)], fill=(0, 0, 0, 25), width=12)
    fd.line([(cx + 60, cy - 100), (cx + 85, cy + 180)], fill=(0, 0, 0, 25), width=12)
    fd.line([(cx - 65, cy - 100), (cx - 80, cy + 180)], fill=(255, 255, 255, 15), width=6)
    fd.line([(cx + 55, cy - 100), (cx + 80, cy + 180)], fill=(255, 255, 255, 15), width=6)
    fold_sh = fold_sh.filter(ImageFilter.GaussianBlur(radius=8))
    img.alpha_composite(fold_sh)

    # Ribbed collar
    d = ImageDraw.Draw(img)
    d.ellipse([cx - 55, cy - 180, cx + 55, cy - 140], outline=(40, 40, 45) if color[0] < 50 else (210, 210, 215), width=8)
    d.ellipse([cx - 50, cy - 176, cx + 50, cy - 144], fill=(0, 0, 0, 60))

    if graphic:
        # Subtle high-end tonal graphic print
        d.rectangle([cx - 45, cy - 40, cx + 45, cy + 50], outline=(120, 120, 130, 90), width=2)
        d.text((cx - 30, cy - 5), "DRIP", fill=(140, 140, 150, 120))
        d.text((cx - 30, cy + 15), "STUDIO", fill=(110, 110, 120, 100))

    # Hem hemline double stitch
    d.line([(cx - 138, cy + 192), (cx + 138, cy + 192)], fill=(0, 0, 0, 40), width=2)
    d.line([(cx - 138, cy + 195), (cx + 138, cy + 195)], fill=(0, 0, 0, 40), width=2)

    img = apply_fabric_texture(img, roughness=0.06)
    img.save(uploads_dir / filename, "PNG")
    img.save(processed_dir / f"clean_{filename}", "PNG")
    print(f"Generated luxury t-shirt: {filename}")

def create_photorealistic_oxford_shirt(filename: str):
    w, h = 600, 600
    cx, cy = w // 2, h // 2
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    add_studio_contact_shadow(img, w, h, cx, cy, spread_x=175, spread_y=26, y_offset=210)

    d = ImageDraw.Draw(img)
    base_color = (250, 250, 252)
    shadow_tone = (220, 222, 228)

    body = [
        (cx - 70, cy - 175), (cx + 70, cy - 175),
        (cx + 225, cy - 85),
        (cx + 245, cy + 55), (cx + 160, cy + 65),
        (cx + 145, cy + 205), (cx - 145, cy + 205),
        (cx - 160, cy + 65), (cx - 245, cy + 55),
        (cx - 225, cy - 85)
    ]
    d.polygon(body, fill=base_color)

    # Fold & side shading
    sh = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    sd = ImageDraw.Draw(sh)
    sd.polygon([(cx - 160, cy + 65), (cx - 140, cy + 70), (cx - 135, cy + 160)], fill=(0, 0, 0, 30))
    sd.polygon([(cx + 160, cy + 65), (cx + 140, cy + 70), (cx + 135, cy + 160)], fill=(0, 0, 0, 30))
    sd.line([(cx - 145, cy + 205), (cx - 120, cy + 100)], fill=(0, 0, 0, 20), width=8)
    sd.line([(cx + 145, cy + 205), (cx + 120, cy + 100)], fill=(0, 0, 0, 20), width=8)
    sh = sh.filter(ImageFilter.GaussianBlur(radius=6))
    img.alpha_composite(sh)

    # Stitched front placket
    d = ImageDraw.Draw(img)
    d.rectangle([cx - 16, cy - 140, cx + 16, cy + 205], fill=(244, 244, 247), outline=(215, 215, 222), width=1)
    # Mother-of-pearl buttons
    for by in range(cy - 90, cy + 180, 55):
        d.ellipse([cx - 5, by - 5, cx + 5, by + 5], fill=(235, 235, 240), outline=(190, 190, 200), width=1)
        d.ellipse([cx - 2, by - 2, cx + 2, by + 2], fill=(210, 210, 220))

    # Tailored folded collar points
    collar_l = [(cx - 65, cy - 175), (cx - 12, cy - 130), (cx - 22, cy - 165)]
    collar_r = [(cx + 65, cy - 175), (cx + 12, cy - 130), (cx + 22, cy - 165)]
    d.polygon(collar_l, fill=(255, 255, 255), outline=(210, 210, 218), width=1)
    d.polygon(collar_r, fill=(255, 255, 255), outline=(210, 210, 218), width=1)

    # Breast pocket with tailored top stitch
    d.rectangle([cx - 110, cy - 40, cx - 45, cy + 40], outline=(215, 215, 225), width=1)
    d.line([(cx - 110, cy - 30), (cx - 45, cy - 30)], fill=(215, 215, 225), width=1)

    img = apply_fabric_texture(img, roughness=0.04)
    img.save(uploads_dir / filename, "PNG")
    img.save(processed_dir / f"clean_{filename}", "PNG")
    print(f"Generated luxury oxford shirt: {filename}")

def create_photorealistic_sweater(filename: str):
    w, h = 600, 600
    cx, cy = w // 2, h // 2
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    add_studio_contact_shadow(img, w, h, cx, cy, spread_x=175, spread_y=26, y_offset=210)

    d = ImageDraw.Draw(img)
    base_blue = (28, 72, 160)
    body = [
        (cx - 70, cy - 165), (cx + 70, cy - 165),
        (cx + 220, cy - 80),
        (cx + 240, cy + 60), (cx + 160, cy + 70),
        (cx + 145, cy + 200), (cx - 145, cy + 200),
        (cx - 160, cy + 70), (cx - 240, cy + 60),
        (cx - 220, cy - 80)
    ]
    d.polygon(body, fill=base_blue)

    # Cable knit texture lines
    knit_sh = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    kd = ImageDraw.Draw(knit_sh)
    for x_line in range(cx - 120, cx + 130, 24):
        kd.line([(x_line, cy - 140), (x_line, cy + 185)], fill=(16, 45, 110, 80), width=4)
        kd.line([(x_line + 4, cy - 140), (x_line + 4, cy + 185)], fill=(65, 125, 230, 60), width=2)
    # Cable twists
    for x_cable in [cx - 60, cx, cx + 60]:
        for y_t in range(cy - 120, cy + 170, 36):
            kd.arc([x_cable - 10, y_t, x_cable + 10, y_t + 25], 0, 180, fill=(15, 40, 100, 110), width=3)
            kd.arc([x_cable - 10, y_t + 12, x_cable + 10, y_t + 37], 180, 360, fill=(75, 140, 245, 90), width=2)
    knit_sh = knit_sh.filter(ImageFilter.GaussianBlur(radius=1.5))
    img.alpha_composite(knit_sh)

    # Ribbed crewneck & ribbed hem
    d = ImageDraw.Draw(img)
    d.ellipse([cx - 52, cy - 175, cx + 52, cy - 145], outline=(18, 48, 120), width=9)
    d.rectangle([cx - 145, cy + 185, cx + 145, cy + 200], fill=(22, 58, 138))
    # Ribbed line texture on hem
    for rh in range(cx - 140, cx + 140, 6):
        d.line([(rh, cy + 185), (rh, cy + 200)], fill=(15, 40, 100), width=1)

    img = apply_fabric_texture(img, roughness=0.08)
    img.save(uploads_dir / filename, "PNG")
    img.save(processed_dir / f"clean_{filename}", "PNG")
    print(f"Generated luxury cable sweater: {filename}")

def create_photorealistic_biker_jacket(filename: str):
    w, h = 600, 600
    cx, cy = w // 2, h // 2
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    add_studio_contact_shadow(img, w, h, cx, cy, spread_x=180, spread_y=28, y_offset=215)

    d = ImageDraw.Draw(img)
    body = [
        (cx - 80, cy - 170), (cx + 80, cy - 170),
        (cx + 235, cy - 75),
        (cx + 235, cy + 120), (cx + 165, cy + 110),
        (cx + 150, cy + 195), (cx - 150, cy + 195),
        (cx - 165, cy + 110), (cx - 235, cy + 120),
        (cx - 235, cy - 75)
    ]
    # Matte black calfskin
    d.polygon(body, fill=(18, 18, 22))

    # Leather sheen highlights
    sheen = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    sh_d = ImageDraw.Draw(sheen)
    sh_d.line([(cx - 190, cy - 60), (cx - 160, cy + 80)], fill=(255, 255, 255, 30), width=16)
    sh_d.line([(cx + 190, cy - 60), (cx + 160, cy + 80)], fill=(255, 255, 255, 30), width=16)
    sh_d.line([(cx - 80, cy - 40), (cx - 60, cy + 160)], fill=(255, 255, 255, 20), width=20)
    sheen = sheen.filter(ImageFilter.GaussianBlur(radius=10))
    img.alpha_composite(sheen)

    # Silver asymmetrical zipper & moto lapels
    d = ImageDraw.Draw(img)
    d.line([(cx + 25, cy - 100), (cx - 30, cy + 195)], fill=(195, 200, 210), width=4)
    # Zipper teeth pattern
    for zy in range(cy - 90, cy + 190, 8):
        zx = int(cx + 25 - (zy - (cy - 100)) * (55 / 295))
        d.line([(zx - 3, zy), (zx + 3, zy)], fill=(240, 240, 245), width=2)

    # Moto notched lapels with silver press snaps
    lapel_l = [(cx - 75, cy - 170), (cx - 10, cy - 60), (cx - 85, cy - 65)]
    lapel_r = [(cx + 75, cy - 170), (cx + 35, cy - 50), (cx + 90, cy - 60)]
    d.polygon(lapel_l, fill=(28, 28, 35), outline=(50, 50, 60), width=1)
    d.polygon(lapel_r, fill=(28, 28, 35), outline=(50, 50, 60), width=1)
    # Metallic snaps
    d.ellipse([cx - 70, cy - 80, cx - 62, cy - 72], fill=(210, 215, 225), outline=(130, 135, 145))
    d.ellipse([cx + 65, cy - 75, cx + 73, cy - 67], fill=(210, 215, 225), outline=(130, 135, 145))

    # Waist belt with silver buckle
    d.rectangle([cx - 150, cy + 180, cx + 150, cy + 195], fill=(12, 12, 15))
    d.rectangle([cx - 35, cy + 176, cx - 15, cy + 198], outline=(220, 220, 230), width=3)

    img = apply_fabric_texture(img, roughness=0.04)
    img.save(uploads_dir / filename, "PNG")
    img.save(processed_dir / f"clean_{filename}", "PNG")
    print(f"Generated luxury biker jacket: {filename}")

def create_photorealistic_jeans(filename: str):
    w, h = 600, 600
    cx, cy = w // 2, h // 2
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    add_studio_contact_shadow(img, w, h, cx, cy, spread_x=130, spread_y=24, y_offset=240)

    d = ImageDraw.Draw(img)
    denim_blue = (22, 38, 75)

    # Left & right trouser legs
    leg_l = [
        (cx - 110, cy - 200), (cx - 8, cy - 160),
        (cx - 24, cy + 230), (cx - 95, cy + 230)
    ]
    leg_r = [
        (cx + 8, cy - 160), (cx + 110, cy - 200),
        (cx + 95, cy + 230), (cx + 24, cy + 230)
    ]
    d.polygon(leg_l, fill=denim_blue)
    d.polygon(leg_r, fill=denim_blue)

    # Thigh whiskering & wash fade
    wash = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    wd = ImageDraw.Draw(wash)
    wd.ellipse([cx - 85, cy - 80, cx - 40, cy + 110], fill=(50, 85, 150, 45))
    wd.ellipse([cx + 40, cy - 80, cx + 85, cy + 110], fill=(50, 85, 150, 45))
    wash = wash.filter(ImageFilter.GaussianBlur(radius=12))
    img.alpha_composite(wash)

    # Gold contrast stitching & five-pocket styling
    d = ImageDraw.Draw(img)
    stitch_gold = (185, 135, 55)
    # Fly & outseam
    d.line([(cx - 8, cy - 160), (cx - 8, cy - 80)], fill=stitch_gold, width=2)
    d.arc([cx - 18, cy - 110, cx + 8, cy - 60], 90, 180, fill=stitch_gold, width=2)
    # Inseam & outseam lines
    d.line([(cx - 105, cy - 195), (cx - 93, cy + 225)], fill=stitch_gold, width=1)
    d.line([(cx + 105, cy - 195), (cx + 93, cy + 225)], fill=stitch_gold, width=1)
    # Curved scoop front pockets with copper rivet
    d.arc([cx - 108, cy - 190, cx - 45, cy - 130], 0, 90, fill=stitch_gold, width=2)
    d.arc([cx + 45, cy - 190, cx + 108, cy - 130], 90, 180, fill=stitch_gold, width=2)
    d.ellipse([cx - 52, cy - 135, cx - 46, cy - 129], fill=(160, 90, 40)) # Copper rivet
    d.ellipse([cx + 46, cy - 135, cx + 52, cy - 129], fill=(160, 90, 40))

    # Cuffed selvedge hem detail
    d.rectangle([cx - 95, cy + 215, cx - 24, cy + 230], fill=(225, 220, 205), outline=(180, 175, 160))
    d.line([(cx - 91, cy + 215), (cx - 91, cy + 230)], fill=(180, 20, 30), width=2) # Redline selvedge
    d.rectangle([cx + 24, cy + 215, cx + 95, cy + 230], fill=(225, 220, 205), outline=(180, 175, 160))
    d.line([(cx + 91, cy + 215), (cx + 91, cy + 230)], fill=(180, 20, 30), width=2)

    img = apply_fabric_texture(img, roughness=0.08)
    img.save(uploads_dir / filename, "PNG")
    img.save(processed_dir / f"clean_{filename}", "PNG")
    print(f"Generated luxury selvedge jeans: {filename}")

def create_photorealistic_cargo_pants(filename: str):
    w, h = 600, 600
    cx, cy = w // 2, h // 2
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    add_studio_contact_shadow(img, w, h, cx, cy, spread_x=135, spread_y=24, y_offset=240)

    d = ImageDraw.Draw(img)
    khaki = (165, 142, 118)

    leg_l = [
        (cx - 115, cy - 200), (cx - 8, cy - 160),
        (cx - 26, cy + 230), (cx - 100, cy + 230)
    ]
    leg_r = [
        (cx + 8, cy - 160), (cx + 115, cy - 200),
        (cx + 100, cy + 230), (cx + 26, cy + 230)
    ]
    d.polygon(leg_l, fill=khaki)
    d.polygon(leg_r, fill=khaki)

    # 3D Bellows Cargo Pockets on outer thighs
    pocket_l = [(cx - 120, cy - 20), (cx - 75, cy - 20), (cx - 75, cy + 70), (cx - 120, cy + 70)]
    pocket_r = [(cx + 75, cy - 20), (cx + 120, cy - 20), (cx + 120, cy + 70), (cx + 75, cy + 70)]
    d.polygon(pocket_l, fill=(150, 128, 105), outline=(125, 105, 85), width=2)
    d.polygon(pocket_r, fill=(150, 128, 105), outline=(125, 105, 85), width=2)
    # Flap closures with snap button
    d.polygon([(cx - 122, cy - 20), (cx - 73, cy - 20), (cx - 97, cy - 5)], fill=(138, 118, 96))
    d.polygon([(cx + 73, cy - 20), (cx + 122, cy - 20), (cx + 97, cy - 5)], fill=(138, 118, 96))
    d.ellipse([cx - 100, cy - 14, cx - 94, cy - 8], fill=(60, 50, 40))
    d.ellipse([cx + 94, cy - 14, cx + 100, cy - 8], fill=(60, 50, 40))

    # Articulated knee darts
    d.line([(cx - 85, cy + 100), (cx - 45, cy + 100)], fill=(130, 110, 90), width=2)
    d.line([(cx + 45, cy + 100), (cx + 85, cy + 100)], fill=(130, 110, 90), width=2)

    img = apply_fabric_texture(img, roughness=0.06)
    img.save(uploads_dir / filename, "PNG")
    img.save(processed_dir / f"clean_{filename}", "PNG")
    print(f"Generated luxury cargo pants: {filename}")

def create_photorealistic_sneakers(filename: str):
    w, h = 600, 600
    cx, cy = w // 2, h // 2
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    add_studio_contact_shadow(img, w, h, cx, cy, spread_x=165, spread_y=20, y_offset=130)

    d = ImageDraw.Draw(img)
    # Side-profile luxury white low-top sneaker
    upper_poly = [
        (cx - 170, cy + 80), # Heel bottom
        (cx - 165, cy - 20), # Heel collar
        (cx - 110, cy - 65), # Ankle scoop
        (cx - 40, cy - 50),  # Eyestay
        (cx + 60, cy + 10),  # Vamp
        (cx + 175, cy + 60), # Toe curve
        (cx + 165, cy + 95), # Toe bottom
        (cx - 165, cy + 95)  # Sole line
    ]
    d.polygon(upper_poly, fill=(245, 245, 248), outline=(215, 215, 222), width=1)

    # Sculpted gum rubber midsole & tread
    d.polygon([
        (cx - 175, cy + 85), (cx + 180, cy + 85),
        (cx + 170, cy + 125), (cx - 170, cy + 125)
    ], fill=(230, 228, 222), outline=(195, 190, 180), width=2)

    # Perforated toe box
    for px in range(cx + 65, cx + 130, 14):
        for py in range(cy + 40, cy + 65, 8):
            d.ellipse([px, py, px + 2, py + 2], fill=(185, 185, 195))

    # Contrast minimal heel tab
    d.polygon([(cx - 165, cy - 20), (cx - 135, cy - 45), (cx - 135, cy + 10), (cx - 168, cy + 15)], fill=(18, 18, 24))

    # Lacing system with metal eyelets
    for i, lx in enumerate(range(cx - 70, cx + 25, 18)):
        ly = cy - 35 + i * 8
        d.ellipse([lx - 3, ly - 3, lx + 3, ly + 3], fill=(200, 200, 205), outline=(160, 160, 170))
        d.line([(lx, ly), (lx + 12, ly + 8)], fill=(255, 255, 255), width=3)

    img = apply_fabric_texture(img, roughness=0.03)
    img.save(uploads_dir / filename, "PNG")
    img.save(processed_dir / f"clean_{filename}", "PNG")
    print(f"Generated luxury sneaker: {filename}")

def create_photorealistic_boots(filename: str):
    w, h = 600, 600
    cx, cy = w // 2, h // 2
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    add_studio_contact_shadow(img, w, h, cx, cy, spread_x=160, spread_y=20, y_offset=130)

    d = ImageDraw.Draw(img)
    suede_brown = (105, 58, 26)

    # Chelsea boot profile with elastic gore
    boot_poly = [
        (cx - 130, cy + 90), # Heel bottom
        (cx - 125, cy - 130),# Shaft back
        (cx - 50, cy - 130), # Shaft front
        (cx - 30, cy - 30),  # Instep
        (cx + 80, cy + 30),  # Vamp
        (cx + 170, cy + 65), # Almond toe
        (cx + 160, cy + 95), # Sole
        (cx - 130, cy + 95)
    ]
    d.polygon(boot_poly, fill=suede_brown)

    # Elastic side gusset (charcoal black)
    gore_poly = [(cx - 95, cy - 125), (cx - 55, cy - 125), (cx - 45, cy + 5), (cx - 85, cy + 5)]
    d.polygon(gore_poly, fill=(28, 28, 32))
    # Ribbed vertical texture on gore
    for gx in range(cx - 90, cx - 50, 4):
        d.line([(gx, cy - 120), (gx, cy)], fill=(45, 45, 52), width=1)

    # Stacked leather & crepe sole
    d.polygon([(cx - 135, cy + 90), (cx + 175, cy + 90), (cx + 165, cy + 115), (cx - 130, cy + 115)], fill=(165, 120, 75))
    # Stacked Cuban heel block
    d.polygon([(cx - 135, cy + 110), (cx - 85, cy + 110), (cx - 85, cy + 130), (cx - 135, cy + 130)], fill=(75, 40, 18))

    img = apply_fabric_texture(img, roughness=0.07)
    img.save(uploads_dir / filename, "PNG")
    img.save(processed_dir / f"clean_{filename}", "PNG")
    print(f"Generated luxury boots: {filename}")

def create_photorealistic_watch(filename: str):
    w, h = 600, 600
    cx, cy = w // 2, h // 2
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    add_studio_contact_shadow(img, w, h, cx, cy, spread_x=80, spread_y=20, y_offset=210)

    d = ImageDraw.Draw(img)
    # Brushed titanium bracelet strap
    d.rectangle([cx - 28, cy - 230, cx + 28, cy + 230], fill=(125, 130, 140))
    for sy in range(cy - 220, cy + 225, 20):
        d.line([(cx - 28, sy), (cx + 28, sy)], fill=(90, 95, 105), width=2)
        d.line([(cx - 28, sy + 2), (cx + 28, sy + 2)], fill=(160, 165, 175), width=1)

    # Watch circular case
    r = 75
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(145, 150, 160), outline=(85, 90, 100), width=3)
    # Bezel
    d.ellipse([cx - (r - 10), cy - (r - 10), cx + (r - 10), cy + (r - 10)], fill=(160, 165, 175), outline=(60, 65, 75), width=2)
    # Dial (sunburst charcoal)
    dr = r - 16
    d.ellipse([cx - dr, cy - dr, cx + dr, cy + dr], fill=(18, 18, 24))

    # Sapphire reflection
    refl = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    rd = ImageDraw.Draw(refl)
    rd.polygon([(cx - 40, cy - dr), (cx + 10, cy - dr), (cx - 20, cy + dr), (cx - 50, cy + dr)], fill=(255, 255, 255, 28))
    refl = refl.filter(ImageFilter.GaussianBlur(radius=4))
    img.alpha_composite(refl)

    # Chrono subdials & hour markers
    d = ImageDraw.Draw(img)
    for hr in range(12):
        rad = math.radians(hr * 30)
        x1 = cx + int((dr - 6) * math.sin(rad))
        y1 = cy - int((dr - 6) * math.cos(rad))
        x2 = cx + int((dr - 14) * math.sin(rad))
        y2 = cy - int((dr - 14) * math.cos(rad))
        d.line([(x1, y1), (x2, y2)], fill=(220, 225, 235), width=2)

    # Hands
    d.line([(cx, cy), (cx + 25, cy - 25)], fill=(240, 240, 250), width=3)
    d.line([(cx, cy), (cx - 15, cy + 30)], fill=(240, 240, 250), width=4)
    d.line([(cx, cy), (cx, cy - 38)], fill=(117, 71, 217), width=1) # Purple second hand
    d.ellipse([cx - 4, cy - 4, cx + 4, cy + 4], fill=(210, 215, 225))

    # Crown pushers
    d.rectangle([cx + r, cy - 10, cx + r + 8, cy + 10], fill=(130, 135, 145), outline=(70, 75, 85))

    img.save(uploads_dir / filename, "PNG")
    img.save(processed_dir / f"clean_{filename}", "PNG")
    print(f"Generated luxury titanium watch: {filename}")

def create_photorealistic_sunglasses(filename: str):
    w, h = 600, 600
    cx, cy = w // 2, h // 2
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    add_studio_contact_shadow(img, w, h, cx, cy, spread_x=140, spread_y=16, y_offset=60)

    d = ImageDraw.Draw(img)
    # Geometric thick acetate frame (deep gloss black)
    # Left & right eye rims
    rw, rh = 95, 65
    gap = 22
    lx = cx - gap // 2 - rw
    rx = cx + gap // 2

    # Frame outer polygons (sharp geometric bevel)
    d.polygon([(lx, cy - 30), (lx + rw, cy - 35), (lx + rw - 5, cy + rh - 30), (lx + 10, cy + rh - 25)], fill=(14, 14, 18))
    d.polygon([(rx, cy - 35), (rx + rw, cy - 30), (rx + rw - 10, cy + rh - 25), (rx + 5, cy + rh - 30)], fill=(14, 14, 18))
    # Keyhole bridge
    d.polygon([(cx - 18, cy - 34), (cx + 18, cy - 34), (cx + 12, cy - 10), (cx - 12, cy - 10)], fill=(14, 14, 18))

    # Lenses (dark tint with subtle gradient)
    d.polygon([(lx + 12, cy - 20), (lx + rw - 12, cy - 24), (lx + rw - 16, cy + rh - 40), (lx + 20, cy + rh - 36)], fill=(32, 34, 42))
    d.polygon([(rx + 12, cy - 24), (rx + rw - 12, cy - 20), (rx + rw - 20, cy + rh - 36), (rx + 16, cy + rh - 40)], fill=(32, 34, 42))

    # Studio glare streak
    glare = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glare)
    gd.polygon([(lx + 20, cy - 20), (lx + 45, cy - 20), (lx + 25, cy + 20), (lx + 10, cy + 20)], fill=(255, 255, 255, 45))
    gd.polygon([(rx + 20, cy - 20), (rx + 45, cy - 20), (rx + 25, cy + 20), (rx + 10, cy + 20)], fill=(255, 255, 255, 45))
    glare = glare.filter(ImageFilter.GaussianBlur(radius=3))
    img.alpha_composite(glare)

    # Silver hinge rivets
    d = ImageDraw.Draw(img)
    d.ellipse([lx + 6, cy - 26, lx + 9, cy - 23], fill=(210, 215, 225))
    d.ellipse([rx + rw - 9, cy - 26, rx + rw - 6, cy - 23], fill=(210, 215, 225))

    img.save(uploads_dir / filename, "PNG")
    img.save(processed_dir / f"clean_{filename}", "PNG")
    print(f"Generated luxury sunglasses: {filename}")

def generate_all():
    create_photorealistic_tshirt("sample_oversized_tee.png", color=(18, 18, 22), graphic=True)
    create_photorealistic_oxford_shirt("sample_oxford_shirt.png")
    create_photorealistic_sweater("sample_knit_sweater.png")
    create_photorealistic_biker_jacket("sample_biker_jacket.png")
    create_photorealistic_jeans("sample_selvedge_jeans.png")
    create_photorealistic_cargo_pants("sample_cargo_pants.png")
    create_photorealistic_sneakers("sample_retro_sneakers.png")
    create_photorealistic_boots("sample_chelsea_boots.png")
    create_photorealistic_watch("sample_titanium_watch.png")
    create_photorealistic_sunglasses("sample_geometric_sunglasses.png")
    print("ALL LUXURY WARDROBE ASSETS GENERATED!")

if __name__ == "__main__":
    generate_all()
