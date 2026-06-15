'use client';

import React from 'react';
import { JourneyController, JourneyZone } from '@/components/ui/JourneyController';
import {
  LaunchPadZone,
  NebulaZone,
  StargateZone,
  CelestialForgeZone,
  ArtifactDiscoveryZone,
  ConstellationMapZone,
  ArtisanOutpostZone,
} from '@/components/ui/JourneyZones';
import { HUDChrome } from '@/components/ui/SciFiHUD';
import CelestialCalculator from '@/components/ui/CelestialCalculator';
import HolographicCard from '@/components/ui/HolographicCard';
import { GravitationalLensCard } from '@/components/ui/GravitationalLens';
import { NeonText } from '@/components/ui/CinematicTransitions';
import Link from 'next/link';
import { Sparkles, Gift, ArrowRight, Star, ShieldCheck, Compass } from 'lucide-react';

/**
 * CosmicVoyagePage — The full sci-fi journey experience.
 * Each "zone" is a full-viewport destination. Scroll/arrows navigate between zones.
 * Think: Star Wars meets Apple product page meets Mass Effect galaxy map.
 */

const JOURNEY_ZONES = [
  { id: 'launch', label: 'Launch Pad', icon: '🚀', color: '#06b6d4' },
  { id: 'nebula', label: 'Nebula of Intentions', icon: '🌌', color: '#a855f7' },
  { id: 'stargate', label: 'Stargate', icon: '⭐', color: '#d4af37' },
  { id: 'forge', label: 'Celestial Forge', icon: '🔮', color: '#ec4899' },
  { id: 'artifacts', label: 'Artifact Discovery', icon: '💎', color: '#06b6d4' },
  { id: 'constellation', label: 'Star Map', icon: '✨', color: '#d4af37' },
  { id: 'outpost', label: 'Artisan Outpost', icon: '🏛️', color: '#a855f7' },
];

interface CosmicVoyagePageProps {
  products: any[];
  artisans: any[];
  zodiacSigns: { name: string; date: string; element: string; color: string }[];
}

