export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  category: { name: string; slug: string };
  customizationConfig: any;
}

// Tailscale Serve URL from host output
const TAILSCALE_URL = 'https://inlccb0132.tailbd65cf.ts.net';
// Fallback Network IP
const LOCAL_IP_URL = 'http://192.168.29.106:3000';

const BASE_URL = `${TAILSCALE_URL}/api`;

// Beautiful mock products for instant fallback/testing
export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    title: 'Solstice Intention Bracelet',
    slug: 'solstice-intention-bracelet',
    description: 'Every thread is hand-knotted loop-by-loop with premium organic cotton thread. Aligned with your specific birth stars and intentions, it is designed for daily celestial protection.',
    price: 1299,
    imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=400&q=80',
    rating: 4.9,
    reviewCount: 142,
    category: { name: 'Bracelets', slug: 'bracelets' },
    customizationConfig: {
      sizes: ['S', 'M', 'L'],
      materials: ['Organic Cotton Thread', 'Pure Merino Wool', 'Organic Bamboo Silk'],
      threadColors: [
        { name: 'Crimson Red', hex: '#cf3a3a' },
        { name: 'Sage Olive', hex: '#6b8e23' },
        { name: 'Mustard Gold', hex: '#daa520' },
        { name: 'Terracotta Clay', hex: '#c27c62' },
        { name: 'Cosmic Indigo', hex: '#3f51b5' }
      ],
      charms: ['None', 'Mini Zodiac Disc', 'Birth Flower Pendant', 'Tiny Sacred Lotus']
    }
  },
  {
    id: 'prod-2',
    title: 'Celestial Thread Anklet',
    slug: 'celestial-thread-anklet',
    description: 'A minimalist hand-woven ankle cord featuring raw crystal beads and intention charms. Programmed under the full moon for earth alignment.',
    price: 899,
    imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=400&q=80',
    rating: 4.8,
    reviewCount: 88,
    category: { name: 'Anklets', slug: 'anklets' },
    customizationConfig: {
      sizes: ['S', 'M', 'L'],
      materials: ['Organic Cotton Thread', 'Organic Bamboo Silk'],
      threadColors: [
        { name: 'Sage Olive', hex: '#6b8e23' },
        { name: 'Mustard Gold', hex: '#daa520' },
        { name: 'Cosmic Indigo', hex: '#3f51b5' }
      ],
      charms: ['None', 'Mini Zodiac Disc', 'Tiny Sacred Lotus']
    }
  },
  {
    id: 'prod-3',
    title: 'Zodiac Birth Flower Ring',
    slug: 'zodiac-birth-flower-ring',
    description: 'An delicate, adjustable ring set woven from fine bamboo silk and carrying a dangling zodiac birth flower miniature pendant.',
    price: 599,
    imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=400&q=80',
    rating: 4.7,
    reviewCount: 65,
    category: { name: 'Rings', slug: 'rings' },
    customizationConfig: {
      sizes: ['S', 'M', 'L'],
      materials: ['Organic Bamboo Silk'],
      threadColors: [
        { name: 'Crimson Red', hex: '#cf3a3a' },
        { name: 'Mustard Gold', hex: '#daa520' },
        { name: 'Terracotta Clay', hex: '#c27c62' }
      ],
      charms: ['Birth Flower Pendant']
    }
  },
  {
    id: 'prod-4',
    title: 'Cosmic Keepsake Choker',
    slug: 'cosmic-keepsake-choker',
    description: 'A premium, statement neckpiece woven from soft merino wool, centering a brass zodiac medallion representing your lunar coordinates.',
    price: 1499,
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80',
    rating: 5.0,
    reviewCount: 37,
    category: { name: 'Neckpieces', slug: 'neckpieces' },
    customizationConfig: {
      sizes: ['S', 'M'],
      materials: ['Pure Merino Wool', 'Organic Bamboo Silk'],
      threadColors: [
        { name: 'Terracotta Clay', hex: '#c27c62' },
        { name: 'Cosmic Indigo', hex: '#3f51b5' }
      ],
      charms: ['Mini Zodiac Disc', 'Tiny Sacred Lotus']
    }
  }
];

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 sec timeout

    const response = await fetch(`${BASE_URL}/products`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.products && data.products.length > 0) {
        return data.products.map((p: any) => ({
          ...p,
          imageUrl: p.imageUrl.startsWith('http') ? p.imageUrl : `${TAILSCALE_URL}${p.imageUrl}`,
        }));
      }
    }
    return MOCK_PRODUCTS;
  } catch (error) {
    console.log('⚠️ Failed to fetch products from server, utilizing local mocks:', error);
    return MOCK_PRODUCTS;
  }
};

export const fetchRecommendations = async (input: {
  zodiac: string;
  recipient: string;
  occasion: string;
  budget: number;
  style: string;
}): Promise<any[]> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${BASE_URL}/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.recommendations) {
        return data.recommendations;
      }
    }
    throw new Error('Server returned unsuccessful response');
  } catch (error) {
    console.log('⚠️ Failed to get recommendations from API, returning local suggestions:', error);
    
    // Return mock recommendation list
    return [
      {
        productId: 'prod-1',
        title: 'Solstice Intention Bracelet',
        reason: `Based on your request for a ${input.occasion} gift, the AI Stylist recommends the Solstice Bracelet in Cosmic Indigo. It aligns with the recipient's spiritual intentions.`,
        price: 1299
      },
      {
        productId: 'prod-3',
        title: 'Zodiac Birth Flower Ring',
        reason: `A perfect choice under ₹${input.budget}. Centered with a birth flower pendant matching the zodiac elements.`,
        price: 599
      }
    ];
  }
};

