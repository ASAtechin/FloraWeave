import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View, Dimensions, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  withSpring,
  Easing,
  interpolate,
  useAnimatedProps,
  cancelAnimation,
  runOnJS,
  SharedValue,
} from 'react-native-reanimated';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, G, Line } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedG = Animated.createAnimatedComponent(G);

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * CosmicArrowPath — An animated SVG arrow-based progress indicator
 * that shows the user's journey through the product selection universe.
 * 
 * Features:
 * - Curved path through space with animated dash progress
 * - Glowing nodes at each step
 * - Pulsing directional arrows along the path
 * - Parallax star micro-animations in the background
 */

interface CosmicArrowPathProps {
  currentStep: number;
  totalSteps: number;
  style?: ViewStyle;
}

export function CosmicArrowPath({ currentStep, totalSteps, style }: CosmicArrowPathProps) {
  const progress = useSharedValue(0);
  const arrowPulse = useSharedValue(0);
  const glowIntensity = useSharedValue(0);

  useEffect(() => {
    const targetProgress = currentStep / (totalSteps - 1);
    progress.value = withSpring(targetProgress, {
      damping: 15,
      stiffness: 80,
      mass: 1,
    });
    
    // Pulse the active arrow
    arrowPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true
    );

    // Glow effect on step change
    glowIntensity.value = withSequence(
      withTiming(1, { duration: 300 }),
      withTiming(0.4, { duration: 600 }),
    );
  }, [currentStep, totalSteps]);

  const pathWidth = SCREEN_WIDTH - 48;
  const pathHeight = 50;

  // Generate cubic bezier path points
  const pathD = useMemo(() => {
    const startX = 20;
    const endX = pathWidth - 20;
    const midY = pathHeight / 2;
    return `M ${startX} ${midY} C ${startX + pathWidth * 0.25} ${midY - 15}, ${startX + pathWidth * 0.5} ${midY + 15}, ${startX + pathWidth * 0.75} ${midY} S ${endX - 20} ${midY - 10}, ${endX} ${midY}`;
  }, [pathWidth, pathHeight]);

  // Animated path dash
  const animatedPathProps = useAnimatedProps(() => {
    const totalLength = pathWidth * 1.2; // approximate
    return {
      strokeDashoffset: totalLength * (1 - progress.value),
      strokeDasharray: `${totalLength} ${totalLength}`,
    };
  });

  // Step node positions (evenly spaced along path)
  const nodePositions = useMemo(() => {
    return Array.from({ length: totalSteps }, (_, i) => {
      const t = i / (totalSteps - 1);
      const x = 20 + t * (pathWidth - 40);
      const y = pathHeight / 2 + Math.sin(t * Math.PI * 1.5) * 10;
      return { x, y };
    });
  }, [totalSteps, pathWidth, pathHeight]);

  return (
    <View style={[styles.arrowPathContainer, style]}>
      <Svg width={pathWidth} height={pathHeight} viewBox={`0 0 ${pathWidth} ${pathHeight}`}>
        <Defs>
          <LinearGradient id="arrowPathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#d4af37" />
            <Stop offset="50%" stopColor="#a855f7" />
            <Stop offset="100%" stopColor="#06b6d4" />
          </LinearGradient>
          <LinearGradient id="arrowTrailGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="rgba(212,175,55,0.1)" />
            <Stop offset="100%" stopColor="rgba(212,175,55,0.4)" />
          </LinearGradient>
        </Defs>

        {/* Background path (dimmed) */}
        <Path
          d={pathD}
          stroke="rgba(99, 102, 241, 0.15)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="6 4"
        />

        {/* Animated progress path */}
        <AnimatedPath
          d={pathD}
          stroke="url(#arrowPathGradient)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          animatedProps={animatedPathProps}
        />

        {/* Step nodes */}
        {nodePositions.map((pos, i) => {
          const isActive = i === currentStep;
          const isCompleted = i < currentStep;
          return (
            <G key={i}>
              {/* Outer glow for active */}
              {isActive && (
                <AnimatedCircle
                  cx={pos.x}
                  cy={pos.y}
                  r="10"
                  fill="none"
                  stroke="#d4af37"
                  strokeWidth="1"
                  opacity={0.4}
                />
              )}
              {/* Node dot */}
              <Circle
                cx={pos.x}
                cy={pos.y}
                r={isActive ? 6 : 4}
                fill={isCompleted ? '#d4af37' : isActive ? '#a855f7' : 'rgba(99, 102, 241, 0.3)'}
                stroke={isActive ? '#d4af37' : 'none'}
                strokeWidth={isActive ? 1.5 : 0}
              />
              {/* Directional arrow between nodes */}
              {i < totalSteps - 1 && (
                <Path
                  d={`M ${pos.x + 12} ${pos.y - 3} L ${pos.x + 18} ${pos.y} L ${pos.x + 12} ${pos.y + 3}`}
                  fill={isCompleted ? '#d4af37' : 'rgba(99, 102, 241, 0.25)'}
                />
              )}
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

/**
 * CosmicWarpEffect — Full-screen warp/hyperspace animation
 * triggered during step transitions. Creates the illusion
 * of traveling through space at light speed.
 */

interface CosmicWarpEffectProps {
  active: boolean;
  direction?: 'forward' | 'backward';
  onComplete?: () => void;
}

export function CosmicWarpEffect({ active, direction = 'forward', onComplete }: CosmicWarpEffectProps) {
  const warpProgress = useSharedValue(0);
  const streaks = useMemo(() => 
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * SCREEN_WIDTH,
      startY: Math.random() * SCREEN_HEIGHT,
      length: 40 + Math.random() * 120,
      speed: 0.5 + Math.random() * 1.5,
      opacity: 0.2 + Math.random() * 0.6,
      color: ['#d4af37', '#a855f7', '#06b6d4', '#ffffff'][Math.floor(Math.random() * 4)],
    })),
    []
  );

  useEffect(() => {
    if (active) {
      warpProgress.value = 0;
      warpProgress.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }, (finished) => {
        if (finished && onComplete) {
          runOnJS(onComplete)();
        }
      });
    } else {
      warpProgress.value = 0;
    }
  }, [active]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(warpProgress.value, [0, 0.1, 0.8, 1], [0, 1, 1, 0]),
  }));

  if (!active) return null;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.warpContainer, containerStyle]}>
      {streaks.map((streak) => (
        <WarpStreak key={streak.id} streak={streak} direction={direction} warpProgress={warpProgress} />
      ))}
      {/* Central flash */}
      <CentralVortex warpProgress={warpProgress} />
    </Animated.View>
  );
}

