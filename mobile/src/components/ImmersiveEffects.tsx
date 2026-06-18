import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View, ViewStyle, Dimensions, Pressable, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  withSpring,
  Easing,
  interpolate,
  interpolateColor,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  ZoomIn,
  SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, Line, Rect, Defs, LinearGradient, Stop, Path } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * HolographicGlassCard — A premium glassmorphism card with animated
 * holographic border, depth shadow, and scan line effect for mobile.
 */

interface HolographicGlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  glowColor?: string;
  delay?: number;
  variant?: 'gold' | 'purple' | 'indigo';
}

export function HolographicGlassCard({
  children,
  style,
  glowColor,
  delay = 0,
  variant = 'gold',
}: HolographicGlassCardProps) {
  const borderGlow = useSharedValue(0);

  const colors = {
    gold: { border: 'rgba(212, 175, 55, 0.3)', glow: 'rgba(212, 175, 55, 0.1)' },
    purple: { border: 'rgba(168, 85, 247, 0.3)', glow: 'rgba(168, 85, 247, 0.1)' },
    indigo: { border: 'rgba(99, 102, 241, 0.35)', glow: 'rgba(99, 102, 241, 0.1)' },
  };

  useEffect(() => {
    borderGlow.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true
      )
    );
  }, [delay]);

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(borderGlow.value, [0, 1], [0.15, 0.45]),
    shadowRadius: interpolate(borderGlow.value, [0, 1], [10, 24]),
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(600).springify().damping(15)}
      style={[styles.holoCard, glowStyle, { shadowColor: colors[variant].border }, style]}
    >
      {/* Holographic border */}
      <View style={[styles.holoCardBorder, { borderColor: colors[variant].border }]}>
        {/* Content */}
        <View style={styles.holoCardContent}>{children}</View>

        {/* Bottom edge glow */}
        <View style={[styles.bottomGlow, { backgroundColor: colors[variant].glow }]} />
      </View>
    </Animated.View>
  );
}

/**
 * ScalePressable — Wraps touch targets with a tactile springy scaling effect.
 */
interface ScalePressableProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
  activeScale?: number;
}

export function ScalePressable({ children, onPress, style, activeScale = 0.96 }: ScalePressableProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(activeScale, { damping: 10, stiffness: 150 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 10, stiffness: 150 });
      }}
      style={style}
    >
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </Pressable>
  );
}

/**
 * ImmersiveEntrance — Wraps the mobile app's entry with a cinematic reveal.
 * Shows a brief warp-speed animation before revealing content.
 */

interface ImmersiveEntranceProps {
  children: React.ReactNode;
  onComplete?: () => void;
}

export function ImmersiveEntrance({ children, onComplete }: ImmersiveEntranceProps) {
  const progress = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const [showContent, setShowContent] = React.useState(false);

  useEffect(() => {
    progress.value = withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) }, (finished) => {
      if (finished) {
        contentOpacity.value = withTiming(1, { duration: 800 });
      }
    });

    const timer = setTimeout(() => {
      setShowContent(true);
      onComplete?.();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const warpOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.8, 1], [1, 0.3, 0]),
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ scale: interpolate(contentOpacity.value, [0, 1], [0.95, 1]) }],
  }));

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Warp entry overlay */}
      <Animated.View style={[StyleSheet.absoluteFill, styles.warpOverlay, warpOverlayStyle]}>
        <WarpLines progress={progress} />
        <View style={styles.brandCenter}>
          <Animated.Text
            entering={ZoomIn.delay(200).duration(800)}
            style={styles.brandText}
          >
            CHOCHETE
          </Animated.Text>
          <Animated.Text
            entering={FadeInUp.delay(600).duration(500)}
            style={styles.brandSub}
          >
            Entering Cosmic Vault
          </Animated.Text>
        </View>
      </Animated.View>

      {/* Main content */}
      <Animated.View style={[StyleSheet.absoluteFill, contentStyle]}>
        {children}
      </Animated.View>
    </View>
  );
}

function WarpLines({ progress }: { progress: SharedValue<number> }) {
  const lines = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      y: 80 + i * (SCREEN_HEIGHT - 160) / 20,
      color: ['#d4af37', '#a855f7', '#06b6d4'][i % 3],
      delay: i * 50,
    })),
    []
  );

  return (
    <View style={StyleSheet.absoluteFill}>
      {lines.map((line) => (
        <WarpLine key={line.id} line={line} />
      ))}
    </View>
  );
}

