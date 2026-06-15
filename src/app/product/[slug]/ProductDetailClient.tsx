'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStore, formatPrice, CustomizationSelections } from '@/store/useStore';
import { Sparkles, Share2, Heart, Bookmark, Compass, Gift, Truck, Star, Check } from 'lucide-react';
import { ShippingService } from '@/lib/services/shipping';
import { MessagingService } from '@/lib/services/messaging';
import { getCelestialBody } from '@/lib/services/celestial';

const zodiacDetails: Record<string, { element: 'Fire' | 'Earth' | 'Air' | 'Water'; symbol: string; color: string; glow: string }> = {
  Aries: { element: 'Fire', symbol: '♈', color: '#EF4444', glow: 'rgba(239, 68, 68, 0.12)' },
  Taurus: { element: 'Earth', symbol: '♉', color: '#10B981', glow: 'rgba(16, 185, 129, 0.12)' },
  Gemini: { element: 'Air', symbol: '♊', color: '#F59E0B', glow: 'rgba(245, 158, 11, 0.12)' },
  Cancer: { element: 'Water', symbol: '♋', color: '#3B82F6', glow: 'rgba(59, 130, 246, 0.12)' },
  Leo: { element: 'Fire', symbol: '♌', color: '#F97316', glow: 'rgba(249, 115, 22, 0.12)' },
  Virgo: { element: 'Earth', symbol: '♍', color: '#059669', glow: 'rgba(5, 150, 105, 0.12)' },
  Libra: { element: 'Air', symbol: '♎', color: '#06B6D4', glow: 'rgba(6, 182, 212, 0.12)' },
  Scorpio: { element: 'Water', symbol: '♏', color: '#8B5CF6', glow: 'rgba(139, 92, 246, 0.12)' },
  Sagittarius: { element: 'Fire', symbol: '♐', color: '#EC4899', glow: 'rgba(236, 72, 153, 0.12)' },
  Capricorn: { element: 'Earth', symbol: '♑', color: '#78716C', glow: 'rgba(120, 113, 108, 0.12)' },
  Aquarius: { element: 'Air', symbol: '♒', color: '#0EA5E9', glow: 'rgba(14, 165, 233, 0.12)' },
  Pisces: { element: 'Water', symbol: '♓', color: '#6366F1', glow: 'rgba(99, 102, 241, 0.12)' },
};

const flowerIcons: Record<string, string> = {
  Carnation: '🌺',
  Violet: '💜',
  Daffodil: '💛',
  Daisy: '🌼',
  Hawthorn: '💮',
  Rose: '🌹',
  Delphinium: '💙',
  Chrysanthemum: '🏵️',
  'Water Lily': '🪷',
  Sunflower: '🌻',
  Lavender: '🪻',
  Orchid: '🌸',
  Lotus: '🪷'
};

interface ProductDetailClientProps {
  product: any;
  initialConfig: any;
}

