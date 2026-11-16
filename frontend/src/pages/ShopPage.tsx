import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ChevronDown, X, Grid2X2, LayoutList } from 'lucide-react';
import { Product } from '../data/products';
import { useStore } from '../store/StoreContext';
import ProductCard from '../components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';

interface ShopPageProps {
  filterCategory?: string; // 'clothing' | 'footwear' | 'accessories' | 'new-arrivals'
  title?: string;
  subtitle?: string;
}

export default function ShopPage({ filterCategory, title = 'SHOP ALL', subtitle = 'The complete DRIPVERSE collection.' }: ShopPageProps) {
  const { state } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [gridSize, setGridSize] = useState<2 | 4>(4);

  // Filter state
  const [selectedSubcats, setSelectedSubcats] = useState<string[]>(() => {
    const sub = searchParams.get('sub');
    return sub ? [sub] : [];
  });
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000]);
  const [sortBy, setSortBy] = useState('featured');
  const searchQuery = searchParams.get('q') || '';

  // Derive subcategory options from the filtered category
  const baseProducts = useMemo(() => {
    if (filterCategory === 'new-arrivals') return state.products.filter((p) => p.isNew);
    if (filterCategory) return state.products.filter((p) => p.category === filterCategory);
    return state.products;
  }, [filterCategory, state.products]);

  const subcategories = useMemo(() => {
    const map = new Map<string, number>();
    baseProducts.forEach((p) => {
      map.set(p.subcategory, (map.get(p.subcategory) || 0) + 1);
    });
    return Array.from(map.entries()).map(([sub, count]) => ({ sub, count }));
  }, [baseProducts]);

  const allSizes = useMemo(() => {
    const set = new Set<string>();
    baseProducts.forEach((p) => p.sizes.forEach((s) => set.add(s)));
    return Array.from(set);
  }, [baseProducts]);

  const filtered = useMemo(() => {
    let list = [...baseProducts];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.includes(q)) ||
          p.subcategory.includes(q) ||
          p.category.includes(q)
      );
    }
    if (selectedSubcats.length) list = list.filter((p) => selectedSubcats.includes(p.subcategory));
    if (selectedSizes.length) list = list.filter((p) => p.sizes.some((s) => selectedSizes.includes(s)));
    list = list.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

    switch (sortBy) {
      case 'price-asc': list.sort((a, b) => a.price - b.price); break;
      case 'price-desc': list.sort((a, b) => b.price - a.price); break;
      case 'newest': list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
      case 'popular': list.sort((a, b) => b.reviewCount - a.reviewCount); break;
      case 'rating': list.sort((a, b) => b.rating - a.rating); break;
      default: list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }
    return list;
  }, [baseProducts, searchQuery, selectedSubcats, selectedSizes, priceRange, sortBy]);

  const toggleSubcat = (sub: string) =>
    setSelectedSubcats((prev) => prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]);

  const toggleSize = (size: string) =>
    setSelectedSizes((prev) => prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]);

  const clearAll = () => {
    setSelectedSubcats([]);
    setSelectedSizes([]);
    setPriceRange([0, 20000]);
    setSortBy('featured');
    setSearchParams({});
  };

  const activeFilterCount = selectedSubcats.length + selectedSizes.length + (priceRange[0] > 0 || priceRange[1] < 20000 ? 1 : 0);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <div className="border-b border-gray-100 bg-[#F7F7F5]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-12">
          {searchQuery && (
            <p className="text-xs tracking-widest uppercase text-gray-400 mb-2">Search results for</p>
          )}
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            {searchQuery ? `"${searchQuery.toUpperCase()}"` : title}
          </h1>
          <p className="text-gray-500 text-sm mt-2">{filtered.length} products</p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className="flex items-center gap-2 text-xs tracking-widest uppercase font-medium border border-black px-4 py-2.5 hover:bg-black hover:text-white transition-colors"
            >
              <SlidersHorizontal size={14} />
              FILTERS
              {activeFilterCount > 0 && (
                <span className="bg-black text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full ml-1">
                  {activeFilterCount}
                </span>
              )}
            </button>
            {activeFilterCount > 0 && (
              <button onClick={clearAll} className="text-xs text-gray-400 hover:text-black transition-colors flex items-center gap-1">
                <X size={12} /> Clear all
              </button>
            )}
            {selectedSubcats.map((sub) => (
              <span key={sub} className="hidden md:flex items-center gap-1 text-xs border border-gray-300 px-3 py-1.5 capitalize">
                {sub} <X size={10} className="cursor-pointer ml-1" onClick={() => toggleSubcat(sub)} />
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setGridSize(4)}
                className={`p-1.5 ${gridSize === 4 ? 'text-black' : 'text-gray-300'}`}
              >
                <Grid2X2 size={16} />
              </button>
              <button
                onClick={() => setGridSize(2)}
                className={`p-1.5 ${gridSize === 2 ? 'text-black' : 'text-gray-300'}`}
              >
                <LayoutList size={16} />
              </button>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs tracking-widest uppercase border border-gray-200 px-3 py-2.5 outline-none bg-white hover:border-black transition-colors cursor-pointer"
            >
              <option value="featured">FEATURED</option>
              <option value="newest">NEWEST</option>
              <option value="popular">MOST POPULAR</option>
              <option value="rating">TOP RATED</option>
              <option value="price-asc">PRICE: LOW TO HIGH</option>
              <option value="price-desc">PRICE: HIGH TO LOW</option>
            </select>
          </div>
        </div>

        <div className="flex gap-8 py-8">
          {/* Sidebar Filters */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.aside
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 240 }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-shrink-0 overflow-hidden"
              >
                <div className="w-60">
                  {/* Category/Subcategory */}
                  {subcategories.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xs tracking-[0.25em] uppercase font-bold mb-4">Category</h3>
                      <div className="space-y-2">
                        {subcategories.map(({ sub, count }) => (
                          <label key={sub} className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={selectedSubcats.includes(sub)}
                              onChange={() => toggleSubcat(sub)}
                              className="w-3.5 h-3.5 accent-black"
                            />
                            <span className="text-xs capitalize group-hover:text-black transition-colors text-gray-600 flex-1">
                              {sub}
                            </span>
                            <span className="text-xs text-gray-300">{count}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Size */}
                  <div className="mb-8">
                    <h3 className="text-xs tracking-[0.25em] uppercase font-bold mb-4">Size</h3>
                    <div className="flex flex-wrap gap-2">
                      {allSizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => toggleSize(size)}
                          className={`text-[10px] border px-2.5 py-1.5 transition-colors ${
                            selectedSizes.includes(size)
                              ? 'bg-black text-white border-black'
                              : 'border-gray-200 hover:border-black'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    <h3 className="text-xs tracking-[0.25em] uppercase font-bold mb-4">
                      Price: {formatPrice(priceRange[0])} — {formatPrice(priceRange[1])}
                    </h3>
                    <input
                      type="range"
                      min={0}
                      max={20000}
                      step={500}
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full accent-black"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                      <span>₹0</span>
                      <span>₹20,000</span>
                    </div>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            {filtered.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-xs tracking-widest uppercase text-gray-400 mb-2">No results found</p>
                <h3 className="text-2xl font-black mb-4">NOTHING HERE YET.</h3>
                <p className="text-gray-500 text-sm mb-6">Try adjusting your filters or search term.</p>
                <button onClick={clearAll} className="border border-black px-6 py-3 text-xs tracking-widest uppercase font-bold hover:bg-black hover:text-white transition-colors">
                  CLEAR FILTERS
                </button>
              </div>
            ) : (
              <div className={`grid gap-4 md:gap-6 ${
                gridSize === 4
                  ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                  : 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3'
              }`}>
                {filtered.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
