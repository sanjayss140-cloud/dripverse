export type WardrobeCategory = 'UPPERWEAR' | 'BOTTOMWEAR' | 'OUTERWEAR' | 'FOOTWEAR' | 'ACCESSORIES' | 'OTHER';

export interface WardrobeItem {
  id: number;
  user_id: number;
  name: string;
  category: WardrobeCategory;
  subcategory: string;
  main_color: string;
  main_color_hex: string;
  secondary_colors: string[];
  pattern: string;
  material: string;
  style: string;
  image_url: string;
  clean_image_url?: string;
  match_tags: string[];
  is_favorite: boolean;
  created_at: string;
}

export interface VirtualModelOption {
  id: string;
  name: string;
  type_category: 'anime' | 'human' | 'mannequin';
  gender: 'male' | 'female' | 'neutral';
  description: string;
  default_preview: string;
  features: string[];
}

export interface UserProfile {
  id: number;
  user_id: number;
  display_name: string;
  gender_presentation: string;
  skin_tone: string;
  hair_style: string;
  hair_color: string;
  body_proportions: string;
  preferred_model_type: string;
  style_preference: string;
  preferences: Record<string, any>;
  api_keys: Record<string, string>;
  created_at: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  profile?: UserProfile;
  created_at: string;
}

export interface TryOnResponse {
  outfit_id: number;
  name: string;
  model_type: string;
  model_settings: Record<string, any>;
  generated_image_url: string;
  views: Record<string, string>; // FRONT, BACK, LEFT, RIGHT
  occasion: string;
  rating: number;
  stylist_notes: string;
  wardrobe_items: WardrobeItem[];
  is_favorite: boolean;
  created_at: string;
}

export interface StylistMode {
  id: string;
  title: string;
  vibe: string;
  focus: string;
}

export interface StylistChatResponse {
  response: string;
  appreciation: string;
  key_strengths: string[];
  practical_suggestions: string[];
  suggested_wardrobe_items: WardrobeItem[];
  mode_used: string;
}

export interface StylistAuditResponse {
  appreciation: string;
  rating: number;
  strengths: string[];
  suggestions: string[];
  color_balance_feedback: string;
  silhouette_feedback: string;
  occasion_verdict: string;
}

export interface ColorPalette {
  name: string;
  description: string;
  hex_colors: string[];
}

export interface ColorMatchResponse {
  item: WardrobeItem;
  dominant_color: string;
  dominant_hex: string;
  palettes: Record<string, ColorPalette>;
  recommended_matching_items: WardrobeItem[];
  styling_tip: string;
}

export interface SavedCollection {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  outfit_count: number;
  outfits: TryOnResponse[];
  created_at: string;
}

export interface CalendarEntry {
  id: number;
  user_id: number;
  outfit_id: number;
  scheduled_date: string;
  occasion: string;
  weather_note?: string;
  outfit?: TryOnResponse;
  created_at: string;
}

export interface OutfitBattleResponse {
  appreciation_both: string;
  outfit_a_analysis: {
    title: string;
    key_advantages: string[];
    vibe: string;
    score: number;
  };
  outfit_b_analysis: {
    title: string;
    key_advantages: string[];
    vibe: string;
    score: number;
  };
  winner_recommendation: string;
  stylist_verdict: string;
  actionable_upgrades: string[];
}
