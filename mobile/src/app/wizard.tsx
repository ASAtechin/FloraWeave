import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sparkles, ArrowRight, ArrowLeft, RefreshCw, ShoppingBag, Gift } from 'lucide-react-native';
import CosmicBackground from '@/components/CosmicBackground';
import Header from '@/components/Header';
import GlassCard from '@/components/GlassCard';
import ProductDetailsModal from '@/components/ProductDetailsModal';
import CartOverlay from '@/components/CartOverlay';
import { CosmicArrowPath, CosmicWarpEffect, CosmicArrowButton, CosmicStepTransition } from '@/components/CosmicAnimations';
import { fetchRecommendations, Product, MOCK_PRODUCTS } from '@/lib/api';

const STEPS = ['recipient', 'zodiac', 'occasion', 'budget', 'style', 'results'];

const RECIPIENTS = ['Friend', 'Partner', 'Mother', 'Sibling', 'Colleague', 'Self'];
const ZODIAC_SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const OCCASIONS = ['Birthday', 'Anniversary', 'Healing blessing', 'Protection amulet', 'Success celebration'];
const BUDGETS = [
  { label: 'Under ₹750', value: 750 },
  { label: 'Under ₹1200', value: 1200 },
  { label: 'Under ₹2000', value: 2000 },
  { label: 'Premium/Unlimited', value: 5000 },
];
const STYLES = ['Minimalist Thread', 'Beaded Astral', 'Chunky Wool Knot', 'Metallic Symbol Accents'];

