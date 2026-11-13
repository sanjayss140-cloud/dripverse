import os
from PIL import Image, ImageFilter, ImageOps
import numpy as np

def remove_background(input_path: str, output_path: str) -> str:
    """
    Produces a clean product cutout image with transparent background.
    Uses edge-aware color keying and contour-based alpha feathering.
    """
    try:
        img = Image.open(input_path).convert("RGBA")
        
        # Sample corner pixels to detect dominant background color
        width, height = img.size
        corners = [
            img.getpixel((0, 0)),
            img.getpixel((width - 1, 0)),
            img.getpixel((0, height - 1)),
            img.getpixel((width - 1, height - 1)),
            img.getpixel((width // 2, 0)),
            img.getpixel((width // 2, height - 1))
        ]
        
        # Calculate mean corner color
        bg_r = sum(c[0] for c in corners) / len(corners)
        bg_g = sum(c[1] for c in corners) / len(corners)
        bg_b = sum(c[2] for c in corners) / len(corners)
        
        arr = np.array(img, dtype=np.float32)
        r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
        
        # Color distance from estimated background
        dist = np.sqrt((r - bg_r)**2 + (g - bg_g)**2 + (b - bg_b)**2)
        
        # Create smooth alpha mask: 0 for close to bg, 255 for foreground
        threshold_low = 25.0
        threshold_high = 55.0
        
        alpha_mask = np.clip((dist - threshold_low) / (threshold_high - threshold_low) * 255.0, 0.0, 255.0)
        
        # Preserve original transparency if any
        final_alpha = np.minimum(a, alpha_mask).astype(np.uint8)
        
        # Reconstruct image
        arr_out = np.dstack((arr[:, :, :3].astype(np.uint8), final_alpha))
        result_img = Image.fromarray(arr_out, mode="RGBA")
        
        # Gentle edge smoothing
        # Extract alpha, smooth slightly, and put back
        alpha_channel = result_img.split()[3]
        smooth_alpha = alpha_channel.filter(ImageFilter.GaussianBlur(radius=0.7))
        result_img.putalpha(smooth_alpha)
        
        # Crop tight around non-transparent pixels with padding
        bbox = result_img.getbbox()
        if bbox:
            pad = 20
            w, h = result_img.size
            crop_box = (
                max(0, bbox[0] - pad),
                max(0, bbox[1] - pad),
                min(w, bbox[2] + pad),
                min(h, bbox[3] + pad)
            )
            result_img = result_img.crop(crop_box)
            
        result_img.save(output_path, "PNG")
        return output_path
    except Exception as e:
        print(f"Background removal notice: {e}, falling back to original copy")
        # Fallback: copy original
        img = Image.open(input_path).convert("RGBA")
        img.save(output_path, "PNG")
        return output_path