export const customizeProductWithAI = async (
  prompt: string,
  productTitle: string,
  productCategory: string,
  config: any
): Promise<any> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${BASE_URL}/ai-customize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        productTitle,
        productCategory,
        config,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.customization) {
        return data.customization;
      }
    }
    throw new Error('AI customization request failed');
  } catch (error) {
    console.log('⚠️ AI Customizer connection failed, utilizing local rules engine:', error);
    
    // Simulate the fallback rule engine from Next.js backend
    const p = prompt.toLowerCase();
    let zodiacSign = 'Aries';
    const zodiacs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    for (const z of zodiacs) {
      if (p.includes(z.toLowerCase())) {
        zodiacSign = z;
        break;
      }
    }

    let threadColorName = 'Sage Olive';
    if (p.includes('red') || p.includes('fire') || p.includes('passion')) threadColorName = 'Crimson Red';
    else if (p.includes('indigo') || p.includes('blue') || p.includes('cosmic')) threadColorName = 'Cosmic Indigo';
    else if (p.includes('gold') || p.includes('yellow')) threadColorName = 'Mustard Gold';
    else if (p.includes('clay') || p.includes('terracotta') || p.includes('earth')) threadColorName = 'Terracotta Clay';

    const metalFinish = p.includes('wool') ? 'Pure Merino Wool' : p.includes('silk') ? 'Organic Bamboo Silk' : 'Organic Cotton Thread';
    const charm = p.includes('lotus') ? 'Tiny Sacred Lotus' : p.includes('flower') ? 'Birth Flower Pendant' : 'Mini Zodiac Disc';

    return {
      zodiacSign,
      birthFlower: 'Rose',
      size: 'M',
      metalFinish,
      threadColorName,
      charm,
      engravingText: 'ALIGN',
      packaging: 'Premium Wooden Zodiac Keepsake Box',
      madeFor: p.includes('gift') ? 'gift' : 'self',
      giftNote: 'Knotted under the alignment of the stars. Carry this energy with you.',
      stylingExplanation: `Selected ${threadColorName} thread with ${metalFinish} and ${charm} to match your birth stars and ground your intention of healing and presence.`
    };
  }
};

// --- Profile APIs ---
export const fetchProfile = async (userId: string): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/profile?userId=${userId}`);
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.profile) {
        return data.profile;
      }
    }
    return null;
  } catch (error) {
    console.log('⚠️ Failed to fetch profile from server:', error);
    return null;
  }
};

export const saveProfile = async (
  userId: string,
  name: string,
  zodiacSign?: string,
  birthDate?: string,
  birthFlower?: string
): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, name, zodiacSign, birthDate, birthFlower }),
    });
    if (response.ok) {
      const data = await response.json();
      return data.success ? data.profile : null;
    }
    return null;
  } catch (error) {
    console.log('⚠️ Failed to save profile to server:', error);
    return null;
  }
};

// --- Saved Designs APIs ---
export const fetchSavedDesigns = async (userId: string): Promise<any[]> => {
  try {
    const response = await fetch(`${BASE_URL}/saved-designs?userId=${userId}`);
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.designs) {
        return data.designs.map((d: any) => ({
          id: d.id,
          title: d.title,
          productId: d.productId,
          productTitle: d.productTitle || d.title,
          imageUrl: d.imageUrl || 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a',
          customization: d.customizationData || d.customization || {},
          createdAt: new Date(d.createdAt).toLocaleDateString(),
        }));
      }
    }
    return [];
  } catch (error) {
    console.log('⚠️ Failed to fetch saved designs:', error);
    return [];
  }
};

export const saveDesignApi = async (
  userId: string,
  productId: string,
  title: string,
  customization: any
): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/saved-designs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, productId, title, customizationData: customization }),
    });
    if (response.ok) {
      const data = await response.json();
      return data.success ? data.design : null;
    }
    return null;
  } catch (error) {
    console.log('⚠️ Failed to save design to server:', error);
    return null;
  }
};

export const deleteSavedDesignApi = async (designId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/saved-designs?id=${designId}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      const data = await response.json();
      return !!data.success;
    }
    return false;
  } catch (error) {
    console.log('⚠️ Failed to delete saved design on server:', error);
    return false;
  }
};

// --- Orders APIs ---
export const fetchOrders = async (userId?: string): Promise<any[]> => {
  try {
    const url = userId ? `${BASE_URL}/orders?userId=${userId}` : `${BASE_URL}/orders`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.orders) {
        return data.orders;
      }
    }
    return [];
  } catch (error) {
    console.log('⚠️ Failed to fetch orders from server:', error);
    return [];
  }
};

export const createOrderApi = async (orderData: any): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (response.ok) {
      const data = await response.json();
      return data.success ? data.order : null;
    }
    return null;
  } catch (error) {
    console.log('⚠️ Failed to create order on server:', error);
    return null;
  }
};

export const updateOrderStatusApi = async (orderId: string, status: string): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (response.ok) {
      const data = await response.json();
      return data.success ? data.order : null;
    }
    return null;
  } catch (error) {
    console.log('⚠️ Failed to update order status on server:', error);
    return null;
  }
};

export const allocateArtisanApi = async (orderId: string, artisanName: string): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ artisanName }),
    });
    if (response.ok) {
      const data = await response.json();
      return data.success ? data.order : null;
    }
    return null;
  } catch (error) {
    console.log('⚠️ Failed to allocate artisan on server:', error);
    return null;
  }
};

