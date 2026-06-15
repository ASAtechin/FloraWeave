import React, { useMemo, useEffect } from 'react';
import { StyleSheet, View, ViewStyle, Dimensions } from 'react-native';
import Svg, { Rect, Circle, Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';

interface CosmicBackgroundProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  intensity?: 'calm' | 'active' | 'warp';
}

const { width, height } = Dimensions.get('window');

export default function CosmicBackground({ children, style, intensity = 'active' }: CosmicBackgroundProps) {
  // Generate random static positions for stars so they don't re-render/re-randomize on state updates
  const stars = useMemo(() => {
    const starList = [];
    const count = intensity === 'warp' ? 60 : intensity === 'active' ? 45 : 30;
    for (let i = 0; i < count; i++) {
      starList.push({
        id: i,
        cx: Math.random() * width,
        cy: Math.random() * height,
        r: 0.5 + Math.random() * 2,
        opacity: 0.1 + Math.random() * 0.8,
        layer: Math.ceil(Math.random() * 3), // 1=far, 2=mid, 3=close
        twinkleDelay: Math.random() * 3000,
        twinkleDuration: 2000 + Math.random() * 3000,
      });
    }
    return starList;
  }, [intensity]);

  return (
    <View style={[styles.container, style]}>
      {/* SVG Space Gradient & Stars */}
      <View style={StyleSheet.absoluteFill}>
        <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="spaceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#02020a" />
              <Stop offset="25%" stopColor="#04030f" />
              <Stop offset="50%" stopColor="#0a0518" />
              <Stop offset="75%" stopColor="#0e0720" />
              <Stop offset="100%" stopColor="#12092c" />
            </LinearGradient>
          </Defs>
          {/* Background fill */}
          <Rect width="100%" height="100%" fill="url(#spaceGradient)" />
          
          {/* Static star base layer (non-animated for performance) */}
          {stars.filter(s => s.layer === 1).map((star) => (
            <Circle
              key={star.id}
              cx={star.cx}
              cy={star.cy}
              r={star.r * 0.7}
              fill="#ffffff"
              opacity={star.opacity * 0.4}
            />
          ))}
        </Svg>
      </View>

      {/* Animated twinkling stars (layers 2 & 3) */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {stars.filter(s => s.layer >= 2).map((star) => (
          <TwinklingDot key={star.id} star={star} />
        ))}
      </View>

      {/* Decorative nebula glows with drift animation */}
      <AnimatedNebula position="topLeft" />
      <AnimatedNebula position="bottomRight" />
      {intensity === 'warp' && <AnimatedNebula position="center" />}

      {/* Content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

/* ─── Twinkling Star Dot ─── */

function TwinklingDot({ star }: { star: any }) {
  const opacity = useSharedValue(star.opacity * 0.3);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    opacity.value = withDelay(
      star.twinkleDelay,
      withRepeat(
        withSequence(
          withTiming(star.layer === 3 ? 0.95 : 0.7, {
            duration: star.twinkleDuration / 2,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(star.layer === 3 ? 0.3 : 0.15, {
            duration: star.twinkleDuration / 2,
            easing: Easing.inOut(Easing.ease),
          }),
        ),
        -1,
        true
      )
    );
    scale.value = withDelay(
      star.twinkleDelay,
      withRepeat(
        withSequence(
          withTiming(1.4, { duration: star.twinkleDuration / 2 }),
          withTiming(0.7, { duration: star.twinkleDuration / 2 }),
        ),
        -1,
        true
      )
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const color = star.layer === 3 ? '#fbbf24' : '#a78bfa';

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: star.cx,
          top: star.cy,
          width: star.r * 2,
          height: star.r * 2,
          borderRadius: star.r,
          backgroundColor: color,
        },
        animStyle,
      ]}
    />
  );
}

/* ─── Animated Nebula Glow ─── */

function AnimatedNebula({ position }: { position: 'topLeft' | 'bottomRight' | 'center' }) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scaleVal = useSharedValue(1);
  const opacityVal = useSharedValue(0.08);

  useEffect(() => {
    translateX.value = withRepeat(
      withSequence(
        withTiming(20, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-15, { duration: 7000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1, true
    );
    translateY.value = withRepeat(
      withSequence(
        withTiming(-15, { duration: 9000, easing: Easing.inOut(Easing.ease) }),
        withTiming(10, { duration: 7000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1, true
    );
    scaleVal.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 10000 }),
        withTiming(0.9, { duration: 8000 }),
      ),
      -1, true
    );
    opacityVal.value = withRepeat(
      withSequence(
        withTiming(0.12, { duration: 6000 }),
        withTiming(0.06, { duration: 5000 }),
      ),
      -1, true
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scaleVal.value },
    ],
    opacity: opacityVal.value,
  }));

  const positionStyles = {
    topLeft: { top: -60, left: -60, backgroundColor: 'rgba(243, 156, 18, 0.35)' },
    bottomRight: { bottom: 40, right: -100, backgroundColor: 'rgba(155, 89, 182, 0.3)' },
    center: { top: '40%' as any, left: '20%' as any, backgroundColor: 'rgba(6, 182, 212, 0.2)' },
  };

  return (
    <Animated.View
      style={[
        styles.nebulaBase,
        positionStyles[position],
        animStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#02020a',
  },
  content: {
    flex: 1,
    zIndex: 10,
  },
  nebulaBase: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
  },
});
