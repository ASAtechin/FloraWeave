import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, Image, TextInput, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Star, Filter } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withSpring, withDelay, withTiming, Easing, ZoomIn } from 'react-native-reanimated';
import CosmicBackground from '@/components/CosmicBackground';
import Header from '@/components/Header';
import GlassCard from '@/components/GlassCard';
import ProductDetailsModal from '@/components/ProductDetailsModal';
import CartOverlay from '@/components/CartOverlay';
import { AnimatedStarField } from '@/components/CosmicAnimations';
import { HolographicGlassCard, NeonGlowText, CinematicSection } from '@/components/ImmersiveEffects';
import { SciFiHUDOverlay, DataMatrixRain } from '@/components/SciFiEffects';
import { fetchProducts, Product, MOCK_PRODUCTS } from '@/lib/api';

const ZODIAC_SIGNS = [
  'All Signs', 'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const CATEGORIES = [
  { slug: 'all', name: 'All Collection' },
  { slug: 'bracelets', name: 'Bracelets' },
  { slug: 'anklets', name: 'Anklets' },
  { slug: 'rings', name: 'Rings' },
  { slug: 'neckpieces', name: 'Neckpieces' },
];

export default function ShopScreen() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [cartVisible, setCartVisible] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedZodiac, setSelectedZodiac] = useState('All Signs');

  useEffect(() => {
    async function loadData() {
      try {
        const prodData = await fetchProducts();
        setProducts(prodData);
      } catch (err) {
        console.log('Failed loading shop products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter logic
  const filteredProducts = products.filter((prod) => {
    const matchesSearch = prod.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prod.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || prod.category.slug === selectedCategory;
    
    // Simulate zodiac compatibility mapping
    const matchesZodiac = selectedZodiac === 'All Signs' || 
                          prod.title.toLowerCase().includes(selectedZodiac.toLowerCase()) || 
                          prod.description.toLowerCase().includes(selectedZodiac.toLowerCase()) || 
                          // Default first product matches Scorpio/Pisces/Aries, etc.
                          (prod.id === 'prod-1' && ['Scorpio', 'Pisces', 'Cancer', 'Aries'].includes(selectedZodiac)) ||
                          (prod.id === 'prod-2' && ['Taurus', 'Capricorn', 'Virgo', 'Libra'].includes(selectedZodiac)) ||
                          (prod.id === 'prod-3' && ['Gemini', 'Libra', 'Aquarius', 'Leo'].includes(selectedZodiac));

    return matchesSearch && matchesCategory && matchesZodiac;
  });

  const openDetails = (prod: Product) => {
    setSelectedProduct(prod);
    setDetailsVisible(true);
  };

  return (
    <CosmicBackground style={styles.container} intensity="active">
      <SciFiHUDOverlay />
      <DataMatrixRain intensity="light" />
      <SafeAreaView style={styles.safeArea}>
        <Header onCartPress={() => setCartVisible(true)} />

        {/* Search Bar */}
        <View style={styles.searchWrapper}>
          <GlassCard style={styles.searchCard}>
            <Search size={16} color="rgba(255,255,255,0.4)" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search celestial threads..."
              placeholderTextColor="rgba(255,255,255,0.3)"
            />
          </GlassCard>
        </View>

        {/* Scrollable Filter Strips */}
        <View style={styles.filtersContainer}>
          {/* Category Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterScrollContent}
          >
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.slug;
              return (
                <Pressable
                  key={cat.slug}
                  onPress={() => setSelectedCategory(cat.slug)}
                  style={[styles.pillBtn, isActive && styles.pillBtnActive]}
                >
                  <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                    {cat.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Zodiac Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterScrollContent}
          >
            {ZODIAC_SIGNS.map((zod) => {
              const isActive = selectedZodiac === zod;
              return (
                <Pressable
                  key={zod}
                  onPress={() => setSelectedZodiac(zod)}
                  style={[styles.zodBtn, isActive && styles.zodBtnActive]}
                >
                  <Text style={[styles.zodText, isActive && styles.zodTextActive]}>
                    {zod}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Product Catalog Grid */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#d4af37" />
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={styles.gridRow}
            ListEmptyComponent={
              <View style={styles.emptyList}>
                <Text style={styles.emptyText}>No celestial items align with these parameters.</Text>
              </View>
            }
            renderItem={({ item, index }) => (
              <Animated.View 
                entering={FadeInDown.delay(index * 80).duration(500).springify().damping(15)}
                style={styles.gridItem}
              >
                <Pressable onPress={() => openDetails(item)}>
                  <HolographicGlassCard 
                    delay={100 + index * 100} 
                    variant={(['gold', 'purple', 'cyan'] as const)[index % 3]}
                  >
                    <View style={styles.prodCard}>
                      <Image source={{ uri: item.imageUrl }} style={styles.prodImg} />
                      <View style={styles.prodMeta}>
                        <Text style={styles.prodTitle} numberOfLines={1}>{item.title}</Text>
                        <View style={styles.ratingRow}>
                          <Star size={10} color="#d4af37" fill="#d4af37" />
                          <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                          <Text style={styles.reviewsText}>({item.reviewCount})</Text>
                        </View>
                        <View style={styles.priceRow}>
                          <Text style={styles.prodPrice}>₹{item.price}</Text>
                          <View style={styles.customizeBadge}>
                            <Text style={styles.customizeBadgeText}>Knot Custom</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </HolographicGlassCard>
                </Pressable>
              </Animated.View>
            )}
          />
        )}

        {/* Global Modals */}
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
  searchWrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(9,5,20,0.5)',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 13,
    padding: 0,
  },
  filtersContainer: {
    paddingVertical: 10,
    gap: 8,
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterScrollContent: {
    paddingHorizontal: 16,
    gap: 6,
  },
  pillBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 99,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  pillBtnActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderColor: '#d4af37',
  },
  pillText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#d4af37',
    fontWeight: 'bold',
  },
  zodBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  zodBtnActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderColor: 'rgba(212,175,55,0.4)',
  },
  zodText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.45)',
    fontWeight: 'bold',
  },
  zodTextActive: {
    color: '#d4af37',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 80,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '49%',
    marginBottom: 8,
  },
  prodCard: {
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
    gap: 3,
  },
  prodTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.8)',
  },
  reviewsText: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.35)',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  prodPrice: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#d4af37',
  },
  customizeBadge: {
    backgroundColor: 'rgba(212,175,55,0.05)',
    borderWidth: 0.5,
    borderColor: 'rgba(212,175,55,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  customizeBadgeText: {
    fontSize: 7,
    color: '#d4af37',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  emptyList: {
    paddingVertical: 64,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
