'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

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

interface ProductGridProps {
  initialProducts: Product[];
}

export default function ProductGrid({ initialProducts }: ProductGridProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'bracelets' | 'earrings' | 'anklets' | 'gift-sets'>('all');

  const tabs = [
    { label: 'All Creations', id: 'all' },
    { label: 'Bracelets', id: 'bracelets' },
    { label: 'Earrings', id: 'earrings' },
    { label: 'Anklets', id: 'anklets' },
    { label: 'Gift Sets', id: 'gift-sets' },
  ] as const;

  const filteredProducts = initialProducts.filter((product) => {
    if (activeTab === 'all') return true;
    return product.category.slug === activeTab;
  });

  return (
    <div className="space-y-12">
      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 border ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-gold-500 to-gold-400 text-space-950 border-gold-400 shadow-[0_0_20px_rgba(212,175,55,0.25)]'
                : 'bg-space-950/60 text-foreground/60 border-space-800 hover:border-foreground/20 hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid of Product Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="group relative rounded-3xl bg-space-950/40 border border-space-800 hover:border-gold-500/40 transition-all duration-500 overflow-hidden shadow-2xl hover:shadow-[0_20px_40px_rgba(212,175,55,0.06)] flex flex-col h-full"
          >
            {/* Image display */}
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-space-900 border-b border-space-800">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-space-950 via-space-950/20 to-transparent opacity-90" />
            </div>

            {/* Content Section */}
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[9px] uppercase font-extrabold tracking-widest text-gold-400/80 bg-gold-400/5 border border-gold-500/10 px-2.5 py-0.5 rounded">
                    {product.category.name}
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-foreground leading-tight mb-2 group-hover:text-gold-400 transition-colors duration-300">
                  {product.title}
                </h3>
                <p className="text-xs text-foreground/60 leading-relaxed mb-6 line-clamp-2">
                  {product.description}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-space-800/60 pt-4 mt-auto">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-widest text-foreground/40 font-bold mb-0.5">Price</span>
                  <span className="text-xl font-serif text-gold-400">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                </div>
                <Link
                  href={`/product/${product.slug}`}
                  className="flex items-center justify-center h-11 w-11 rounded-full border bg-space-900 border-space-700 text-gold-400 transition-all duration-300 group-hover:bg-gold-500 group-hover:border-gold-400 group-hover:text-space-950 group-hover:shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                >
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-16 bg-space-900/30 border border-space-800 rounded-3xl">
          <p className="text-sm text-foreground/40 font-bold uppercase tracking-widest">No Creations Found</p>
        </div>
      )}
    </div>
  );
}
