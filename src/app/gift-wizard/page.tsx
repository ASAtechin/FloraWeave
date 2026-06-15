'use client';

import { useState } from 'react';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import { useStore, formatPrice } from '@/store/useStore';
import { Sparkles, Gift, Sliders, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import StellarSky from '@/components/ui/StellarSky';
import CosmicJourney from '@/components/ui/CosmicJourney';
import CosmicArrowNavigator from '@/components/ui/CosmicArrowNavigator';
import { CosmicWarpTransition } from '@/components/ui/CosmicWarpTransition';

export default function GiftWizardPage() {
  const { currency, language } = useStore();

  // Wizard Questions State
  const [step, setStep] = useState(1);
  const [recipient, setRecipient] = useState<'self' | 'partner' | 'friend' | 'family' | 'child'>('friend');
  const [zodiac, setZodiac] = useState('Cancer');
  const [occasion, setOccasion] = useState<'birthday' | 'anniversary' | 'solstice' | 'festival' | 'healing' | 'just-because'>('birthday');
  const [style, setStyle] = useState<'minimalist' | 'bold' | 'earthy' | 'elegant' | 'spiritual'>('minimalist');
  const [budget, setBudget] = useState<number>(1000);

  // Recommendations Output State
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [warpActive, setWarpActive] = useState(false);
  const [warpDirection, setWarpDirection] = useState<'forward' | 'backward'>('forward');

  const handleNextStep = () => {
    setWarpDirection('forward');
    setWarpActive(true);
    setTimeout(() => {
      setStep(step + 1);
      setWarpActive(false);
    }, 600);
  };

  const handlePrevStep = () => {
    setWarpDirection('backward');
    setWarpActive(true);
    setTimeout(() => {
      setStep(step - 1);
      setWarpActive(false);
    }, 500);
  };

  const handleSearchRecommendations = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zodiac,
          recipient,
          occasion,
          budget,
          style,
          userId: 'buyer-luna-id', // Seed user ID
        }),
      });

      const data = await response.json();
      if (data.success) {
        setRecommendations(data.recommendations || []);
        setStep(6); // Go to results screen
      } else {
        setError(data.error || 'Failed to generate recommendations.');
      }
    } catch (e) {
      console.error(e);
      setError('Connection to AI Concierge lost. Falling back to local rules.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen relative bg-space-950 text-foreground overflow-hidden">
      {/* Dynamic Stardust Backdrop */}
      <StellarSky />

      {/* Warp Speed Transition */}
      <CosmicWarpTransition active={warpActive} direction={warpDirection} />

      <Header />

      <main className="flex-grow mx-auto max-w-4xl w-full px-4 py-12 sm:px-6 lg:px-8 flex flex-col justify-center relative z-10 animate-fade-in">
        
        {/* Cosmic Arrow Path Progress */}
        {step <= 5 && (
          <div className="mb-12">
            <div className="flex items-center justify-between text-xs text-foreground/50 font-bold uppercase tracking-wider mb-2">
              <span>Step {step} of 5</span>
              <span className="text-gold-400">{Math.round(((step - 1) / 4) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-space-900 border border-space-850 h-1.5 rounded-full overflow-hidden relative">
              <div className="bg-gradient-to-r from-gold-500 via-nebula-500 to-teal-500 h-full transition-all duration-700 ease-out" style={{ width: `${((step) / 5) * 100}%` }} />
              {/* Animated leading edge */}
              <div 
                className="absolute top-0 h-full w-4 bg-gradient-to-r from-gold-400/80 to-transparent animate-cosmic-arrow transition-all duration-700" 
                style={{ left: `calc(${((step) / 5) * 100}% - 16px)` }} 
              />
            </div>
            {/* Step arrow indicators */}
            <div className="flex justify-between mt-3">
              {['Recipient', 'Zodiac', 'Occasion', 'Style', 'Budget'].map((label, i) => (
                <div key={label} className="flex flex-col items-center gap-1">
                  <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                    i < step ? 'bg-gold-400 shadow-[0_0_8px_rgba(212,175,55,0.5)]' : 
                    i === step - 1 ? 'bg-nebula-500 shadow-[0_0_12px_rgba(168,85,247,0.5)] animate-pulse' : 
                    'bg-space-700'
                  }`} />
                  <span className={`text-[10px] ${i < step ? 'text-gold-400' : 'text-foreground/30'}`}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-space-900/60 border border-space-800 rounded-craft p-6 sm:p-10 shadow-tactile relative overflow-hidden backdrop-blur">
          
          {/* Question 1: Recipient */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-gold-400">Step 1: Recipient Alignment</span>
                <h2 className="font-serif text-3xl font-bold text-foreground flex items-center gap-2 mt-1">
                  <Gift className="h-7 w-7 text-gold-400" />
                  Who is this cosmic ornament for?
                </h2>
                <p className="text-sm text-foreground/60">We map thread lengths and metal sizes based on the recipient.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'self', label: 'For Myself', desc: 'Crafted to align with your personal energy' },
                  { key: 'partner', label: 'For My Partner', desc: 'Emotional connection, elegant metal finishes' },
                  { key: 'friend', label: 'For a Close Friend', desc: 'Intention threads, birthstones, daily protection' },
                  { key: 'family', label: 'For Family Member', desc: 'Ancestral bond colors, blessing seals' },
                  { key: 'child', label: 'For a Child', desc: 'Slightly shorter cord lengths, safe alloy finishes' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => {
                      setRecipient(item.key as any);
                      handleNextStep();
                    }}
                    className={`p-4 rounded-craft border text-left transition-all flex flex-col justify-between ${
                      recipient === item.key
                        ? 'border-gold-400 bg-gold-400/5'
                        : 'border-space-800 bg-space-950/40 hover:border-space-700'
                    }`}
                  >
                    <span className="font-serif text-base font-bold text-foreground">{item.label}</span>
                    <span className="text-xs text-foreground/50 mt-1">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Question 2: Zodiac Sign */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-gold-400">Step 2: Zodiac Synthesis</span>
                <h2 className="font-serif text-3xl font-bold text-foreground flex items-center gap-2 mt-1">
                  <Sparkles className="h-7 w-7 text-gold-400 animate-pulse" />
                  What is their Zodiac Sign?
                </h2>
                <p className="text-sm text-foreground/60">This determines core elements (Fire, Water, Air, Earth) and gemstone matching.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'].map((z) => (
                  <button
                    key={z}
                    onClick={() => {
                      setZodiac(z);
                      handleNextStep();
                    }}
                    className={`py-3.5 px-2 rounded-craft border text-center transition-all ${
                      zodiac === z
                        ? 'bg-gradient-to-r from-gold-500 to-gold-400 text-space-950 border-gold-300 font-bold shadow'
                        : 'border-space-800 bg-space-950/40 hover:border-space-700 text-sm'
                    }`}
                  >
                    {z}
                  </button>
                ))}
              </div>

              <div className="flex justify-between pt-4 border-t border-space-800">
                <button onClick={handlePrevStep} className="text-xs text-foreground/50 hover:text-gold-400 hover:underline">Back</button>
              </div>
            </div>
          )}

          {/* Question 3: Occasion */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-gold-400">Step 3: Temporal Intent</span>
                <h2 className="font-serif text-3xl font-bold text-foreground mt-1">What is the occasion?</h2>
                <p className="text-sm text-foreground/60">Customizes packaging themes and gift cards.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'birthday', label: 'Birthday Celebration', desc: 'Featuring specific birth flowers' },
                  { key: 'anniversary', label: 'Milestone Anniversary', desc: 'Matching metal alignments' },
                  { key: 'solstice', label: 'Solstice or Equinox', desc: 'Limited edition natural dyes threads' },
                  { key: 'festival', label: 'Rakhi or Festive Drops', desc: 'Sacred red and gold protection threads' },
                  { key: 'healing', label: 'Healing & Spiritual Guidance', desc: 'Focus on therapeutic chakra crystals' },
                  { key: 'just-because', label: 'Thinking of You', desc: 'Simple heart-knotted surprise cords' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => {
                      setOccasion(item.key as any);
                      handleNextStep();
                    }}
                    className={`p-4 rounded-craft border text-left transition-all flex flex-col justify-between ${
                      occasion === item.key
                        ? 'border-gold-400 bg-gold-400/5'
                        : 'border-space-800 bg-space-950/40 hover:border-space-700'
                    }`}
                  >
                    <span className="font-serif text-base font-bold text-foreground">{item.label}</span>
                    <span className="text-xs text-foreground/50 mt-1">{item.desc}</span>
                  </button>
                ))}
              </div>

              <div className="flex justify-between pt-4 border-t border-space-800">
                <button onClick={handlePrevStep} className="text-xs text-foreground/50 hover:text-gold-400 hover:underline">Back</button>
              </div>
            </div>
          )}

          {/* Question 4: Preferred Style */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-gold-400">Step 4: Aesthetic Soul</span>
                <h2 className="font-serif text-3xl font-bold text-foreground mt-1">Which style reflects their soul?</h2>
                <p className="text-sm text-foreground/60">Selects thread color schemes and pendant designs.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { key: 'minimalist', label: 'Minimalist', desc: 'Thin cords, single crystal' },
                  { key: 'bold', label: 'Bold Accent', desc: 'Thick braids, multi-plated seals' },
                  { key: 'earthy', label: 'Earthy Organic', desc: 'Natural sage dyes, raw stone beads' },
                  { key: 'elegant', label: 'Classic Elegant', desc: 'Sterling silver drops and pearls' },
                  { key: 'spiritual', label: 'Spiritual Meaning', desc: 'Mandalas and sacred geometry' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => {
                      setStyle(item.key as any);
                      handleNextStep();
                    }}
                    className={`p-4 rounded-craft border text-left transition-all flex flex-col justify-between ${
                      style === item.key
                        ? 'border-gold-400 bg-gold-400/5'
                        : 'border-space-800 bg-space-950/40 hover:border-space-700'
                    }`}
                  >
                    <span className="font-serif text-base font-bold text-foreground">{item.label}</span>
                    <span className="text-xs text-foreground/50 mt-1">{item.desc}</span>
                  </button>
                ))}
              </div>

              <div className="flex justify-between pt-4 border-t border-space-800">
                <button onClick={handlePrevStep} className="text-xs text-foreground/50 hover:text-gold-400 hover:underline">Back</button>
              </div>
            </div>
          )}

          {/* Question 5: Budget */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-gold-400">Step 5: Budget Matrix</span>
                <h2 className="font-serif text-3xl font-bold text-foreground mt-1">What is your maximum budget?</h2>
                <p className="text-sm text-foreground/60">Helps rank recommendations within your spending goals.</p>
              </div>

              <div className="space-y-6">
                <div className="text-center font-serif text-4xl font-bold text-gold-400">
                  {formatPrice(budget, currency, language)}
                </div>
                <input
                  type="range"
                  min="500"
                  max="3000"
                  step="100"
                  value={budget}
                  onChange={(e) => setBudget(parseInt(e.target.value))}
                  className="w-full accent-gold-500 h-2 bg-space-950 rounded-lg appearance-none cursor-pointer border border-space-800"
                />
                <div className="flex justify-between text-xs text-foreground/45 font-bold">
                  <span>₹500</span>
                  <span>₹1,500</span>
                  <span>₹3,000+</span>
                </div>
              </div>

              <div className="flex justify-between pt-6 border-t border-space-800">
                <button onClick={handlePrevStep} className="text-xs text-foreground/50 hover:text-gold-400 hover:underline">Back</button>
                <button
                  onClick={handleSearchRecommendations}
                  disabled={loading}
                  className="bg-gradient-to-r from-gold-500 to-gold-400 text-space-950 px-6 py-2.5 rounded-craft text-sm font-bold hover:from-gold-400 hover:to-gold-300 transition-colors flex items-center gap-2 border border-gold-300 shadow"
                >
                  {loading ? 'Consulting AI Stylist...' : 'Find Celestial Match'}
                  <ArrowRight className="h-4 w-4 text-space-950" />
                </button>
              </div>
            </div>
          )}

          {/* Step 6: Recommendations Output */}
          {step === 6 && (
            <div className="space-y-8 animate-scale-in">
              <div className="space-y-2 text-center">
                <div className="inline-flex h-12 w-12 rounded-full bg-gold-400/10 items-center justify-center text-gold-400 mb-2 border border-gold-400/20">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h2 className="font-serif text-3xl font-bold text-foreground">
                  Your AI Curated Alignment Matches
                </h2>
                <p className="text-sm text-foreground/70 max-w-xl mx-auto">
                  Based on their {zodiac} energy, preferred {style} design, and the {occasion} intent, we recommend these personalized combos.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-craft text-xs text-red-400 flex gap-2 items-center">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recommendations.map((reco) => {
                  const paramString = new URLSearchParams({
                    zodiac,
                    metal: reco.customizationSuggestions.metalFinish || '',
                    thread: reco.customizationSuggestions.threadColor || '',
                    charm: reco.customizationSuggestions.charm || '',
                    engraving: reco.customizationSuggestions.engravingText || '',
                    packaging: reco.customizationSuggestions.packaging || '',
                    madeFor: recipient === 'self' ? 'self' : 'gift'
                  }).toString();

                  return (
                    <div
                      key={reco.productId}
                      className="p-6 bg-space-950/80 border border-space-800 rounded-craft flex flex-col justify-between space-y-4 shadow-sm hover:border-gold-400/50 transition-all duration-300"
                    >
                      <div className="space-y-3">
                        <div className="aspect-video w-full rounded-craft bg-space-900 overflow-hidden border border-space-850">
                          <img
                            src={zodiac ? `/images/zodiac/${zodiac.toLowerCase()}.png` : reco.imageUrl}
                            alt={reco.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h3 className="font-serif text-xl font-bold text-foreground">{reco.title}</h3>
                        <p className="text-xs text-foreground/75 leading-relaxed bg-space-900 p-3 rounded-craft border border-space-800 italic">
                          {reco.reason}
                        </p>
                        
                        {/* Customization Suggestions Preview */}
                        <div className="space-y-1 pt-2 border-t border-space-800">
                          <h4 className="text-[10px] uppercase font-extrabold text-gold-400 tracking-wider">AI Suggested Form Configuration:</h4>
                          <div className="text-[11px] text-foreground/70 space-y-0.5 mt-1 font-medium">
                            {reco.customizationSuggestions.threadColor && (
                              <p>• Thread: <span className="font-bold text-gold-400">{reco.customizationSuggestions.threadColor}</span></p>
                            )}
                            <p>• Metal Plating: {reco.customizationSuggestions.metalFinish}</p>
                            <p>• Emblem Charm: {reco.customizationSuggestions.charm}</p>
                            {reco.customizationSuggestions.engravingText && (
                              <p>• Engraving Text: &ldquo;{reco.customizationSuggestions.engravingText}&rdquo;</p>
                            )}
                            <p>• Box Style: {reco.customizationSuggestions.packaging}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-space-800">
                        <span className="font-serif text-lg font-bold text-gold-400">
                          {formatPrice(reco.price, currency, language)}
                        </span>
                        
                        {/* Link carrying prefilled query params directly to Customizer Page */}
                        <Link
                          href={`/product/${reco.productSlug}?${paramString}`}
                          className="bg-gradient-to-r from-gold-500 to-gold-400 text-space-950 text-xs font-bold px-4 py-2.5 rounded-craft hover:from-gold-400 hover:to-gold-300 transition-all flex items-center gap-1.5 shadow border border-gold-300"
                        >
                          One-Click Personalize
                          <ArrowRight className="h-3.5 w-3.5 text-space-950" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-center pt-6 border-t border-space-800">
                <button
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-gold-400 hover:underline"
                >
                  Restart Gift Quiz
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