export default function ProductDetailClient({ product, initialConfig }: ProductDetailClientProps) {
  const { addToCart, saveDesign, currency, language } = useStore();
  const searchParams = useSearchParams();

  // 1. Core Form Customization State
  const [madeFor, setMadeFor] = useState<'self' | 'gift'>('self');
  const [selectedZodiac, setSelectedZodiac] = useState('');
  const [selectedFlower, setSelectedFlower] = useState('');
  const [selectedSize, setSelectedSize] = useState(initialConfig.sizes?.[0]?.name || 'M');
  const [selectedMetal, setSelectedMetal] = useState(initialConfig.metals?.[0]?.name || 'Organic Cotton Thread');
  const [selectedThread, setSelectedThread] = useState(initialConfig.threadColors?.[0] || null);
  const [selectedCharm, setSelectedCharm] = useState(initialConfig.charms?.[0]?.name || 'None');
  const [engraving, setEngraving] = useState('');
  const [packaging, setPackaging] = useState(initialConfig.packaging?.[0]?.name || 'Standard Kraft Envelope');
  const [giftNote, setGiftNote] = useState('');
  const [rushMode, setRushMode] = useState(false);
  const [activeImage, setActiveImage] = useState(product.imageUrl || '/images/products/default.jpg');

  const allImages = useMemo(() => {
    const list = [product.imageUrl || '/images/products/default.jpg'];
    if (product.galleryUrls && Array.isArray(product.galleryUrls)) {
      product.galleryUrls.forEach((url: string) => {
        if (url && !list.includes(url)) list.push(url);
      });
    }
    return list;
  }, [product.imageUrl, product.galleryUrls]);

  useEffect(() => {
    setActiveImage(product.imageUrl || '/images/products/default.jpg');
  }, [product.imageUrl]);

  // AI Customizer state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStylingExplanation, setAiStylingExplanation] = useState('');

  const handleAICustomize = async () => {
    if (!aiPrompt.trim()) {
      alert('Please enter a description for the AI Stylist.');
      return;
    }
    setAiLoading(true);
    setAiStylingExplanation('');
    try {
      const response = await fetch('/api/ai-customize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          productTitle: product.title,
          productCategory: product.category.name,
          config: initialConfig
        })
      });
      const data = await response.json();
      if (data.success && data.customization) {
        const c = data.customization;
        if (c.zodiacSign) setSelectedZodiac(c.zodiacSign);
        if (c.birthFlower) setSelectedFlower(c.birthFlower);
        if (c.size) setSelectedSize(c.size);

        // Robust base material / metal mapping
        const metalVal = c.metalFinish || c.material || c.metal;
        if (metalVal) {
          const match = initialConfig.metals?.find(
            (m: any) => m.name.toLowerCase() === metalVal.toLowerCase()
          );
          if (match) setSelectedMetal(match.name);
        }

        // Robust thread color mapping
        const colorName = c.threadColorName || c.threadColor;
        if (colorName) {
          const match = initialConfig.threadColors?.find(
            (t: any) => t.name.toLowerCase() === colorName.toLowerCase()
          );
          if (match) setSelectedThread(match);
        }

        // Robust charm mapping
        const charmVal = c.charm || c.charmPendant;
        if (charmVal) {
          const match = initialConfig.charms?.find(
            (ch: any) => ch.name.toLowerCase() === charmVal.toLowerCase()
          );
          if (match) setSelectedCharm(match.name);
        }

        // Robust engraving
        const engravingVal = c.engravingText || c.engraving;
        if (engravingVal) setEngraving(engravingVal.toUpperCase().slice(0, 12));

        // Robust packaging
        if (c.packaging) {
          const match = initialConfig.packaging?.find(
            (p: any) => p.name.toLowerCase() === c.packaging.toLowerCase()
          );
          if (match) setPackaging(match.name);
        }

        if (c.madeFor) setMadeFor(c.madeFor);
        if (c.giftNote) setGiftNote(c.giftNote);
        if (c.stylingExplanation) setAiStylingExplanation(c.stylingExplanation);
      } else {
        alert('AI Stylist could not align your elements. Please try another description.');
      }
    } catch (e) {
      console.error(e);
      alert('Error contacting AI Stylist. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  // Parse query params on load to pre-populate customizer options
  useEffect(() => {
    const zodiacParam = searchParams.get('zodiac');
    const metalParam = searchParams.get('metal');
    const threadParam = searchParams.get('thread');
    const charmParam = searchParams.get('charm');
    const engravingParam = searchParams.get('engraving');
    const packagingParam = searchParams.get('packaging');
    const madeForParam = searchParams.get('madeFor');

    if (zodiacParam) setSelectedZodiac(zodiacParam);
    if (metalParam) {
      const match = initialConfig.metals?.find((m: any) => m.name.toLowerCase() === metalParam.toLowerCase());
      if (match) setSelectedMetal(match.name);
    }
    if (threadParam) {
      const match = initialConfig.threadColors?.find((t: any) => t.name.toLowerCase() === threadParam.toLowerCase());
      if (match) setSelectedThread(match);
    }
    if (charmParam) {
      const match = initialConfig.charms?.find((c: any) => c.name.toLowerCase() === charmParam.toLowerCase());
      if (match) setSelectedCharm(match.name);
    }
    if (engravingParam) setEngraving(engravingParam.slice(0, 12));
    if (packagingParam) {
      const match = initialConfig.packaging?.find((p: any) => p.name.toLowerCase() === packagingParam.toLowerCase());
      if (match) setPackaging(match.name);
    }
    if (madeForParam === 'gift') setMadeFor('gift');
  }, [searchParams, initialConfig]);

  useEffect(() => {
    // Lock background to this product's celestial body on mount
    window.dispatchEvent(new CustomEvent('celestial-focus', { detail: { slug: product.slug } }));
    return () => {
      // Clear focus on unmount
      window.dispatchEvent(new CustomEvent('celestial-focus', { detail: null }));
    };
  }, [product.slug]);




  // Review states
  const [activeTab, setActiveTab] = useState<'customize' | 'reviews'>('customize');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewBody, setNewReviewBody] = useState('');
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [reviewsList, setReviewsList] = useState<any[]>(product.reviews || []);
  const [reviewSubmittedMessage, setReviewSubmittedMessage] = useState('');

  // 2. Pricing calculation helpers
  const calculatedPrice = useMemo(() => {
    let price = product.price;

    // Base material modifier
    if (selectedMetal === 'Pure Merino Wool') price += 150;
    if (selectedMetal === 'Organic Bamboo Silk') price += 250;

    // Charm modifier
    if (selectedCharm === 'Mini Zodiac Disc') price += 150;
    if (selectedCharm === 'Birth Flower Pendant') price += 180;
    if (selectedCharm === 'Tiny Sacred Lotus') price += 120;

    // Packaging modifier
    if (packaging === 'Premium Wooden Zodiac Keepsake Box') price += 199;

    return price;
  }, [product.price, selectedMetal, selectedCharm, packaging]);

  // 3. Shipping timeline helper
  const deliveryETA = useMemo(() => {
    const quote = ShippingService.calculateShippingQuote(
      { street: '', city: '', state: '', postalCode: '302001', country: 'IN' },
      calculatedPrice,
      rushMode
    );
    return {
      dateStr: quote.deliveryDate.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }),
      days: quote.estimatedDays,
      crafting: quote.craftingDays
    };
  }, [calculatedPrice, rushMode, language]);

  // 4. Zodiac compat stories
  const activeZodiacStory = useMemo(() => {
    if (!selectedZodiac) return '';
    return product.zodiacMappings?.find((m: any) => m.zodiacSign === selectedZodiac)?.storyText || '';
  }, [selectedZodiac, product.zodiacMappings]);

  // 5. Actions
  const handleAddToCart = () => {
    const customization: CustomizationSelections = {
      zodiacSign: selectedZodiac || undefined,
      birthFlower: selectedFlower || undefined,
      size: selectedSize,
      metalFinish: selectedMetal,
      threadColor: selectedThread ? selectedThread.hex : undefined,
      charm: selectedCharm,
      engravingText: engraving || undefined,
      packaging,
      giftNote: madeFor === 'gift' ? giftNote : undefined,
      madeFor
    };

    addToCart({
      productId: product.id,
      title: product.title,
      imageUrl: product.imageUrl,
      price: product.price,
      customPrice: calculatedPrice,
      quantity: 1,
      customization
    });
    alert('Added customized item to basket!');
  };

  const handleSaveDraft = () => {
    const customization: CustomizationSelections = {
      zodiacSign: selectedZodiac || undefined,
      birthFlower: selectedFlower || undefined,
      size: selectedSize,
      metalFinish: selectedMetal,
      threadColor: selectedThread ? selectedThread.hex : undefined,
      charm: selectedCharm,
      engravingText: engraving || undefined,
      packaging,
      giftNote: madeFor === 'gift' ? giftNote : undefined,
      madeFor
    };

    saveDesign(product.id, `${product.title} Draft - ${selectedZodiac || 'Custom'}`, customization);
    alert('Design draft saved in Account area!');
  };

  const handleShareDesign = () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const whatsappLink = MessagingService.getShareLink(
      `${product.title} (${selectedZodiac || 'Custom'})`,
      shareUrl
    );
    window.open(whatsappLink, '_blank');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewBody || !newReviewTitle) {
      alert('Please fill out review title and content.');
      return;
    }

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          userId: 'buyer-luna-id', // Seed user ID
          rating: newReviewRating,
          title: newReviewTitle,
          body: newReviewBody,
          customizationSummary: `Thread: ${selectedThread?.name || 'None'}, Metal: ${selectedMetal}, Charm: ${selectedCharm}`
        })
      });

      const data = await response.json();
      if (data.success) {
        setReviewSubmittedMessage('Review submitted successfully! It will appear after moderation.');
        setNewReviewTitle('');
        setNewReviewBody('');
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Network review post error');
    }
  };

  const categorySlug = product.category?.slug || '';

  // Category-specific high-fidelity SVG mockup renderers
  const renderBraceletSVG = () => {
    const threadColor = selectedThread?.hex || '#d4af37';
    const elementGlow = selectedZodiac ? (zodiacDetails[selectedZodiac]?.glow || 'rgba(212, 175, 55, 0.12)') : 'rgba(212, 175, 55, 0.05)';
    const glowColor = selectedZodiac ? (zodiacDetails[selectedZodiac]?.color || '#d4af37') : '#d4af37';
    
    let strokeWidth = 8;
    let strokeDasharray = undefined;
    let doubleStrand = false;
    let woolFuzz = false;

    if (selectedMetal === 'Pure Merino Wool') {
      strokeWidth = 11;
      woolFuzz = true;
    } else if (selectedMetal === 'Organic Bamboo Silk') {
      strokeWidth = 3.5;
      doubleStrand = true;
    } else {
      strokeDasharray = "5, 3";
    }

    return (
      <svg viewBox="0 0 400 400" className="w-full h-full max-h-[350px] drop-shadow-[0_0_20px_rgba(0,0,0,0.6)]">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="fuzz" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE082" />
            <stop offset="30%" stopColor="#FFD54F" />
            <stop offset="70%" stopColor="#FFB300" />
            <stop offset="100%" stopColor="#FF8F00" />
          </linearGradient>
        </defs>

        {/* Ambient Element Glow */}
        <circle cx="200" cy="180" r="120" fill={elementGlow} filter="url(#glow)" className="transition-all duration-700" />

        {/* Bracelet cords */}
        {doubleStrand ? (
          <g className="transition-all duration-500">
            <circle cx="200" cy="180" r="102" fill="none" stroke={threadColor} strokeWidth={strokeWidth} />
            <circle cx="200" cy="180" r="92" fill="none" stroke={threadColor} strokeWidth={strokeWidth} />
          </g>
        ) : (
          <circle 
            cx="200" 
            cy="180" 
            r="97" 
            fill="none" 
            stroke={threadColor} 
            strokeWidth={strokeWidth} 
            strokeDasharray={strokeDasharray}
            filter={woolFuzz ? "url(#fuzz)" : undefined}
            className="transition-all duration-500" 
          />
        )}

        {/* Outer beads */}
        <circle cx="103" cy="180" r="7" fill="url(#goldGrad)" />
        <circle cx="297" cy="180" r="7" fill="url(#goldGrad)" />
        <circle cx="200" cy="83" r="8" fill="url(#goldGrad)" />
        
        {selectedZodiac && (
          <g className="transition-all duration-500">
            <circle cx="135" cy="115" r="6" fill={glowColor} />
            <circle cx="265" cy="115" r="6" fill={glowColor} />
          </g>
        )}

        {/* Connector ring */}
        <rect x="195" y="265" width="10" height="15" rx="3" fill="url(#goldGrad)" />
        <circle cx="200" cy="280" r="5" fill="none" stroke="url(#goldGrad)" strokeWidth="2.5" />

        {/* Charm disc */}
        {selectedCharm !== 'None' ? (
          <g className="animate-fade-in transition-all duration-500">
            <circle cx="200" cy="312" r="26" fill="url(#goldGrad)" stroke="#FFB300" strokeWidth="1" />
            <circle cx="200" cy="312" r="22" fill="none" stroke="#FFE082" strokeWidth="1" strokeDasharray="2,2" />

            {/* Unicode Zodiac/Flower/Lotus Icon */}
            <text x="200" y="318" textAnchor="middle" fill="#5D4037" fontSize="18" fontWeight="bold" fontFamily="serif">
              {selectedCharm === 'Mini Zodiac Disc' && (selectedZodiac ? zodiacDetails[selectedZodiac]?.symbol : '♈')}
              {selectedCharm === 'Birth Flower Pendant' && (selectedFlower ? (flowerIcons[selectedFlower] || '🌸') : '🌸')}
              {selectedCharm === 'Tiny Sacred Lotus' && '🪷'}
            </text>

            {/* Curved text for custom engraving */}
            {engraving && (
              <g transform="translate(200, 312)">
                <path id="engravePath" d="M -18 10 A 18 18 0 0 0 18 10" fill="none" />
                <text fontSize="6" fontWeight="bold" fill="#3E2723" letterSpacing="0.8" fontFamily="monospace">
                  <textPath href="#engravePath" startOffset="50%" textAnchor="middle">
                    {engraving}
                  </textPath>
                </text>
              </g>
            )}
          </g>
        ) : (
          /* Simple small knot finish when no charm is selected */
          <circle cx="200" cy="292" r="4" fill="url(#goldGrad)" />
        )}
      </svg>
    );
  };

  const renderEarringSVG = () => {
    const elementGlow = selectedZodiac ? (zodiacDetails[selectedZodiac]?.glow || 'rgba(212, 175, 55, 0.12)') : 'rgba(212, 175, 55, 0.05)';
    const glowColor = selectedZodiac ? (zodiacDetails[selectedZodiac]?.color || '#d4af37') : '#d4af37';
    
    return (
      <svg viewBox="0 0 400 400" className="w-full h-full max-h-[350px] drop-shadow-[0_0_20px_rgba(0,0,0,0.6)]">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE082" />
            <stop offset="50%" stopColor="#FFB300" />
            <stop offset="100%" stopColor="#FF8F00" />
          </linearGradient>
        </defs>

        <circle cx="200" cy="180" r="120" fill={elementGlow} filter="url(#glow)" />

        {/* Left Earring */}
        <g transform="translate(130, 40)">
          <path d="M 50 50 Q 50 15 30 15 Q 15 15 15 35" fill="none" stroke="url(#goldGrad)" strokeWidth="2.5" />
          <line x1="50" y1="50" x2="50" y2="130" stroke="url(#goldGrad)" strokeWidth="2.5" />
          
          {/* Crystal Quartz chip polygon */}
          <polygon points="42,130 58,130 62,175 50,205 38,175" fill="#E2E8F0" stroke="#B0BEC5" strokeWidth="1" opacity="0.9" />
          <circle cx="50" cy="210" r="3.5" fill="none" stroke="url(#goldGrad)" strokeWidth="2" />
          
          {selectedCharm !== 'None' && (
            <g transform="translate(50, 230)">
              <circle cx="0" cy="0" r="18" fill="url(#goldGrad)" stroke="#FFB300" strokeWidth="1" />
              <text x="0" y="5" textAnchor="middle" fill="#5D4037" fontSize="12" fontWeight="bold">
                {selectedCharm === 'Mini Zodiac Disc' && (selectedZodiac ? zodiacDetails[selectedZodiac]?.symbol : '♈')}
                {selectedCharm === 'Birth Flower Pendant' && (selectedFlower ? (flowerIcons[selectedFlower] || '🌸') : '🌸')}
                {selectedCharm === 'Tiny Sacred Lotus' && '🪷'}
              </text>
              {engraving && (
                <text x="0" y="13" textAnchor="middle" fill="#3E2723" fontSize="4.5" fontWeight="bold" fontFamily="monospace">
                  {engraving.slice(0, 5)}
                </text>
              )}
            </g>
          )}
        </g>

        {/* Right Earring */}
        <g transform="translate(230, 40)">
          <path d="M 50 50 Q 50 15 30 15 Q 15 15 15 35" fill="none" stroke="url(#goldGrad)" strokeWidth="2.5" />
          <line x1="50" y1="50" x2="50" y2="130" stroke="url(#goldGrad)" strokeWidth="2.5" />
          
          {/* Crystal Quartz chip */}
          <polygon points="43,128 57,132 60,172 50,208 40,178" fill="#E2E8F0" stroke="#B0BEC5" strokeWidth="1" opacity="0.9" />
          <circle cx="50" cy="210" r="3.5" fill="none" stroke="url(#goldGrad)" strokeWidth="2" />
          
          {selectedCharm !== 'None' && (
            <g transform="translate(50, 230)">
              <circle cx="0" cy="0" r="18" fill="url(#goldGrad)" stroke="#FFB300" strokeWidth="1" />
              <text x="0" y="5" textAnchor="middle" fill="#5D4037" fontSize="12" fontWeight="bold">
                {selectedCharm === 'Mini Zodiac Disc' && (selectedZodiac ? zodiacDetails[selectedZodiac]?.symbol : '♈')}
                {selectedCharm === 'Birth Flower Pendant' && (selectedFlower ? (flowerIcons[selectedFlower] || '🌸') : '🌸')}
                {selectedCharm === 'Tiny Sacred Lotus' && '🪷'}
              </text>
              {engraving && (
                <text x="0" y="13" textAnchor="middle" fill="#3E2723" fontSize="4.5" fontWeight="bold" fontFamily="monospace">
                  {engraving.slice(0, 5)}
                </text>
              )}
            </g>
          )}
        </g>
      </svg>
    );
  };

  const renderGiftSetSVG = () => {
    const threadColor = selectedThread?.hex || '#d4af37';
    const elementGlow = selectedZodiac ? (zodiacDetails[selectedZodiac]?.glow || 'rgba(212, 175, 55, 0.12)') : 'rgba(212, 175, 55, 0.05)';
    
    return (
      <svg viewBox="0 0 400 400" className="w-full h-full max-h-[350px] drop-shadow-[0_0_20px_rgba(0,0,0,0.6)]">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="woodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8D6E63" />
            <stop offset="50%" stopColor="#5D4037" />
            <stop offset="100%" stopColor="#3E2723" />
          </linearGradient>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE082" />
            <stop offset="50%" stopColor="#FFB300" />
            <stop offset="100%" stopColor="#FF8F00" />
          </linearGradient>
        </defs>

        <circle cx="200" cy="180" r="120" fill={elementGlow} filter="url(#glow)" />

        {/* Wooden Gift Box */}
        <rect x="70" y="70" width="260" height="260" rx="8" fill="url(#woodGrad)" stroke="#271510" strokeWidth="4" />
        <rect x="82" y="82" width="236" height="236" rx="4" fill="#271510" opacity="0.5" />

        {/* Box divider lines */}
        <line x1="70" y1="195" x2="330" y2="195" stroke="#271510" strokeWidth="3" />
        <line x1="200" y1="195" x2="200" y2="330" stroke="#271510" strokeWidth="3" />

        {/* Top compartment: customized thread bracelet */}
        <g transform="translate(200, 132) scale(0.55)">
          <circle cx="0" cy="0" r="90" fill="none" stroke={threadColor} strokeWidth="8" strokeDasharray="5,3" />
          <circle cx="-90" cy="0" r="6" fill="url(#goldGrad)" />
          <circle cx="90" cy="0" r="6" fill="url(#goldGrad)" />
          <circle cx="0" cy="-90" r="8" fill="url(#goldGrad)" />
          {selectedCharm !== 'None' && (
            <g transform="translate(0, 90)">
              <circle cx="0" cy="12" r="22" fill="url(#goldGrad)" stroke="#FFB300" strokeWidth="1" />
              <text x="0" y="18" textAnchor="middle" fill="#5D4037" fontSize="16" fontWeight="bold">
                {selectedCharm === 'Mini Zodiac Disc' && (selectedZodiac ? zodiacDetails[selectedZodiac]?.symbol : '♈')}
                {selectedCharm === 'Birth Flower Pendant' && (selectedFlower ? (flowerIcons[selectedFlower] || '🌸') : '🌸')}
                {selectedCharm === 'Tiny Sacred Lotus' && '🪷'}
              </text>
            </g>
          )}
        </g>

        {/* Bottom Left: Custom element candle */}
        <g transform="translate(135, 262)">
          <rect x="-24" y="-24" width="48" height="48" rx="4" fill="#ECEFF1" stroke="#CFD8DC" strokeWidth="1.5" />
          <ellipse cx="0" cy="-24" rx="24" ry="8" fill="#ECEFF1" stroke="#CFD8DC" strokeWidth="1" />
          <line x1="0" y1="-24" x2="0" y2="-32" stroke="#37474F" strokeWidth="1.5" />
          
          {/* Flame */}
          <path d="M 0 -32 Q 5 -42 0 -54 Q -5 -42 0 -32" fill="#FF9100" />
          <path d="M 0 -32 Q 2 -37 0 -45 Q -2 -37 0 -32" fill="#FFD600" />
          
          <rect x="-16" y="-12" width="32" height="22" rx="2" fill="#FFF8E1" stroke="#FFE082" />
          <text x="0" y="-3" textAnchor="middle" fill="#5D4037" fontSize="7" fontWeight="bold">
            {selectedZodiac ? zodiacDetails[selectedZodiac]?.element : 'COSMOS'}
          </text>
          <text x="0" y="6" textAnchor="middle" fill="#5D4037" fontSize="5">
            ELEMENT
          </text>
        </g>

        {/* Bottom Right: flower card */}
        <g transform="translate(265, 262) rotate(-3)">
          <rect x="-28" y="-36" width="56" height="72" rx="4" fill="#FFF9C4" stroke="#FFF59D" strokeWidth="1.5" />
          <rect x="-24" y="-32" width="48" height="64" fill="none" stroke="#FFF176" strokeWidth="0.8" strokeDasharray="2,2" />
          <circle cx="0" cy="-8" r="8" fill="none" stroke="#F472B6" strokeWidth="1.2" />
          <path d="M 0 -16 Q 4 -24 0 -28 Q -4 -24 0 -16" fill="none" stroke="#F472B6" strokeWidth="1.2" />
          <path d="M 0 0 C 8 8 0 16 0 24" fill="none" stroke="#4CAF50" strokeWidth="1.2" />
          <text x="0" y="16" textAnchor="middle" fill="#5D4037" fontSize="6" fontWeight="bold">
            {selectedFlower || 'COSMIC FLOW'}
          </text>
        </g>

        {/* Wood engraving banner */}
        {engraving && (
          <g transform="translate(200, 310)">
            <rect x="-42" y="-8" width="84" height="16" rx="3" fill="#3E2723" stroke="#271510" strokeWidth="1" />
            <text x="0" y="3" textAnchor="middle" fill="#FFE082" fontSize="7" fontWeight="bold" fontFamily="serif" letterSpacing="1.5">
              {engraving}
            </text>
          </g>
        )}
      </svg>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 relative z-10">
      {/* Product Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-gold-400">Astrological Alignment</span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mt-1">{product.title}</h1>
          <p className="text-xs text-foreground/50 mt-1 uppercase tracking-wider">{product.category.name}</p>
        </div>
        <div className="flex items-center gap-3 bg-space-900/80 border border-gold-500/25 p-4 rounded-craft shadow-tactile max-w-sm backdrop-blur">
          <div className="text-3xl animate-spin-slow flex-shrink-0">{getCelestialBody(product.slug).icon}</div>
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-gold-400">Resonant Body: {getCelestialBody(product.slug).name}</div>
            <div className="text-[10px] text-foreground/75 leading-relaxed">{getCelestialBody(product.slug).description}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Left Column: Visual Preview Panel */}
        <div className="space-y-6 lg:sticky lg:top-24">
          <div className="relative aspect-square rounded-craft border border-space-800 bg-space-900/60 overflow-hidden shadow-tactile flex items-center justify-center backdrop-blur-md">
            <img
              src={activeImage}
              alt={product.title}
              className="w-full h-full object-cover transition-all duration-300 rounded-craft"
            />
            {/* Subtle vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-space-950/20 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Gallery Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex flex-wrap gap-3 justify-center">
              {allImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(imgUrl)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border transition-all duration-300 ${
                    activeImage === imgUrl
                      ? 'border-gold-400 shadow-md scale-105'
                      : 'border-space-800 hover:border-gold-400/50'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`${product.title} gallery thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Social Commerce & Draft Shares */}
          <div className="flex gap-4">
            <button
              onClick={handleSaveDraft}
              className="flex-1 border border-space-800 bg-space-900/60 py-3 rounded-craft font-semibold text-foreground hover:bg-space-850 transition-colors flex items-center justify-center gap-2 text-sm backdrop-blur"
            >
              <Bookmark className="h-4 w-4 text-gold-400" />
              Save Design Draft
            </button>
            <button
              onClick={handleShareDesign}
              className="flex-1 border border-space-800 bg-space-900/60 py-3 rounded-craft font-semibold text-foreground hover:bg-space-850 transition-colors flex items-center justify-center gap-2 text-sm backdrop-blur"
            >
              <Share2 className="h-4 w-4 text-cyan-400" />
              Share Configuration
            </button>
          </div>
        </div>

        {/* Right Column: Customization Controls Panel */}
        <div className="space-y-8 bg-space-900/60 border border-space-800 rounded-craft p-6 sm:p-8 shadow-tactile backdrop-blur">
          
          {/* Navigation Tabs (Form vs Reviews) */}
          <div className="flex border-b border-space-800">
            <button
              onClick={() => setActiveTab('customize')}
              className={`flex-1 pb-4 text-center font-serif text-lg font-bold border-b-2 transition-colors ${
                activeTab === 'customize' ? 'border-gold-400 text-gold-400' : 'border-transparent text-foreground/60'
              }`}
            >
              Customize Product
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 pb-4 text-center font-serif text-lg font-bold border-b-2 transition-colors ${
                activeTab === 'reviews' ? 'border-gold-400 text-gold-400' : 'border-transparent text-foreground/60'
              }`}
            >
              Artisan Reviews ({reviewsList.length})
            </button>
          </div>

          {activeTab === 'customize' ? (
            <div className="space-y-6">
              
              {/* AI Celestial Customizer Card */}
              <div className="p-5 bg-space-950/80 border border-gold-500/20 rounded-craft space-y-3 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 h-16 w-16 bg-gold-400/5 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-gold-400 animate-pulse" />
                  <h3 className="font-serif text-sm font-bold text-foreground">✨ AI Celestial Customizer</h3>
                </div>
                <p className="text-[11px] text-foreground/75 leading-relaxed">
                  Describe the recipient, occasion, element style (e.g. &ldquo;earthy&rdquo;, &ldquo;spiritual&rdquo;) or intention. The AI Concierge will automatically configure the threads and select compatible zodiac pairings for you.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="E.g., A protective bracelet for my Scorpio partner who loves indigo..."
                    className="flex-grow bg-space-900 border border-space-700 rounded-craft px-3 py-2 text-xs focus:outline-none focus:border-gold-400 text-foreground placeholder:text-foreground/45"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAICustomize();
                    }}
                  />
                  <button
                    onClick={handleAICustomize}
                    disabled={aiLoading}
                    className="bg-gradient-to-r from-gold-500 to-gold-400 text-space-950 text-xs font-bold px-4 py-2 rounded-craft hover:from-gold-400 hover:to-gold-300 disabled:opacity-50 transition-all flex items-center gap-1 flex-shrink-0 shadow"
                  >
                    {aiLoading ? 'Aligning...' : 'Personalize'}
                  </button>
                </div>
                {aiStylingExplanation && (
                  <div className="p-3 bg-space-900 border border-space-850 rounded-craft text-[11px] text-foreground/80 leading-relaxed italic animate-fade-in flex gap-2">
                    <Sparkles className="h-4 w-4 text-gold-400 flex-shrink-0 mt-0.5" />
                    <span>{aiStylingExplanation}</span>
                  </div>
                )}
              </div>

              {/* Made For Selector */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground/60">Made For</span>
                <div className="flex gap-4">
                  <button
                    onClick={() => setMadeFor('self')}
                    className={`flex-1 py-2.5 rounded-craft border text-sm font-semibold transition-colors ${
                      madeFor === 'self'
                        ? 'bg-gradient-to-r from-gold-500 to-gold-400 text-space-950 border-gold-400 font-bold'
                        : 'border-space-750 text-foreground hover:bg-space-800'
                    }`}
                  >
                    Self
                  </button>
                  <button
                    onClick={() => setMadeFor('gift')}
                    className={`flex-1 py-2.5 rounded-craft border text-sm font-semibold transition-colors ${
                      madeFor === 'gift'
                        ? 'bg-gradient-to-r from-gold-500 to-gold-400 text-space-950 border-gold-400 font-bold'
                        : 'border-space-750 text-foreground hover:bg-space-800'
                    }`}
                  >
                    Gift (Handwritten card)
                  </button>
                </div>
              </div>

              {/* Zodiac Mapping Selection */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground/60">Zodiac Sign Mapping</span>
                  <span className="text-[10px] text-gold-400 font-semibold">Optional</span>
                </div>
                <select
                  value={selectedZodiac}
                  onChange={(e) => setSelectedZodiac(e.target.value)}
                  className="w-full bg-space-950 border border-space-700 text-foreground rounded-craft p-2.5 text-sm focus:outline-none"
                >
                  <option value="" className="bg-space-950">No Zodiac Alignment</option>
                  {['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'].map((z) => (
                    <option key={z} value={z} className="bg-space-950">{z}</option>
                  ))}
                </select>

                {/* Astrological Story Explainer (Central Promise) */}
                {activeZodiacStory && (
                  <div className="p-3.5 bg-space-950 border border-space-800 rounded-craft text-xs text-foreground/80 leading-relaxed flex gap-2">
                    <Sparkles className="h-4 w-4 text-gold-400 flex-shrink-0 mt-0.5" />
                    <span>{activeZodiacStory}</span>
                  </div>
                )}
              </div>

              {/* Birth Flower Selector */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground/60">Birth Flower mapping</span>
                  <span className="text-[10px] text-gold-400 font-semibold">Optional</span>
                </div>
                <select
                  value={selectedFlower}
                  onChange={(e) => setSelectedFlower(e.target.value)}
                  className="w-full bg-space-950 border border-space-700 text-foreground rounded-craft p-2.5 text-sm focus:outline-none"
                >
                  <option value="" className="bg-space-950">No Birth Flower</option>
                  {['Carnation', 'Violet', 'Daffodil', 'Daisy', 'Hawthorn', 'Rose', 'Delphinium', 'Chrysanthemum'].map((f) => (
                    <option key={f} value={f} className="bg-space-950">{f}</option>
                  ))}
                </select>
              </div>

              {/* Thread Color Selections (With meanings) */}
              {initialConfig.threadColors && initialConfig.threadColors.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground/60">Thread & Color Meanings</span>
                  <div className="flex flex-wrap gap-3">
                    {initialConfig.threadColors.map((color: any) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedThread(color)}
                        className={`h-8 w-8 rounded-full border-2 transition-all relative flex items-center justify-center ${
                          selectedThread?.name === color.name ? 'border-gold-400 ring-2 ring-gold-400/20 scale-105' : 'border-transparent'
                        }`}
                        title={`${color.name}: ${color.meaning}`}
                      >
                        <span className="h-6 w-6 rounded-full inline-block border border-white/10" style={{ backgroundColor: color.hex }} />
                        {selectedThread?.name === color.name && (
                          <Check className="h-3 w-3 absolute text-white" />
                        )}
                      </button>
                    ))}
                  </div>
                  {selectedThread && (
                    <p className="text-[10px] text-gold-400 font-semibold italic">
                      {selectedThread.name}: {selectedThread.meaning}
                    </p>
                  )}
                </div>
              )}

              {/* Base Cord Material options */}
              {initialConfig.metals && initialConfig.metals.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground/60">Base Cord Material</span>
                  <div className="grid grid-cols-3 gap-2">
                    {initialConfig.metals.map((metal: any) => (
                      <button
                        key={metal.name}
                        onClick={() => setSelectedMetal(metal.name)}
                        className={`py-2 rounded-craft border text-xs font-semibold transition-colors ${
                          selectedMetal === metal.name
                            ? 'bg-gradient-to-r from-gold-500 to-gold-400 text-space-950 border-gold-400 font-bold'
                            : 'border-space-750 text-foreground hover:bg-space-800'
                        }`}
                      >
                        <div>{metal.name}</div>
                        {metal.priceModifier > 0 && (
                          <div className="text-[9px] opacity-75">+{formatPrice(metal.priceModifier, currency, language)}</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Charm Selection */}
              {initialConfig.charms && initialConfig.charms.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground/60">Charm & Emblem Add-on</span>
                  <div className="grid grid-cols-2 gap-2">
                    {initialConfig.charms.map((charm: any) => (
                      <button
                        key={charm.name}
                        onClick={() => setSelectedCharm(charm.name)}
                        className={`py-2 rounded-craft border text-xs font-semibold transition-colors ${
                          selectedCharm === charm.name
                            ? 'bg-gradient-to-r from-gold-500 to-gold-400 text-space-950 border-gold-400 font-bold'
                            : 'border-space-750 text-foreground hover:bg-space-800'
                        }`}
                      >
                        <div>{charm.name}</div>
                        {charm.priceModifier > 0 && (
                          <div className="text-[9px] opacity-75">+{formatPrice(charm.priceModifier, currency, language)}</div>
                        )}
                      </button>
                    ))}
                  </div>
                  {selectedCharm !== 'None' && (
                    <p className="text-[10px] text-gold-400/80 font-medium italic mt-1 leading-relaxed bg-space-950/40 p-2 rounded-craft border border-space-800/40">
                      {selectedCharm === 'Mini Zodiac Disc' && `Adds a 12mm polished gold disc engraved with the ${selectedZodiac || 'selected'} Zodiac astrological symbol.`}
                      {selectedCharm === 'Birth Flower Pendant' && `Adds a delicate botanical pendant engraved with the ${selectedFlower || 'selected'} Birth Flower motif.`}
                      {selectedCharm === 'Tiny Sacred Lotus' && "Adds a 10mm sacred lotus charm representing purity, spiritual alignment, and rebirth."}
                    </p>
                  )}
                </div>
              )}

              {/* Initials Engraving */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground/60">Initials Engraving (Max 12 Chars)</span>
                  <span className="text-[10px] text-foreground/50">{engraving.length}/12</span>
                </div>
                <input
                  type="text"
                  maxLength={12}
                  value={engraving}
                  onChange={(e) => setEngraving(e.target.value.toUpperCase())}
                  placeholder="E.g., LOVE, LUNA"
                  className="w-full bg-space-950 border border-space-700 text-foreground rounded-craft p-2.5 text-sm focus:outline-none focus:border-gold-400"
                />
              </div>

              {/* Gift Packaging & Note */}
              <div className="space-y-2 border-t border-space-800 pt-4">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground/60">Gift Packaging Style</span>
                <select
                  value={packaging}
                  onChange={(e) => setPackaging(e.target.value)}
                  className="w-full bg-space-950 border border-space-700 text-foreground rounded-craft p-2.5 text-sm focus:outline-none"
                >
                  {initialConfig.packaging.map((pack: any) => (
                    <option key={pack.name} value={pack.name} className="bg-space-950">
                      {pack.name} {pack.priceModifier > 0 ? `(+${formatPrice(pack.priceModifier, currency, language)})` : ''}
                    </option>
                  ))}
                </select>
                
                {madeFor === 'gift' && (
                  <div className="space-y-2 mt-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground/60">Handwritten Note</span>
                    <textarea
                      rows={3}
                      value={giftNote}
                      onChange={(e) => setGiftNote(e.target.value)}
                      placeholder="Write your emotional alignment intent note..."
                      className="w-full bg-space-950 border border-space-700 text-foreground rounded-craft p-2.5 text-sm focus:outline-none focus:border-gold-400"
                    />
                  </div>
                )}
              </div>

              {/* Rush Order Toggle */}
              <div className="flex items-center justify-between border-t border-space-800 pt-4">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-foreground">Rush Handcrafting Mode</span>
                  <span className="text-[10px] text-foreground/60 font-semibold">Craft in 1 day instead of 3 (+{formatPrice(250, currency, language)})</span>
                </div>
                <input
                  type="checkbox"
                  checked={rushMode}
                  onChange={(e) => setRushMode(e.target.checked)}
                  className="rounded border-space-700 text-gold-500 focus:ring-gold-500 bg-space-950 h-4 w-4"
                />
              </div>

              {/* Live Recalculation Summary */}
              <div className="p-4 bg-space-950/80 border border-space-800 rounded-craft space-y-2">
                <div className="flex justify-between text-xs text-foreground/75">
                  <span>Base Price</span>
                  <span>{formatPrice(product.price, currency, language)}</span>
                </div>
                {selectedMetal !== 'Organic Cotton Thread' && (
                  <div className="flex justify-between text-xs text-foreground/75">
                    <span>Base Cord Material ({selectedMetal})</span>
                    <span>+{formatPrice(selectedMetal === 'Pure Merino Wool' ? 150 : 250, currency, language)}</span>
                  </div>
                )}
                {selectedCharm !== 'None' && (
                  <div className="flex justify-between text-xs text-foreground/75">
                    <span>Charm add-on ({selectedCharm})</span>
                    <span>+{formatPrice(selectedCharm === 'Mini Zodiac Disc' ? 150 : selectedCharm === 'Birth Flower Pendant' ? 180 : 120, currency, language)}</span>
                  </div>
                )}
                {packaging === 'Premium Wooden Zodiac Keepsake Box' && (
                  <div className="flex justify-between text-xs text-foreground/75">
                    <span>Premium wooden packaging</span>
                    <span>+{formatPrice(199, currency, language)}</span>
                  </div>
                )}
                {rushMode && (
                  <div className="flex justify-between text-xs text-foreground/75">
                    <span>Rush crafting mode</span>
                    <span>+{formatPrice(250, currency, language)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-foreground border-t border-space-800 pt-2">
                  <span>Recalculated Price</span>
                  <span className="text-gold-400 font-serif text-base">{formatPrice(calculatedPrice, currency, language)}</span>
                </div>
              </div>

              {/* Complexity Delivery Timeline */}
              <div className="flex items-center gap-3 text-xs text-foreground/70 p-3 bg-space-950 border border-space-800 rounded-craft">
                <Truck className="h-4 w-4 text-gold-400 flex-shrink-0" />
                <span>
                  Delivery Estimate: Handcrafting takes <b>{deliveryETA.crafting} days</b>, arrival by <b>{deliveryETA.dateStr}</b> (Bangalore Center dispatch).
                </span>
              </div>

              {/* Submit to Cart */}
              <button
                onClick={handleAddToCart}
                className="w-full bg-gradient-to-r from-gold-500 to-gold-400 text-space-950 py-3.5 rounded-craft font-bold hover:from-gold-400 hover:to-gold-300 transition-all shadow-tactile flex items-center justify-center gap-2 border border-gold-300"
              >
                <Sparkles className="h-4 w-4 text-space-950 animate-pulse" />
                Add Customized Design to Basket
              </button>

            </div>
          ) : (
            // Reviews & Ratings tab content
            <div className="space-y-6">
              
              {/* Existing Reviews */}
              <div className="space-y-4">
                {reviewsList.length === 0 ? (
                  <p className="text-sm text-foreground/60 italic text-center py-6">No approved reviews yet. Be the first to write one!</p>
                ) : (
                  reviewsList.map((rev: any) => (
                    <div key={rev.id} className="p-4 border-b border-space-800/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {rev.user?.profile?.avatarUrl && (
                            <img src={rev.user.profile.avatarUrl} className="h-6 w-6 rounded-full object-cover border border-space-700" />
                          )}
                          <span className="text-xs font-bold text-foreground">
                            {rev.user?.profile?.firstName || 'Luna'} {rev.user?.profile?.lastName || ''}
                          </span>
                          {rev.user?.profile?.zodiacSign && (
                            <span className="text-[9px] bg-gold-400/10 text-gold-400 px-1.5 py-0.5 rounded border border-gold-400/20">
                              {rev.user.profile.zodiacSign}
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-bold text-gold-400 flex items-center gap-0.5">
                          <Star className="h-3 w-3 fill-gold-400" />
                          {rev.rating}
                        </span>
                      </div>
                      {rev.title && <h5 className="text-xs font-bold text-foreground">{rev.title}</h5>}
                      <p className="text-xs text-foreground/80 leading-relaxed">{rev.body}</p>
                      {rev.customizationSummary && (
                        <p className="text-[10px] text-foreground/45 italic">{rev.customizationSummary}</p>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Submit a New Review */}
              <form onSubmit={handleReviewSubmit} className="space-y-4 border-t border-space-800 pt-6">
                <h4 className="font-serif text-base font-bold text-foreground">Write a Review</h4>
                
                {reviewSubmittedMessage && (
                  <p className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-xs text-emerald-400">{reviewSubmittedMessage}</p>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground/60">Rating</label>
                  <select
                    value={newReviewRating}
                    onChange={(e) => setNewReviewRating(parseInt(e.target.value))}
                    className="w-full bg-space-950 border border-space-700 text-foreground rounded p-2 text-xs focus:outline-none"
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r} className="bg-space-950">{r} Stars</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground/60">Title</label>
                  <input
                    type="text"
                    value={newReviewTitle}
                    onChange={(e) => setNewReviewTitle(e.target.value)}
                    placeholder="E.g. Exceptionally woven!"
                    className="w-full bg-space-950 border border-space-700 text-foreground rounded p-2.5 text-xs focus:outline-none focus:border-gold-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground/60">Review Content</label>
                  <textarea
                    rows={3}
                    value={newReviewBody}
                    onChange={(e) => setNewReviewBody(e.target.value)}
                    placeholder="Tell other celestial seekers about your customization and fit..."
                    className="w-full bg-space-950 border border-space-700 text-foreground rounded p-2.5 text-xs focus:outline-none focus:border-gold-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-gold-500 to-gold-400 text-space-950 py-2.5 rounded-craft text-xs font-bold hover:from-gold-400 hover:to-gold-300 transition-colors shadow"
                >
                  Submit Review (Get 50 Loyalty Points)
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
