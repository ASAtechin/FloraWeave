import { db } from '@/lib/db';

export interface RecommendationInput {
  zodiac: string;
  recipient: 'self' | 'partner' | 'friend' | 'family' | 'child';
  occasion: 'birthday' | 'anniversary' | 'solstice' | 'festival' | 'healing' | 'just-because';
  budget: number;
  style: 'minimalist' | 'bold' | 'earthy' | 'elegant' | 'spiritual';
}

export interface RecommendationResult {
  productId: string;
  productSlug: string;
  title: string;
  imageUrl: string;
  price: number;
  reason: string;
  customizationSuggestions: {
    threadColor?: string;
    metalFinish?: string;
    charm?: string;
    packaging?: string;
    engravingText?: string;
  };
  confidence: number;
}

export class AIService {
  /**
   * Main recommendation entry point. Tries Gemini API first, then falls back to rule-based logic.
   */
  static async getRecommendations(input: RecommendationInput): Promise<RecommendationResult[]> {
    const provider = process.env.AI_PROVIDER || 'mock';
    const apiKey = process.env.GEMINI_API_KEY;

    if (provider === 'gemini' && apiKey && apiKey !== 'gemini_api_key_placeholder') {
      try {
        return await this.fetchGeminiRecommendations(input, apiKey);
      } catch (error) {
        console.error('⚠️ Gemini recommendation error, falling back to rule engine:', error);
        return this.getFallbackRecommendations(input);
      }
    }

    return this.getFallbackRecommendations(input);
  }

  /**
   * Queries Gemini 2.0 Flash using REST API to generate personalization configurations.
   */
  private static async fetchGeminiRecommendations(
    input: RecommendationInput,
    apiKey: string
  ): Promise<RecommendationResult[]> {
    const products = await db.product.findMany({
      where: { isActive: true },
      select: { id: true, slug: true, title: true, description: true, price: true, imageUrl: true }
    });

    const prompt = `
      You are an expert astrological stylist and gifting concierge for Chochete, a premium handmade zodiac jewelry brand.
      
      Recommend 2 products from this catalog:
      ${JSON.stringify(products)}
      
      For a user with these preferences:
      - Zodiac Sign: ${input.zodiac}
      - Recipient Relationship: ${input.recipient}
      - Occasion: ${input.occasion}
      - Budget Limit: INR ${input.budget}
      - Preferred Style: ${input.style}
      
      Generate a JSON response matching this schema:
      [
        {
          "productId": "string",
          "reason": "Explain why this matches their zodiac element, the recipient's energy, and the occasion in a beautiful emotional way.",
          "customizationSuggestions": {
            "threadColor": "string from (Crimson Red, Sage Olive, Mustard Gold, Terracotta Clay, Cosmic Indigo)",
            "metalFinish": "string from (Brass (Artisanal), Sterling Silver 925, 18K Gold Plated)",
            "charm": "string from (Mini Zodiac Disc, Birth Flower Pendant, Tiny Sacred Lotus)",
            "packaging": "string from (Standard Kraft Envelope, Premium Wooden Zodiac Keepsake Box)",
            "engravingText": "suggested 2-3 word engraved intention text"
          },
          "confidence": 0.0 to 1.0
        }
      ]
      
      Return ONLY raw JSON, no markdown wrapper, no conversational text.
    `;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API responded with status ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    const rawResults = JSON.parse(rawText.trim());

    return rawResults.map((res: any) => {
      const match = products.find((p) => p.id === res.productId);
      return {
        productId: res.productId,
        productSlug: match?.slug || '',
        title: match?.title || 'Celestial Ornament',
        imageUrl: match?.imageUrl || '',
        price: match?.price || 599.0,
        reason: res.reason,
        customizationSuggestions: res.customizationSuggestions || {},
        confidence: res.confidence || 0.9
      };
    });
  }

  /**
   * Rule-based fallback engine mapping zodiac elements to product attributes.
   */
  private static async getFallbackRecommendations(input: RecommendationInput): Promise<RecommendationResult[]> {
    const products = await db.product.findMany({
      where: { isActive: true },
      include: { zodiacMappings: true }
    });

    // Determine Zodiac Element
    const zodiacElements: Record<string, string> = {
      Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
      Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
      Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
      Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water'
    };

    const element = zodiacElements[input.zodiac] || 'Spirit';

    // Tailored defaults based on Zodiac Element
    const elementCustomizations: Record<string, any> = {
      Fire: {
        threadColor: 'Crimson Red',
        metalFinish: '18K Gold Plated',
        charm: 'Mini Zodiac Disc',
        engravingText: 'IGNITE',
        reasonText: `Being a Fire sign (${input.zodiac}), their energy is highly radiant and expressive. The gold finish combined with Crimson Red threads mirrors their natural warmth and drive.`
      },
      Earth: {
        threadColor: 'Terracotta Clay',
        metalFinish: 'Brass (Artisanal)',
        charm: 'Tiny Sacred Lotus',
        engravingText: 'GROUNDED',
        reasonText: `As an Earth sign (${input.zodiac}), they seek centering and organic alignment. Natural brass with Terracotta Clay thread matches their steady, supportive presence.`
      },
      Air: {
        threadColor: 'Mustard Gold',
        metalFinish: 'Sterling Silver 925',
        charm: 'Birth Flower Pendant',
        engravingText: 'BREATHE',
        reasonText: `Air signs (${input.zodiac}) thrive on intellectual expansion and communication. Sterling silver and Mustard Gold threads keep their mental flow balanced and light.`
      },
      Water: {
        threadColor: 'Cosmic Indigo',
        metalFinish: 'Sterling Silver 925',
        charm: 'Mini Zodiac Disc',
        engravingText: 'FLOW',
        reasonText: `Water signs (${input.zodiac}) possess deep emotional wisdom. The silver pairing with Cosmic Indigo threads supports their intuition, offering soothing lunar energy.`
      },
      Spirit: {
        threadColor: 'Sage Olive',
        metalFinish: 'Sterling Silver 925',
        charm: 'Tiny Sacred Lotus',
        engravingText: 'PEACE',
        reasonText: `This selection supports custom emotional alignment, combining natural sage threads with sterling silver for healing.`
      }
    };

    const currentConfigs = elementCustomizations[element];

    // Filter products within budget and rank them based on relevance
    const filtered = products
      .filter((p) => p.price <= input.budget)
      .slice(0, 2);

    return filtered.map((prod) => {
      // Find matching zodiac story if available
      const exactStory = prod.zodiacMappings.find((m) => m.zodiacSign === input.zodiac)?.storyText;

      return {
        productId: prod.id,
        productSlug: prod.slug,
        title: prod.title,
        imageUrl: prod.imageUrl,
        price: prod.price,
        reason: exactStory || `${currentConfigs.reasonText} This product is an excellent choice for a ${input.occasion} gift.`,
        customizationSuggestions: {
          threadColor: currentConfigs.threadColor,
          metalFinish: currentConfigs.metalFinish,
          charm: currentConfigs.charm,
          packaging: input.recipient === 'partner' ? 'Premium Wooden Zodiac Keepsake Box' : 'Standard Kraft Envelope',
          engravingText: currentConfigs.engravingText
        },
        confidence: 0.85
      };
    });
  }
}
