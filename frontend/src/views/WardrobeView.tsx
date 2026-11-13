import React, { useState } from 'react';
import {
  Shirt,
  Search,
  Filter,
  Plus,
  Heart,
  Edit2,
  Trash2,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  Tag
} from 'lucide-react';
import { WardrobeItem, WardrobeCategory } from '../types';
import { api } from '../api';

interface WardrobeViewProps {
  wardrobe: WardrobeItem[];
  onRefresh: () => void;
  openUploadModal: () => void;
  onEditItem: (item: WardrobeItem) => void;
  onSelectForTryOn: (item: WardrobeItem) => void;
}

const CATEGORY_TABS: { label: string; value: string }[] = [
  { label: 'All Garments', value: 'ALL' },
  { label: 'Upperwear', value: 'UPPERWEAR' },
  { label: 'Bottomwear', value: 'BOTTOMWEAR' },
  { label: 'Outerwear', value: 'OUTERWEAR' },
  { label: 'Footwear', value: 'FOOTWEAR' },
  { label: 'Accessories', value: 'ACCESSORIES' },
  { label: 'Other', value: 'OTHER' },
];

export const WardrobeView: React.FC<WardrobeViewProps> = ({
  wardrobe,
  onRefresh,
  openUploadModal,
  onEditItem,
  onSelectForTryOn,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>('All');
  const [favoriteOnly, setFavoriteOnly] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Filter items locally for instant responsiveness
  const filteredItems = wardrobe.filter((item) => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (selectedStyle !== 'All' && item.style !== selectedStyle) return false;
    if (favoriteOnly && !item.is_favorite) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchSub = item.subcategory.toLowerCase().includes(q);
      const matchCol = item.main_color.toLowerCase().includes(q);
      const matchPat = item.pattern.toLowerCase().includes(q);
      const matchMat = item.material.toLowerCase().includes(q);
      if (!matchName && !matchSub && !matchCol && !matchPat && !matchMat) return false;
    }
    return true;
  });

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this garment from your wardrobe?')) return;
    setDeletingId(id);
    try {
      await api.deleteWardrobeItem(id);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleFavorite = async (item: WardrobeItem) => {
    try {
      await api.updateWardrobeItem(item.id, { is_favorite: !item.is_favorite });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white font-display">Digital Wardrobe Vault</h2>
          <p className="text-xs text-zinc-400">
            {wardrobe.length} items digitized with AI vision & automated background cutouts
          </p>
        </div>

        <button
          onClick={openUploadModal}
          className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs flex items-center space-x-2 transition-all shadow-glow-sm hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Clothes</span>
        </button>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSelectedCategory(tab.value)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === tab.value
                ? 'bg-violet-600 text-white shadow-glow-sm'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2.5 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-zinc-400 shrink-0 ml-1" />
          <input
            type="text"
            placeholder="Search by name, color, pattern, material..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-white placeholder-zinc-500 text-xs focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-3">
          {/* Style Selector */}
          <div className="flex items-center space-x-1.5 bg-zinc-900 px-3 py-1.5 rounded-xl border border-white/10">
            <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="bg-transparent text-zinc-300 text-xs focus:outline-none"
            >
              <option value="All" className="bg-zinc-900">All Styles</option>
              <option value="Casual" className="bg-zinc-900">Casual</option>
              <option value="Streetwear" className="bg-zinc-900">Streetwear</option>
              <option value="Formal" className="bg-zinc-900">Formal</option>
              <option value="Minimalist" className="bg-zinc-900">Minimalist</option>
              <option value="Traditional" className="bg-zinc-900">Traditional</option>
            </select>
          </div>

          {/* Favorite Only Toggle */}
          <button
            onClick={() => setFavoriteOnly(!favoriteOnly)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition-all ${
              favoriteOnly
                ? 'bg-pink-500/20 border-pink-500/40 text-pink-400'
                : 'bg-zinc-900 border-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${favoriteOnly ? 'fill-current' : ''}`} />
            <span>Favorites</span>
          </button>
        </div>
      </div>

      {/* Wardrobe Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
            <Shirt className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-white">No items found</h4>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Try adjusting your search terms or upload new clothing items to expand your digital wardrobe.
          </p>
          <button
            onClick={openUploadModal}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs mt-2"
          >
            Upload Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="glass-card-hover rounded-2xl overflow-hidden border border-white/10 flex flex-col group relative"
            >
              {/* Image Preview Canvas */}
              <div className="relative aspect-square bg-[#0e0e14] p-4 flex items-center justify-center overflow-hidden">
                <img
                  src={item.clean_image_url || item.image_url}
                  alt={item.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
                />

                {/* Favorite Heart Button */}
                <button
                  onClick={() => handleToggleFavorite(item)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md text-zinc-400 hover:text-pink-400 transition-colors"
                >
                  <Heart className={`w-3.5 h-3.5 ${item.is_favorite ? 'text-pink-500 fill-current' : ''}`} />
                </button>

                {/* Category Pill */}
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-semibold text-violet-300 border border-violet-500/20">
                  {item.category}
                </div>
              </div>

              {/* Item Details */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-white truncate" title={item.name}>
                    {item.name}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-[11px] text-zinc-400">{item.subcategory}</span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-[11px] text-zinc-400">{item.material}</span>
                  </div>
                </div>

                {/* Color and Tags */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="flex items-center space-x-1.5" title={`Color: ${item.main_color}`}>
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: item.main_color_hex || '#18181b' }}
                    />
                    <span className="text-[10px] text-zinc-400 truncate max-w-[80px]">
                      {item.main_color}
                    </span>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-medium">
                    {item.style}
                  </span>
                </div>

                {/* Action Toolbar */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onEditItem(item)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                      title="Edit Classification"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                      title="Remove from Wardrobe"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => onSelectForTryOn(item)}
                    className="px-3 py-1 rounded-lg bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white text-[11px] font-semibold flex items-center space-x-1 transition-all"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Try On</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
