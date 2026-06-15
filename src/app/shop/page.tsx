'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import { useStore, formatPrice } from '@/store/useStore';
import { Sparkles, SlidersHorizontal, RefreshCw, Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import StellarSky from '@/components/ui/StellarSky';
import { CosmicScrollJourney, CosmicProductReveal } from '@/components/ui/CosmicWarpTransition';
import { getCelestialBody } from '@/lib/services/celestial';
import { GravitationalLensCard } from '@/components/ui/GravitationalLens';
import { HUDFrame, GlitchDivider, HoloBadge } from '@/components/ui/SciFiHUD';
import { DataStream } from '@/components/ui/DataStream';
import { ConstellationSection } from '@/components/ui/NeuralConstellation';

function ShopContent() {
  const searchParams = useSearchParams();
  const { currency, language } = useStore();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedZodiac, setSelectedZodiac] = useState(searchParams.get('zodiac') || '');
  const [selectedFlower, setSelectedFlower] = useState(searchParams.get('flower') || '');
  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [sortBy, setSortBy] = useState('newest');

  // Static lists for filters
  const categories = [
    { name: 'Bracelets', slug: 'bracelets' },
    { name: 'Earrings', slug: 'earrings' },
    { name: 'Anklets', slug: 'anklets' },
    { name: 'Gift Sets', slug: 'gift-sets' },
    { name: 'Sacred Threads', slug: 'threads' },
  ];

  const zodiacs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const flowers = ['Carnation', 'Violet', 'Daffodil', 'Daisy', 'Hawthorn', 'Rose', 'Delphinium', 'Chrysanthemum'];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedZodiac) params.append('zodiac', selectedZodiac);
      if (selectedFlower) params.append('flower', selectedFlower);
      if (maxPrice) params.append('maxPrice', maxPrice.toString());

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        let list = data.products || [];
        // Apply local sorting
        if (sortBy === 'price-low') {
          list.sort((a: any, b: any) => a.price - b.price);
        } else if (sortBy === 'price-high') {
          list.sort((a: any, b: any) => b.price - a.price);
        }
        setProducts(list);
      }
    } catch (e) {
      console.error('Error loading products:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedZodiac, selectedFlower, maxPrice, sortBy]);

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSelectedZodiac('');
    setSelectedFlower('');
    setMaxPrice(3000);
    setSortBy('newest');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1 flex flex-col relative z-10">
      <div className="flex flex-col md:flex-row gap-8 flex-1">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-6 bg-space-900/60 p-6 rounded-craft border border-space-800 backdrop-blur">
          <div className="flex items-center justify-between border-b border-space-800 pb-4">
            <h2 className="font-serif text-xl font-bold flex items-center gap-2 text-foreground">
              <SlidersHorizontal className="h-5 w-5 text-gold-400" />
              Filters
            </h2>
            <button
              onClick={handleResetFilters}
              className="text-xs text-gold-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <RefreshCw className="h-3 w-3" />
              Reset All
            </button>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/60">Product Type</h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory('')}
                className={`w-full text-left text-sm py-1.5 px-3 rounded-craft transition-colors ${
                  selectedCategory === ''
                    ? 'bg-gradient-to-r from-gold-500 to-gold-400 text-space-950 font-bold'
                    : 'hover:bg-space-800 text-foreground/80'
                }`}
              >
                All Products
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`w-full text-left text-sm py-1.5 px-3 rounded-craft transition-colors ${
                    selectedCategory === cat.slug
                      ? 'bg-gradient-to-r from-gold-500 to-gold-400 text-space-950 font-bold'
                      : 'hover:bg-space-800 text-foreground/80'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Zodiac Sign */}
          <div className="space-y-2 border-t border-space-800 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/60">Shop by Zodiac</h3>
            <select
              value={selectedZodiac}
              onChange={(e) => setSelectedZodiac(e.target.value)}
              className="w-full bg-space-950 border border-space-700 text-foreground rounded-craft p-2 text-sm focus:outline-none"
            >
              <option value="" className="bg-space-950">All Signs</option>
              {zodiacs.map((z) => (
                <option key={z} value={z} className="bg-space-950">{z}</option>
              ))}
            </select>
          </div>

          {/* Birth Flower */}
          <div className="space-y-2 border-t border-space-800 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/60">Shop by Birth Flower</h3>
            <select
              value={selectedFlower}
              onChange={(e) => setSelectedFlower(e.target.value)}
              className="w-full bg-space-950 border border-space-700 text-foreground rounded-craft p-2 text-sm focus:outline-none"
            >
              <option value="" className="bg-space-950">All Flowers</option>
              {flowers.map((f) => (
                <option key={f} value={f} className="bg-space-950">{f}</option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="space-y-2 border-t border-space-800 pt-4">
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-foreground/60">
              <span>Max Budget</span>
              <span className="text-gold-400 font-bold">{formatPrice(maxPrice, currency, language)}</span>
            </div>
            <input
              type="range"
              min="300"
              max="3000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="w-full accent-gold-500 h-2 bg-space-950 rounded-lg appearance-none cursor-pointer border border-space-800"
            />
          </div>

          {/* Sorting */}
          <div className="space-y-2 border-t border-space-800 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/60">Sort By</h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-space-950 border border-space-700 text-foreground rounded-craft p-2 text-sm focus:outline-none"
            >
              <option value="newest" className="bg-space-950">Newest First</option>
              <option value="price-low" className="bg-space-950">Price: Low to High</option>
              <option value="price-high" className="bg-space-950">Price: High to Low</option>
            </select>
          </div>
        </aside>

        {/* Product Grid — With Gravitational Lens Effect */}
        <main className="flex-1 relative">
          {/* Subtle data stream background */}
          <DataStream opacity={0.05} speed="slow" density="sparse" colorScheme="cyan" />
          
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gold-400" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-space-900/60 rounded-craft border border-space-800 p-8 max-w-lg mx-auto backdrop-blur shadow-tactile">
              <h3 className="font-serif text-2xl font-bold mb-2">No Matching Celestial Items</h3>
              <p className="text-sm text-foreground/70 mb-6">
                Try widening your price range, clearing filters, or requesting a suggestion from our AI Concierge.
              </p>
              <button
                onClick={handleResetFilters}
                className="bg-gradient-to-r from-gold-500 to-gold-400 text-space-950 px-6 py-2.5 rounded-craft text-sm font-bold hover:from-gold-400 hover:to-gold-300 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 cosmic-stagger relative z-10">
              {products.map((product, index) => (
                <CosmicProductReveal key={product.id} index={index}>
                  <GravitationalLensCard
                    glowColor={index % 3 === 0 ? 'rgba(212, 175, 55, 0.25)' : index % 3 === 1 ? 'rgba(168, 85, 247, 0.25)' : 'rgba(6, 182, 212, 0.25)'}
                    intensity={index < 3 ? 'medium' : 'subtle'}
                  >
                  <div
                    className="group relative flex flex-col overflow-hidden"
                    onMouseEnter={() => {
                      window.dispatchEvent(new CustomEvent('celestial-focus', { detail: { slug: product.slug } }));
                    }}
                    onMouseLeave={() => {
                      window.dispatchEvent(new CustomEvent('celestial-focus', { detail: null }));
                    }}
                  >
                  <div className="relative aspect-square w-full bg-space-950 overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-space-950/90 text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-gold-400/30">
                      <Sparkles className="h-3 w-3 animate-spin-slow" />
                      Handcraft
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] uppercase font-bold text-gold-400">
                        <span>{product.category?.name || 'Accessories'}</span>
                        {product.rating > 0 && (
                          <span className="flex items-center gap-0.5 text-gold-400">
                            <Star className="h-3 w-3 fill-gold-400" />
                            {product.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <h3 className="font-serif text-lg font-bold text-foreground leading-snug group-hover:text-gold-400 transition-colors">
                        {product.title}
                      </h3>
                      <p className="text-xs text-foreground/70 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>

                      {/* Celestial Body Connection */}
                      <div className="text-[10px] text-gold-400 font-bold flex items-center gap-1.5 bg-space-950/80 px-2.5 py-1 rounded border border-gold-500/20 w-fit">
                        <span className="animate-pulse">{getCelestialBody(product.slug).icon}</span>
                        <span>Resonates: {getCelestialBody(product.slug).name}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-space-800">
                      <span className="text-base font-bold text-gold-400 font-serif">
                        {formatPrice(product.price, currency, language)}
                      </span>
                      <Link
                        href={`/product/${product.slug}`}
                        className="cosmic-nav-arrow text-xs !py-1.5 !px-3"
                      >
                        Personalize
                        <ArrowRight className="h-3 w-3 animate-cosmic-arrow" />
                      </Link>
                    </div>
                    </div>
                </div>
                </GravitationalLensCard>
                </CosmicProductReveal>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <div className="flex flex-col min-h-screen relative bg-space-950 text-foreground overflow-hidden">
      {/* Background stardust */}
      <StellarSky />

      <Header />
      <div className="border-b border-space-800 py-16 relative z-10 bg-space-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-400">Bangalore Vault</span>
          <h1 className="font-serif text-5xl sm:text-6xl font-bold tracking-tight text-foreground">
            The Cosmic Vault
          </h1>
          <p className="text-sm text-foreground/70 mt-2 max-w-xl mx-auto">
            Explore and configure thread bracelets, anklets, and constellation drop earrings tailored with intention.
          </p>
        </div>
      </div>
      <Suspense fallback={
        <div className="flex-grow flex items-center justify-center py-24 relative z-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gold-400" />
        </div>
      }>
        <ShopContent />
      </Suspense>
      <Footer />
    </div>
  );
}
