/**
 * DRIPVERSE Image Utility & Curated Catalog Assets
 * Handles image validation, Google Search URL extraction,
 * client-side image compression (for LocalStorage safety), and fashion presets.
 */

export interface ImagePreset {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  url: string;
}

export const FASHION_PRESETS: ImagePreset[] = [
  // Pants & Trousers
  {
    id: 'pant-denim-1',
    name: 'Slim Selvedge Jeans',
    category: 'clothing',
    subcategory: 'denim',
    url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80',
  },
  {
    id: 'pant-straight-1',
    name: 'Straight Fit Dark Jeans',
    category: 'clothing',
    subcategory: 'denim',
    url: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800&q=80',
  },
  {
    id: 'pant-cargo-1',
    name: 'Black Technical Cargo Pants',
    category: 'clothing',
    subcategory: 'cargo',
    url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80',
  },
  {
    id: 'pant-trouser-1',
    name: 'Tailored Suiting Trousers',
    category: 'clothing',
    subcategory: 'trousers',
    url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80',
  },
  {
    id: 'pant-casual-1',
    name: 'Relaxed Fit Chinos',
    category: 'clothing',
    subcategory: 'trousers',
    url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80',
  },

  // Shirts
  {
    id: 'shirt-oxford-1',
    name: 'Classic White Oxford Shirt',
    category: 'clothing',
    subcategory: 'shirts',
    url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80',
  },
  {
    id: 'shirt-formal-1',
    name: 'Crisp Slim Formal Shirt',
    category: 'clothing',
    subcategory: 'shirts',
    url: 'https://images.unsplash.com/photo-1594938298603-c8148c4b400d?w=800&q=80',
  },
  {
    id: 'shirt-linen-1',
    name: 'Relaxed Linen Overshirt',
    category: 'clothing',
    subcategory: 'shirts',
    url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80',
  },

  // T-Shirts & Outerwear
  {
    id: 'tee-oversized-1',
    name: 'Heavyweight Oversized Tee',
    category: 'clothing',
    subcategory: 't-shirts',
    url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
  },
  {
    id: 'tee-black-1',
    name: 'Minimal Black Supima Tee',
    category: 'clothing',
    subcategory: 't-shirts',
    url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80',
  },
  {
    id: 'jacket-blazer-1',
    name: 'Italian Wool Blazer',
    category: 'clothing',
    subcategory: 'blazers',
    url: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800&q=80',
  },
  {
    id: 'jacket-bomber-1',
    name: 'Minimalist Bomber Jacket',
    category: 'clothing',
    subcategory: 'jackets',
    url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80',
  },

  // Footwear & Accessories
  {
    id: 'shoes-chelsea-1',
    name: 'Leather Chelsea Boots',
    category: 'footwear',
    subcategory: 'boots',
    url: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&q=80',
  },
  {
    id: 'shoes-sneaker-1',
    name: 'Minimal Leather Sneakers',
    category: 'footwear',
    subcategory: 'sneakers',
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
  },
  {
    id: 'acc-watch-1',
    name: 'Minimalist Automatic Watch',
    category: 'accessories',
    subcategory: 'watches',
    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
  },
  {
    id: 'acc-sunglasses-1',
    name: 'Black Acetate Sunglasses',
    category: 'accessories',
    subcategory: 'sunglasses',
    url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80',
  },
];

export const UNIVERSAL_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80';

/**
 * Returns a fitting fallback high-fashion image based on category and subcategory
 */
export function getFallbackImage(category?: string, subcategory?: string): string {
  const cat = (category || '').toLowerCase();
  const sub = (subcategory || '').toLowerCase();

  if (sub.includes('pant') || sub.includes('denim') || sub.includes('trouser') || sub.includes('cargo') || sub.includes('jean')) {
    return 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80';
  }
  if (sub.includes('shirt')) {
    return 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80';
  }
  if (sub.includes('tee') || sub.includes('t-shirt') || sub.includes('polo')) {
    return 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80';
  }
  if (sub.includes('blazer') || sub.includes('suit')) {
    return 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800&q=80';
  }
  if (sub.includes('jacket') || sub.includes('hoodie') || sub.includes('sweat')) {
    return 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80';
  }
  if (cat === 'footwear' || sub.includes('boot') || sub.includes('shoe') || sub.includes('sneaker') || sub.includes('loafer')) {
    return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80';
  }
  if (cat === 'accessories' || sub.includes('watch') || sub.includes('sunglass') || sub.includes('chain') || sub.includes('bag')) {
    return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';
  }

  return UNIVERSAL_FALLBACK_IMAGE;
}

/**
 * Automatically cleans and extracts direct image links from Google search / imgres redirect URLs
 */
export function cleanImageUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim();

  // If user pasted a Google Search imgres URL like https://www.google.com/imgres?imgurl=https%3A%2F%2F...
  if (trimmed.includes('google.') && trimmed.includes('imgurl=')) {
    try {
      const match = trimmed.match(/[?&]imgurl=([^&]+)/);
      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
    } catch {
      // ignore
    }
  }

  // If user pasted a Google Search redirect URL with &url=
  if (trimmed.includes('google.') && trimmed.includes('&url=')) {
    try {
      const match = trimmed.match(/[?&]url=([^&]+)/);
      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
    } catch {
      // ignore
    }
  }

  return trimmed;
}

/**
 * Resizes and compresses an image file from the user's computer
 * to a lightweight base64 Data URL (JPEG, max 1000px, ~100-150KB),
 * preventing LocalStorage quota overflow while keeping sharp luxury visual quality.
 */
export function compressImageFile(file: File, maxDim = 1000, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    // If not an image
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please select an image file (JPEG, PNG, WebP).'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file from computer.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to parse image.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // fallback to raw data url if canvas not supported
          resolve(reader.result as string);
          return;
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to high-quality JPEG
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
