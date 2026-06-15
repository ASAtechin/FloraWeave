'use client';

import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FluidParticleCanvas, { GlowingCursor } from './FluidParticleCanvas';

// Dynamic import for Three.js (heavy, only load client-side)
const CosmicUniverse3D = dynamic(() => import('./CosmicUniverse3D'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-[#020208]" />,
});

/**
 * ImmersiveExperience — The full immersive sci-fi homepage shell.
 * Combines:
 * - WebGL 3D particle universe (Three.js)
 * - Fluid 2D particle canvas overlay
 * - Glowing cursor trail
 * - Cinematic entrance sequence
 * - Floating UI chrome elements
 */

interface ImmersiveExperienceProps {
  children: React.ReactNode;
  show3D?: boolean;
  showParticles?: boolean;
  showCursor?: boolean;
}

export default function ImmersiveExperience({
  children,
  show3D = true,
  showParticles = true,
  showCursor = true,
}: ImmersiveExperienceProps) {
  const [loaded, setLoaded] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);

  useEffect(() => {
    // Give WebGL a moment to initialize
    const timer = setTimeout(() => setLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loaded) {
      const timer = setTimeout(() => setIntroComplete(true), 1800);
      return () => clearTimeout(timer);
    }
  }, [loaded]);

  return (
    <div className="relative min-h-screen bg-[#020208] text-foreground overflow-hidden">
      {/* Cinematic intro overlay */}
      <AnimatePresence>
        {!introComplete && (
          <motion.div
            className="fixed inset-0 z-[200] bg-[#020208] flex items-center justify-center"
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className="flex flex-col items-center gap-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Entry warp lines */}
              <div className="absolute inset-0 overflow-hidden">
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute h-[1px]"
                    style={{
                      left: '50%',
                      top: `${20 + i * 3}%`,
                      width: '0%',
                      background: `linear-gradient(90deg, transparent, ${
                        ['#d4af37', '#a855f7', '#06b6d4'][i % 3]
                      }, transparent)`,
                    }}
                    animate={{
                      width: ['0%', '80%', '0%'],
                      left: ['50%', '10%', '90%'],
                      opacity: [0, 0.6, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      delay: 0.5 + i * 0.05,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>

              {/* Logo text */}
              <motion.h1
                className="font-serif text-4xl sm:text-6xl font-bold tracking-wider"
                initial={{ opacity: 0, letterSpacing: '0.5em' }}
                animate={{ opacity: 1, letterSpacing: '0.15em' }}
                transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  color: '#fbbf24',
                  textShadow: '0 0 20px rgba(212,175,55,0.5), 0 0 40px rgba(212,175,55,0.2)',
                }}
              >
                CHOCHETE
              </motion.h1>
              <motion.p
                className="text-sm text-foreground/50 tracking-[0.3em] uppercase"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                Entering the Cosmic Vault
              </motion.p>

              {/* Loading indicator */}
              <motion.div
                className="w-32 h-[2px] bg-space-800 rounded-full overflow-hidden mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-gold-500 via-nebula-500 to-teal-500"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.5, delay: 0.3, ease: 'easeInOut' }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D WebGL Universe Background */}
      {show3D && loaded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
        >
          <CosmicUniverse3D intensity="active" />
        </motion.div>
      )}

      {/* 2D Fluid Particle Overlay */}
      {showParticles && introComplete && (
        <motion.div
          className="fixed inset-0 z-[1] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          <FluidParticleCanvas particleCount={80} mouseInfluence={120} colorScheme="cosmic" />
        </motion.div>
      )}

      {/* Glowing Cursor */}
      {showCursor && introComplete && <GlowingCursor />}

      {/* Ambient UI Chrome — top edge glow */}
      <div className="fixed top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold-400/20 to-transparent z-50 pointer-events-none" />
      <div className="fixed bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-nebula-400/15 to-transparent z-50 pointer-events-none" />

      {/* Corner accent markers */}
      <div className="fixed top-4 left-4 w-8 h-8 border-t border-l border-gold-400/20 z-50 pointer-events-none" />
      <div className="fixed top-4 right-4 w-8 h-8 border-t border-r border-gold-400/20 z-50 pointer-events-none" />
      <div className="fixed bottom-4 left-4 w-8 h-8 border-b border-l border-nebula-400/15 z-50 pointer-events-none" />
      <div className="fixed bottom-4 right-4 w-8 h-8 border-b border-r border-nebula-400/15 z-50 pointer-events-none" />

      {/* Main Content Layer */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0 }}
        animate={introComplete ? { opacity: 1 } : {}}
        transition={{ duration: 1, delay: 0.3 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
