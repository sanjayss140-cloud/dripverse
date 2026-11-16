import React, { useState } from 'react';
import {
  Shirt,
  Search,
  Plus,
  Heart,
  Edit2,
  Trash2,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { WardrobeItem } from '../types';
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
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-studio-border pb-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-studio-secondary border border-studio-border text-studio-text text-[11px] font-mono tracking-widest uppercase mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-studio-text" />
            <span>AUTHENTIC DIGITAL VAULT • WHITE STUDIO</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-studio-text font-display">Digital Wardrobe Vault</h2>
          <p className="text-xs text-studio-muted">
            {wardrobe.length} physical garments digitized with fabric drape preservation & automated studio cutouts.
          </p>
        </div>

        <button
          onClick={openUploadModal}
          className="px-5 py-2.5 rounded-xl bg-studio-text hover:bg-studio-text/90 text-studio-bg font-semibold text-xs flex items-center space-x-2 transition-all shadow-studio-sm hover:scale-[1.01]"
        >
          <Plus className="w-4 h-4 text-studio-bg" />
          <span>Upload Clothes</span>
        </button>
      </div>

      {/* Category Tabs Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSelectedCategory(tab.value)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === tab.value
                ? 'bg-studio-text text-studio-bg font-bold shadow-studio-sm'
                : 'bg-studio-secondary text-studio-muted hover:text-studio-text border border-studio-border'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 rounded-2xl bg-studio-secondary flex flex-wrap items-center justify-between gap-3 text-xs border border-studio-border shadow-studio-sm">
        <div className="flex items-center space-x-2.5 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-studio-muted shrink-0 ml-1" />
          <input
            type="text"
            placeholder="Search by name, color, material, pattern..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-studio-text placeholder-studio-muted text-xs focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-3">
          {/* Style Selector */}
          <div className="flex items-center space-x-1.5 bg-studio-bg px-3 py-1.5 rounded-xl border border-studio-border">
            <SlidersHorizontal className="w-3.5 h-3.5 text-studio-muted" />
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="bg-transparent text-studio-text text-xs focus:outline-none cursor-pointer"
            >
              <option value="All">All Styles</option>
              <option value="Casual">Casual</option>
              <option value="Streetwear">Streetwear</option>
              <option value="Formal">Formal</option>
              <option value="Minimalist">Minimalist</option>
              <option value="Traditional">Traditional</option>
            </select>
          </div>

          {/* Favorite Only Toggle */}
          <button
            onClick={() => setFavoriteOnly(!favoriteOnly)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition-all ${
              favoriteOnly
                ? 'bg-studio-text text-studio-bg border-studio-text font-bold shadow-studio-sm'
                : 'bg-studio-bg border-studio-border text-studio-muted hover:text-studio-text'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${favoriteOnly ? 'fill-current' : ''}`} />
            <span>Favorites</span>
          </button>
        </div>
      </div>

      {/* Wardrobe Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-12 rounded-3xl text-center space-y-3 border border-studio-border bg-studio-secondary shadow-studio-card">
          <div className="w-12 h-12 rounded-full bg-studio-bg flex items-center justify-center mx-auto text-studio-muted border border-studio-border">
            <Shirt className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-studio-text">No garments found</h4>
          <p className="text-xs text-studio-muted max-w-sm mx-auto">
            Try adjusting your search filters or upload new garments to expand your personal fashion vault.
          </p>
          <button
            onClick={openUploadModal}
            className="px-4 py-2 rounded-xl bg-studio-text text-studio-bg font-semibold text-xs mt-2"
          >
            Upload Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredItems.map((item) => (
            <div key={item.id} className="wardrobe-card group">
              {/* Product Photography Canvas */}
              <div className="wardrobe-card-image">
                <img
                  src={item.clean_image_url || item.image_url}
                  alt={item.name}
                />

                {/* Favorite Heart */}
                <button
                  onClick={() => handleToggleFavorite(item)}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 dark:bg-black/70 backdrop-blur-sm text-studio-muted hover:text-studio-text transition-colors shadow-sm border border-studio-border"
                >
                  <Heart className={`w-3.5 h-3.5 ${item.is_favorite ? 'text-red-500 fill-current' : ''}`} />
                </button>

                {/* Category Pill */}
                <div className="absolute top-3 left-3 badge">
                  {item.category}
                </div>
              </div>

              {/* Item Details */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-studio-text truncate" title={item.name}>
                    {item.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[11px] text-studio-muted">{item.subcategory}</span>
                    <span className="text-studio-border">·</span>
                    <span className="text-[11px] text-studio-muted">{item.material}</span>
                  </div>
                </div>

                {/* Color and Style */}
                <div className="flex items-center justify-between pt-2.5 border-t border-studio-border">
                  <div className="flex items-center gap-1.5" title={`Color: ${item.main_color}`}>
                    <span
                      className="w-3 h-3 rounded-full border border-black/10 shadow-sm shrink-0"
                      style={{ backgroundColor: item.main_color_hex || '#18181b' }}
                    />
                    <span className="text-[10px] text-studio-muted truncate max-w-[80px]">
                      {item.main_color}
                    </span>
                  </div>
                  <span className="badge">{item.style}</span>
                </div>

                {/* Action Toolbar */}
                <div className="flex items-center justify-between pt-2.5 border-t border-studio-border">
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => onEditItem(item)}
                      className="p-1.5 rounded-lg text-studio-muted hover:text-studio-text hover:bg-studio-secondary transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="p-1.5 rounded-lg text-studio-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => onSelectForTryOn(item)}
                    className="btn-primary py-1.5 px-3 text-[11px]"
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