function WarpStreak({ streak, direction, warpProgress }: any) {
  const animStyle = useAnimatedStyle(() => {
    const progress = warpProgress.value;
    const dirMultiplier = direction === 'forward' ? -1 : 1;
    const translateY = interpolate(progress, [0, 1], [0, dirMultiplier * SCREEN_HEIGHT * streak.speed]);
    const scaleY = interpolate(progress, [0, 0.3, 1], [0.3, 2, 3]);
    const opacity = interpolate(progress, [0, 0.2, 0.7, 1], [0, streak.opacity, streak.opacity * 0.5, 0]);

    return {
      transform: [{ translateY }, { scaleY }],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: streak.x,
          top: streak.startY,
          width: 1.5,
          height: streak.length,
          backgroundColor: streak.color,
          borderRadius: 1,
        },
        animStyle,
      ]}
    />
  );
}

function CentralVortex({ warpProgress }: { warpProgress: SharedValue<number> }) {
  const style = useAnimatedStyle(() => {
    const scale = interpolate(warpProgress.value, [0, 0.5, 1], [0, 1.5, 0]);
    const opacity = interpolate(warpProgress.value, [0, 0.3, 0.7, 1], [0, 0.3, 0.2, 0]);
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.centralVortex, style]} />
  );
}

/**
 * CosmicArrowButton — An animated navigation button with cosmic trail effect.
 * Makes the user feel they're launching forward through space.
 */

interface CosmicArrowButtonProps {
  direction: 'forward' | 'backward';
  onPress: () => void;
  disabled?: boolean;
  label?: string;
}

