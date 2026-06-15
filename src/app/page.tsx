import Link from 'next/link';
import { db } from '@/lib/db';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import { Sparkles, Gift, Compass, ShieldCheck, HeartHandshake, Eye, ArrowRight, Star } from 'lucide-react';
import ProductGrid from '@/components/ui/ProductGrid';
import StellarSky from '@/components/ui/StellarSky';
import CelestialCalculator from '@/components/ui/CelestialCalculator';
import ImmersiveExperience from '@/components/ui/ImmersiveExperience';
import HolographicCard from '@/components/ui/HolographicCard';
import { CinematicReveal, ImmersiveScrollSection, NeonText, TypewriterGlow } from '@/components/ui/CinematicTransitions';
import { HUDFrame, HUDChrome, GlitchDivider, HoloBadge, TargetingReticle } from '@/components/ui/SciFiHUD';
import { DimensionalRift, SpacetimeFold } from '@/components/ui/QuantumPortal';
import { ConstellationSection } from '@/components/ui/NeuralConstellation';
import { GravitationalLensCard, EventHorizonButton } from '@/components/ui/GravitationalLens';
import { DataStream, DNAHelix } from '@/components/ui/DataStream';

export const revalidate = 60; // Revalidate every minute

export default async function HomePage() {
  // Fetch products, artisans and creator campaigns from DB
  const featuredProducts = await db.product.findMany({
    where: { isFeatured: true, isActive: true },
    include: { category: true },
    take: 3,
  });

  const allProducts = await db.product.findMany({
    where: { isActive: true },
    include: { category: true },
  });

  const artisans = await db.artisanProfile.findMany({
    where: { verificationStatus: 'APPROVED' },
    take: 2,
  });

  const creators = await db.creatorProfile.findMany({
    where: { isActive: true },
    take: 1,
  });

  const zodiacSigns = [
    { name: 'Aries', date: 'Mar 21 - Apr 19', element: 'Fire', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
    { name: 'Taurus', date: 'Apr 20 - May 20', element: 'Earth', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { name: 'Gemini', date: 'May 21 - Jun 20', element: 'Air', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
    { name: 'Cancer', date: 'Jun 21 - Jul 22', element: 'Water', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { name: 'Leo', date: 'Jul 23 - Aug 22', element: 'Fire', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
    { name: 'Virgo', date: 'Aug 23 - Sep 22', element: 'Earth', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { name: 'Libra', date: 'Sep 23 - Oct 22', element: 'Air', color: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
    { name: 'Scorpio', date: 'Oct 23 - Nov 21', element: 'Water', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    { name: 'Sagittarius', date: 'Nov 22 - Dec 21', element: 'Fire', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
    { name: 'Capricorn', date: 'Dec 22 - Jan 19', element: 'Earth', color: 'bg-stone-500/10 text-stone-400 border-stone-500/20' },
    { name: 'Aquarius', date: 'Jan 20 - Feb 18', element: 'Air', color: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
    { name: 'Pisces', date: 'Feb 19 - Mar 20', element: 'Water', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  ];

  return (
    <ImmersiveExperience show3D={true} showParticles={true} showCursor={true}>
      <div className="flex flex-col min-h-screen relative text-foreground overflow-hidden">
        {/* Dynamic star field overlay */}
        <StellarSky />

        <Header />

        {/* Hero Section — Cinematic Entrance */}
        <section className="relative overflow-hidden py-24 sm:py-36 z-10">
          <div className="cosmic-glow bg-amber-500/10 top-20 left-10 h-96 w-96" />
          <div className="cosmic-glow bg-purple-500/10 bottom-10 right-10 h-[500px] w-[500px]" />
          
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <CinematicReveal delay={0.2} direction="depth">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold-500/30 bg-space-900/80 text-gold-400 text-xs font-bold tracking-wider uppercase animate-pulse-glow shadow-tactile backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-gold-400" />
                Bangalore Generational Knotting · Star Aligned
              </div>
            </CinematicReveal>
            
            <CinematicReveal delay={0.5} direction="up">
              <h1 className="font-serif text-5xl sm:text-8xl font-bold tracking-tight text-foreground max-w-5xl mx-auto leading-[1.1]">
                Accessories Woven for Your{' '}
                <NeonText color="gold" className="italic font-extrabold">Celestial Identity</NeonText>
              </h1>
            </CinematicReveal>
            
            <CinematicReveal delay={0.8} direction="up">
              <p className="text-lg sm:text-xl text-foreground/80 max-w-2xl mx-auto leading-relaxed font-sans">
                Every thread knotted by hand, customized with your zodiac flower and birth intentions.
                <br className="hidden sm:block" />
                <span className="text-gold-400 font-semibold">Gift meaning. Carry power. Wear your stars.</span>
              </p>
            </CinematicReveal>

            <CinematicReveal delay={1.1} direction="up">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link
                  href="/shop"
                  className="w-full sm:w-auto cosmic-nav-arrow !px-8 !py-4 !text-base !font-bold !bg-gradient-to-r !from-gold-500 !to-gold-400 !text-space-950 !border-0 hover:shadow-[0_0_40px_rgba(212,175,55,0.4)] transition-all"
                >
                  Explore Collection
                  <ArrowRight className="h-4 w-4 animate-cosmic-arrow" />
                </Link>
                <Link
                  href="/gift-wizard"
                  className="w-full sm:w-auto cosmic-nav-arrow !px-8 !py-4"
                >
                  <Gift className="h-4 w-4 text-teal-400" />
                  AI Gift Finder
                </Link>
              </div>
            </CinematicReveal>

            {/* Hero trust badges */}
            <CinematicReveal delay={1.4} direction="up">
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-foreground/60 pt-6">
                {['★ 4.9 / 5 Rating', '✓ 1,200+ Celestial Orders', '🛡️ Secure UPI & Card Checkout', '⚡ Fast Shipping Above ₹999'].map((t) => (
                  <span key={t} className="px-4 py-1.5 bg-space-900/80 border border-space-700/60 rounded-full shadow-tactile font-semibold text-foreground/80 backdrop-blur-sm">{t}</span>
                ))}
              </div>
            </CinematicReveal>
          </div>
        </section>

      {/* ─── Astrological Intention Calculator Strip ─── */}
      <section className="py-12 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <CelestialCalculator />
        </div>
      </section>

      {/* ─── DIMENSIONAL RIFT — Section Divider ─── */}
      <DimensionalRift />

      {/* Social Proof Stats Strip — HUD Framed */}
      <ConstellationSection
        nodeCount={40}
        colorScheme="zodiac"
        intensity="subtle"
        className="border-y border-space-800 bg-space-900/40 py-10 relative z-10 backdrop-blur-sm"
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { stat: '1,200+', label: 'Orders Shipped', icon: '📦' },
              { stat: '200+', label: 'Artisan Weavers', icon: '🧵' },
              { stat: '12', label: 'Celestial Alignments', icon: '✨' },
              { stat: '4.9★', label: 'Average Score', icon: '💫' },
            ].map(({ stat, label, icon }, i) => (
              <CinematicReveal key={label} delay={0.2 + i * 0.15} direction="up">
                <HUDFrame>
                  <div className="space-y-1 p-2">
                    <div className="text-3xl">{icon}</div>
                    <p className="font-serif text-3xl sm:text-4xl font-bold text-gold-400">{stat}</p>
                    <p className="text-xs text-foreground/60 font-semibold uppercase tracking-wider">{label}</p>
                  </div>
                </HUDFrame>
              </CinematicReveal>
            ))}
          </div>
        </div>
      </ConstellationSection>

      {/* ─── DIMENSIONAL RIFT — Before Brand Story ─── */}
      <DimensionalRift />

      {/* Brand Storytelling & Emotional Promise — Holographic Cards */}
      <ImmersiveScrollSection className="py-24 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <HolographicCard delay={0.1} glowColor="rgba(212, 175, 55, 0.15)">
              <div className="flex flex-col items-center text-center space-y-4 p-8">
                <div className="h-14 w-14 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-400 border border-gold-500/20">
                  <HeartHandshake className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-foreground">Handcrafted Loop-by-Loop</h3>
                <p className="text-sm text-foreground/70 leading-relaxed">
                  No automatic factories. Our pieces are hand-woven knot-by-knot by traditional artisans using robust, organic cotton thread.
                </p>
              </div>
            </HolographicCard>

            <HolographicCard delay={0.3} glowColor="rgba(6, 182, 212, 0.15)">
              <div className="flex flex-col items-center text-center space-y-4 p-8">
                <div className="h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center text-accent border border-teal-500/20">
                  <Compass className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-foreground">Aura & Zodiac Aligned</h3>
                <p className="text-sm text-foreground/70 leading-relaxed">
                  Customized for your birth energy. Select your elements, stars, and birth flower to configure specific crystals and threads.
                </p>
              </div>
            </HolographicCard>

            <HolographicCard delay={0.5} glowColor="rgba(168, 85, 247, 0.15)">
              <div className="flex flex-col items-center text-center space-y-4 p-8">
                <div className="h-14 w-14 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-foreground">Intention Storycards</h3>
                <p className="text-sm text-foreground/70 leading-relaxed">
                  Each product arrives in a wooden drawer box, carrying customized flower prints and a handwritten intention blessing note.
                </p>
              </div>
            </HolographicCard>
          </div>
        </div>
      </ImmersiveScrollSection>

      {/* Featured Products Showcase Section — With Data Stream Background */}
      <section className="py-24 relative z-10" id="collection-showcase">
        {/* Matrix data rain background */}
        <DataStream opacity={0.08} speed="slow" density="sparse" colorScheme="gold" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-4">
            <SpacetimeFold>
              <div>
                <HoloBadge>Quantum Curated</HoloBadge>
                <h2 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mt-4">
                  Artisanal Spotlight
                </h2>
                <p className="text-sm text-foreground/70 mt-2">
                  Explore our hand-knotted thread and wool collections designed for celestial protection and intentions.
                </p>
              </div>
            </SpacetimeFold>
            <Link
              href="/shop"
              className="text-gold-400 hover:text-gold-300 text-sm font-semibold flex items-center gap-1.5 group"
            >
              View Full Catalog
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <ProductGrid initialProducts={allProducts} />
        </div>
      </section>

      {/* Interactive Zodiac Hub — With Neural Constellation */}
      <ConstellationSection
        nodeCount={50}
        colorScheme="quantum"
        intensity="medium"
        interactive
        className="py-24 border-t border-b border-space-800 relative overflow-hidden z-10 bg-space-900/30"
      >
        <div className="cosmic-glow bg-gold-400/5 right-0 top-1/4 h-96 w-96" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <HoloBadge>Neural Network Active</HoloBadge>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mt-4">
              Zodiac Alignment Hub
            </h2>
            <p className="text-sm sm:text-base text-foreground/70">
              Select your astrological sign to unlock compatibility guides, elemental alignment summaries, and tailored gemstone recommendations.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {zodiacSigns.map((zodiac, i) => (
              <SpacetimeFold key={zodiac.name} delay={i * 0.05}>
                <Link
                  href={`/shop?zodiac=${zodiac.name}`}
                  className="group p-6 bg-space-900/60 rounded-craft border border-space-800 hover:border-gold-400 hover:shadow-md transition-all text-center flex flex-col items-center justify-between gap-3 shadow-tactile backdrop-blur warp-field"
                >
                  <div className="font-serif text-lg font-bold text-foreground group-hover:text-gold-400 transition-colors">
                    {zodiac.name}
                  </div>
                  <div className="text-[10px] text-foreground/40 font-medium">
                    {zodiac.date}
                  </div>
                  <span className={`text-[9px] px-2.5 py-1 rounded-full font-bold uppercase border ${zodiac.color}`}>
                    {zodiac.element}
                  </span>
                </Link>
              </SpacetimeFold>
            ))}
          </div>
        </div>
      </ConstellationSection>

      {/* ─── DIMENSIONAL RIFT — Before Artisan Section ─── */}
      <DimensionalRift />

      {/* Artisan & Creator Discovery Showcase — With DNA Helix */}
      <section className="py-24 relative z-10" id="artisan-hub">
        {/* DNA Helix decoration on left edge */}
        <div className="absolute left-0 top-0 bottom-0 w-20 opacity-30 hidden lg:block">
          <DNAHelix height={600} />
        </div>
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Artisan Spotlight */}
            <div className="space-y-8">
              <SpacetimeFold>
                <div className="border-l-4 border-gold-400 pl-4">
                  <HoloBadge>Verified Nexus</HoloBadge>
                  <h2 className="font-serif text-3xl font-bold text-foreground mt-2">
                    Artisan Collective
                  </h2>
                  <p className="text-sm text-foreground/70 mt-1">
                    Connecting generational weaver talent directly to modern seekers.
                  </p>
                </div>
              </SpacetimeFold>

              {artisans.map((artisan) => (
                <div
                  key={artisan.id}
                  className="flex flex-col sm:flex-row gap-6 p-6 bg-space-900/60 border border-space-800 rounded-craft shadow-tactile items-start backdrop-blur"
                >
                  <img
                    src={artisan.avatarUrl || ''}
                    alt={artisan.storeName}
                    className="h-24 w-24 rounded-craft object-cover border border-space-700"
                  />
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif text-lg font-bold text-foreground">{artisan.storeName}</h4>
                      <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-500/20">
                        <Star className="h-3 w-3 fill-emerald-400" />
                        {artisan.qualityScore.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-xs text-foreground/75 leading-relaxed">{artisan.bio}</p>
                    <Link
                      href={`/shop?artisan=${artisan.id}`}
                      className="text-xs font-semibold text-gold-400 hover:underline flex items-center gap-1 pt-2"
                    >
                      Shop Artisan Collection
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Creator Storefront */}
            <div className="space-y-8">
              <div className="border-l-4 border-accent pl-4">
                <h2 className="font-serif text-3xl font-bold text-foreground">
                  Creator Curations
                </h2>
                <p className="text-sm text-foreground/70 mt-1">
                  Limited solstice capsule edits compiled by celestial creators.
                </p>
              </div>

              {creators.map((creator) => (
                <div
                  key={creator.id}
                  className="p-6 bg-space-900/60 border border-space-800 rounded-craft shadow-tactile space-y-4 backdrop-blur"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={creator.avatarUrl || ''}
                      alt={creator.displayName}
                      className="h-16 w-16 rounded-full object-cover border border-space-700"
                    />
                    <div>
                      <h4 className="font-serif text-lg font-bold text-foreground">{creator.displayName}</h4>
                      <p className="text-xs text-gold-400 font-bold">@{creator.handle}</p>
                    </div>
                  </div>
                  <p className="text-xs text-foreground/75 leading-relaxed italic">&ldquo;{creator.bio}&rdquo;</p>
                  <div className="p-4 bg-space-950/80 border border-space-800 rounded-craft flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-foreground">Active Campaign</p>
                      <p className="text-xs text-foreground/60">Summer Solstice Magic</p>
                    </div>
                    <Link
                      href="/shop?creator=aurorascope"
                      className="bg-gradient-to-r from-gold-500 to-gold-400 text-space-950 text-xs font-bold px-4 py-2 rounded-craft hover:from-gold-400 hover:to-gold-300 transition-colors"
                    >
                      View Solstice Capsule
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* WhatsApp Order Chat */}
        <a
          href="https://wa.me/919999999999?text=Hi! I'd like to place a custom zodiac bracelet order."
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 text-white p-3.5 rounded-full shadow-lg hover:bg-green-600 transition-all flex items-center gap-2 group hover:scale-105 border border-green-400 animate-float"
          title="Order via WhatsApp"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          <span className="text-sm font-semibold max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
            Order on WhatsApp
          </span>
        </a>
        {/* AI Stylist */}
        <Link
          href="/gift-wizard"
          className="bg-gradient-to-r from-gold-500 to-gold-400 text-space-950 p-4 rounded-full shadow-lg hover:from-gold-400 hover:to-gold-300 transition-all flex items-center gap-2 group hover:scale-105 border border-gold-300"
        >
          <Sparkles className="h-5 w-5 text-accent animate-spin-slow" />
          <span className="text-sm font-semibold max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
            Ask AI Stylist
          </span>
        </Link>
      </div>

      {/* Sci-Fi HUD Chrome Overlay */}
      <HUDChrome />

      {/* Glitch Divider before Footer */}
      <GlitchDivider className="my-0" />

      <Footer />
    </div>
    </ImmersiveExperience>
  );
}
