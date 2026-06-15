import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sparkles, Gift, Compass, ShieldCheck, Heart, Star, ArrowRight } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import CosmicBackground from '@/components/CosmicBackground';
import Header from '@/components/Header';
import GlassCard from '@/components/GlassCard';
import CelestialCalculator from '@/components/CelestialCalculator';
import ProductDetailsModal from '@/components/ProductDetailsModal';
import CartOverlay from '@/components/CartOverlay';
import { HolographicGlassCard, NeonGlowText, CinematicSection } from '@/components/ImmersiveEffects';
import { SciFiHUDOverlay, DataMatrixRain } from '@/components/SciFiEffects';
import { fetchProducts, Product, MOCK_PRODUCTS } from '@/lib/api';
import { useStore } from '@/store/useStore';

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [cartVisible, setCartVisible] = useState(false);

  // Sync calculations into customization details
  const [alignedThread, setAlignedThread] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const prodData = await fetchProducts();
        setProducts(prodData);
      } catch (err) {
        console.log('Failed loading index products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCustomizeAlignment = (thread: string, element: string) => {
    // Save thread to state to pre-select, and trigger opening first product
    setAlignedThread(thread);
    const firstProduct = products[0] || MOCK_PRODUCTS[0];
    // Override the default thread color in configuration for this session
    const customProd = {
      ...firstProduct,
      customizationConfig: {
        ...firstProduct.customizationConfig,
        threadColors: [
          { name: thread.split(' ')[0], hex: thread.toLowerCase().includes('indigo') ? '#3f51b5' : thread.toLowerCase().includes('olive') ? '#6b8e23' : thread.toLowerCase().includes('clay') ? '#c27c62' : '#daa520' },
          ...firstProduct.customizationConfig.threadColors.filter((c: any) => c.name !== thread.split(' ')[0])
        ]
      }
    };
    setSelectedProduct(customProd);
    setDetailsVisible(true);
  };

  const openDetails = (prod: Product) => {
    setSelectedProduct(prod);
    setDetailsVisible(true);
  };

  return (
    <CosmicBackground style={styles.container} intensity="active">
      {/* Sci-Fi HUD Chrome */}
      <SciFiHUDOverlay />
      {/* Subtle matrix rain in background */}
      <DataMatrixRain intensity="light" />
      
      <SafeAreaView style={styles.safeArea}>
        <Header onCartPress={() => setCartVisible(true)} />

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {/* Hero Banner — Cinematic Entry */}
          <CinematicSection delay={100} direction="up">
            <View style={styles.hero}>
              <Animated.View entering={ZoomIn.delay(200).duration(500)} style={styles.heroBadge}>
                <Sparkles size={11} color="#d4af37" />
                <Text style={styles.heroBadgeText}>Bangalore Generational Knotting</Text>
              </Animated.View>
              <Animated.View entering={FadeInDown.delay(400).duration(700).springify()}>
                <Text style={styles.heroTitle}>
                  Accessories Woven for Your{' '}
                </Text>
                <NeonGlowText style={styles.heroTitleGlow} color="gold">
                  Celestial Identity
                </NeonGlowText>
              </Animated.View>
              <Animated.View entering={FadeInUp.delay(700).duration(600)}>
                <Text style={styles.heroDesc}>
                  Every thread knotted by hand, customized with your zodiac flower and birth intentions.
                </Text>
              </Animated.View>
            <Animated.View entering={FadeInDown.delay(900).duration(500)} style={styles.badgeRow}>
              {['★ 4.9 Rating', '🛡️ Secure UPI', '⚡ Fast Shipping'].map((tag, i) => (
                <Animated.View key={tag} entering={FadeInDown.delay(1000 + i * 100).duration(400)} style={styles.tagBadge}>
                  <Text style={styles.tagBadgeText}>{tag}</Text>
                </Animated.View>
              ))}
            </Animated.View>
          </View>
          </CinematicSection>

          {/* Calculator Strip */}
          <CelestialCalculator onCustomizeWithAlignment={handleCustomizeAlignment} />

          {/* Featured Collections */}
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Featured Spotlight</Text>
              <Text style={styles.sectionSub}>Generational weaver knotting designed for your path</Text>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#d4af37" style={styles.loader} />
          ) : (
            <View style={styles.featuredGrid}>
              {products.slice(0, 2).map((prod, i) => (
                <Pressable key={prod.id} onPress={() => openDetails(prod)}>
                  <HolographicGlassCard delay={200 + i * 150} variant={i === 0 ? 'gold' : 'purple'}>
                    <View style={styles.prodCard}>
                      <Image source={{ uri: prod.imageUrl }} style={styles.prodImg} />
                      <View style={styles.prodMeta}>
                        <Text style={styles.prodTitle} numberOfLines={1}>{prod.title}</Text>
                        <View style={styles.ratingRow}>
                          <Star size={11} color="#d4af37" fill="#d4af37" />
                          <Text style={styles.ratingText}>{prod.rating.toFixed(1)}</Text>
                        </View>
                        <Text style={styles.prodPrice}>₹{prod.price}</Text>
                      </View>
                    </View>
                  </HolographicGlassCard>
                </Pressable>
              ))}
            </View>
          )}

          {/* Value Cards — Holographic */}
          <CinematicSection delay={400} direction="up">
            <View style={styles.storyGrid}>
              <HolographicGlassCard delay={500} variant="gold">
                <View style={styles.storyCard}>
                  <View style={[styles.storyIconCircle, { backgroundColor: 'rgba(212, 175, 55, 0.08)' }]}>
                    <Sparkles size={16} color="#d4af37" />
                  </View>
                  <Text style={styles.storyTitle}>Handcrafted Knotting</Text>
                  <Text style={styles.storyDesc}>
                    No automatic factories. Our pieces are hand-woven knot-by-knot by traditional artisans using robust, organic cotton thread.
                  </Text>
                </View>
              </HolographicGlassCard>

              <HolographicGlassCard delay={650} variant="purple">
                <View style={styles.storyCard}>
                  <View style={[styles.storyIconCircle, { backgroundColor: 'rgba(168, 85, 247, 0.08)' }]}>
                    <Compass size={16} color="#a855f7" />
                  </View>
                  <Text style={styles.storyTitle}>Aura & Stars Aligned</Text>
                  <Text style={styles.storyDesc}>
                    Customized for your birth energy. Choose elements, zodiac crystals, and colors to channel specific blessings and alignments.
                  </Text>
                </View>
              </HolographicGlassCard>
            </View>
          </CinematicSection>

          {/* Artisan collective spotlight */}
          <CinematicSection delay={800} direction="up">
            <HolographicGlassCard delay={900} variant="cyan">
              <View style={styles.artisanCard}>
                <View style={styles.artisanHeader}>
                  <View style={styles.artisanIcon}>
                    <Heart size={16} color="#ef4444" fill="#ef4444" />
                  </View>
                  <View>
                    <Text style={styles.artisanTitle}>Artisan Collective</Text>
                    <Text style={styles.artisanSubtitle}>Generational Rajasthani weavers</Text>
                  </View>
                </View>
                <Text style={styles.artisanText}>
                  "By connecting Bangalore's generational weaver families directly to your astrology profile, we preserve ancient knotting crafts while carrying intention to your day."
                </Text>
              </View>
            </HolographicGlassCard>
          </CinematicSection>

          <View style={styles.spacingPad} />
        </ScrollView>

        {/* Global Modal Sheets */}
        <ProductDetailsModal
          product={selectedProduct}
          visible={detailsVisible}
          onClose={() => setDetailsVisible(false)}
        />

        <CartOverlay
          visible={cartVisible}
          onClose={() => setCartVisible(false)}
        />
      </SafeAreaView>
    </CosmicBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  hero: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    textAlign: 'center',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
  },
  heroBadgeText: {
    fontSize: 9,
    color: '#d4af37',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 34,
    paddingHorizontal: 8,
  },
  heroTitleGlow: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 34,
  },
  goldText: {
    color: '#d4af37',
  },
  heroDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.65)',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  tagBadge: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  tagBadgeText: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  sectionSub: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 2,
  },
  loader: {
    marginVertical: 24,
  },
  featuredGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  prodCard: {
    flex: 1,
    minWidth: 160,
    maxWidth: 180,
    padding: 8,
    gap: 8,
  },
  prodImg: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  prodMeta: {
    gap: 4,
  },
  prodTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.8)',
  },
  prodPrice: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#d4af37',
  },
  storyGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  storyCard: {
    flex: 1,
    padding: 12,
    gap: 8,
  },
  storyIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  storyDesc: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.55)',
    lineHeight: 14,
  },
  artisanCard: {
    padding: 14,
    gap: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.02)',
    borderColor: 'rgba(239, 68, 68, 0.08)',
  },
  artisanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  artisanIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  artisanTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  artisanSubtitle: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
  },
  artisanText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  spacingPad: {
    height: 80,
  },
});
