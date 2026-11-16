import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

// ── Hero Section ──────────────────────────────────────────────
export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-black" style={{ minHeight: '90vh' }}>
      {/* Full-bleed editorial image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1800&q=90"
          alt="DRIPVERSE Hero"
          className="w-full h-full object-cover object-center opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 h-full flex flex-col justify-end pb-20 pt-32" style={{ minHeight: '90vh' }}>
        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xs tracking-[0.4em] uppercase text-white/60 mb-4 font-medium"
          >
            New Collection — AW 2026
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-none tracking-tight mb-6"
          >
            DEFINE<br />YOUR OWN<br />STYLE.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-white/70 text-lg md:text-xl mb-10 font-light"
          >
            Modern essentials. Timeless attitude.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap gap-4"
          >
            <Link
              to="/shop"
              className="bg-white text-black px-10 py-4 text-xs tracking-[0.3em] uppercase font-bold hover:bg-gray-200 transition-colors"
            >
              SHOP MEN
            </Link>
            <Link
              to="/new-arrivals"
              className="border border-white text-white px-10 py-4 text-xs tracking-[0.3em] uppercase font-bold hover:bg-white hover:text-black transition-colors"
            >
              EXPLORE COLLECTION
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ── Category Grid ─────────────────────────────────────────────
import { categories } from '../data/products';

export function CategorySection() {
  return (
    <section className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-20">
      <div className="mb-10">
        <p className="text-xs tracking-[0.3em] uppercase text-gray-400 mb-2">Browse by Category</p>
        <h2 className="text-3xl font-black tracking-tight">SHOP BY STYLE.</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.04 }}
          >
            <Link
              to={`/${cat.parent}?sub=${cat.slug}`}
              className="group block relative overflow-hidden aspect-[3/4] bg-gray-100"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white text-[10px] tracking-[0.2em] uppercase font-bold leading-tight">{cat.name}</p>
                <p className="text-white/60 text-[9px] tracking-widest uppercase mt-0.5">Shop →</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ── Featured Editorial ─────────────────────────────────────────
export function FeaturedCollection() {
  return (
    <section className="relative overflow-hidden bg-black my-6" style={{ minHeight: '70vh' }}>
      <img
        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1800&q=90"
        alt="Featured Collection"
        className="absolute inset-0 w-full h-full object-cover object-top opacity-50"
      />
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 flex items-center min-h-[70vh]">
        <div className="max-w-xl">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-xs tracking-[0.3em] uppercase text-white/50 mb-4"
          >
            The DRIPVERSE Philosophy
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-black text-white leading-none tracking-tight mb-6"
          >
            LESS,<br />BUT<br />BETTER.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-white/70 text-lg mb-8"
          >
            Every piece has a purpose.<br />Every detail makes a difference.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Link
              to="/shop"
              className="border border-white text-white px-10 py-4 text-xs tracking-[0.3em] uppercase font-bold hover:bg-white hover:text-black transition-colors inline-block"
            >
              SHOP THE COLLECTION
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ── Brand Statement ────────────────────────────────────────────
export function BrandStatement() {
  return (
    <section className="bg-[#F7F7F5] py-24">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 text-center">
        <motion.blockquote
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight max-w-4xl mx-auto"
        >
          "STYLE ISN'T ABOUT FOLLOWING TRENDS.<br className="hidden md:block" />
          IT'S ABOUT KNOWING WHO YOU ARE."
        </motion.blockquote>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-6 text-gray-400 text-xs tracking-[0.3em] uppercase"
        >
          — DRIPVERSE
        </motion.p>
      </div>
    </section>
  );
}

// ── Size Guide Modal ───────────────────────────────────────────
interface SizeGuideProps {
  onClose: () => void;
}

export function SizeGuideModal({ onClose }: SizeGuideProps) {
  const sizes = [
    { size: 'XS', chest: '84-88', waist: '68-72', hip: '90-94' },
    { size: 'S', chest: '88-92', waist: '72-76', hip: '94-98' },
    { size: 'M', chest: '92-96', waist: '76-80', hip: '98-102' },
    { size: 'L', chest: '96-100', waist: '80-84', hip: '102-106' },
    { size: 'XL', chest: '100-104', waist: '84-88', hip: '106-110' },
    { size: 'XXL', chest: '104-108', waist: '88-92', hip: '110-114' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/60" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-white p-8 w-full max-w-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-black tracking-tight mb-6">SIZE GUIDE (CM)</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {['SIZE', 'CHEST', 'WAIST', 'HIP'].map((h) => (
                  <th key={h} className="text-left text-xs tracking-widest uppercase pb-3 text-gray-500 font-medium pr-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sizes.map((row) => (
                <tr key={row.size} className="border-b border-gray-100">
                  <td className="py-3 font-bold text-xs pr-4">{row.size}</td>
                  <td className="py-3 text-xs text-gray-600 pr-4">{row.chest}</td>
                  <td className="py-3 text-xs text-gray-600 pr-4">{row.waist}</td>
                  <td className="py-3 text-xs text-gray-600">{row.hip}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-gray-400 mt-4">All measurements are in centimetres. For best fit, measure over light clothing.</p>
          <button
            onClick={onClose}
            className="mt-6 w-full bg-black text-white py-3 text-xs tracking-widest uppercase font-bold hover:bg-gray-900 transition-colors"
          >
            CLOSE
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
