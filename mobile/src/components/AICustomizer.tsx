import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { Sparkles, Check, HelpCircle } from 'lucide-react-native';
import { customizeProductWithAI } from '../lib/api';
import GlassCard from './GlassCard';

interface AICustomizerProps {
  productTitle: string;
  productCategory: string;
  customizationConfig: any;
  onApplyCustomization: (customData: any) => void;
}

export default function AICustomizer({
  productTitle,
  productCategory,
  customizationConfig,
  onApplyCustomization,
}: AICustomizerProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const handleAISubmit = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const data = await customizeProductWithAI(
        prompt,
        productTitle,
        productCategory,
        customizationConfig
      );
      setResult(data);
    } catch (err) {
      console.log('Error customizing:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!result) return;
    onApplyCustomization(result);
    // Clear prompt and result after applying
    setPrompt('');
    setResult(null);
  };

  return (
    <GlassCard style={styles.container} borderType="gold">
      <View style={styles.header}>
        <Sparkles size={16} color="#d4af37" style={styles.sparkleIcon} />
        <Text style={styles.title}>AI Astrological Customizer</Text>
      </View>
      <Text style={styles.subtitle}>
        Tell the AI Stylist what vibes, intentions, elements, or zodiac traits you want. It will choose the perfect alignment.
      </Text>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={prompt}
          onChangeText={setPrompt}
          placeholder="e.g. A Scorpio bracelet focused on healing and calm water energy"
          placeholderTextColor="rgba(255, 255, 255, 0.35)"
          multiline
          numberOfLines={2}
          maxLength={150}
        />
        <Pressable
          onPress={handleAISubmit}
          disabled={loading || !prompt.trim()}
          style={[styles.submitBtn, (!prompt.trim() || loading) && styles.disabledBtn]}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#090514" />
          ) : (
            <Sparkles size={14} color="#090514" />
          )}
        </Pressable>
      </View>

      {/* Results View */}
      {result && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultHeading}>AI Selected Alignment</Text>
          
          <View style={styles.resultGrid}>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Zodiac Sign</Text>
              <Text style={styles.resultVal}>{result.zodiacSign || 'Universal'}</Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Thread Color</Text>
              <Text style={styles.resultValGold}>{result.threadColorName || 'Sage Olive'}</Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Cord Material</Text>
              <Text style={styles.resultVal}>{result.metalFinish || 'Organic Cotton Thread'}</Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Charm</Text>
              <Text style={styles.resultVal}>{result.charm || 'None'}</Text>
            </View>
            {result.engravingText ? (
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Engraving</Text>
                <Text style={styles.resultValEngrave}>"{result.engravingText}"</Text>
              </View>
            ) : null}
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Packaging</Text>
              <Text style={styles.resultVal} numberOfLines={1}>{result.packaging || 'Standard'}</Text>
            </View>
          </View>

          {result.stylingExplanation ? (
            <View style={styles.explanationBox}>
              <Text style={styles.explanationText}>
                ✨ {result.stylingExplanation}
              </Text>
            </View>
          ) : null}

          <Pressable onPress={handleApply} style={styles.applyBtn}>
            <Text style={styles.applyBtnText}>Apply Selected Configuration</Text>
            <Check size={14} color="#090514" />
          </Pressable>
        </View>
      )}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    padding: 16,
    backgroundColor: 'rgba(212, 175, 55, 0.03)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  sparkleIcon: {
    transform: [{ rotate: '10deg' }],
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 15,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(9, 5, 20, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#ffffff',
    textAlignVertical: 'top',
    height: 52,
  },
  submitBtn: {
    backgroundColor: '#d4af37',
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledBtn: {
    opacity: 0.4,
  },
  resultContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 14,
    gap: 12,
  },
  resultHeading: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#d4af37',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  resultGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  resultItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    minWidth: '48%',
    flexGrow: 1,
  },
  resultLabel: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: 'bold',
  },
  resultVal: {
    fontSize: 10,
    color: '#ffffff',
    marginTop: 1,
  },
  resultValGold: {
    fontSize: 10,
    color: '#d4af37',
    fontWeight: 'bold',
    marginTop: 1,
  },
  resultValEngrave: {
    fontSize: 10,
    color: '#10b981',
    fontWeight: 'bold',
    marginTop: 1,
  },
  explanationBox: {
    backgroundColor: 'rgba(212, 175, 55, 0.03)',
    borderLeftWidth: 2,
    borderLeftColor: '#d4af37',
    padding: 10,
    borderRadius: 4,
  },
  explanationText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  applyBtn: {
    backgroundColor: '#d4af37',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 4,
  },
  applyBtnText: {
    color: '#090514',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