export default function CosmicVoyagePage({ products, artisans, zodiacSigns }: CosmicVoyagePageProps) {
  return (
    <>
      <HUDChrome />
      <JourneyController zones={JOURNEY_ZONES} transitionDuration={1000}>
        {/* Zone 1: Launch Pad */}
        <JourneyZone>
          <LaunchPadZone />
        </JourneyZone>

        {/* Zone 2: Nebula of Intentions — Calculator */}
        <JourneyZone>
          <NebulaZone>
            <div className="w-full max-w-4xl space-y-6">
              <div className="text-center space-y-3">
                <p className="text-[10px] font-mono text-purple-300/60 uppercase tracking-[0.3em]">Entering Nebula</p>
                <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white">
                  Discover Your <NeonText color="purple">Celestial Thread</NeonText>
                </h2>
                <p className="text-sm text-white/50 max-w-lg mx-auto">
                  Input your birth details to calculate your zodiac alignment, ruling planet, and ideal thread color.
                </p>
              </div>
              <CelestialCalculator />
            </div>
          </NebulaZone>
        </JourneyZone>

        {/* Zone 3: Stargate — Social Proof */}
        <JourneyZone>
          <StargateZone>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
              {[
                { stat: '1,200+', label: 'Orders Shipped', icon: '📦' },
                { stat: '200+', label: 'Artisan Weavers', icon: '🧵' },
                { stat: '12', label: 'Celestial Alignments', icon: '✨' },
                { stat: '4.9★', label: 'Average Score', icon: '💫' },
              ].map(({ stat, label, icon }) => (
                <div key={label} className="space-y-2 p-4 bg-space-900/40 rounded-xl border border-white/5 backdrop-blur">
                  <div className="text-3xl">{icon}</div>
                  <p className="font-serif text-3xl sm:text-4xl font-bold text-gold-400">{stat}</p>
                  <p className="text-[10px] text-white/50 font-semibold uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </div>
          </StargateZone>
        </JourneyZone>

        {/* Zone 4: Celestial Forge — Brand Story */}
        <JourneyZone>
          <CelestialForgeZone>
            <div className="w-full max-w-6xl space-y-8">
              <div className="text-center space-y-3">
                <p className="text-[10px] font-mono text-cyan-300/60 uppercase tracking-[0.3em]">Docked: Celestial Forge</p>
                <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white">
                  The <NeonText color="gold">Artisan Craft</NeonText>
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <HolographicCard delay={0.1} glowColor="rgba(212, 175, 55, 0.15)">
                  <div className="flex flex-col items-center text-center space-y-4 p-8">
                    <div className="h-14 w-14 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-400 border border-gold-500/20">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <h3 className="font-serif text-xl font-bold text-white">Handcrafted Knotting</h3>
                    <p className="text-sm text-white/60 leading-relaxed">
                      No automatic factories. Our pieces are hand-woven knot-by-knot by traditional artisans using robust, organic cotton thread.
                    </p>
                  </div>
                </HolographicCard>
                
                <HolographicCard delay={0.3} glowColor="rgba(168, 85, 247, 0.15)">
                  <div className="flex flex-col items-center text-center space-y-4 p-8">
                    <div className="h-14 w-14 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                      <Compass className="h-6 w-6" />
                    </div>
                    <h3 className="font-serif text-xl font-bold text-white">Zodiac Aligned</h3>
                    <p className="text-sm text-white/60 leading-relaxed">
                      Thread colors, gemstones, and knotting patterns carefully selected based on celestial computations of your birth chart.
                    </p>
                  </div>
                </HolographicCard>
                
                <HolographicCard delay={0.5} glowColor="rgba(6, 182, 212, 0.15)">
                  <div className="flex flex-col items-center text-center space-y-4 p-8">
                    <div className="h-14 w-14 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <h3 className="font-serif text-xl font-bold text-white">Intention Storycards</h3>
                    <p className="text-sm text-white/60 leading-relaxed">
                      Each product arrives in a wooden drawer box, carrying customized flower prints and a handwritten intention blessing note.
                    </p>
                  </div>
                </HolographicCard>
              </div>
            </div>
          </CelestialForgeZone>
        </JourneyZone>

        {/* Zone 5: Artifact Discovery — Products */}
        <JourneyZone>
          <ArtifactDiscoveryZone>
            <div className="w-full max-w-7xl mx-auto space-y-8">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-mono text-cyan-300/60 uppercase tracking-[0.3em]">Scanning Area</p>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-2">
                    Discovered Artifacts
                  </h2>
                  <p className="text-sm text-white/40 mt-1">Celestial accessories detected in this sector</p>
                </div>
                <Link href="/shop" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium">
                  View All <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.slice(0, 6).map((product, i) => (
                  <GravitationalLensCard
                    key={product.id}
                    glowColor={i % 3 === 0 ? 'rgba(212,175,55,0.2)' : i % 3 === 1 ? 'rgba(168,85,247,0.2)' : 'rgba(6,182,212,0.2)'}
                    intensity="medium"
                  >
                    <Link href={`/product/${product.slug}`} className="block">
                      <div className="aspect-square bg-space-950 overflow-hidden rounded-t-lg">
                        <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="p-4 space-y-2">
                        <h3 className="font-serif text-base font-bold text-white truncate">{product.title}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-gold-400">₹{product.price}</span>
                          <div className="flex items-center gap-1 text-[10px] text-white/40">
                            <Star className="h-3 w-3 text-gold-400 fill-gold-400" />
                            {product.rating?.toFixed(1)}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </GravitationalLensCard>
                ))}
              </div>
            </div>
          </ArtifactDiscoveryZone>
        </JourneyZone>

        {/* Zone 6: Constellation Map — Zodiac Hub */}
        <JourneyZone>
          <ConstellationMapZone>
            <div className="w-full max-w-7xl space-y-8">
              <div className="text-center space-y-3">
                <p className="text-[10px] font-mono text-gold-300/60 uppercase tracking-[0.3em]">Navigation Chart</p>
                <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white">
                  Zodiac <NeonText color="gold">Star Map</NeonText>
                </h2>
                <p className="text-sm text-white/40 max-w-lg mx-auto">
                  Select your constellation to discover aligned artifacts
                </p>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {zodiacSigns.map((zodiac) => (
                  <Link
                    key={zodiac.name}
                    href={`/shop?zodiac=${zodiac.name}`}
                    className="group p-4 bg-space-900/60 rounded-xl border border-white/5 hover:border-gold-400/50 hover:bg-space-900/80 transition-all text-center space-y-2 backdrop-blur"
                  >
                    <div className="font-serif text-base font-bold text-white group-hover:text-gold-400 transition-colors">
                      {zodiac.name}
                    </div>
                    <div className="text-[9px] text-white/30">{zodiac.date}</div>
                    <span className={`inline-block text-[8px] px-2 py-0.5 rounded-full font-bold uppercase border ${zodiac.color}`}>
                      {zodiac.element}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </ConstellationMapZone>
        </JourneyZone>

        {/* Zone 7: Artisan Outpost */}
        <JourneyZone>
          <ArtisanOutpostZone>
            <div className="w-full max-w-5xl mx-auto space-y-8">
              <div className="text-center space-y-3">
                <p className="text-[10px] font-mono text-gold-300/60 uppercase tracking-[0.3em]">Outpost Docked</p>
                <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white">
                  Artisan <NeonText color="gold">Collective</NeonText>
                </h2>
                <p className="text-sm text-white/40 max-w-lg mx-auto">
                  Meet the generational Rajasthani weavers behind your celestial accessories
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {artisans.map((artisan) => (
                  <HolographicCard key={artisan.id} glowColor="rgba(212,175,55,0.1)">
                    <div className="flex gap-4 p-6">
                      <img
                        src={artisan.avatarUrl || '/images/products/default.jpg'}
                        alt={artisan.storeName}
                        className="w-16 h-16 rounded-full object-cover border border-white/10"
                      />
                      <div className="space-y-2 flex-1">
                        <h3 className="font-serif text-lg font-bold text-white">{artisan.storeName}</h3>
                        <p className="text-xs text-white/50 line-clamp-2">{artisan.bio}</p>
                        <div className="flex items-center gap-2 text-[10px] text-gold-400">
                          <Star className="h-3 w-3 fill-gold-400" />
                          <span>Master Weaver · Bangalore</span>
                        </div>
                      </div>
                    </div>
                  </HolographicCard>
                ))}
              </div>

              {/* CTA to continue */}
              <div className="text-center pt-6 space-y-4">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-gold-500 to-gold-400 text-space-950 font-bold rounded-full hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-all"
                >
                  <Sparkles className="h-4 w-4" />
                  Explore Full Collection
                </Link>
                <div className="flex items-center justify-center gap-6">
                  <Link href="/gift-wizard" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                    <Gift className="h-3 w-3" /> AI Gift Wizard
                  </Link>
                  <a href="https://wa.me/919999999999" className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1">
                    💬 Order on WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </ArtisanOutpostZone>
        </JourneyZone>
      </JourneyController>
    </>
  );
}
