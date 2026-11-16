import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react';
import { Product } from '../data/products';
import { useStore } from '../store/StoreContext';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { state, dispatch, isInWishlist } = useStore();
  const [hovered, setHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [addedToCart, setAddedToCart] = useState(false);
  const inWishlist = isInWishlist(product.id);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedSize && product.sizes.length > 1) {
      // Show size picker by hovering
      return;
    }
    const size = selectedSize || product.sizes[0];
    dispatch({
      type: 'ADD_TO_CART',
      payload: { product, size, color: product.colors[0], quantity: 1 },
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch({ type: 'TOGGLE_WISHLIST', payload: product.id });
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setSelectedSize(''); }}
    >
      <Link to={`/product/${product.id}`} className="block">
        {/* Image */}
        <div className="relative overflow-hidden bg-gray-100 aspect-[3/4]">
          <img
            src={product.images[0]}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-700 ${
              hovered && product.images[1] ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
            }`}
          />
          {product.images[1] && (
            <img
              src={product.images[1]}
              alt={product.name}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                hovered ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
            />
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isNew && (
              <span className="bg-black text-white text-[9px] tracking-[0.2em] uppercase px-2 py-1 font-bold">NEW</span>
            )}
            {discount && (
              <span className="bg-white text-black text-[9px] tracking-[0.2em] uppercase px-2 py-1 font-bold">-{discount}%</span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            className={`absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm transition-all duration-200 hover:scale-110 ${
              hovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
            aria-label="Add to wishlist"
          >
            <Heart
              size={14}
              strokeWidth={1.5}
              className={inWishlist ? 'fill-black text-black' : 'text-black'}
            />
          </button>

          {/* Quick View badge on desktop */}
          <span
            className={`absolute bottom-3 right-3 p-2 bg-white/90 backdrop-blur-sm transition-all duration-200 ${
              hovered ? 'opacity-100' : 'opacity-0'
            } hidden lg:flex pointer-events-none`}
            aria-label="Quick view"
          >
            <Eye size={14} strokeWidth={1.5} />
          </span>

          {/* Quick Add overlay */}
          <div
            className={`absolute bottom-0 left-0 right-0 bg-white transition-all duration-300 ${
              hovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
            }`}
          >
            {product.sizes.length > 1 ? (
              <div className="p-3">
                <div className="flex gap-1.5 justify-center flex-wrap mb-2">
                  {product.sizes.slice(0, 6).map((s) => (
                    <button
                      key={s}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedSize(s); }}
                      className={`text-[10px] border w-8 h-8 transition-colors ${
                        selectedSize === s ? 'bg-black text-white border-black' : 'border-gray-300 hover:border-black'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleQuickAdd}
                  disabled={!selectedSize}
                  className={`w-full py-2.5 text-[10px] tracking-widest uppercase font-bold transition-colors ${
                    addedToCart
                      ? 'bg-neutral-800 text-white'
                      : selectedSize
                      ? 'bg-black text-white hover:bg-neutral-800'
                      : 'bg-neutral-100 text-neutral-400 cursor-default'
                  }`}
                >
                  {addedToCart ? '✓ ADDED' : selectedSize ? 'ADD TO BAG' : 'SELECT SIZE'}
                </button>
              </div>
            ) : (
              <button
                onClick={handleQuickAdd}
                className={`w-full py-3 text-[10px] tracking-widest uppercase font-bold transition-colors ${
                  addedToCart ? 'bg-neutral-800 text-white' : 'bg-black text-white hover:bg-neutral-800'
                }`}
              >
                {addedToCart ? '✓ ADDED TO BAG' : 'QUICK ADD'}
              </button>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-3 px-0.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-black leading-tight truncate">{product.name}</h3>
              <p className="text-xs text-gray-400 mt-0.5 uppercase tracking-wider">{product.subcategory}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold text-black">{formatPrice(product.price)}</p>
              {product.originalPrice && (
                <p className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</p>
              )}
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={10}
                  className={i < Math.floor(product.rating) ? 'fill-black text-black' : 'text-gray-200 fill-gray-200'}
                />
              ))}
            </div>
            <span className="text-[10px] text-gray-400">({product.reviewCount})</span>
          </div>

          {/* Colors */}
          <div className="flex gap-1.5 mt-2">
            {product.colors.slice(0, 4).map((color) => (
              <div
                key={color}
                className="w-3 h-3 rounded-full border border-gray-200 flex-shrink-0"
                style={{
                  backgroundColor:
                    color.toLowerCase().includes('white') || color.toLowerCase().includes('ecru') || color.toLowerCase().includes('off-white')
                      ? '#f5f5f5'
                      : color.toLowerCase().includes('black') || color.toLowerCase().includes('triple')
                      ? '#1a1a1a'
                      : color.toLowerCase().includes('grey') || color.toLowerCase().includes('gray') || color.toLowerCase().includes('charcoal')
                      ? '#888'
                      : color.toLowerCase().includes('brown') || color.toLowerCase().includes('cognac') || color.toLowerCase().includes('tan')
                      ? '#8B5E3C'
                      : color.toLowerCase().includes('navy') || color.toLowerCase().includes('blue') || color.toLowerCase().includes('indigo')
                      ? '#1e3a5f'
                      : color.toLowerCase().includes('green') || color.toLowerCase().includes('olive') || color.toLowerCase().includes('army')
                      ? '#4a6741'
                      : color.toLowerCase().includes('silver')
                      ? '#c0c0c0'
                      : color.toLowerCase().includes('gold')
                      ? '#CFB53B'
                      : '#d4d4d4',
                }}
                title={color}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-[10px] text-gray-400">+{product.colors.length - 4}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