export function CosmicArrowButton({ direction, onPress, disabled = false, label }: CosmicArrowButtonProps) {
  const pulseAnim = useSharedValue(0);
  const trailAnim = useSharedValue(0);

  useEffect(() => {
    if (!disabled) {
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true
      );
      trailAnim.value = withRepeat(
        withTiming(1, { duration: 1500, easing: Easing.linear }),
        -1,
        false
      );
    }
  }, [disabled]);

  const arrowStyle = useAnimatedStyle(() => {
    const translateX = interpolate(pulseAnim.value, [0, 1], [0, direction === 'forward' ? 4 : -4]);
    return {
      transform: [{ translateX }],
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    const opacity = interpolate(pulseAnim.value, [0, 1], [0.3, 0.8]);
    const scale = interpolate(pulseAnim.value, [0, 1], [0.8, 1.2]);
    return { opacity, transform: [{ scale }] };
  });

  return (
    <Animated.View style={[styles.arrowBtnWrapper, disabled && styles.arrowBtnDisabled]}>
      {/* Glow behind button */}
      {!disabled && (
        <Animated.View style={[styles.arrowBtnGlow, glowStyle]} />
      )}
      
      <View style={[styles.arrowBtn, direction === 'forward' ? styles.arrowBtnForward : styles.arrowBtnBackward]}>
        {direction === 'backward' && (
          <Animated.View style={arrowStyle}>
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <Path d="M19 12H5M11 19l-7-7 7-7" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Animated.View>
        )}
        
        {label && (
          <Animated.Text style={[
            styles.arrowBtnLabel,
            direction === 'forward' ? styles.arrowBtnLabelPrimary : styles.arrowBtnLabelSecondary
          ]}>
            {label}
          </Animated.Text>
        )}

        {direction === 'forward' && (
          <Animated.View style={arrowStyle}>
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <Path d="M5 12h14M13 5l7 7-7 7" stroke={disabled ? 'rgba(255,255,255,0.3)' : '#090514'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Animated.View>
        )}

        {/* Trailing particles */}
        {!disabled && direction === 'forward' && (
          <View style={styles.trailContainer}>
            {[0, 1, 2].map((i) => (
              <TrailDot key={i} index={i} trailAnim={trailAnim} />
            ))}
          </View>
        )}
      </View>
    </Animated.View>
  );
}

function TrailDot({ index, trailAnim }: { index: number; trailAnim: SharedValue<number> }) {
  const dotStyle = useAnimatedStyle(() => {
    const delay = index * 0.2;
    const adjustedProgress = (trailAnim.value + delay) % 1;
    const opacity = interpolate(adjustedProgress, [0, 0.3, 0.7, 1], [0, 0.8, 0.4, 0]);
    const translateX = interpolate(adjustedProgress, [0, 1], [-8 - index * 6, -20 - index * 6]);
    const scale = interpolate(adjustedProgress, [0, 0.3, 1], [0.5, 1, 0.3]);

    return {
      opacity,
      transform: [{ translateX }, { scale }],
    };
  });

  return (
    <Animated.View style={[styles.trailDot, dotStyle]} />
  );
}

/**
 * AnimatedStarField — Enhanced cosmic background with animated twinkling stars,
 * shooting stars, and depth layers.
 */

interface AnimatedStarFieldProps {
  intensity?: 'low' | 'medium' | 'high';
  style?: ViewStyle;
}

export function AnimatedStarField({ intensity = 'medium', style }: AnimatedStarFieldProps) {
  const starCounts = { low: 25, medium: 50, high: 80 };
  const count = starCounts[intensity];

  const stars = useMemo(() => 
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 0.5 + Math.random() * 2.5,
      layer: Math.ceil(Math.random() * 3), // 1=far dim, 2=mid, 3=close bright
      twinkleDelay: Math.random() * 4000,
      twinkleDuration: 2000 + Math.random() * 3000,
    })),
    [count]
  );

  return (
    <View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      {stars.map((star) => (
        <TwinklingStar key={star.id} star={star} />
      ))}
      {/* Occasional shooting star */}
      <ShootingStar />
    </View>
  );
}

