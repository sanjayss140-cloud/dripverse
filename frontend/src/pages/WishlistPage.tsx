import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import ProductCard from '../components/ProductCard';

export default function WishlistPage() {
  const { state } = useStore();
  const wishlistProducts = state.products.filter((p) => state.wishlist.includes(p.id));

  if (wishlistProducts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <Heart size={56} strokeWidth={1} className="text-gray-200" />
        <div className="text-center">
          <h2 className="text-2xl font-black tracking-tight mb-2">YOUR WISHLIST IS EMPTY.</h2>
          <p className="text-gray-500 text-sm">Save pieces you love for later.</p>
        </div>
        <Link to="/shop" className="bg-black text-white px-10 py-4 text-xs tracking-[0.3em] uppercase font-bold hover:bg-gray-900 transition-colors">
          EXPLORE THE COLLECTION
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-12">
      <div className="mb-10">
        <p className="text-xs tracking-[0.3em] uppercase text-gray-400 mb-2">Saved Items</p>
        <h1 className="text-4xl font-black tracking-tight">YOUR WISHLIST.</h1>
        <p className="text-sm text-gray-500 mt-1">{wishlistProducts.length} items saved</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {wishlistProducts.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
    </div>
  );
}
