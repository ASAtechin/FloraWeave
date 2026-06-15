'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Star, Heart, Fingerprint, Eye, Compass } from 'lucide-react';
import { getCelestialBody } from '@/lib/services/celestial';

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  imageUrl: string;
  category: {
    name: string;
    slug: string;
  };
}

interface InteractiveShowcaseProps {
  initialProducts: Product[];
}

function ProductCard({ product, index, vibeInfo }: { product: Product, index: number, vibeInfo: any }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDeepFocus, setIsDeepFocus] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    // Intent-based animation: wait 500ms before showing deep details and shifting galaxy
    hoverTimer.current = setTimeout(() => {
      setIsDeepFocus(true);
      window.dispatchEvent(new CustomEvent('celestial-focus', { detail: { slug: product.slug } }));
    }, 500);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsDeepFocus(false);
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    window.dispatchEvent(new CustomEvent('celestial-focus', { detail: null }));
    
    // Reset mouse pos for smooth untrack
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) setMousePos({ x: rect.width / 2, y: rect.height / 2 });
  };

  const width = cardRef.current?.offsetWidth || 300;
  const height = cardRef.current?.offsetHeight || 400;
  
  // 3D Tilt calculation (max 15 degrees)
  const rotateY = isHovered ? ((mousePos.x - width / 2) / width) * 30 : 0;
  const rotateX = isHovered ? -((mousePos.y - height / 2) / height) * 30 : 0;
  
  const glareX = (mousePos.x / width) * 100;
  const glareY = (mousePos.y / height) * 100;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-3xl will-change-transform ${isHovered ? 'z-20 scale-[1.03]' : 'z-10 scale-100'}`}
      style={{
        transformStyle: 'preserve-3d',
        transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: isHovered 
          ? 'transform 0.15s cubic-bezier(0.1,0.5,0.3,1), scale 0.4s ease-out' 
          : 'transform 0.8s cubic-bezier(0.2,0.8,0.2,1), scale 0.5s ease-out',
        animationFillMode: 'both',
        animationDelay: `${index * 150}ms`
      }}
    >
      <div 
        className={`relative h-full w-full bg-space-950/90 rounded-3xl overflow-hidden border transition-all duration-700 ${
          isHovered ? 'border-gold-400/60 shadow-[0_20px_50px_rgba(212,175,55,0.15)]' : 'border-space-800 shadow-2xl'
        }`}
      >
        {/* Dynamic Glare Overlay */}
        <div 
          className="absolute inset-0 z-30 pointer-events-none transition-opacity duration-500 rounded-3xl mix-blend-overlay"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 60%)`
          }}
        />

        {/* Image Display */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-space-900 border-b border-space-800">
          <img
            src={product.imageUrl}
            alt={product.title}
            className={`w-full h-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${isHovered ? 'scale-110' : 'scale-100'}`}
          />
          {/* Subtle vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-space-950 via-space-950/10 to-transparent opacity-90" />
          
          {/* Tags */}
          <div className="absolute top-5 left-5 z-10 flex flex-col gap-2.5">
            <div className={`transform transition-all duration-500 ease-out ${isHovered ? 'translate-x-0 opacity-100' : '-translate-x-6 opacity-0'}`}>
              <span className="bg-space-950/80 backdrop-blur-md border border-gold-500/40 text-gold-400 text-[10px] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                <Sparkles className="h-3 w-3" />
                {vibeInfo.tag}
              </span>
            </div>
            <div className={`transform transition-all duration-500 ease-out delay-75 ${isHovered ? 'translate-x-0 opacity-100' : '-translate-x-6 opacity-0'}`}>
              <span className="bg-space-950/80 backdrop-blur-md border border-space-700 text-foreground/90 text-[9px] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                <Fingerprint className="h-3 w-3 text-accent" />
                {vibeInfo.vibe}
              </span>
            </div>
          </div>

          <button className={`absolute top-5 right-5 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 ${isHovered ? 'bg-space-950/90 border border-space-700 text-foreground hover:text-red-500 hover:border-red-500/50 scale-100 opacity-100' : 'bg-transparent text-transparent scale-90 opacity-0'}`}>
            <Heart className="h-4 w-4" />
          </button>

          {/* Deep Focus Intent Overlay */}
          <div className={`absolute inset-0 bg-space-950/75 backdrop-blur-md z-20 flex flex-col items-center justify-center p-8 text-center transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${isDeepFocus ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'}`}>
            <div className="h-12 w-12 rounded-full border border-gold-400/30 flex items-center justify-center mb-6">
              <Eye className="h-5 w-5 text-gold-400 animate-pulse" />
            </div>
            <div className="text-[10px] uppercase font-bold text-gold-400/60 tracking-widest mb-2">Connected Body</div>
            <h4 className="font-serif text-3xl text-gold-400 mb-4 font-bold tracking-wide">{getCelestialBody(product.slug).name}</h4>
            <p className="text-xs text-foreground/80 leading-relaxed mb-8 italic">&ldquo;{vibeInfo.detail}&rdquo;</p>
            <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider text-emerald-400 border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 rounded-full">
               <Star className="h-3 w-3 fill-emerald-400" />
               Score {vibeInfo.rating} ({vibeInfo.reviews})
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="relative p-7 z-10 flex flex-col">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[9px] uppercase font-extrabold tracking-widest text-gold-400/70 border border-gold-500/20 px-2 py-0.5 rounded">
              {product.category.name}
            </span>
          </div>
          <h3 className={`font-serif text-2xl font-bold text-foreground leading-tight mb-3 transition-colors duration-500 ${isHovered ? 'text-gold-400' : ''}`}>
            {product.title}
          </h3>
          <p className="text-xs text-foreground/60 line-clamp-2 leading-relaxed mb-8">
            {product.description}
          </p>

          <div className="flex items-end justify-between mt-auto">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-widest text-foreground/40 font-bold mb-1">Exchange</span>
              <span className="text-2xl font-serif text-gold-400">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            </div>
            <Link
              href={`/product/${product.slug}`}
              className={`flex items-center justify-center h-14 w-14 rounded-full border transition-all duration-500 ease-out overflow-hidden group/btn ${
                isHovered 
                  ? 'bg-gold-500 border-gold-400 text-space-950 shadow-[0_0_20px_rgba(212,175,55,0.4)]' 
                  : 'bg-space-900 border-space-700 text-gold-400'
              }`}
            >
              <ArrowRight className={`h-5 w-5 transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isHovered ? '-rotate-45 scale-110' : 'group-hover/btn:translate-x-1'}`} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InteractiveShowcase({ initialProducts }: InteractiveShowcaseProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'bracelets' | 'earrings' | 'anklets' | 'gift-sets'>('all');
  const [isAnimating, setIsAnimating] = useState(false);

  const tabs = [
    { label: 'All Creations', id: 'all' },
    { label: 'Bracelets', id: 'bracelets' },
    { label: 'Earrings', id: 'earrings' },
    { label: 'Anklets', id: 'anklets' },
    { label: 'Gift Sets', id: 'gift-sets' },
  ] as const;

  const handleTabChange = (tabId: any) => {
    if (tabId === activeTab) return;
    // Animate out
    setIsAnimating(true);
    setTimeout(() => {
      setActiveTab(tabId);
      // Animate in
      setTimeout(() => setIsAnimating(false), 50);
    }, 400); 
  };

  const filteredProducts = initialProducts.filter(p => {
    if (activeTab === 'all') return true;
    return p.category.slug === activeTab;
  });

  const productVibes: Record<string, { tag: string; vibe: string; detail: string; rating: number; reviews: number }> = {
    'aura-alignment-thread-bracelet': {
      tag: 'Best Seller',
      vibe: 'Element Sync',
      detail: 'Crafted from Premium Merino & Bamboo Silk, aligning directly with your core aura.',
      rating: 4.9,
      reviews: 148,
    },
    'celestial-constellation-drop-earrings': {
      tag: 'Artisan Choice',
      vibe: 'Raw Crystals',
      detail: 'Suspended on hypoallergenic silk-thread mounts for pure crystal resonance.',
      rating: 4.8,
      reviews: 94,
    },
    'zodiac-silk-cord-anklet': {
      tag: 'Delicately Knotted',
      vibe: 'Freshwater Pearls',
      detail: 'Features sliding adjustor knots allowing natural pearls to rest gracefully.',
      rating: 4.7,
      reviews: 62,
    },
    'zodiac-birth-flower-keepsake-gift-set': {
      tag: 'Gifting Premium',
      vibe: 'Candle & Card',
      detail: 'Arrives in an engraved Cedarwood Box, bringing intention and warmth to any space.',
      rating: 5.0,
      reviews: 210,
    },
  };

  const defaultVibe = {
    tag: 'Handcrafted',
    vibe: 'Celestial Intent',
    detail: 'Woven with 100% Organic Cotton base cords and blessed with cosmic intent.',
    rating: 4.8,
    reviews: 42,
  };

  return (
    <div className="space-y-16 py-8 perspective-[2000px]">
      {/* Sleek Minimalist Navigation */}
      <div className="flex justify-center relative z-30">
        <div className="inline-flex items-center gap-1 p-1.5 bg-space-950/80 backdrop-blur-xl border border-space-800 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden relative">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`relative px-6 py-3 rounded-full text-[10px] font-extrabold tracking-widest uppercase transition-colors duration-500 ease-out z-10 ${
                activeTab === tab.id
                  ? 'text-space-950'
                  : 'text-foreground/60 hover:text-gold-400'
              }`}
            >
              {activeTab === tab.id && (
                <span className="absolute inset-0 bg-gradient-to-r from-gold-500 to-gold-400 rounded-full shadow-[0_0_20px_rgba(212,175,55,0.4)] -z-10 animate-fade-in" />
              )}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Elegant 3D Product Grid */}
      <div 
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 xl:gap-14 transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
          isAnimating ? 'opacity-0 scale-95 translate-y-8' : 'opacity-100 scale-100 translate-y-0'
        }`}
      >
        {filteredProducts.map((product, idx) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            index={idx} 
            vibeInfo={productVibes[product.slug] || defaultVibe} 
          />
        ))}
      </div>
    </div>
  );
}
