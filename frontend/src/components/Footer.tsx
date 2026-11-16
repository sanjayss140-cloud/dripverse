import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Youtube, ArrowRight } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();

  const links = {
    Shop: [
      { label: 'New Arrivals', to: '/new-arrivals' },
      { label: 'Clothing', to: '/clothing' },
      { label: 'Footwear', to: '/footwear' },
      { label: 'Accessories', to: '/accessories' },
      { label: 'Shop All', to: '/shop' },
    ],
    Customer: [
      { label: 'My Account', to: '/account' },
      { label: 'Wishlist', to: '/wishlist' },
      { label: 'Shopping Bag', to: '/cart' },
      { label: 'Sign In / Register', to: '/login' },
      { label: 'Owner & Admin Portal', to: '/admin' },
    ],
    Help: [
      { label: 'Contact Us', to: '/contact' },
      { label: 'Shipping & Delivery', to: '/contact' },
      { label: 'Returns & Exchanges', to: '/contact' },
      { label: 'FAQs', to: '/contact' },
    ],
    Brand: [
      { label: 'About DRIPVERSE', to: '/about' },
      { label: 'Philosophy', to: '/about' },
      { label: 'Privacy Policy', to: '/about' },
      { label: 'Terms of Service', to: '/about' },
    ],
  };

  return (
    <footer className="bg-black text-white mt-24">
      {/* Newsletter */}
      <div className="border-b border-neutral-800">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-16">
          <div className="max-w-2xl">
            <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-3 font-medium">Newsletter</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
              GET THE DRIPVERSE<br />EXPERIENCE.
            </h2>
            <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
              Curated drops, editorial lookbooks, and private member previews — delivered directly to your inbox.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Thank you for subscribing to DRIPVERSE updates.');
              }}
              className="flex max-w-md"
            >
              <input
                type="email"
                required
                placeholder="ENTER YOUR EMAIL"
                className="flex-1 bg-transparent border border-neutral-700 px-4 py-3.5 text-xs tracking-wider outline-none focus:border-white transition-colors placeholder:text-neutral-500 uppercase"
              />
              <button
                type="submit"
                className="bg-white text-black px-6 py-3.5 text-xs tracking-[0.2em] uppercase font-bold hover:bg-neutral-200 transition-colors flex items-center gap-1.5 flex-shrink-0"
              >
                JOIN <ArrowRight size={14} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="text-xl font-black tracking-[0.2em] uppercase block mb-4 hover:opacity-80 transition-opacity">
              DRIPVERSE
            </Link>
            <p className="text-neutral-400 text-xs leading-relaxed uppercase tracking-widest mb-6">
              DEFINE YOUR OWN STYLE.<br />
              <span className="normal-case tracking-normal text-neutral-500">
                Modern essentials. Timeless attitude.
              </span>
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-8 h-8 rounded-full border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-white transition-colors" aria-label="Instagram">
                <Instagram size={14} strokeWidth={1.5} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-white transition-colors" aria-label="Twitter">
                <Twitter size={14} strokeWidth={1.5} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-white transition-colors" aria-label="YouTube">
                <Youtube size={14} strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Nav links columns */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h3 className="text-xs tracking-[0.25em] uppercase font-bold mb-5 text-white">{title}</h3>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link to={item.to} className="text-neutral-400 hover:text-white transition-colors text-xs tracking-wide">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-neutral-800 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-neutral-500 text-xs tracking-widest uppercase">
            © {year} DRIPVERSE LTD. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-neutral-500 text-xs tracking-widest uppercase">Payment Partners</span>
            <div className="flex gap-2 text-neutral-400 text-[10px] tracking-wider font-mono">
              <span className="border border-neutral-800 px-2 py-0.5">VISA</span>
              <span className="border border-neutral-800 px-2 py-0.5">MASTERCARD</span>
              <span className="border border-neutral-800 px-2 py-0.5">UPI</span>
              <span className="border border-neutral-800 px-2 py-0.5">COD</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
