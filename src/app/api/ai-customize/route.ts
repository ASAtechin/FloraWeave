import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, productTitle, productCategory, config } = body;

    if (!prompt || !productTitle) {
      return NextResponse.json(
        { success: false, error: 'Prompt and product title are required' },
        { status: 400 }
      );
    }

    const provider = process.env.AI_PROVIDER || 'mock';
    const apiKey = process.env.GEMINI_API_KEY;

    let result;

    if (provider === 'gemini' && apiKey && apiKey !== 'gemini_api_key_placeholder') {
      try {
        result = await queryGeminiCustomizer(prompt, productTitle, productCategory, config, apiKey);
      } catch (error) {
        console.error('⚠️ Gemini customization error, falling back to rule engine:', error);
        result = queryFallbackCustomizer(prompt, productTitle, productCategory, config);
      }
    } else {
      result = queryFallbackCustomizer(prompt, productTitle, productCategory, config);
    }

    return NextResponse.json({
      success: true,
      customization: result,
    });
  } catch (error: any) {
    console.error('AI Customization API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal AI Customization Error' },
      { status: 500 }
    );
  }
}

async function queryGeminiCustomizer(
  prompt: string,
  productTitle: string,
  productCategory: string,
  config: any,
  apiKey: string
) {
  const promptText = `
    You are an expert astrological stylist and gifting concierge for Chochete, a premium handmade zodiac jewelry brand.
    
    The user wants to customize this product: "${productTitle}" (Category: "${productCategory}").
    Here is the available customization configuration for this product:
    ${JSON.stringify(config)}
    
    The user provided this customization prompt:
    "${prompt}"
    
    Select the best matching configuration parameters from the available options.
    
    Generate a JSON response matching this schema:
    {
      "zodiacSign": "One of the zodiac signs (Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces) or empty string",
      "birthFlower": "One of the birth flowers (Carnation, Violet, Daffodil, Daisy, Hawthorn, Rose, Delphinium, Chrysanthemum) or empty string",
      "size": "S, M, or L",
      "metalFinish": "One of the base cord materials (Organic Cotton Thread, Pure Merino Wool, Organic Bamboo Silk)",
      "threadColorName": "One of the thread colors (Crimson Red, Sage Olive, Mustard Gold, Terracotta Clay, Cosmic Indigo) or empty string",
      "charm": "One of the charms (None, Mini Zodiac Disc, Birth Flower Pendant, Tiny Sacred Lotus)",
      "engravingText": "1-12 character word or uppercase abbreviation (e.g. LOVE, LUNA, HEAL)",
      "packaging": "One of the packaging options (Standard Kraft Envelope, Premium Wooden Zodiac Keepsake Box)",
      "madeFor": "self" or "gift",
      "giftNote": "a short beautiful gift card message if madeFor is gift",
      "stylingExplanation": "Explain in 2-3 warm, mystical, and encouraging sentences why this specific combination of thread color, base material, charm, and engraving text aligns with their request, elements, and spiritual intention."
    }
    
    Return ONLY raw JSON, no markdown wrapper, no conversational text.
  `;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: { responseMimeType: 'application/json' }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API responded with status ${response.status}`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  return JSON.parse(rawText.trim());
}

function queryFallbackCustomizer(
  prompt: string,
  productTitle: string,
  productCategory: string,
  config: any
) {
  const p = prompt.toLowerCase();
  
  // 1. Detect Zodiac Sign
  const zodiacs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  let zodiacSign = '';
  for (const z of zodiacs) {
    if (p.includes(z.toLowerCase())) {
      zodiacSign = z;
      break;
    }
  }

  // 2. Detect Birth Flower
  const flowers = ['Carnation', 'Violet', 'Daffodil', 'Daisy', 'Hawthorn', 'Rose', 'Delphinium', 'Chrysanthemum'];
  let birthFlower = '';
  for (const f of flowers) {
    if (p.includes(f.toLowerCase())) {
      birthFlower = f;
      break;
    }
  }

  // 3. Detect Size
  let size = 'M';
  if (p.includes('small') || p.includes('petite') || p.includes('tight')) {
    size = 'S';
  } else if (p.includes('large') || p.includes('loose') || p.includes('big')) {
    size = 'L';
  }

  // 4. Detect Base Cord Material
  let metalFinish = 'Organic Cotton Thread';
  if (p.includes('wool') || p.includes('merino') || p.includes('winter') || p.includes('warm')) {
    metalFinish = 'Pure Merino Wool';
  } else if (p.includes('silk') || p.includes('bamboo') || p.includes('luxury')) {
    metalFinish = 'Organic Bamboo Silk';
  }

  // 5. Detect Thread Color
  let threadColorName = config.threadColors?.[0]?.name || 'Sage Olive';
  if (p.includes('red') || p.includes('fire') || p.includes('passion') || p.includes('crimson')) {
    threadColorName = 'Crimson Red';
  } else if (p.includes('green') || p.includes('sage') || p.includes('olive') || p.includes('nature') || p.includes('calm')) {
    threadColorName = 'Sage Olive';
  } else if (p.includes('yellow') || p.includes('gold') || p.includes('mustard') || p.includes('bright') || p.includes('sun')) {
    threadColorName = 'Mustard Gold';
  } else if (p.includes('clay') || p.includes('terracotta') || p.includes('brown') || p.includes('earth') || p.includes('ground')) {
    threadColorName = 'Terracotta Clay';
  } else if (p.includes('indigo') || p.includes('blue') || p.includes('cosmic') || p.includes('magic') || p.includes('intuition') || p.includes('purple')) {
    threadColorName = 'Cosmic Indigo';
  } else if (zodiacSign) {
    // Zodiac element fallback
    const elements: Record<string, string> = {
      Aries: 'Crimson Red', Leo: 'Crimson Red', Sagittarius: 'Crimson Red',
      Taurus: 'Terracotta Clay', Virgo: 'Terracotta Clay', Capricorn: 'Terracotta Clay',
      Gemini: 'Mustard Gold', Libra: 'Mustard Gold', Aquarius: 'Mustard Gold',
      Cancer: 'Cosmic Indigo', Scorpio: 'Cosmic Indigo', Pisces: 'Cosmic Indigo'
    };
    threadColorName = elements[zodiacSign] || 'Sage Olive';
  }

  // 6. Detect Charm
  let charm = 'None';
  if (p.includes('disc') || p.includes('zodiac') || p.includes('symbol')) {
    charm = 'Mini Zodiac Disc';
  } else if (p.includes('flower') || p.includes('pendant')) {
    charm = 'Birth Flower Pendant';
  } else if (p.includes('lotus') || p.includes('sacred') || p.includes('spirit')) {
    charm = 'Tiny Sacred Lotus';
  } else if (config.charms && config.charms.length > 1) {
    // If no preference, select Mini Zodiac Disc as a good default
    charm = 'Mini Zodiac Disc';
  }

  // 7. Extract Engraving Text (look for uppercase word or in quotes, or fallback based on energy)
  let engravingText = '';
  const quotesMatch = prompt.match(/"([^"]+)"|'([^']+)'/);
  if (quotesMatch) {
    engravingText = (quotesMatch[1] || quotesMatch[2]).toUpperCase().slice(0, 12);
  } else {
    // Vibe-based engraving fallback
    if (p.includes('healing') || p.includes('peace') || p.includes('calm')) engravingText = 'HEAL';
    else if (p.includes('love') || p.includes('passion') || p.includes('heart')) engravingText = 'LOVE';
    else if (p.includes('strength') || p.includes('power') || p.includes('courage')) engravingText = 'STRONG';
    else if (p.includes('luck') || p.includes('fortune') || p.includes('prosper')) engravingText = 'LUCK';
    else if (zodiacSign) {
      const zodiacEngravings: Record<string, string> = {
        Aries: 'COURAGE', Taurus: 'STRENGTH', Gemini: 'HARMONY', Cancer: 'PROTECT',
        Leo: 'SHINE', Virgo: 'PURE', Libra: 'BALANCE', Scorpio: 'RISE',
        Sagittarius: 'EXPLORE', Capricorn: 'AMBITION', Aquarius: 'UNIQUE', Pisces: 'DREAM'
      };
      engravingText = zodiacEngravings[zodiacSign] || 'SOUL';
    } else {
      engravingText = 'SOUL';
    }
  }

  // 8. Detect Packaging
  let packaging = 'Standard Kraft Envelope';
  if (p.includes('box') || p.includes('keepsake') || p.includes('gift') || p.includes('premium')) {
    packaging = 'Premium Wooden Zodiac Keepsake Box';
  }

  // 9. Made For / Recipient
  let madeFor: 'self' | 'gift' = 'self';
  if (p.includes('gift') || p.includes('friend') || p.includes('sister') || p.includes('mother') || p.includes('mom') || p.includes('partner') || p.includes('wife') || p.includes('for her') || p.includes('for him')) {
    madeFor = 'gift';
  }

  // 10. Gift Note
  let giftNote = '';
  if (madeFor === 'gift') {
    giftNote = `Hand-knotted with intention. May this ${zodiacSign || 'cosmic'} thread bring you alignment, strength, and joy.`;
  }

  // 11. Custom astrological stylist explanation
  let stylingExplanation = `For your request, our AI Stylist selected the ${threadColorName} thread representing ${
    threadColorName === 'Crimson Red' ? 'strength and passion' :
    threadColorName === 'Sage Olive' ? 'growth and serenity' :
    threadColorName === 'Mustard Gold' ? 'intellect and abundance' :
    threadColorName === 'Terracotta Clay' ? 'grounding and warmth' :
    'intuition and cosmic magic'
  }. We paired it with a ${metalFinish} base for organic durability and a ${charm} charm to center your intentions.`;

  if (zodiacSign) {
    stylingExplanation += ` This configuration beautifully matches the celestial traits of ${zodiacSign}.`;
  }

  return {
    zodiacSign,
    birthFlower,
    size,
    metalFinish,
    threadColorName,
    charm,
    engravingText,
    packaging,
    madeFor,
    giftNote,
    stylingExplanation
  };
}