function WarpLine({ line }: { line: any }) {
  const width = useSharedValue(0);
  const left = useSharedValue(SCREEN_WIDTH / 2);
  const opacity = useSharedValue(0);

  useEffect(() => {
    width.value = withDelay(
      line.delay,
      withSequence(
        withTiming(SCREEN_WIDTH * 0.7, { duration: 600, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: 400, easing: Easing.in(Easing.cubic) }),
      )
    );
    left.value = withDelay(
      line.delay,
      withSequence(
        withTiming(SCREEN_WIDTH * 0.15, { duration: 600 }),
        withTiming(SCREEN_WIDTH, { duration: 400 }),
      )
    );
    opacity.value = withDelay(
      line.delay,
      withSequence(
        withTiming(0.7, { duration: 200 }),
        withTiming(0.7, { duration: 500 }),
        withTiming(0, { duration: 300 }),
      )
    );
  }, []);

  const lineStyle = useAnimatedStyle(() => ({
    width: width.value,
    left: left.value,
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: line.y,
          height: 1.5,
          backgroundColor: line.color,
          borderRadius: 1,
        },
        lineStyle,
      ]}
    />
  );
}

/**
 * NeonGlowText — Text with animated neon glow effect for mobile headings.
 */

interface NeonGlowTextProps {
  children: string;
  style?: any;
  color?: 'gold' | 'purple' | 'cyan';
}

export function NeonGlowText({ children, style, color = 'gold' }: NeonGlowTextProps) {
  const glow = useSharedValue(0);

  const glowColors = {
    gold: '#d4af37',
    purple: '#a855f7',
    cyan: '#06b6d4',
  };

  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true
    );
  }, []);

  const textStyle = useAnimatedStyle(() => ({
    textShadowRadius: interpolate(glow.value, [0, 1], [4, 15]),
    textShadowColor: glowColors[color],
    opacity: interpolate(glow.value, [0, 1], [0.85, 1]),
  }));

  return (
    <Animated.Text style={[{ color: glowColors[color], textShadowOffset: { width: 0, height: 0 } }, textStyle, style]}>
      {children}
    </Animated.Text>
  );
}

/**
 * FloatingActionButton — A floating button with cosmic glow & pulse
 */

interface FloatingActionButtonProps {
  onPress: () => void;
  icon: React.ReactNode;
  label?: string;
  color?: 'gold' | 'purple' | 'cyan';
}

export function FloatingActionButton({ onPress, icon, label, color = 'gold' }: FloatingActionButtonProps) {
  const pulse = useSharedValue(0);
  const glowColors = {
    gold: { bg: '#d4af37', shadow: 'rgba(212, 175, 55, 0.4)' },
    purple: { bg: '#a855f7', shadow: 'rgba(168, 85, 247, 0.4)' },
    cyan: { bg: '#06b6d4', shadow: 'rgba(6, 182, 212, 0.4)' },
  };

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(pulse.value, [0, 1], [0.3, 0.7]),
    shadowRadius: interpolate(pulse.value, [0, 1], [10, 25]),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.05]) }],
  }));

  const c = glowColors[color];

  return (
    <Pressable onPress={onPress}>
      <Animated.View style={[styles.fab, { backgroundColor: c.bg, shadowColor: c.bg }, glowStyle]}>
        {icon}
        {label && <Text style={styles.fabLabel}>{label}</Text>}
      </Animated.View>
    </Pressable>
  );
}

/**
 * CinematicSection — Fade-in with depth effect for scrollable content sections.
 */

interface CinematicSectionProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export function CinematicSection({ children, delay = 0, direction = 'up' }: CinematicSectionProps) {
  const entering = direction === 'up'
    ? FadeInDown.delay(delay).duration(700).springify().damping(15)
    : direction === 'down'
    ? FadeInUp.delay(delay).duration(700).springify().damping(15)
    : direction === 'left'
    ? SlideInRight.delay(delay).duration(700).springify().damping(15)
    : FadeInDown.delay(delay).duration(700).springify().damping(15);

  return (
    <Animated.View entering={entering}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  holoCard: {
    borderRadius: 22,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  holoCardBorder: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: 'rgba(8, 8, 30, 0.7)',
  },
  holoCardContent: {
    position: 'relative',
    zIndex: 2,
  },
  bottomGlow: {
    position: 'absolute',
    bottom: 0,
    left: '15%',
    right: '15%',
    height: 1,
  },
  warpOverlay: {
    backgroundColor: '#020208',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  brandCenter: {
    alignItems: 'center',
    gap: 8,
  },
  brandText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fbbf24',
    letterSpacing: 8,
    textShadowColor: 'rgba(212, 175, 55, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  brandSub: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 999,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  fabLabel: {
    color: '#090514',
    fontSize: 13,
    fontWeight: '700',
  },
});
