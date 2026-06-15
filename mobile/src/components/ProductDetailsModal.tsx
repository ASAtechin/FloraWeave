import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, Image, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { X, Star, Sparkles, ShieldCheck, Heart, ShoppingBag } from 'lucide-react-native';
import { useStore, CustomizationData } from '../store/useStore';
import { Product } from '../lib/api';
import AICustomizer from './AICustomizer';
import GlassCard from './GlassCard';

interface ProductDetailsModalProps {
  product: Product | null;
  visible: boolean;
  onClose: () => void;
}

export default function ProductDetailsModal({ product, visible, onClose }: ProductDetailsModalProps) {
  if (!product) return null;

  const { addToCart, saveDesign } = useStore();

  // Customization state
  const [size, setSize] = useState('M');
  const [metalFinish, setMetalFinish] = useState('Organic Cotton Thread');
  const [threadColorName, setThreadColorName] = useState('Sage Olive');
  const [charm, setCharm] = useState('None');
  const [engravingText, setEngravingText] = useState('');
  const [packaging, setPackaging] = useState('Standard Kraft Envelope');
  const [madeFor, setMadeFor] = useState<'self' | 'gift'>('self');
  const [giftNote, setGiftNote] = useState('');
  const [stylingExplanation, setStylingExplanation] = useState<string | undefined>(undefined);

  // Sync state with product default config when product changes
  useEffect(() => {
    if (product) {
      const config = product.customizationConfig;
      if (config.sizes && config.sizes.length > 0) setSize(config.sizes[0] || 'M');
      if (config.materials && config.materials.length > 0) setMetalFinish(config.materials[0]);
      if (config.threadColors && config.threadColors.length > 0) setThreadColorName(config.threadColors[0].name);
      if (config.charms && config.charms.length > 0) setCharm(config.charms[0]);
      
      setEngravingText('');
      setPackaging('Standard Kraft Envelope');
      setMadeFor('self');
      setGiftNote('');
      setStylingExplanation(undefined);
    }
  }, [product]);

  // Apply AI customization values directly to state
  const handleApplyAICustomization = (custom: any) => {
    if (custom.size) setSize(custom.size);
    if (custom.metalFinish) setMetalFinish(custom.metalFinish);
    if (custom.threadColorName) setThreadColorName(custom.threadColorName);
    if (custom.charm) setCharm(custom.charm);
    if (custom.engravingText) setEngravingText(custom.engravingText);
    if (custom.packaging) setPackaging(custom.packaging);
    if (custom.madeFor) setMadeFor(custom.madeFor);
    if (custom.giftNote) setGiftNote(custom.giftNote);
    if (custom.stylingExplanation) setStylingExplanation(custom.stylingExplanation);
  };

  const handleAddToCart = () => {
    const customization: CustomizationData = {
      size,
      metalFinish,
      threadColorName,
      charm,
      engravingText: engravingText.trim() || undefined,
      packaging,
      madeFor,
      giftNote: madeFor === 'gift' ? giftNote.trim() : undefined,
      stylingExplanation,
    };

    addToCart({
      productId: product.id,
      title: product.title,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: 1,
      customization,
    });
    
    onClose();
  };

  const handleSaveDesign = () => {
    const customization: CustomizationData = {
      size,
      metalFinish,
      threadColorName,
      charm,
      engravingText: engravingText.trim() || undefined,
      packaging,
      madeFor,
      giftNote: madeFor === 'gift' ? giftNote.trim() : undefined,
      stylingExplanation,
    };

    saveDesign({
      productId: product.id,
      productTitle: product.title,
      imageUrl: product.imageUrl,
      title: `${product.title} Custom - ${threadColorName}`,
      customization,
    });

    alert('Design saved to your profile coordinates! ✨');
  };

  const config = product.customizationConfig;

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.backdrop} />
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.sheetWrapper}
        >
          <View style={styles.sheetContainer}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle} numberOfLines={1}>{product.title}</Text>
              <Pressable onPress={onClose} style={styles.closeBtn}>
                <X size={20} color="#ffffff" />
              </Pressable>
            </View>

            <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
              {/* Product Info */}
              <View style={styles.imageRow}>
                <Image source={{ uri: product.imageUrl }} style={styles.prodImg} />
                <View style={styles.prodMeta}>
                  <Text style={styles.prodTitle}>{product.title}</Text>
                  <View style={styles.ratingRow}>
                    <Star size={12} color="#d4af37" fill="#d4af37" />
                    <Text style={styles.prodRating}>{product.rating.toFixed(1)}</Text>
                    <Text style={styles.prodReviews}>({product.reviewCount} reviews)</Text>
                  </View>
                  <Text style={styles.prodPrice}>₹{product.price}</Text>
                  <Text style={styles.prodCategory}>{product.category.name}</Text>
                </View>
              </View>

              <Text style={styles.prodDesc}>{product.description}</Text>

              {/* ─── AI Customizer Section ─── */}
              <AICustomizer
                productTitle={product.title}
                productCategory={product.category.name}
                customizationConfig={product.customizationConfig}
                onApplyCustomization={handleApplyAICustomization}
              />

              {/* Styling Explanation Display (If applied from AI) */}
              {stylingExplanation && (
                <GlassCard style={styles.explanationCard} borderType="gold">
                  <Text style={styles.explanationHeader}>✨ ASTROLOGICAL STYLIST VIBE</Text>
                  <Text style={styles.explanationBody}>{stylingExplanation}</Text>
                </GlassCard>
              )}

              {/* ─── Manual Controls Section ─── */}
              <Text style={styles.sectionHeading}>Manual Customization</Text>

              {/* Thread Color */}
              {config.threadColors && (
                <View style={styles.optionGroup}>
                  <Text style={styles.optionLabel}>Celestial Thread Color: {threadColorName}</Text>
                  <View style={styles.colorSelectorRow}>
                    {config.threadColors.map((color: any) => {
                      const isActive = threadColorName === color.name;
                      return (
                        <Pressable
                          key={color.name}
                          onPress={() => setThreadColorName(color.name)}
                          style={[
                            styles.colorDotOutline,
                            isActive && { borderColor: color.hex || '#d4af37' },
                          ]}
                        >
                          <View
                            style={[
                              styles.colorDot,
                              { backgroundColor: color.hex || '#ffffff' },
                            ]}
                          />
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Cord Base Material */}
              {config.materials && (
                <View style={styles.optionGroup}>
                  <Text style={styles.optionLabel}>Base Cord Material</Text>
                  <View style={styles.pillRow}>
                    {config.materials.map((mat: string) => {
                      const isActive = metalFinish === mat;
                      return (
                        <Pressable
                          key={mat}
                          onPress={() => setMetalFinish(mat)}
                          style={[styles.pillBtn, isActive && styles.pillBtnActive]}
                        >
                          <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                            {mat}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Size Selectors */}
              {config.sizes && (
                <View style={styles.optionGroup}>
                  <Text style={styles.optionLabel}>Size Coordinates</Text>
                  <View style={styles.pillRow}>
                    {config.sizes.map((sz: string) => {
                      const isActive = size === sz;
                      return (
                        <Pressable
                          key={sz}
                          onPress={() => setSize(sz)}
                          style={[styles.sizeBtn, isActive && styles.sizeBtnActive]}
                        >
                          <Text style={[styles.sizeText, isActive && styles.sizeTextActive]}>
                            {sz}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Charms */}
              {config.charms && (
                <View style={styles.optionGroup}>
                  <Text style={styles.optionLabel}>Astrological Charm</Text>
                  <View style={styles.pillRow}>
                    {config.charms.map((ch: string) => {
                      const isActive = charm === ch;
                      return (
                        <Pressable
                          key={ch}
                          onPress={() => setCharm(ch)}
                          style={[styles.pillBtn, isActive && styles.pillBtnActive]}
                        >
                          <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                            {ch}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Engraving Text */}
              <View style={styles.optionGroup}>
                <Text style={styles.optionLabel}>Custom Intention Engraving (1-12 uppercase chars)</Text>
                <TextInput
                  style={styles.textInput}
                  value={engravingText}
                  onChangeText={(t) => setEngravingText(t.toUpperCase())}
                  placeholder="e.g. PEACE, HEAL, SCO"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  maxLength={12}
                  autoCapitalize="characters"
                />
              </View>

              {/* Packaging */}
              <View style={styles.optionGroup}>
                <Text style={styles.optionLabel}>Unboxing Packaging</Text>
                <View style={styles.pillRow}>
                  {[
                    'Standard Kraft Envelope',
                    'Premium Wooden Zodiac Keepsake Box (+₹199)',
                  ].map((pkg) => {
                    const isActive = packaging === pkg;
                    return (
                      <Pressable
                        key={pkg}
                        onPress={() => setPackaging(pkg)}
                        style={[styles.pillBtn, isActive && styles.pillBtnActive, { flex: 1 }]}
                      >
                        <Text style={[styles.pillText, isActive && styles.pillTextActive, { textAlign: 'center' }]}>
                          {pkg.includes('Keepsake') ? 'Wooden Keepsake Box' : 'Kraft Envelope'}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Gifting Selector */}
              <View style={styles.optionGroup}>
                <Text style={styles.optionLabel}>Intention Recipient</Text>
                <View style={styles.pillRow}>
                  {[
                    { value: 'self', label: 'Made for Self' },
                    { value: 'gift', label: 'Send as Blessing Gift' },
                  ].map((opt) => {
                    const isActive = madeFor === opt.value;
                    return (
                      <Pressable
                        key={opt.value}
                        onPress={() => setMadeFor(opt.value as any)}
                        style={[styles.pillBtn, isActive && styles.pillBtnActive, { flex: 1 }]}
                      >
                        <Text style={[styles.pillText, isActive && styles.pillTextActive, { textAlign: 'center' }]}>
                          {opt.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Gift Note */}
              {madeFor === 'gift' && (
                <View style={styles.optionGroup}>
                  <Text style={styles.optionLabel}>Blessing card message</Text>
                  <TextInput
                    style={[styles.textInput, styles.multilineInput]}
                    value={giftNote}
                    onChangeText={setGiftNote}
                    placeholder="Woven with love, may this thread align your path..."
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    multiline
                    numberOfLines={3}
                  />
                </View>
              )}
            </ScrollView>

            {/* Bottom Actions Block */}
            <View style={styles.actionsBar}>
              <Pressable onPress={handleSaveDesign} style={styles.secondaryActionBtn}>
                <Heart size={18} color="#ffffff" />
                <Text style={styles.secActionText}>Save Design</Text>
              </Pressable>
              
              <Pressable onPress={handleAddToCart} style={styles.primaryActionBtn}>
                <ShoppingBag size={18} color="#090514" />
                <Text style={styles.primActionText}>Add to Basket</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  sheetWrapper: {
    height: '92%',
  },
  sheetContainer: {
    backgroundColor: '#090514',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderBottomWidth: 0,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    marginRight: 16,
  },
  closeBtn: {
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 99,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  imageRow: {
    flexDirection: 'row',
    gap: 16,
  },
  prodImg: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  prodMeta: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  prodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  prodRating: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  prodReviews: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
  },
  prodPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d4af37',
  },
  prodCategory: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  prodDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 18,
  },
  explanationCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.04)',
    borderColor: 'rgba(212, 175, 55, 0.2)',
    padding: 12,
    gap: 4,
  },
  explanationHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#d4af37',
    letterSpacing: 0.5,
  },
  explanationBody: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 10,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingBottom: 6,
  },
  optionGroup: {
    gap: 8,
  },
  optionLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.55)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  colorSelectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  colorDotOutline: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pillBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  pillBtnActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderColor: '#d4af37',
  },
  pillText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.65)',
    fontWeight: '500',
  },
  pillTextActive: {
    color: '#d4af37',
    fontWeight: 'bold',
  },
  sizeBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeBtnActive: {
    borderColor: '#d4af37',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  sizeText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: 'bold',
  },
  sizeTextActive: {
    color: '#d4af37',
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    fontSize: 12,
    color: '#ffffff',
  },
  multilineInput: {
    textAlignVertical: 'top',
    height: 60,
  },
  actionsBar: {
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#07040f',
  },
  secondaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    paddingVertical: 12,
  },
  secActionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  primaryActionBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#d4af37',
    borderRadius: 8,
    paddingVertical: 12,
  },
  primActionText: {
    color: '#090514',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
