'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

/**
 * CinematicPageTransition — Smooth camera-like transitions between pages/sections.
 * Creates the feeling of moving through a 3D space like a film dolly shot.
 */

interface CinematicTransitionProps {
  children: React.ReactNode;
  transitionKey: string;
  direction?: 'zoom-in' | 'zoom-out' | 'dolly-left' | 'dolly-right' | 'tilt-up' | 'fade-depth';
}

const transitionVariants = {
  'zoom-in': {
    initial: { opacity: 0, scale: 0.8, filter: 'blur(10px)' },
    animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, scale: 1.2, filter: 'blur(8px)' },
  },
  'zoom-out': {
    initial: { opacity: 0, scale: 1.3, filter: 'blur(8px)' },
    animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, scale: 0.7, filter: 'blur(10px)' },
  },
  'dolly-left': {
    initial: { opacity: 0, x: 100, rotateY: -5 },
    animate: { opacity: 1, x: 0, rotateY: 0 },
    exit: { opacity: 0, x: -100, rotateY: 5 },
  },
  'dolly-right': {
    initial: { opacity: 0, x: -100, rotateY: 5 },
    animate: { opacity: 1, x: 0, rotateY: 0 },
    exit: { opacity: 0, x: 100, rotateY: -5 },
  },
  'tilt-up': {
    initial: { opacity: 0, y: 80, rotateX: 5, scale: 0.95 },
    animate: { opacity: 1, y: 0, rotateX: 0, scale: 1 },
    exit: { opacity: 0, y: -60, rotateX: -5, scale: 1.05 },
  },
  'fade-depth': {
    initial: { opacity: 0, z: -100, filter: 'blur(20px) brightness(2)' },
    animate: { opacity: 1, z: 0, filter: 'blur(0px) brightness(1)' },
    exit: { opacity: 0, z: 100, filter: 'blur(15px) brightness(0.5)' },
  },
};

export function CinematicPageTransition({ children, transitionKey, direction = 'zoom-in' }: CinematicTransitionProps) {
  const variants = transitionVariants[direction];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={transitionKey}
        initial={variants.initial}
        animate={variants.animate}
        exit={variants.exit}
        transition={{
          duration: 0.8,
          ease: [0.16, 1, 0.3, 1],
        }}
        style={{ transformStyle: 'preserve-3d', perspective: '1200px' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * CinematicReveal — Reveals content sections with a cinematic camera push effect.
 * Elements appear as if the camera is slowly pushing forward to reveal them.
 */

interface CinematicRevealProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'depth';
}

export function CinematicReveal({ children, delay = 0, direction = 'up' }: CinematicRevealProps) {
  const directionStyles = {
    up: { initial: { opacity: 0, y: 60, scale: 0.97 }, animate: { opacity: 1, y: 0, scale: 1 } },
    down: { initial: { opacity: 0, y: -60, scale: 0.97 }, animate: { opacity: 1, y: 0, scale: 1 } },
    left: { initial: { opacity: 0, x: 80, scale: 0.97 }, animate: { opacity: 1, x: 0, scale: 1 } },
    right: { initial: { opacity: 0, x: -80, scale: 0.97 }, animate: { opacity: 1, x: 0, scale: 1 } },
    depth: { initial: { opacity: 0, scale: 0.85, filter: 'blur(8px)' }, animate: { opacity: 1, scale: 1, filter: 'blur(0px)' } },
  };

  const { initial, animate } = directionStyles[direction];

  return (
    <motion.div
      initial={initial}
      whileInView={animate}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 1,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * ParallaxDepthSection — Creates multi-layered parallax depth as user scrolls.
 * Different z-depth layers move at different speeds for a 3D feel.
 */

interface ParallaxDepthSectionProps {
  children: React.ReactNode;
  depth?: number; // 0 = static, 1 = slow, 2 = medium, 3 = fast
  className?: string;
}

export function ParallaxDepthSection({ children, depth = 1, className = '' }: ParallaxDepthSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [depth * 30, -depth * 30]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95 + depth * 0.02, 1, 0.95 + depth * 0.02]);

  return (
    <motion.div ref={ref} className={className} style={{ y, scale }}>
      {children}
    </motion.div>
  );
}

/**
 * ImmersiveScrollSection — A full-viewport section that zooms into focus as the user scrolls.
 */

interface ImmersiveScrollSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function ImmersiveScrollSection({ children, className = '' }: ImmersiveScrollSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'center center'],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [0.85, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 1], [0, 0.5, 1]);
  const blur = useTransform(scrollYProgress, [0, 1], [8, 0]);

  return (
    <motion.section
      ref={ref}
      className={`relative ${className}`}
      style={{
        scale,
        opacity,
        filter: useTransform(blur, (v) => `blur(${v}px)`),
      }}
    >
      {children}
    </motion.section>
  );
}

