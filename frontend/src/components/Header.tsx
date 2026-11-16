import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, Menu, X, ChevronDown } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const { state, dispatch, cartCount } = useStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [shopDropdown, setShopDropdown] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setShopDropdown(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShopDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      dispatch({ type: 'SET_SEARCH', payload: searchInput.trim() });
      navigate(`/shop?q=${encodeURIComponent(searchInput.trim())}`);
      dispatch({ type: 'SET_SEARCH_OPEN', payload: false });
      setSearchInput('');
    }
  };

  const navLinks = [
    { label: 'New Arrivals', to: '/new-arrivals' },
    { label: 'Shop All', to: '/shop', hasDropdown: true },
    { label: 'Clothing', to: '/clothing' },
    { label: 'Footwear', to: '/footwear' },
    { label: 'Accessories', to: '/accessories' },
    { label: 'About', to: '/about' },
  ];

  const shopCategories = [
    { label: 'All Products', to: '/shop' },
    { label: 'New Arrivals', to: '/new-arrivals' },
    { label: 'Clothing', to: '/clothing' },
    { label: 'Footwear', to: '/footwear' },
    { label: 'Accessories', to: '/accessories' },
    { label: 'Denim', to: '/clothing?sub=denim' },
    { label: 'Blazers & Suiting', to: '/clothing?sub=blazers' },
    { label: 'Boots & Sneakers', to: '/footwear?sub=boots' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white shadow-[0_1px_0_0_#eaeaea]' : 'bg-white border-b border-[#eaeaea]'
        }`}
      >
        {/* Top announcement bar */}
        <div className="bg-black text-white text-center text-[11px] py-2 px-4 tracking-[0.25em] font-medium uppercase">
          COMPLIMENTARY SHIPPING ON ORDERS OVER ₹2,999 &nbsp;|&nbsp; USE CODE: <span className="font-bold underline">DRIP10</span>
        </div>

        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex items-center justify-between h-18">
            {/* Logo */}
            <Link
              to="/"
              className="font-black text-2xl tracking-[0.2em] text-black uppercase hover:opacity-75 transition-opacity"
            >
              DRIPVERSE
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8" ref={dropdownRef}>
              {navLinks.map((link) =>
                link.hasDropdown ? (
                  <div key={link.label} className="relative">
                    <button
                      className={`flex items-center gap-1.5 text-xs tracking-[0.18em] uppercase font-semibold text-black transition-opacity hover:opacity-50 ${
                        location.pathname === '/shop' ? 'border-b-2 border-black pb-0.5' : ''
                      }`}
                      onMouseEnter={() => setShopDropdown(true)}
                      onClick={() => setShopDropdown((v) => !v)}
                    >
                      {link.label}
                      <ChevronDown size={12} className={`transition-transform duration-200 ${shopDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {shopDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 mt-3 bg-white border border-neutral-200 shadow-xl min-w-[210px] py-2.5 z-50"
                          onMouseLeave={() => setShopDropdown(false)}
                        >
                          {shopCategories.map((cat) => (
                            <Link
                              key={cat.label}
                              to={cat.to}
                              className="block px-5 py-2 text-xs tracking-widest uppercase text-neutral-800 hover:bg-neutral-50 hover:text-black font-medium transition-colors"
                            >
                              {cat.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    key={link.label}
                    to={link.to}
                    className={`text-xs tracking-[0.18em] uppercase font-semibold transition-opacity hover:opacity-50 ${
                      location.pathname === link.to ? 'border-b-2 border-black pb-0.5' : ''
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>

            {/* Action Icons */}
            <div className="flex items-center gap-3 md:gap-5">
              {/* Admin Portal Link */}
              <Link
                to="/admin"
                className="text-[9px] tracking-[0.2em] uppercase font-bold border border-black px-2.5 py-1 hover:bg-black hover:text-white transition-colors hidden sm:block"
                title="Owner & Admin Management Console"
              >
                ADMIN
              </Link>

              {/* Search Toggle */}
              <button
                onClick={() => dispatch({ type: 'SET_SEARCH_OPEN', payload: !state.isSearchOpen })}
                className="hover:opacity-50 transition-opacity p-2 text-black"
                aria-label="Search catalog"
              >
                <Search size={19} strokeWidth={1.5} />
              </button>

              {/* Account */}
              <button
                onClick={() => {
                  if (state.user) {
                    navigate('/account');
                  } else {
                    navigate('/login');
                  }
                }}
                className="hover:opacity-50 transition-opacity p-2 text-black"
                aria-label="User Account"
              >
                <User size={19} strokeWidth={1.5} />
              </button>

              {/* Wishlist */}
              <Link to="/wishlist" className="hover:opacity-50 transition-opacity p-2 relative text-black" aria-label="Wishlist">
                <Heart size={19} strokeWidth={1.5} />
                {state.wishlist.length > 0 && (
                  <span className="absolute top-0 right-0 bg-black text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                    {state.wishlist.length}
                  </span>
                )}
              </Link>

              {/* Shopping Bag */}
              <Link to="/cart" className="hover:opacity-50 transition-opacity p-2 relative text-black" aria-label="Shopping Cart">
                <ShoppingBag size={19} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-black text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Mobile menu toggle */}
              <button
                className="lg:hidden hover:opacity-50 transition-opacity p-2 text-black ml-1"
                onClick={() => setIsMenuOpen((v) => !v)}
                aria-label="Toggle Navigation Menu"
              >
                {isMenuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
              </button>
            </div>
          </div>
        </div>

        {/* Search Overlay */}
        <AnimatePresence>
          {state.isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-[#eaeaea] bg-white overflow-hidden"
            >
              <form onSubmit={handleSearch} className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-5 flex items-center gap-3">
                <Search size={18} className="text-neutral-400" />
                <input
                  autoFocus
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="SEARCH JACKETS, DENIM, BOOTS, WATCHES..."
                  className="flex-1 text-xs md:text-sm tracking-[0.15em] uppercase outline-none bg-transparent placeholder:text-neutral-400 py-1"
                />
                <button
                  type="submit"
                  className="text-xs tracking-widest uppercase font-bold px-5 py-2.5 bg-black text-white hover:bg-neutral-800 transition-colors"
                >
                  SEARCH
                </button>
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'SET_SEARCH_OPEN', payload: false })}
                  className="text-neutral-400 hover:text-black transition-colors p-1"
                  aria-label="Close search"
                >
                  <X size={18} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-[#eaeaea] bg-white overflow-hidden shadow-lg"
            >
              <nav className="px-6 py-6 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="text-xs tracking-[0.2em] uppercase font-bold text-black hover:opacity-50 transition-opacity py-1 border-b border-neutral-100"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  to="/contact"
                  className="text-xs tracking-[0.2em] uppercase font-bold text-black hover:opacity-50 transition-opacity py-1 border-b border-neutral-100"
                >
                  Contact & Support
                </Link>
                <Link
                  to="/admin"
                  className="text-xs tracking-[0.2em] uppercase font-bold text-black hover:opacity-50 transition-opacity py-1 border-b border-neutral-100 flex items-center justify-between"
                >
                  <span>Admin & Price Console</span>
                  <span className="text-[10px] bg-black text-white px-1.5 py-0.5 rounded">OWNER</span>
                </Link>

                <div className="pt-2 flex flex-col gap-3">
                  {state.user ? (
                    <Link
                      to="/account"
                      className="text-xs tracking-widest uppercase font-bold bg-black text-white text-center py-3"
                    >
                      My Account ({state.user.name})
                    </Link>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <Link
                        to="/login"
                        className="text-xs tracking-widest uppercase font-bold text-center py-3 border border-black hover:bg-black hover:text-white transition-colors"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        className="text-xs tracking-widest uppercase font-bold text-center py-3 bg-black text-white hover:bg-neutral-800 transition-colors"
                      >
                        Register
                      </Link>
                    </div>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Spacer for sticky header */}
      <div className="h-[104px]" />
    </>
  );
}
