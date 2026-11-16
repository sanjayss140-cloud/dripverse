import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { StoreProvider } from './store/StoreContext';
import Header from './components/Header';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';

// Pages
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import WishlistPage from './pages/WishlistPage';
import AccountPage from './pages/AccountPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <ScrollToTop />
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />

            {/* Shop routes */}
            <Route path="/shop" element={<ShopPage title="SHOP ALL" subtitle="The complete DRIPVERSE collection." />} />
            <Route path="/new-arrivals" element={<ShopPage filterCategory="new-arrivals" title="NEW ARRIVALS" subtitle="Fresh from the studio." />} />
            <Route path="/clothing" element={<ShopPage filterCategory="clothing" title="CLOTHING" subtitle="Essential men's clothing." />} />
            <Route path="/footwear" element={<ShopPage filterCategory="footwear" title="FOOTWEAR" subtitle="Step with purpose." />} />
            <Route path="/accessories" element={<ShopPage filterCategory="accessories" title="ACCESSORIES" subtitle="Complete the look." />} />

            {/* Product Details */}
            <Route path="/product/:id" element={<ProductPage />} />

            {/* Commerce */}
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />

            {/* Account & Auth */}
            <Route path="/account" element={<AccountPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<LoginPage />} />
            <Route path="/admin" element={<AdminPage />} />

            {/* Info pages */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* 404 Not Found */}
            <Route path="*" element={
              <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4 text-center">
                <p className="text-xs tracking-[0.3em] uppercase text-gray-400">404 ERROR</p>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight">PAGE NOT FOUND.</h1>
                <p className="text-gray-500 max-w-sm text-sm">
                  The page you are looking for does not exist or has been relocated in the DRIPVERSE catalog.
                </p>
                <a href="/" className="bg-black text-white px-8 py-3.5 text-xs tracking-widest uppercase font-bold hover:bg-neutral-800 transition-colors">
                  Return to Home
                </a>
              </div>
            } />
          </Routes>
        </Layout>
      </HashRouter>
    </StoreProvider>
  );
}
