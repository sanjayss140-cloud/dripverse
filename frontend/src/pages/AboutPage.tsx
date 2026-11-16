import React from 'react';
import { motion } from 'framer-motion';

export default function AboutPage() {
  const values = [
    { title: 'PRECISION', desc: 'Every garment is designed with intention. No excess. No compromise.' },
    { title: 'QUALITY', desc: 'Premium materials sourced from the best mills in the world.' },
    { title: 'TIMELESSNESS', desc: 'We build pieces that outlive seasons and trends.' },
    { title: 'IDENTITY', desc: 'DRIPVERSE is not about fashion. It\'s about knowing who you are.' },
  ];

  const team = [
    { name: 'Sanjay', role: 'Founder & Creative Director' },
    { name: 'Rahul Verma', role: 'Head of Design' },
    { name: 'Priya Sharma', role: 'Brand Director' },
    { name: 'Kabir Singh', role: 'Head of Product' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-black overflow-hidden" style={{ minHeight: '60vh' }}>
        <img
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1800&q=90"
          alt="About DRIPVERSE"
          className="absolute inset-0 w-full h-full object-cover object-top opacity-40"
        />
        <div className="relative z-10 max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 flex items-end" style={{ minHeight: '60vh', paddingBottom: '5rem' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-xs tracking-[0.4em] uppercase text-white/50 mb-4">The Brand</p>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-none tracking-tight">ABOUT<br />DRIPVERSE.</h1>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="text-xs tracking-[0.3em] uppercase text-gray-400 mb-4">Our Mission</p>
            <h2 className="text-4xl font-black tracking-tight leading-tight mb-8">WE BUILD CLOTHES<br />FOR MEN WHO<br />KNOW THEMSELVES.</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              DRIPVERSE was born from a simple belief: that the best clothing doesn't shout — it speaks with absolute clarity. We create essential men's fashion that merges modern minimalism with timeless construction.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Founded in Mumbai in 2024, we work with premium mills and manufacturers to bring you garments that justify every rupee. No logos. No trends. Just exceptional clothing that makes you feel exactly who you are.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="relative aspect-[4/5] overflow-hidden bg-gray-100"
          >
            <img
              src="https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800&q=90"
              alt="DRIPVERSE Brand"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-black py-24">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
          <p className="text-xs tracking-[0.3em] uppercase text-white/40 mb-4">What We Stand For</p>
          <h2 className="text-4xl font-black text-white tracking-tight mb-16">OUR VALUES.</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="border-t border-white/10 pt-6"
              >
                <h3 className="text-white font-black text-lg tracking-tight mb-3">{v.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { number: '50+', label: 'Premium Products' },
            { number: '10K+', label: 'Happy Customers' },
            { number: '4.8★', label: 'Average Rating' },
            { number: '30', label: 'Day Returns' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <p className="text-5xl font-black tracking-tight mb-2">{stat.number}</p>
              <p className="text-xs tracking-widest uppercase text-gray-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="bg-[#F7F7F5] py-24">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
          <p className="text-xs tracking-[0.3em] uppercase text-gray-400 mb-4">The People</p>
          <h2 className="text-4xl font-black tracking-tight mb-16">OUR TEAM.</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="aspect-[3/4] bg-gray-200 mb-4 overflow-hidden">
                  <img
                    src={`https://images.unsplash.com/photo-${['1507003211169-0a1dd7228f2d', '1500648767791-00dcc994a43e', '1472099645785-5658abf4ff4e', '1519345182560-3f2917c472ef'][i]}?w=400&q=80`}
                    alt={member.name}
                    className="w-full h-full object-cover grayscale"
                  />
                </div>
                <h3 className="font-bold text-sm">{member.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-24 text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-gray-400 mb-4">Ready?</p>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">START DEFINING<br />YOUR STYLE.</h2>
        <a
          href="/shop"
          className="inline-block bg-black text-white px-12 py-5 text-xs tracking-[0.3em] uppercase font-bold hover:bg-gray-900 transition-colors"
        >
          SHOP THE COLLECTION
        </a>
      </section>
    </div>
  );
}
