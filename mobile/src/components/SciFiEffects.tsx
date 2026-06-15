import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  interpolate,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import Svg, { Circle, Line, Path, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const AnimatedLine = Animated.createAnimatedComponent(Line);

/**
 * SciFiHUDOverlay — Full-screen HUD chrome for mobile.
 * Corner brackets, scan lines, coordinate readouts.
 */

export function SciFiHUDOverlay({ visible = true }: { visible?: boolean }) {
  const scanPos = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    scanPos.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.linear }),
      -1,
      false
    );
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true
    );
  }, []);

  const scanLineStyle = useAnimatedStyle(() => ({
    top: interpolate(scanPos.value, [0, 1], [-2, SCREEN_HEIGHT]),
    opacity: interpolate(scanPos.value, [0, 0.1, 0.9, 1], [0, 0.4, 0.4, 0]),
  }));

  const cornerPulseStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.3, 0.8]),
  }));

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Scanning line */}
      <Animated.View style={[styles.scanLine, scanLineStyle]} />

      {/* Corner brackets */}
      <Animated.View style={[styles.cornerTL, cornerPulseStyle]}>
        <View style={[styles.cornerBracket, styles.cornerBracketTL]} />
      </Animated.View>
      <Animated.View style={[styles.cornerTR, cornerPulseStyle]}>
        <View style={[styles.cornerBracket, styles.cornerBracketTR]} />
      </Animated.View>
      <Animated.View style={[styles.cornerBL, cornerPulseStyle]}>
        <View style={[styles.cornerBracket, styles.cornerBracketBL]} />
      </Animated.View>
      <Animated.View style={[styles.cornerBR, cornerPulseStyle]}>
        <View style={[styles.cornerBracket, styles.cornerBracketBR]} />
      </Animated.View>

      {/* Top-left data readout */}
      <Animated.View entering={FadeIn.delay(500).duration(800)} style={styles.dataReadoutTL}>
        <Text style={styles.hudText}>SYS.CELESTIAL v3.2</Text>
        <Text style={styles.hudTextDim}>QUANTUM_STATE: COHERENT</Text>
      </Animated.View>

      {/* Top-right coordinates */}
      <Animated.View entering={FadeIn.delay(700).duration(800)} style={styles.dataReadoutTR}>
        <Text style={[styles.hudText, { textAlign: 'right' }]}>26.9124° N</Text>
        <Text style={[styles.hudTextGold, { textAlign: 'right' }]}>BANGALORE NEXUS</Text>
      </Animated.View>

      {/* Bottom sweep bar */}
      <View style={styles.bottomBar}>
        <Animated.View style={[styles.sweepDot, useAnimatedStyle(() => ({
          left: interpolate(scanPos.value, [0, 1], [0, SCREEN_WIDTH * 0.4]),
        }))]} />
      </View>
    </View>
  );
}

/**
 * QuantumPulseRing — Expanding energy ring emanating from a point.
 * Used on button presses and interaction points.
 */

interface QuantumPulseRingProps {
  active: boolean;
  color?: string;
  size?: number;
}

export function QuantumPulseRing({ active, color = '#06b6d4', size = 80 }: QuantumPulseRingProps) {
  const ring1 = useSharedValue(0);
  const ring2 = useSharedValue(0);
  const ring3 = useSharedValue(0);

  useEffect(() => {
    if (active) {
      ring1.value = 0;
      ring2.value = 0;
      ring3.value = 0;
      ring1.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) });
      ring2.value = withDelay(200, withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) }));
      ring3.value = withDelay(400, withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) }));
    }
  }, [active]);

  const ring1Style = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(ring1.value, [0, 1], [0.2, 1.5]) }],
    opacity: interpolate(ring1.value, [0, 0.3, 1], [0.8, 0.5, 0]),
    borderColor: color,
  }));

  const ring2Style = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(ring2.value, [0, 1], [0.2, 1.3]) }],
    opacity: interpolate(ring2.value, [0, 0.3, 1], [0.6, 0.4, 0]),
    borderColor: color,
  }));

  const ring3Style = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(ring3.value, [0, 1], [0.2, 1.1]) }],
    opacity: interpolate(ring3.value, [0, 0.3, 1], [0.4, 0.3, 0]),
    borderColor: color,
  }));

  return (
    <View style={[styles.pulseContainer, { width: size, height: size }]}>
      <Animated.View style={[styles.pulseRing, { width: size, height: size }, ring1Style]} />
      <Animated.View style={[styles.pulseRing, { width: size, height: size }, ring2Style]} />
      <Animated.View style={[styles.pulseRing, { width: size, height: size }, ring3Style]} />
    </View>
  );
}

/**
 * DataMatrixRain — Matrix-style falling symbols using native views.
 * Lighter alternative to canvas for mobile.
 */