function TwinklingStar({ star }: { star: any }) {
  const opacity = useSharedValue(star.layer === 3 ? 0.8 : star.layer === 2 ? 0.5 : 0.2);
  const scale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withDelay(
      star.twinkleDelay,
      withRepeat(
        withSequence(
          withTiming(star.layer === 3 ? 0.9 : 0.6, { duration: star.twinkleDuration / 2 }),
          withTiming(star.layer === 3 ? 0.3 : 0.15, { duration: star.twinkleDuration / 2 }),
        ),
        -1,
        true
      )
    );
    scale.value = withDelay(
      star.twinkleDelay,
      withRepeat(
        withSequence(
          withTiming(1.3, { duration: star.twinkleDuration / 2 }),
          withTiming(0.8, { duration: star.twinkleDuration / 2 }),
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

  const color = star.layer === 3 ? '#fbbf24' : star.layer === 2 ? '#a78bfa' : '#ffffff';

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: `${star.x}%`,
          top: `${star.y}%`,
          width: star.size,
          height: star.size,
          borderRadius: star.size / 2,
          backgroundColor: color,
        },
        animStyle,
      ]}
    />
  );
}

function ShootingStar() {
  const translateX = useSharedValue(-50);
  const translateY = useSharedValue(-50);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const triggerShootingStar = () => {
      const startX = Math.random() * SCREEN_WIDTH * 0.5;
      const startY = Math.random() * SCREEN_HEIGHT * 0.3;
      translateX.value = startX;
      translateY.value = startY;

      opacity.value = withSequence(
        withTiming(0.9, { duration: 100 }),
        withTiming(0, { duration: 600 }),
      );
      translateX.value = withTiming(startX + 200 + Math.random() * 150, {
        duration: 700,
        easing: Easing.out(Easing.cubic),
      });
      translateY.value = withTiming(startY + 100 + Math.random() * 80, {
        duration: 700,
        easing: Easing.out(Easing.cubic),
      });
    };

    // Trigger shooting stars at random intervals
    const interval = setInterval(triggerShootingStar, 4000 + Math.random() * 6000);
    return () => clearInterval(interval);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { rotate: '35deg' }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.shootingStar, animStyle]} />
  );
}

/**
 * CosmicStepTransition — Wraps step content with entrance/exit animations
 * that feel like traveling through space.
 */

interface CosmicStepTransitionProps {
  children: React.ReactNode;
  step: number;
  direction?: 'forward' | 'backward';
}

export function CosmicStepTransition({ children, step, direction = 'forward' }: CosmicStepTransitionProps) {
  const translateY = useSharedValue(direction === 'forward' ? 40 : -40);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(direction === 'forward' ? 0.95 : 1.05);

  useEffect(() => {
    translateY.value = direction === 'forward' ? 40 : -40;
    opacity.value = 0;
    scale.value = direction === 'forward' ? 0.95 : 1.05;

    translateY.value = withSpring(0, { damping: 18, stiffness: 90 });
    opacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) });
    scale.value = withSpring(1, { damping: 15, stiffness: 100 });
  }, [step]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animStyle}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  arrowPathContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  warpContainer: {
    backgroundColor: 'rgba(2, 2, 10, 0.85)',
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centralVortex: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
  },
  arrowBtnWrapper: {
    position: 'relative',
  },
  arrowBtnDisabled: {
    opacity: 0.35,
  },
  arrowBtnGlow: {
    position: 'absolute',
    inset: -4,
    borderRadius: 999,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
  },
  arrowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
  },
  arrowBtnForward: {
    backgroundColor: '#d4af37',
  },
  arrowBtnBackward: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  arrowBtnLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  arrowBtnLabelPrimary: {
    color: '#090514',
  },
  arrowBtnLabelSecondary: {
    color: '#ffffff',
  },
  trailContainer: {
    position: 'absolute',
    right: 12,
    top: '50%',
    flexDirection: 'row',
  },
  trailDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fbbf24',
    marginLeft: 2,
  },
  shootingStar: {
    position: 'absolute',
    width: 40,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#ffffff',
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});
