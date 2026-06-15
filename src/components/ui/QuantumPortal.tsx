'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';

/**
 * QuantumPortal — A dimensional rift / wormhole gateway transition.
 * Creates a visual "tear in spacetime" between sections.
 */

export function QuantumPortal({ children, className = '' }: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  
  const portalScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 1, 0.3]);
  const portalOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const contentScale = useTransform(scrollYProgress, [0.2, 0.5], [0.8, 1]);
  const contentOpacity = useTransform(scrollYProgress, [0.2, 0.5], [0, 1]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Portal ring effect */}
      <motion.div
        style={{ scale: portalScale, opacity: portalOpacity }}
        className="absolute inset-0 pointer-events-none flex items-center justify-center"
      >
        <div className="relative w-[600px] h-[600px] max-w-full">
          {/* Outer distortion ring */}
          <div className="absolute inset-0 rounded-full border border-purple-500/20 animate-spin" style={{ animationDuration: '20s' }} />
          <div className="absolute inset-4 rounded-full border border-cyan-500/15 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
          <div className="absolute inset-8 rounded-full border border-purple-400/10 animate-spin" style={{ animationDuration: '25s' }} />
          
          {/* Gravitational accretion disk */}
          <div className="absolute inset-12 rounded-full bg-gradient-conic from-purple-900/0 via-cyan-900/20 via-purple-900/0 via-cyan-900/20 to-purple-900/0 animate-spin blur-sm" style={{ animationDuration: '10s' }} />
          
          {/* Event horizon glow */}
          <div className="absolute inset-[40%] rounded-full bg-gradient-radial from-cyan-500/10 via-purple-900/5 to-transparent blur-xl animate-pulse" />
        </div>
      </motion.div>
      
      {/* Content emerges from portal */}
      <motion.div style={{ scale: contentScale, opacity: contentOpacity }}>
        {children}
      </motion.div>
    </div>
  );
}

/**
 * DimensionalRift — A horizontal "tear" in space that content passes through.
 * Perfect for section dividers that feel like crossing dimensions.
 */

export function DimensionalRift({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.5 });

  return (
    <div ref={ref} className={`relative h-32 flex items-center justify-center overflow-hidden ${className}`}>
      {/* Central rift line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-3xl h-[2px]"
      >
        {/* Core energy line */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/90 to-transparent" />
        
        {/* Upper distortion */}
        <div className="absolute -top-8 inset-x-0 h-8 bg-gradient-to-b from-transparent to-purple-500/10 blur-sm" />
        
        {/* Lower distortion */}
        <div className="absolute -bottom-8 inset-x-0 h-8 bg-gradient-to-t from-transparent to-cyan-500/10 blur-sm" />
        
        {/* Particle sparks along the rift */}
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 0 }}
            animate={isInView ? {
              opacity: [0, 1, 0],
              y: [0, (i % 2 === 0 ? -20 : 20)],
              x: [(i / 12) * 100 + '%']
            } : {}}
            transition={{ duration: 1.5, delay: 0.5 + i * 0.08, ease: 'easeOut' }}
            className="absolute top-0 w-0.5 h-0.5 rounded-full bg-white/80"
            style={{ left: `${(i / 12) * 100}%` }}
          />
        ))}
        
        {/* Central nexus point */}
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white/80 blur-[2px]"
        />
      </motion.div>
      
      {/* Dimensional label */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 1 }}
        className="absolute bottom-2 font-mono text-[8px] tracking-[0.5em] text-cyan-400/30 uppercase"
      >
        Dimensional Threshold
      </motion.div>
    </div>
  );
}

/**
 * WormholeTransition — Content appears to travel through a wormhole tunnel.
 * Wrap around sections for dramatic entrance effects.
 */

export function WormholeTransition({ children, className = '' }: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] });
  
  const perspective = useTransform(scrollYProgress, [0, 1], [800, 1200]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [15, 5, 0]);
  const translateZ = useTransform(scrollYProgress, [0, 1], [-200, 0]);
  const blur = useTransform(scrollYProgress, [0, 0.7, 1], [8, 2, 0]);

  return (
    <div ref={ref} className={`relative ${className}`} style={{ perspective: '1200px' }}>
      <motion.div
        style={{ 
          rotateX, 
          translateZ,
          filter: blur.get() > 0 ? `blur(${blur.get()}px)` : undefined
        }}
        className="origin-bottom"
      >
        {children}
      </motion.div>
    </div>
  );
}

/**
 * SpacetimeFold — Content section that "unfolds" from a singularity point.
 */

export function SpacetimeFold({ children, className = '', delay = 0 }: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <div ref={ref} className={className}>
      <motion.div
        initial={{ 
          opacity: 0, 
          scale: 0.6, 
          rotateY: -15,
          filter: 'blur(10px) brightness(2)'
        }}
        animate={isInView ? { 
          opacity: 1, 
          scale: 1, 
          rotateY: 0,
          filter: 'blur(0px) brightness(1)'
        } : {}}
        transition={{ 
          duration: 1.2, 
          delay,
          ease: [0.16, 1, 0.3, 1]
        }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {children}
      </motion.div>
    </div>
  );
}