export function DataMatrixRain({ intensity = 'medium' }: { intensity?: 'light' | 'medium' | 'heavy' }) {
  const GLYPHS = '♈♉♊♋♌♍♎♏♐♑♒♓☉☽★⚡◇△▽○●';
  const columnCount = intensity === 'light' ? 8 : intensity === 'medium' ? 12 : 18;

  const columns = useMemo(() =>
    Array.from({ length: columnCount }, (_, i) => ({
      id: i,
      x: (i / columnCount) * SCREEN_WIDTH,
      chars: Array.from({ length: 6 }, () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]),
      speed: 2000 + Math.random() * 3000,
      delay: Math.random() * 2000,
    })),
    [columnCount]
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {columns.map((col) => (
        <DataColumn key={col.id} column={col} />
      ))}
    </View>
  );
}

function DataColumn({ column }: { column: any }) {
  const y = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    y.value = withDelay(
      column.delay,
      withRepeat(
        withSequence(
          withTiming(-100, { duration: 0 }),
          withTiming(SCREEN_HEIGHT + 100, { duration: column.speed, easing: Easing.linear }),
        ),
        -1,
        false
      )
    );
    opacity.value = withDelay(column.delay, withTiming(1, { duration: 500 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[{ position: 'absolute', left: column.x }, style]}>
      {column.chars.map((char: string, i: number) => (
        <Text
          key={i}
          style={[
            styles.matrixChar,
            { opacity: 1 - i * 0.15, color: i === 0 ? '#06b6d4' : 'rgba(6, 182, 212, 0.4)' },
          ]}
        >
          {char}
        </Text>
      ))}
    </Animated.View>
  );
}

/**
 * GravitationalField — Visual indicator of gravitational warping around an element.
 * Shows concentric rings that pulse and orbit.
 */

export function GravitationalField({ size = 200, color = '#d4af37' }: { size?: number; color?: string }) {
  const rotate1 = useSharedValue(0);
  const rotate2 = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    rotate1.value = withRepeat(withTiming(360, { duration: 12000, easing: Easing.linear }), -1, false);
    rotate2.value = withRepeat(withTiming(-360, { duration: 8000, easing: Easing.linear }), -1, false);
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.95, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true
    );
  }, []);

  const ring1Style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate1.value}deg` }, { scale: scale.value }],
  }));

  const ring2Style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate2.value}deg` }],
  }));

  return (
    <View style={[styles.gravitationalContainer, { width: size, height: size }]}>
      <Animated.View style={[styles.orbitRing, { width: size, height: size, borderColor: color + '20' }, ring1Style]} />
      <Animated.View style={[styles.orbitRing, { width: size * 0.75, height: size * 0.75, borderColor: color + '30' }, ring2Style]} />
      {/* Core glow */}
      <View style={[styles.gravitationalCore, { backgroundColor: color + '10', width: size * 0.3, height: size * 0.3 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(6, 182, 212, 0.3)',
  },
  cornerTL: { position: 'absolute', top: 8, left: 8 },
  cornerTR: { position: 'absolute', top: 8, right: 8 },
  cornerBL: { position: 'absolute', bottom: 8, left: 8 },
  cornerBR: { position: 'absolute', bottom: 8, right: 8 },
  cornerBracket: {
    width: 20,
    height: 20,
    borderColor: 'rgba(6, 182, 212, 0.5)',
  },
  cornerBracketTL: { borderTopWidth: 1.5, borderLeftWidth: 1.5 },
  cornerBracketTR: { borderTopWidth: 1.5, borderRightWidth: 1.5 },
  cornerBracketBL: { borderBottomWidth: 1.5, borderLeftWidth: 1.5 },
  cornerBracketBR: { borderBottomWidth: 1.5, borderRightWidth: 1.5 },
  dataReadoutTL: {
    position: 'absolute',
    top: 32,
    left: 12,
  },
  dataReadoutTR: {
    position: 'absolute',
    top: 32,
    right: 12,
  },
  hudText: {
    fontFamily: 'monospace',
    fontSize: 8,
    color: 'rgba(6, 182, 212, 0.5)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  hudTextDim: {
    fontFamily: 'monospace',
    fontSize: 7,
    color: 'rgba(6, 182, 212, 0.3)',
    letterSpacing: 0.5,
  },
  hudTextGold: {
    fontFamily: 'monospace',
    fontSize: 8,
    color: 'rgba(212, 175, 55, 0.5)',
    letterSpacing: 1,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 6,
    left: '30%',
    right: '30%',
    height: 1,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    overflow: 'hidden',
  },
  sweepDot: {
    position: 'absolute',
    top: -1,
    width: 20,
    height: 3,
    backgroundColor: 'rgba(6, 182, 212, 0.5)',
    borderRadius: 2,
  },
  pulseContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    borderWidth: 1.5,
    borderRadius: 999,
  },
  matrixChar: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
  gravitationalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitRing: {
    position: 'absolute',
    borderWidth: 0.5,
    borderRadius: 999,
    borderStyle: 'dashed',
  },
  gravitationalCore: {
    borderRadius: 999,
  },
});
