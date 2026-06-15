'use client';

import { useState } from 'react';
import { Sparkles, Calendar, Wind, Flame, Droplets, Mountain, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ElementInfo {
  name: string;
  colors: string[];
  gem: string;
  intention: string;
  thread: string;
  charms: string[];
  hex: string;
}

const ELEMENT_DATA: Record<string, ElementInfo> = {
  Fire: {
    name: 'Fire (Aries, Leo, Sagittarius)',
    colors: ['#ef4444', '#f97316', '#f59e0b'],
    gem: 'Carnelian & Sunstone',
    intention: 'Passion, Radiance, & Courage',
    thread: 'Terracotta Clay Thread',
    charms: ['Mini Sun Disk', 'Star Emblem'],
    hex: 'from-red-500 via-orange-500 to-amber-500',
  },
  Earth: {
    name: 'Earth (Taurus, Virgo, Capricorn)',
    colors: ['#10b981', '#047857', '#84cc16'],
    gem: 'Moss Agate & Green Jade',
    intention: 'Grounding, Growth, & Abundance',
    thread: 'Sage Olive Thread',
    charms: ['Oak Leaf Charm', 'Infinity Loop'],
    hex: 'from-emerald-500 via-teal-600 to-lime-500',
  },
  Air: {
    name: 'Air (Gemini, Libra, Aquarius)',
    colors: ['#a855f7', '#c084fc', '#e9d5ff'],
    gem: 'Amethyst & Clear Quartz',
    intention: 'Clarity, Intuition, & Elevation',
    thread: 'Cosmic Indigo Thread',
    charms: ['Feather Charm', 'Crescent Moon'],
    hex: 'from-purple-500 via-violet-400 to-fuchsia-400',
  },
  Water: {
    name: 'Water (Cancer, Scorpio, Pisces)',
    colors: ['#06b6d4', '#3b82f6', '#1d4ed8'],
    gem: 'Aquamarine & Lapis Lazuli',
    intention: 'Harmony, Healing, & Flow',
    thread: 'Oceanic Blue Thread',
    charms: ['Wave Charm', 'Zodiac Water Vessel'],
    hex: 'from-cyan-400 via-blue-500 to-indigo-600',
  },
};

export default function CelestialCalculator() {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [element, setElement] = useState<string>('Air');
  const [isCalculated, setIsCalculated] = useState(false);
  const [calculating, setCalculating] = useState(false);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setCalculating(true);
    setTimeout(() => {
      setCalculating(false);
      setIsCalculated(true);
    }, 1200);
  };

  const selectedData = ELEMENT_DATA[element];

  return (
    <div className="w-full max-w-4xl mx-auto p-8 rounded-craft bg-space-900/60 border border-space-700/80 backdrop-blur-md shadow-tactile relative overflow-hidden">
      <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/10 blur-3xl rounded-full" />
      <div className="absolute bottom-0 left-0 h-40 w-40 bg-cyan-500/10 blur-3xl rounded-full" />

      {!isCalculated ? (
        <form onSubmit={handleCalculate} className="space-y-6 relative z-10">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-gold-500/30 bg-gold-500/5 text-gold-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3 w-3 text-gold-400" />
              Dynamic Astral Alignment
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
              Intention Aura Calculator
            </h3>
            <p className="text-sm text-foreground/70 max-w-lg mx-auto">
              Configure your astrological element and birth date to discover your custom thread coloring, gemstones, and aligned celestial accessories.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                Your Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Luna Devi"
                className="w-full bg-space-950/80 border border-space-700 rounded-craft-sm px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                Birth Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full bg-space-950/80 border border-space-700 rounded-craft-sm px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-gold-400"
                />
              </div>
            </div>
          </div>

          {/* Element Selection grid */}
          <div className="space-y-3">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/60 text-center">
              Select Your Birth Element
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: 'Fire', icon: Flame, color: 'text-red-400 border-red-500/20 hover:border-red-500/50 hover:bg-red-500/5', activeColor: 'bg-red-500/10 border-red-500 text-red-400' },
                { name: 'Earth', icon: Mountain, color: 'text-emerald-400 border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-500/5', activeColor: 'bg-emerald-500/10 border-emerald-500 text-emerald-400' },
                { name: 'Air', icon: Wind, color: 'text-purple-400 border-purple-500/20 hover:border-purple-500/50 hover:bg-purple-500/5', activeColor: 'bg-purple-500/10 border-purple-500 text-purple-400' },
                { name: 'Water', icon: Droplets, color: 'text-cyan-400 border-cyan-500/20 hover:border-cyan-500/50 hover:bg-cyan-500/5', activeColor: 'bg-cyan-500/10 border-cyan-500 text-cyan-400' },
              ].map((el) => {
                const Icon = el.icon;
                const isActive = element === el.name;
                return (
                  <button
                    key={el.name}
                    type="button"
                    onClick={() => setElement(el.name)}
                    className={`flex flex-col items-center justify-center p-4 border rounded-craft transition-all ${
                      isActive ? el.activeColor : el.color
                    }`}
                  >
                    <Icon className="h-6 w-6 mb-2" />
                    <span className="text-xs font-bold tracking-wider uppercase">{el.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              type="submit"
              disabled={calculating}
              className="bg-gradient-to-r from-gold-500 to-gold-400 text-space-950 font-bold px-8 py-3.5 rounded-craft-sm text-sm hover:from-gold-400 hover:to-gold-300 transition-all shadow-md flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
            >
              {calculating ? (
                <>Calculating Alignment...</>
              ) : (
                <>
                  Chart My Intentions
                  <Sparkles className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6 relative z-10 text-center animate-scale-in">
          {/* Dynamic Intention Aura visualization */}
          <div className="relative w-36 h-36 mx-auto rounded-full flex items-center justify-center mb-6">
            <div className={`absolute inset-0 rounded-full bg-gradient-to-tr ${selectedData.hex} opacity-40 blur-md animate-pulse`} />
            <div className="relative w-28 h-28 rounded-full bg-space-950 border-2 border-gold-400/80 flex flex-col items-center justify-center text-center shadow-lg">
              <Sparkles className="h-6 w-6 text-gold-400 mb-1 animate-spin-slow" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold-300">{element}</span>
              <span className="text-xs font-serif italic text-foreground/80 mt-0.5">Aligned</span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs text-gold-400 font-bold uppercase tracking-widest">Astral Alignment Profile</span>
            <h4 className="font-serif text-3xl font-bold text-foreground">
              {name || 'The Seeker'}&apos;s Intentions
            </h4>
            <p className="text-xs text-foreground/50">Birth Date: {birthDate || 'Celestial Dawn'}</p>
          </div>

          {/* Intention Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto text-left pt-4">
            <div className="p-4 bg-space-950/60 border border-space-700/60 rounded-craft space-y-1">
              <span className="text-[9px] uppercase font-bold text-foreground/40 tracking-wider">Aura Colors</span>
              <div className="flex gap-2 items-center pt-1">
                {selectedData.colors.map((c, i) => (
                  <span key={i} className="h-4 w-4 rounded-full border border-white/10" style={{ backgroundColor: c }} />
                ))}
                <span className="text-xs font-semibold text-foreground/80 pl-1">{selectedData.name}</span>
              </div>
            </div>

            <div className="p-4 bg-space-950/60 border border-space-700/60 rounded-craft space-y-1">
              <span className="text-[9px] uppercase font-bold text-foreground/40 tracking-wider">Aligned Gemstones</span>
              <p className="text-xs font-bold text-gold-300">{selectedData.gem}</p>
            </div>

            <div className="p-4 bg-space-950/60 border border-space-700/60 rounded-craft space-y-1">
              <span className="text-[9px] uppercase font-bold text-foreground/40 tracking-wider">Core Intentions</span>
              <p className="text-xs font-bold text-foreground/90">{selectedData.intention}</p>
            </div>

            <div className="p-4 bg-space-950/60 border border-space-700/60 rounded-craft space-y-1">
              <span className="text-[9px] uppercase font-bold text-foreground/40 tracking-wider">Celestial Thread</span>
              <p className="text-xs font-bold text-emerald-400">{selectedData.thread}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6">
            <button
              onClick={() => setIsCalculated(false)}
              className="text-xs font-bold text-foreground/60 hover:text-foreground border border-space-700 px-6 py-2.5 rounded-craft-sm transition-all"
            >
              Recalculate
            </button>
            <Link
              href={`/product/zodiac-flower-anklets?threadColor=${encodeURIComponent(
                selectedData.thread
              )}&element=${element}`}
              className="bg-gradient-to-r from-gold-500 to-gold-400 text-space-950 font-bold px-6 py-2.5 rounded-craft-sm text-xs hover:from-gold-400 hover:to-gold-300 transition-all flex items-center gap-2 shadow"
            >
              Customize with My Alignment
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
