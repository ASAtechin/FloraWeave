import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, ActivityIndicator, Platform } from 'react-native';
import { Sparkles, Flame, Mountain, Wind, Droplets, ArrowRight } from 'lucide-react-native';
import Animated, { FadeInDown, FadeOut, useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import GlassCard from './GlassCard';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ElementInfo {
  name: string;
  colors: string[];
  gem: string;
  intention: string;
  thread: string;
  charms: string[];
  gradientColors: string[];
}

const ELEMENT_DATA: Record<string, ElementInfo> = {
  Fire: {
    name: 'Fire (Aries, Leo, Sagittarius)',
    colors: ['#ef4444', '#f97316', '#f59e0b'],
    gem: 'Carnelian & Sunstone',
    intention: 'Passion, Radiance, & Courage',
    thread: 'Terracotta Clay Thread',
    charms: ['Mini Sun Disk', 'Star Emblem'],
    gradientColors: ['#ef4444', '#f97316'],
  },
  Earth: {
    name: 'Earth (Taurus, Virgo, Capricorn)',
    colors: ['#10b981', '#047857', '#84cc16'],
    gem: 'Moss Agate & Green Jade',
    intention: 'Grounding, Growth, & Abundance',
    thread: 'Sage Olive Thread',
    charms: ['Oak Leaf Charm', 'Infinity Loop'],
    gradientColors: ['#10b981', '#047857'],
  },
  Air: {
    name: 'Air (Gemini, Libra, Aquarius)',
    colors: ['#a855f7', '#c084fc', '#e9d5ff'],
    gem: 'Amethyst & Clear Quartz',
    intention: 'Clarity, Intuition, & Elevation',
    thread: 'Cosmic Indigo Thread',
    charms: ['Feather Charm', 'Crescent Moon'],
    gradientColors: ['#a855f7', '#c084fc'],
  },
  Water: {
    name: 'Water (Cancer, Scorpio, Pisces)',
    colors: ['#06b6d4', '#3b82f6', '#1d4ed8'],
    gem: 'Aquamarine & Lapis Lazuli',
    intention: 'Harmony, Healing, & Flow',
    thread: 'Oceanic Blue Thread',
    charms: ['Wave Charm', 'Zodiac Water Vessel'],
    gradientColors: ['#06b6d4', '#3b82f6'],
  },
};

interface CelestialCalculatorProps {
  onCustomizeWithAlignment: (thread: string, element: string) => void;
}

export default function CelestialCalculator({ onCustomizeWithAlignment }: CelestialCalculatorProps) {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [element, setElement] = useState<string>('Air');
  const [isCalculated, setIsCalculated] = useState(false);
  const [calculating, setCalculating] = useState(false);

  // Focus states for text inputs
  const [nameFocused, setNameFocused] = useState(false);
  const [dateFocused, setDateFocused] = useState(false);

  const handleCalculate = () => {
    if (!name.trim()) return;
    setCalculating(true);
    setTimeout(() => {
      setCalculating(false);
      setIsCalculated(true);
    }, 1200);
  };

  const selectedData = ELEMENT_DATA[element];

  // Helper animated components
  const ElementButton = ({ el, isActive, onPress }: { el: any; isActive: boolean; onPress: () => void }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      borderColor: withTiming(isActive ? el.color : 'rgba(255,255,255,0.08)', { duration: 250 }),
      backgroundColor: withTiming(isActive ? `${el.color}15` : 'rgba(255,255,255,0)', { duration: 250 }),
    }));

    const Icon = el.icon;

    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.95, { damping: 12 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 12 }); }}
        style={[styles.elementButton, animatedStyle]}
      >
        <Icon size={20} color={el.color} style={styles.elementIcon} />
        <Text style={[styles.elementText, { color: isActive ? el.color : '#a8a29e' }]}>
          {el.name}
        </Text>
      </AnimatedPressable>
    );
  };

  const CalcSubmitButton = ({ onPress, disabled, calculating, text, icon: ButtonIcon }: any) => {
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.96, { damping: 12 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 12 }); }}
        disabled={disabled}
        style={[styles.button, disabled && styles.disabledButton, animatedStyle]}
      >
        {calculating ? (
          <ActivityIndicator color="#090514" />
        ) : (
          <>
            <Text style={styles.buttonText}>{text}</Text>
            {ButtonIcon && <ButtonIcon size={14} color="#090514" />}
          </>
        )}
      </AnimatedPressable>
    );
  };

  const RecalcBtn = ({ onPress }: any) => {
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.95, { damping: 12 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 12 }); }}
        style={[styles.recalcButton, animatedStyle]}
      >
        <Text style={styles.recalcButtonText}>Recalculate</Text>
      </AnimatedPressable>
    );
  };

  const ApplyBtn = ({ onPress, text, icon: ButtonIcon }: any) => {
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.96, { damping: 12 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 12 }); }}
        style={[styles.actionBtn, animatedStyle]}
      >
        <Text style={styles.actionBtnText}>{text}</Text>
        {ButtonIcon && <ButtonIcon size={14} color="#090514" />}
      </AnimatedPressable>
    );
  };

  return (
    <GlassCard style={styles.cardContainer}>
      {!isCalculated ? (
        <Animated.View 
          entering={FadeInDown.duration(450)} 
          exiting={FadeOut.duration(200)}
          style={styles.formContainer}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.badge}>
              <Sparkles size={10} color="#d4af37" />
              <Text style={styles.badgeText}>Dynamic Astral Alignment</Text>
            </View>
            <Text style={styles.title}>Intention Aura Calculator</Text>
            <Text style={styles.subtitle}>
              Configure your astrological element and birth date to discover your custom thread coloring, gemstones, and aligned celestial accessories.
            </Text>
          </View>

          {/* Input Fields */}
          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Your Name</Text>
              <TextInput
                style={[
                  styles.input,
                  nameFocused && { borderColor: '#d4af37' }
                ]}
                value={name}
                onChangeText={setName}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
                placeholder="e.g. Luna Devi"
                placeholderTextColor="rgba(255,255,255,0.3)"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Birth Date (DD/MM/YYYY)</Text>
              <TextInput
                style={[
                  styles.input,
                  dateFocused && { borderColor: '#d4af37' }
                ]}
                value={birthDate}
                onChangeText={setBirthDate}
                onFocus={() => setDateFocused(true)}
                onBlur={() => setDateFocused(false)}
                placeholder="e.g. 15/08/1999"
                placeholderTextColor="rgba(255,255,255,0.3)"
              />
            </View>
          </View>

          {/* Element Selection */}
          <View style={styles.elementSection}>
            <Text style={styles.sectionLabel}>Select Your Birth Element</Text>
            <View style={styles.elementGrid}>
              {[
                { name: 'Fire', icon: Flame, color: '#ef4444' },
                { name: 'Earth', icon: Mountain, color: '#10b981' },
                { name: 'Air', icon: Wind, color: '#a855f7' },
                { name: 'Water', icon: Droplets, color: '#06b6d4' },
              ].map((el) => (
                <ElementButton
                  key={el.name}
                  el={el}
                  isActive={element === el.name}
                  onPress={() => setElement(el.name)}
                />
              ))}
            </View>
          </View>

          {/* Submit Button */}
          <CalcSubmitButton
            onPress={handleCalculate}
            disabled={calculating || !name.trim()}
            calculating={calculating}
            text="Chart My Intentions"
            icon={Sparkles}
          />
        </Animated.View>
      ) : (
        <Animated.View 
          entering={FadeInDown.duration(450)} 
          exiting={FadeOut.duration(200)}
          style={styles.resultsContainer}
        >
          {/* Aura Visualization */}
          <View style={styles.auraWrapper}>
            <View
              style={[
                styles.glowAura,
                { backgroundColor: selectedData.colors[0], shadowColor: selectedData.colors[0] },
              ]}
            />
            <View style={styles.innerAuraRing}>
              <Sparkles size={20} color="#d4af37" style={styles.spinIcon} />
              <Text style={styles.auraElementText}>{element}</Text>
              <Text style={styles.auraStatus}>Aligned</Text>
            </View>
          </View>

          <View style={styles.resultsHeader}>
            <Text style={styles.resultsBadgeText}>Astral Alignment Profile</Text>
            <Text style={styles.resultsTitle}>{name}'s Intentions</Text>
            <Text style={styles.resultsDateText}>Birth Date: {birthDate || 'Celestial Dawn'}</Text>
          </View>

          {/* Results Grid */}
          <View style={styles.resultsGrid}>
            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>Aura Colors</Text>
              <View style={styles.colorRow}>
                {selectedData.colors.map((c, i) => (
                  <View key={i} style={[styles.colorDot, { backgroundColor: c }]} />
                ))}
                <Text style={styles.colorLabelText} numberOfLines={1}>
                  {selectedData.name.split(' ')[0]}
                </Text>
              </View>
            </View>

            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>Aligned Gemstones</Text>
              <Text style={styles.resultValueTextGold}>{selectedData.gem}</Text>
            </View>

            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>Core Intentions</Text>
              <Text style={styles.resultValueText}>{selectedData.intention}</Text>
            </View>

            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>Celestial Thread</Text>
              <Text style={styles.resultValueTextEmerald}>{selectedData.thread}</Text>
            </View>
          </View>

          {/* Action Row */}
          <View style={styles.actionRow}>
            <RecalcBtn onPress={() => setIsCalculated(false)} />
            <ApplyBtn
              onPress={() => onCustomizeWithAlignment(selectedData.thread, element)}
              text="Apply to Custom Shop"
              icon={ArrowRight}
            />
          </View>
        </Animated.View>
      )}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginVertical: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  formContainer: {
    gap: 16,
  },
  header: {
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
  },
  badgeText: {
    fontSize: 9,
    color: '#d4af37',
    fontWeight: 'bold',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.65)',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  inputGroup: {
    flex: 1,
    gap: 6,
  },
  label: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: 'rgba(9, 5, 20, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    fontSize: 13,
    color: '#ffffff',
  },
  elementSection: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  elementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  elementButton: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 12,
    gap: 8,
  },
  elementIcon: {
    marginRight: 2,
  },
  elementText: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  button: {
    backgroundColor: '#d4af37',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#090514',
    fontSize: 13,
    fontWeight: 'bold',
  },
  resultsContainer: {
    alignItems: 'center',
    gap: 16,
  },
  auraWrapper: {
    position: 'relative',
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  glowAura: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    opacity: 0.45,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 15,
  },
  innerAuraRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#090514',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  spinIcon: {
    marginBottom: 2,
  },
  auraElementText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#d4af37',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  auraStatus: {
    fontSize: 9,
    fontStyle: 'italic',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  resultsHeader: {
    alignItems: 'center',
    gap: 4,
  },
  resultsBadgeText: {
    fontSize: 9,
    color: '#d4af37',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  resultsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  resultsDateText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
  },
  resultsGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  resultCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(9, 5, 20, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  resultLabel: {
    fontSize: 8,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.4)',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  colorLabelText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 2,
  },
  resultValueTextGold: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#d4af37',
  },
  resultValueText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  resultValueTextEmerald: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#10b981',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    marginTop: 8,
  },
  recalcButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  recalcButtonText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: 'bold',
  },
  actionBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d4af37',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  actionBtnText: {
    color: '#090514',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
