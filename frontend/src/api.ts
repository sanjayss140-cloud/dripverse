import {
  User,
  UserProfile,
  WardrobeItem,
  VirtualModelOption,
  TryOnResponse,
  StylistMode,
  StylistChatResponse,
  StylistAuditResponse,
  ColorMatchResponse,
  SavedCollection,
  CalendarEntry,
  OutfitBattleResponse
} from './types';

const BASE_URL = '/api';

export const api = {
  // Auth & Profile
  async getMe(): Promise<User> {
    const res = await fetch(`${BASE_URL}/auth/me`);
    if (!res.ok) throw new Error('Failed to fetch user profile');
    return res.json();
  },

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const res = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },

  // Wardrobe
  async getWardrobeItems(params?: {
    category?: string;
    style?: string;
    color?: string;
    search?: string;
    favorite_only?: boolean;
  }): Promise<WardrobeItem[]> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.style) query.append('style', params.style);
    if (params?.color) query.append('color', params.color);
    if (params?.search) query.append('search', params.search);
    if (params?.favorite_only) query.append('favorite_only', 'true');

    const res = await fetch(`${BASE_URL}/wardrobe?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to load wardrobe items');
    return res.json();
  },

  async uploadWardrobeItems(files: File[]): Promise<WardrobeItem[]> {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));

    const res = await fetch(`${BASE_URL}/wardrobe/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(err.detail || 'Upload failed');
    }
    return res.json();
  },

  async updateWardrobeItem(id: number, data: Partial<WardrobeItem>): Promise<WardrobeItem> {
    const res = await fetch(`${BASE_URL}/wardrobe/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update item');
    return res.json();
  },

  async deleteWardrobeItem(id: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/wardrobe/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete item');
  },

  // Virtual Models Studio
  async getVirtualModels(): Promise<VirtualModelOption[]> {
    const res = await fetch(`${BASE_URL}/models`);
    if (!res.ok) throw new Error('Failed to load virtual models');
    return res.json();
  },

  async customizeAvatar(data: {
    model_type: string;
    skin_tone: string;
    hair_style: string;
    hair_color: string;
    body_proportions: string;
  }): Promise<UserProfile> {
    const res = await fetch(`${BASE_URL}/models/customize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to customize avatar');
    return res.json();
  },

  // Virtual Try-On
  async generateVirtualTryOn(data: {
    upperwear_id?: number;
    bottomwear_id?: number;
    outerwear_id?: number;
    footwear_id?: number;
    accessory_ids: number[];
    model_type: string;
    model_settings?: Record<string, any>;
    name?: string;
    occasion?: string;
  }): Promise<TryOnResponse> {
    const res = await fetch(`${BASE_URL}/tryon/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Try-on failed' }));
      throw new Error(err.detail || 'Failed to generate virtual try-on');
    }
    return res.json();
  },

  async getTryOnHistory(): Promise<TryOnResponse[]> {
    const res = await fetch(`${BASE_URL}/tryon/history`);
    if (!res.ok) throw new Error('Failed to fetch try-on history');
    return res.json();
  },

  async toggleFavoriteOutfit(outfitId: number): Promise<{ is_favorite: boolean }> {
    const res = await fetch(`${BASE_URL}/tryon/${outfitId}/favorite`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to toggle favorite');
    return res.json();
  },

  async deleteOutfit(outfitId: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/tryon/${outfitId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete outfit');
  },

  // MIRA Stylist
  async getStylistModes(): Promise<StylistMode[]> {
    const res = await fetch(`${BASE_URL}/stylist/modes`);
    if (!res.ok) throw new Error('Failed to load stylist modes');
    return res.json();
  },

  async chatWithMira(data: {
    message: string;
    mode: string;
    current_outfit_id?: number;
    selected_wardrobe_ids?: number[];
    occasion?: string;
  }): Promise<StylistChatResponse> {
    const res = await fetch(`${BASE_URL}/stylist/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to converse with MIRA');
    return res.json();
  },

  async auditOutfit(data: {
    wardrobe_item_ids: number[];
    mode: string;
    occasion: string;
  }): Promise<StylistAuditResponse> {
    const res = await fetch(`${BASE_URL}/stylist/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to audit outfit');
    return res.json();
  },

  // Outfits & Surprise Me & Battle
  async surpriseMe(data: {
    excluded_item_ids?: number[];
    preferred_style?: string;
    preferred_occasion?: string;
    preferred_model_type?: string;
  }): Promise<any> {
    const res = await fetch(`${BASE_URL}/outfits/surprise-me`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Surprise generation failed' }));
      throw new Error(err.detail || 'Surprise Me failed');
    }
    return res.json();
  },

  async runOutfitBattle(data: {
    outfit_a_ids: number[];
    outfit_b_ids: number[];
    occasion: string;
  }): Promise<OutfitBattleResponse> {
    const res = await fetch(`${BASE_URL}/outfits/battle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Outfit battle evaluation failed');
    return res.json();
  },

  // Color Lab
  async analyzeColor(wardrobeItemId: number): Promise<ColorMatchResponse> {
    const res = await fetch(`${BASE_URL}/color-lab/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wardrobe_item_id: wardrobeItemId }),
    });
    if (!res.ok) throw new Error('Failed to analyze color harmony');
    return res.json();
  },

  // Collections
  async getCollections(): Promise<SavedCollection[]> {
    const res = await fetch(`${BASE_URL}/collections`);
    if (!res.ok) throw new Error('Failed to fetch collections');
    return res.json();
  },

  async createCollection(name: string, description?: string): Promise<SavedCollection> {
    const res = await fetch(`${BASE_URL}/collections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    });
    if (!res.ok) throw new Error('Failed to create collection');
    return res.json();
  },

  async addToCollection(collectionId: number, outfitId: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/collections/${collectionId}/add/${outfitId}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to add to collection');
  },

  async removeFromCollection(collectionId: number, outfitId: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/collections/${collectionId}/remove/${outfitId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to remove from collection');
  },

  async deleteCollection(collectionId: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/collections/${collectionId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete collection');
  },

  // Planner
  async getWeeklyPlanner(): Promise<CalendarEntry[]> {
    const res = await fetch(`${BASE_URL}/planner`);
    if (!res.ok) throw new Error('Failed to fetch weekly planner');
    return res.json();
  },

  async assignPlannerDay(data: {
    outfit_id: number;
    scheduled_date: string;
    occasion: string;
    weather_note?: string;
  }): Promise<CalendarEntry> {
    const res = await fetch(`${BASE_URL}/planner/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to schedule outfit');
    return res.json();
  },

  async removePlannerEntry(id: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/planner/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete planner entry');
  },

  // Settings
  async getSettings(): Promise<any> {
    const res = await fetch(`${BASE_URL}/settings`);
    if (!res.ok) throw new Error('Failed to load settings');
    return res.json();
  },

  async updateApiKeys(keys: { gemini?: string; openai?: string }): Promise<any> {
    const res = await fetch(`${BASE_URL}/settings/keys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(keys),
    });
    if (!res.ok) throw new Error('Failed to update API credentials');
    return res.json();
  },

  async exportWardrobe(): Promise<any> {
    const res = await fetch(`${BASE_URL}/settings/export`);
    if (!res.ok) throw new Error('Failed to export wardrobe');
    return res.json();
  },
};
