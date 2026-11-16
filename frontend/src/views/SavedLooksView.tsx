import React, { useState, useEffect } from 'react';
import {
  BookmarkCheck,
  Plus,
  Folder,
  Trash2,
  Star,
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

  const _handleDeleteCollection = async (id: number) => {
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
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-studio-border pb-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-studio-secondary border border-studio-border text-studio-text text-[11px] font-mono tracking-widest uppercase mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-studio-text" />
            <span>LOOKBOOK VAULT • WHITE STUDIO</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-studio-text font-display">Saved Looks & Collections</h2>
          <p className="text-xs text-studio-muted">
            Organize generated outfits by occasion: College, Streetwear, Everyday, Formal, or custom tags.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 rounded-xl bg-studio-text hover:bg-studio-text/90 text-studio-bg font-semibold text-xs flex items-center space-x-2 transition-all shadow-studio-sm"
        >
          <Plus className="w-4 h-4 text-studio-bg" />
          <span>New Collection</span>
        </button>
      </div>

      {/* Collection Navigation Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveCollectionId('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeCollectionId === 'ALL'
              ? 'bg-studio-text text-studio-bg shadow-studio-sm font-bold'
              : 'bg-studio-secondary text-studio-muted hover:text-studio-text border border-studio-border'
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
                    ? 'bg-studio-text text-studio-bg shadow-studio-sm font-bold'
                    : 'bg-studio-secondary text-studio-muted hover:text-studio-text border border-studio-border'
                }`}
              >
                <Folder className="w-3.5 h-3.5" />
                <span>{col.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-studio-bg border border-studio-border text-studio-text">
                  {col.outfit_count}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Outfits Grid */}
      {displayedOutfits.length === 0 ? (
        <div className="p-12 rounded-3xl text-center space-y-3 border border-studio-border bg-studio-secondary shadow-studio-card">
          <div className="w-12 h-12 rounded-full bg-studio-bg flex items-center justify-center mx-auto text-studio-muted border border-studio-border">
            <BookmarkCheck className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-studio-text">No saved looks in this collection</h4>
          <p className="text-xs text-studio-muted max-w-sm mx-auto">
            Generate new outfits in the Virtual Try-On Studio and bookmark them directly to this collection.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedOutfits.map((outfit) => (
            <div
              key={outfit.outfit_id}
              className="rounded-3xl overflow-hidden border border-studio-border bg-studio-bg flex flex-col group shadow-studio-card hover:border-studio-text/40 transition-all"
            >
              <div className="relative aspect-[3/4] bg-studio-secondary overflow-hidden border-b border-studio-border flex items-center justify-center">
                <img
                  src={outfit.generated_image_url}
                  alt={outfit.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded bg-studio-bg/90 backdrop-blur-md text-[9px] font-mono uppercase tracking-wider font-bold text-studio-text border border-studio-border shadow-sm">
                  {outfit.occasion}
                </div>

                <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-studio-text text-studio-bg text-[10px] font-bold flex items-center space-x-1 shadow-studio-sm">
                  <Star className="w-3 h-3 fill-current" />
                  <span>{outfit.rating}</span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-studio-text mb-1">{outfit.name}</h4>
                  <p className="text-xs text-studio-muted line-clamp-2 leading-relaxed">
                    {outfit.stylist_notes}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-studio-border">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-studio-muted font-mono text-[10px]">{outfit.wardrobe_items?.length || 0} PIECES COMBINED</span>
                    <button
                      onClick={() => onReopenTryOn(outfit)}
                      className="text-studio-text hover:underline font-semibold flex items-center space-x-1"
                    >
                      <span>Reopen Studio</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-studio-border text-xs">
                    <button
                      onClick={() => setSelectedOutfitModal(outfit)}
                      className="text-[11px] text-studio-muted hover:text-studio-text font-medium"
                    >
                      View Layer Specs
                    </button>
                    <button
                      onClick={() => handleDeleteOutfit(outfit.outfit_id)}
                      className="text-studio-muted hover:text-red-500 p-1 rounded transition-colors"
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

      {/* Layer Specs Modal */}
      {selectedOutfitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-studio-bg rounded-3xl p-6 border border-studio-border max-w-lg w-full space-y-4 shadow-studio-card">
            <div className="flex items-center justify-between border-b border-studio-border pb-3">
              <h3 className="text-base font-bold text-studio-text font-display">
                {selectedOutfitModal.name} — Specs
              </h3>
              <button
                onClick={() => setSelectedOutfitModal(null)}
                className="text-xs text-studio-muted hover:text-studio-text"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {selectedOutfitModal.wardrobe_items?.map((it) => (
                <div key={it.id} className="p-2.5 rounded-xl bg-studio-secondary border border-studio-border flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-studio-text">{it.name}</p>
                    <span className="text-[10px] text-studio-muted font-mono">{it.category} • {it.main_color}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-studio-bg border border-studio-border font-medium">
                    {it.style}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedOutfitModal(null)}
              className="w-full py-2.5 rounded-xl bg-studio-text text-studio-bg text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Create Collection Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateCollection}
            className="bg-studio-bg rounded-3xl p-6 border border-studio-border max-w-md w-full space-y-4 shadow-studio-card"
          >
            <div className="flex items-center justify-between border-b border-studio-border pb-3">
              <h3 className="text-base font-bold text-studio-text font-display">New Look Collection</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-xs text-studio-muted hover:text-studio-text"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-studio-text block mb-1">Collection Name</label>
                <input
                  type="text"
                  placeholder="e.g. Summer European Rotation, College Essentials"
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  className="w-full bg-studio-secondary border border-studio-border rounded-xl px-3 py-2 text-studio-text focus:outline-none focus:border-studio-text"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-studio-text block mb-1">Description (Optional)</label>
                <textarea
                  placeholder="Notes about this aesthetic capsule..."
                  value={newColDesc}
                  onChange={(e) => setNewColDesc(e.target.value)}
                  className="w-full bg-studio-secondary border border-studio-border rounded-xl px-3 py-2 text-studio-text focus:outline-none focus:border-studio-text"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-studio-border">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-studio-muted hover:text-studio-text font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-studio-text text-studio-bg text-xs font-semibold"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
