import React from 'react';
import { Link } from 'react-router-dom';
import { HeroSection, CategorySection, FeaturedCollection, BrandStatement } from '../components/Sections';
import ProductCard from '../components/ProductCard';
import { useStore } from '../store/StoreContext';

export default function HomePage() {
  const { state } = useStore();
  const newArrivals = state.products.filter((p) => p.isNew).slice(0, 8);
  const trending = state.products.filter((p) => p.isTrending).slice(0, 8);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <HeroSection />

      {/* Category Grid */}
      <CategorySection />

      {/* New Arrivals */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-2">Just In</p>
            <h2 className="text-3xl font-black tracking-tight">NEW ARRIVALS.</h2>
          </div>
          <Link
            to="/new-arrivals"
            className="text-xs tracking-widest uppercase font-semibold underline underline-offset-4 hover:no-underline transition-all hidden md:block"
          >
            VIEW ALL
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {newArrivals.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
        <div className="text-center mt-8 md:hidden">
          <Link to="/new-arrivals" className="inline-block border border-black px-8 py-3 text-xs tracking-widest uppercase font-bold hover:bg-black hover:text-white transition-colors">
            VIEW ALL NEW ARRIVALS
          </Link>
        </div>
      </section>

      {/* Featured editorial */}
      <FeaturedCollection />

      {/* Trending Now */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-2">Most Wanted</p>
            <h2 className="text-3xl font-black tracking-tight">TRENDING NOW.</h2>
          </div>
          <Link
            to="/shop"
            className="text-xs tracking-widest uppercase font-semibold underline underline-offset-4 hover:no-underline transition-all hidden md:block"
          >
            SHOP ALL
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {trending.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </section>

      {/* Brand Statement */}
      <BrandStatement />

      {/* Two-panel editorial split */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-20">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative overflow-hidden group aspect-[4/5] bg-black">
            <img
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&q=85"
              alt="Premium Footwear"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8">
              <p className="text-neutral-300 text-xs tracking-[0.3em] uppercase mb-2">Premium Footwear</p>
              <h3 className="text-white text-3xl font-black tracking-tight mb-4">STEP WITH PURPOSE.</h3>
              <Link
                to="/footwear"
                className="bg-white text-black px-6 py-3 text-xs tracking-widest uppercase font-bold hover:bg-neutral-200 transition-colors inline-block"
              >
                SHOP FOOTWEAR
              </Link>
            </div>
          </div>
          <div className="relative overflow-hidden group aspect-[4/5] bg-black">
            <img
              src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&q=85"
              alt="Accessories"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8">
              <p className="text-neutral-300 text-xs tracking-[0.3em] uppercase mb-2">Complete the Look</p>
              <h3 className="text-white text-3xl font-black tracking-tight mb-4">WEAR THE DETAILS.</h3>
              <Link
                to="/accessories"
                className="bg-white text-black px-6 py-3 text-xs tracking-widest uppercase font-bold hover:bg-neutral-200 transition-colors inline-block"
              >
                SHOP ACCESSORIES
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