/**
 * TypewriterGlow — Text that types in with a glowing cursor effect
 */

interface TypewriterGlowProps {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
  glowColor?: string;
}

export function TypewriterGlow({ text, className = '', speed = 50, delay = 0, glowColor = '#d4af37' }: TypewriterGlowProps) {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        setDisplayText(text.slice(0, i + 1));
        i++;
        if (i >= text.length) {
          clearInterval(interval);
          setTimeout(() => setShowCursor(false), 1500);
        }
      }, speed);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, speed, delay]);

  return (
    <span className={className}>
      {displayText}
      {showCursor && (
        <motion.span
          className="inline-block w-[2px] h-[1em] ml-0.5 align-middle"
          style={{ backgroundColor: glowColor, boxShadow: `0 0 8px ${glowColor}` }}
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}
    </span>
  );
}

/**
 * NeonText — Text with animated neon glow effect
 */

interface NeonTextProps {
  children: React.ReactNode;
  color?: 'gold' | 'purple' | 'cyan';
  className?: string;
  flicker?: boolean;
}

export function NeonText({ children, color = 'gold', className = '', flicker = false }: NeonTextProps) {
  const glowColors = {
    gold: { text: '#fbbf24', shadow: 'rgba(212, 175, 55, 0.8)' },
    purple: { text: '#c084fc', shadow: 'rgba(168, 85, 247, 0.8)' },
    cyan: { text: '#67e8f9', shadow: 'rgba(6, 182, 212, 0.8)' },
  };

  const c = glowColors[color];

  return (
    <motion.span
      className={`${className}`}
      style={{
        color: c.text,
        textShadow: `0 0 7px ${c.shadow}, 0 0 10px ${c.shadow}, 0 0 21px ${c.shadow}, 0 0 42px ${c.shadow}`,
      }}
      animate={flicker ? {
        opacity: [1, 0.8, 1, 0.9, 1, 0.7, 1],
        textShadow: [
          `0 0 7px ${c.shadow}, 0 0 10px ${c.shadow}, 0 0 21px ${c.shadow}`,
          `0 0 4px ${c.shadow}, 0 0 7px ${c.shadow}`,
          `0 0 7px ${c.shadow}, 0 0 10px ${c.shadow}, 0 0 21px ${c.shadow}, 0 0 42px ${c.shadow}`,
        ],
      } : {}}
      transition={flicker ? { duration: 3, repeat: Infinity, ease: 'easeInOut' } : {}}
    >
      {children}
    </motion.span>
  );
}

/**
 * GlitchText — Text with digital glitch animation effect
 */

interface GlitchTextProps {
  children: string;
  className?: string;
}

export function GlitchText({ children, className = '' }: GlitchTextProps) {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{children}</span>
      <motion.span
        className="absolute inset-0 text-cyan-400 z-0"
        aria-hidden
        animate={{
          x: [0, -2, 0, 2, 0],
          opacity: [0, 0.8, 0, 0.6, 0],
        }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
      >
        {children}
      </motion.span>
      <motion.span
        className="absolute inset-0 text-red-400 z-0"
        aria-hidden
        animate={{
          x: [0, 2, 0, -2, 0],
          opacity: [0, 0.6, 0, 0.8, 0],
        }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, delay: 0.1 }}
      >
        {children}
      </motion.span>
    </span>
  );
}