export default function WizardScreen() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepDirection, setStepDirection] = useState<'forward' | 'backward'>('forward');
  const [warpActive, setWarpActive] = useState(false);
  
  // Selection state
  const [recipient, setRecipient] = useState('');
  const [zodiac, setZodiac] = useState('');
  const [occasion, setOccasion] = useState('');
  const [budget, setBudget] = useState(1200);
  const [style, setStyle] = useState('');

  // Results state
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [cartVisible, setCartVisible] = useState(false);

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setStepDirection('forward');
      setWarpActive(true);
    }
  };

  const handleWarpComplete = () => {
    setWarpActive(false);
    const nextStep = currentStepIndex + 1;
    setCurrentStepIndex(nextStep);
    
    // If navigating to results step, execute search
    if (STEPS[nextStep] === 'results') {
      getRecommendations();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setStepDirection('backward');
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const getRecommendations = async () => {
    setLoading(true);
    try {
      const recs = await fetchRecommendations({
        zodiac,
        recipient,
        occasion,
        budget,
        style,
      });
      setRecommendations(recs);
    } catch (err) {
      console.log('Error getting recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setRecipient('');
    setZodiac('');
    setOccasion('');
    setBudget(1200);
    setStyle('');
    setRecommendations([]);
    setCurrentStepIndex(0);
  };

  const handleProductSelect = (productId: string) => {
    // Find matching product in mock products or load default
    const matched = MOCK_PRODUCTS.find((p) => p.id === productId) || MOCK_PRODUCTS[0];
    
    // Auto populate customization options based on wizard outputs!
    const customProd = {
      ...matched,
      customizationConfig: {
        ...matched.customizationConfig,
        threadColors: [
          { name: zodiac === 'Scorpio' || zodiac === 'Cancer' ? 'Cosmic Indigo' : zodiac === 'Aries' || zodiac === 'Leo' ? 'Crimson Red' : 'Sage Olive', hex: zodiac === 'Scorpio' || zodiac === 'Cancer' ? '#3f51b5' : zodiac === 'Aries' || zodiac === 'Leo' ? '#cf3a3a' : '#6b8e23' },
          ...matched.customizationConfig.threadColors.filter((c: any) => c.name !== 'Sage Olive')
        ]
      }
    };
    
    setSelectedProduct(customProd);
    setDetailsVisible(true);
  };

  const stepName = STEPS[currentStepIndex];

  return (
    <CosmicBackground style={styles.container} intensity="active">
      <SafeAreaView style={styles.safeArea}>
        <Header onCartPress={() => setCartVisible(true)} />

        <View style={styles.wizardWrapper}>
          {/* Cosmic Arrow Path Progress Indicator */}
          {stepName !== 'results' && (
            <CosmicArrowPath
              currentStep={currentStepIndex}
              totalSteps={5}
              style={{ marginBottom: 12 }}
            />
          )}

          {/* Recipient Step */}
          {stepName === 'recipient' && (
            <CosmicStepTransition step={currentStepIndex} direction={stepDirection}>
              <View style={styles.stepBlock}>
                <View style={styles.headingGroup}>
                  <Gift size={20} color="#d4af37" style={styles.stepIcon} />
                  <Text style={styles.stepTitle}>Who is this blessing for?</Text>
                  <Text style={styles.stepSub}>Select the connection coordinate for this woven thread.</Text>
                </View>
                <ScrollView style={styles.optionsList}>
                  <View style={styles.gridContainer}>
                    {RECIPIENTS.map((rec) => {
                      const isActive = recipient === rec;
                      return (
                        <Pressable
                          key={rec}
                          onPress={() => setRecipient(rec)}
                          style={[styles.gridBtn, isActive && styles.gridBtnActive]}
                        >
                          <Text style={[styles.gridBtnText, isActive && styles.gridBtnTextActive]}>
                            {rec}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            </CosmicStepTransition>
          )}

          {/* Zodiac Step */}
          {stepName === 'zodiac' && (
            <CosmicStepTransition step={currentStepIndex} direction={stepDirection}>
              <View style={styles.stepBlock}>
                <View style={styles.headingGroup}>
                  <Sparkles size={20} color="#d4af37" style={styles.stepIcon} />
                  <Text style={styles.stepTitle}>What is their birth sign?</Text>
                  <Text style={styles.stepSub}>We use this to align the gemstones, thread aura, and knotting colors.</Text>
                </View>
                <ScrollView style={styles.optionsList}>
                  <View style={styles.gridContainer}>
                    {ZODIAC_SIGNS.map((zod) => {
                      const isActive = zodiac === zod;
                      return (
                        <Pressable
                          key={zod}
                          onPress={() => setZodiac(zod)}
                          style={[styles.gridBtn, isActive && styles.gridBtnActive]}
                        >
                          <Text style={[styles.gridBtnText, isActive && styles.gridBtnTextActive]}>
                            {zod}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            </CosmicStepTransition>
          )}

          {/* Occasion Step */}
          {stepName === 'occasion' && (
            <CosmicStepTransition step={currentStepIndex} direction={stepDirection}>
              <View style={styles.stepBlock}>
                <View style={styles.headingGroup}>
                  <Sparkles size={20} color="#d4af37" style={styles.stepIcon} />
                  <Text style={styles.stepTitle}>Select the intention occasion</Text>
                  <Text style={styles.stepSub}>We program the knots under the correct moon coordinates.</Text>
                </View>
                <ScrollView style={styles.optionsList}>
                  <View style={styles.listContainer}>
                    {OCCASIONS.map((occ) => {
                      const isActive = occasion === occ;
                      return (
                        <Pressable
                          key={occ}
                          onPress={() => setOccasion(occ)}
                          style={[styles.listBtn, isActive && styles.listBtnActive]}
                        >
                          <Text style={[styles.listBtnText, isActive && styles.listBtnTextActive]}>
                            {occ}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            </CosmicStepTransition>
          )}

          {/* Budget Step */}
          {stepName === 'budget' && (
            <CosmicStepTransition step={currentStepIndex} direction={stepDirection}>
              <View style={styles.stepBlock}>
                <View style={styles.headingGroup}>
                  <Sparkles size={20} color="#d4af37" style={styles.stepIcon} />
                  <Text style={styles.stepTitle}>Set your price coordinate</Text>
                  <Text style={styles.stepSub}>Artisanal knotting adjusted to your budget levels.</Text>
                </View>
                <ScrollView style={styles.optionsList}>
                  <View style={styles.listContainer}>
                    {BUDGETS.map((bud) => {
                      const isActive = budget === bud.value;
                      return (
                        <Pressable
                          key={bud.value}
                          onPress={() => setBudget(bud.value)}
                          style={[styles.listBtn, isActive && styles.listBtnActive]}
                        >
                          <Text style={[styles.listBtnText, isActive && styles.listBtnTextActive]}>
                            {bud.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            </CosmicStepTransition>
          )}

          {/* Style Step */}
          {stepName === 'style' && (
            <CosmicStepTransition step={currentStepIndex} direction={stepDirection}>
              <View style={styles.stepBlock}>
                <View style={styles.headingGroup}>
                  <Sparkles size={20} color="#d4af37" style={styles.stepIcon} />
                  <Text style={styles.stepTitle}>Choose a styling coordinate</Text>
                  <Text style={styles.stepSub}>Minimalist or Statement pieces knot-woven for presence.</Text>
                </View>
                <ScrollView style={styles.optionsList}>
                  <View style={styles.listContainer}>
                    {STYLES.map((st) => {
                      const isActive = style === st;
                      return (
                        <Pressable
                          key={st}
                          onPress={() => setStyle(st)}
                          style={[styles.listBtn, isActive && styles.listBtnActive]}
                        >
                          <Text style={[styles.listBtnText, isActive && styles.listBtnTextActive]}>
                            {st}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            </CosmicStepTransition>
          )}

          {/* Results Step */}
          {stepName === 'results' && (
            <View style={[styles.stepBlock, styles.resultsBlock]}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#d4af37" />
                  <Text style={styles.loadingText}>Aligning Weaver Recommendations...</Text>
                </View>
              ) : (
                <ScrollView style={styles.resultsScroll} contentContainerStyle={styles.resultsContent}>
                  <View style={styles.successBadge}>
                    <Sparkles size={12} color="#d4af37" />
                    <Text style={styles.successBadgeText}>Alignment Complete</Text>
                  </View>
                  <Text style={styles.resultsTitle}>AI Stylist Alignments</Text>
                  <Text style={styles.resultsSub}>
                    Custom threads proposed for {recipient || 'your friend'}'s {occasion || 'occasion'} based on {zodiac || 'cosmic'} coordinates.
                  </Text>

                  {recommendations.map((rec, idx) => (
                    <GlassCard key={idx} style={styles.recoCard} borderType="gold">
                      <View style={styles.recoHeader}>
                        <View style={styles.recoBadge}>
                          <Text style={styles.recoBadgeText}>Recommendation #{idx + 1}</Text>
                        </View>
                        <Text style={styles.recoPrice}>₹{rec.price}</Text>
                      </View>
                      
                      <Text style={styles.recoTitle}>{rec.title}</Text>
                      <Text style={styles.recoReason}>
                        ✨ {rec.reason}
                      </Text>

                      <Pressable
                        onPress={() => handleProductSelect(rec.productId)}
                        style={styles.recoBtn}
                      >
                        <Text style={styles.recoBtnText}>Customize & Handcraft</Text>
                        <ArrowRight size={14} color="#090514" />
                      </Pressable>
                    </GlassCard>
                  ))}

                  <Pressable onPress={handleRestart} style={styles.restartBtn}>
                    <RefreshCw size={14} color="#ffffff" />
                    <Text style={styles.restartBtnText}>Find Another Alignment</Text>
                  </Pressable>
                  <View style={styles.pad} />
                </ScrollView>
              )}
            </View>
          )}

          {/* Navigation Controls with Cosmic Arrows */}
          {stepName !== 'results' && (
            <View style={styles.navBar}>
              <CosmicArrowButton
                direction="backward"
                onPress={handleBack}
                disabled={currentStepIndex === 0}
                label="Back"
              />

              <CosmicArrowButton
                direction="forward"
                onPress={handleNext}
                disabled={
                  (stepName === 'recipient' && !recipient) ||
                  (stepName === 'zodiac' && !zodiac) ||
                  (stepName === 'occasion' && !occasion) ||
                  (stepName === 'style' && !style)
                }
                label={stepName === 'style' ? 'Consult AI' : 'Continue'}
              />
            </View>
          )}
        </View>

        {/* Cosmic Warp Transition Effect */}
        <CosmicWarpEffect
          active={warpActive}
          direction={stepDirection}
          onComplete={handleWarpComplete}
        />

        {/* Dynamic Modals */}
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
  wizardWrapper: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  progressRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 20,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
  },
  progressSegmentActive: {
    backgroundColor: '#d4af37',
  },
  stepBlock: {
    flex: 1,
    gap: 16,
  },
  headingGroup: {
    gap: 6,
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepIcon: {
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  stepSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 12,
  },
  optionsList: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingVertical: 10,
  },
  gridBtn: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridBtnActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderColor: '#d4af37',
  },
  gridBtnText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: 'bold',
  },
  gridBtnTextActive: {
    color: '#d4af37',
  },
  listContainer: {
    gap: 10,
    paddingVertical: 10,
  },
  listBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  listBtnActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderColor: '#d4af37',
  },
  listBtnText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: 'bold',
  },
  listBtnTextActive: {
    color: '#d4af37',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'transparent',
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  disabledNavBtn: {
    opacity: 0.35,
  },
  navBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  navBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#d4af37',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  navBtnPrimaryText: {
    color: '#090514',
    fontSize: 12,
    fontWeight: 'bold',
  },
  resultsBlock: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 12,
    color: '#d4af37',
    fontWeight: 'bold',
  },
  resultsScroll: {
    flex: 1,
  },
  resultsContent: {
    gap: 16,
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
    backgroundColor: 'rgba(212,175,55,0.05)',
  },
  successBadgeText: {
    fontSize: 9,
    color: '#d4af37',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  resultsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  resultsSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 8,
  },
  recoCard: {
    gap: 10,
    padding: 14,
    backgroundColor: 'rgba(212, 175, 55, 0.02)',
  },
  recoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recoBadge: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recoBadgeText: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  recoPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#d4af37',
  },
  recoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  recoReason: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  recoBtn: {
    backgroundColor: '#d4af37',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 6,
    gap: 6,
    marginTop: 4,
  },
  recoBtnText: {
    color: '#090514',
    fontSize: 11,
    fontWeight: 'bold',
  },
  restartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 10,
  },
  restartBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pad: {
    height: 80,
  },
});
