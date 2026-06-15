import React from 'react';
import { StyleSheet, View, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassCardProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  borderType?: 'gold' | 'muted';
}

export default function GlassCard({
  children,
  style,
  intensity = 20,
  borderType = 'muted',
}: GlassCardProps) {
  const borderStyle = borderType === 'gold' ? styles.goldBorder : styles.mutedBorder;

  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={intensity}
        tint="dark"
        style={[styles.card, borderStyle, style]}
      >
        {children}
      </BlurView>
    );
  }

  // Android & Web fallbacks (using solid translucent background for maximum performance and compatibility)
  return (
    <View style={[styles.card, styles.androidFallback, borderStyle, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },
  androidFallback: {
    backgroundColor: 'rgba(18, 14, 28, 0.75)',
  },
  mutedBorder: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  goldBorder: {
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
});
