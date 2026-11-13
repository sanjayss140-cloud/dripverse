import React, { useState, useEffect } from 'react';
import {
  BookmarkCheck,
  Plus,
  Folder,
  Trash2,
  ExternalLink,
  Star,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { SavedCollection, TryOnResponse } from '../types';
import { api } from '../api';

interface SavedLooksViewProps {
  outfits: TryOnResponse[];
  onReopenTryOn: (outfit: TryOnResponse) => void;
  onRefreshOutfits: () => void;
}

export const SavedLooksView: React.FC<SavedLooksViewProps> = ({
  outfits,
  onReopenTryOn,
  onRefreshOutfits,
}) => {
  const [collections, setCollections] = useState<SavedCollection[]>([]);
  const [activeCollectionId, setActiveCollectionId] = useState<number | 'ALL'>('ALL');
  const [newColName, setNewColName] = useState<string>('');
  const [newColDesc, setNewColDesc] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [selectedOutfitModal, setSelectedOutfitModal] = useState<TryOnResponse | null>(null);

  const fetchCollections = async () => {
    try {
      const data = await api.getCollections();
      setCollections(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    try {
      await api.createCollection(newColName.trim(), newColDesc.trim() || undefined);
      setNewColName('');
      setNewColDesc('');
      setShowCreateModal(false);
      fetchCollections();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteOutfit = async (id: number) => {
    if (!window.confirm('Delete this saved outfit look?')) return;
    try {
      await api.deleteOutfit(id);
      onRefreshOutfits();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCollection = async (id: number) => {
    if (!window.confirm('Delete this collection?')) return;
    try {
      await api.deleteCollection(id);
      fetchCollections();
      if (activeCollectionId === id) setActiveCollectionId('ALL');
    } catch (err) {
      console.error(err);
    }
  };

  const activeCollection =
    activeCollectionId === 'ALL'
      ? null
      : collections.find((c) => c.id === activeCollectionId);

  const displayedOutfits =
    activeCollectionId === 'ALL'
      ? outfits
      : activeCollection?.outfits || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold mb-2">
            <BookmarkCheck className="w-3.5 h-3.5 text-violet-400" />
            <span>Curated Lookbook Vault</span>
          </div>
          <h2 className="text-2xl font-bold text-white font-display">Saved Looks & Collections</h2>
          <p className="text-xs text-zinc-400">
            Organize generated outfits by occasion: College, Streetwear, Everyday, Formal, or custom tags.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs flex items-center space-x-2 transition-all shadow-glow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Collection</span>
        </button>
      </div>

      {/* Collection Navigation Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveCollectionId('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeCollectionId === 'ALL'
              ? 'bg-violet-600 text-white shadow-glow-sm'
              : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          All Looks ({outfits.length})
        </button>

        {collections.map((col) => {
          const isSelected = activeCollectionId === col.id;
          return (
            <div key={col.id} className="relative group">
              <button
                onClick={() => setActiveCollectionId(col.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-2 ${
                  isSelected
                    ? 'bg-violet-600 text-white shadow-glow-sm'
                    : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Folder className="w-3.5 h-3.5 text-violet-400" />
                <span>{col.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40 text-zinc-300">
                  {col.outfit_count}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Outfits Grid */}
      {displayedOutfits.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
            <BookmarkCheck className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-white">No saved looks in this collection</h4>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Generate new outfits in the Virtual Try-On Studio and bookmark them directly to this collection.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedOutfits.map((outfit) => (
            <div
              key={outfit.outfit_id}
              className="glass-card-hover rounded-3xl overflow-hidden border border-white/10 flex flex-col group"
            >
              <div className="relative aspect-[3/4] bg-[#0c0c12] overflow-hidden">
                <img
                  src={outfit.generated_image_url}
                  alt={outfit.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold text-white border border-white/10">
                  {outfit.occasion}
                </div>

                <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-violet-600 text-white text-[10px] font-bold flex items-center space-x-1 shadow-glow-sm">
                  <Star className="w-3 h-3 fill-current" />
                  <span>{outfit.rating}</span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">{outfit.name}</h4>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {outfit.stylist_notes}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-white/5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">{outfit.wardrobe_items?.length || 0} pieces</span>
                    <button
                      onClick={() => onReopenTryOn(outfit)}
                      className="text-violet-400 hover:text-violet-300 font-semibold flex items-center space-x-1"
                    >
                      <span>Reopen 360 Studio</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => setSelectedOutfitModal(outfit)}
                      className="text-[11px] text-zinc-400 hover:text-white"
                    >
                      Inspect All 4 Angles
                    </button>
                    <button
                      onClick={() => handleDeleteOutfit(outfit.outfit_id)}
                      className="p-1 rounded text-zinc-500 hover:text-red-400"
                      title="Delete Outfit"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Collection Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-drip-card border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-white font-display mb-1">Create New Look Collection</h3>
            <p className="text-xs text-zinc-400 mb-4">E.g., "College", "Date Night", "Streetwear", "Formal"</p>

            <form onSubmit={handleCreateCollection} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-zinc-400 uppercase font-semibold block mb-1">Collection Name</label>
                <input
                  type="text"
                  placeholder="E.g., Tokyo Streetwear 2026"
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  className="w-full bg-zinc-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-violet-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase font-semibold block mb-1">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="Key vibe or dress code notes"
                  value={newColDesc}
                  onChange={(e) => setNewColDesc(e.target.value)}
                  className="w-full bg-zinc-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl"
                >
                  Create Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect All 4 Angles Modal */}
      {selectedOutfitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-4xl bg-drip-card border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white font-display">{selectedOutfitModal.name}</h3>
                <p className="text-xs text-zinc-400">4-View Multi-Angle Studio Synthesis</p>
              </div>
              <button
                onClick={() => setSelectedOutfitModal(null)}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white text-xs"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(['FRONT', 'BACK', 'LEFT', 'RIGHT'] as const).map((viewKey) => {
                const img = selectedOutfitModal.views[viewKey] || selectedOutfitModal.generated_image_url;
                return (
                  <div key={viewKey} className="aspect-[3/4] bg-black/50 rounded-2xl overflow-hidden relative border border-white/5">
                    <img src={img} alt={viewKey} className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-bold text-violet-300">
                      {viewKey}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
