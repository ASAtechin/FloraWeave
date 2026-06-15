'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, Gift, ArrowRight, Compass } from 'lucide-react';
import { useJourney } from './JourneyController';

/**
 * Zone 1: LaunchPad — The hero as a spaceship cockpit.
 * The user "launches" their journey from here.
 */

export function LaunchPadZone() {
  const { next, currentZone } = useJourney();
  const [countdown, setCountdown] = useState<number | null>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Parallax on mouse
  const rotateX = useTransform(mouseY, [-300, 300], [2, -2]);
  const rotateY = useTransform(mouseX, [-300, 300], [-2, 2]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleLaunch = () => {
    setCountdown(3);
    let count = 3;
    const interval = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(interval);
        setCountdown(null);
        next();
      } else {
        setCountdown(count);
      }
    }, 400);
  };

  return (
    <div
      className="h-full w-full flex flex-col items-center justify-center relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Deep space background gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-space-900 via-space-950 to-black" />
      
      {/* Animated star layers */}
      <div className="absolute inset-0">
        {Array.from({ length: 80 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            className="absolute w-[2px] h-[2px] bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Cockpit frame edges */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-0 bottom-0 left-0 w-12 bg-gradient-to-r from-black/40 to-transparent" />
        <div className="absolute top-0 bottom-0 right-0 w-12 bg-gradient-to-l from-black/40 to-transparent" />
        
        {/* Cockpit HUD lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M 0 85 Q 50 75 100 85" fill="none" stroke="rgba(6,182,212,0.4)" strokeWidth="0.2" />
          <path d="M 10 90 Q 50 82 90 90" fill="none" stroke="rgba(6,182,212,0.3)" strokeWidth="0.15" />
          <circle cx="50" cy="50" r="25" fill="none" stroke="rgba(6,182,212,0.1)" strokeWidth="0.1" strokeDasharray="2 3" />
        </svg>
      </div>

      {/* Main content with parallax */}
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative z-10 text-center space-y-8 max-w-4xl px-6"
      >
        {/* System status badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-space-900/80 backdrop-blur"
        >
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-[0.2em]">
            Systems Online · Bangalore Nexus Connected
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="font-serif text-5xl sm:text-7xl lg:text-8xl font-bold text-white leading-[1.05]"
        >
          Begin Your{' '}
          <span className="bg-gradient-to-r from-gold-400 via-gold-300 to-gold-500 bg-clip-text text-transparent">
            Celestial
          </span>
          <br />
          <span className="text-4xl sm:text-5xl lg:text-6xl text-white/90">Voyage</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-base sm:text-lg text-white/60 max-w-xl mx-auto leading-relaxed"
        >
          Navigate through cosmic dimensions to discover handcrafted accessories 
          woven with your zodiac energy and birth intentions.
        </motion.p>

        {/* Launch button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.1 }}
          className="pt-4"
        >
          {countdown !== null ? (
            <motion.div
              key="countdown"
              animate={{ scale: [1.2, 1] }}
              className="text-6xl font-mono font-bold text-cyan-400"
            >
              {countdown}
            </motion.div>
          ) : (
            <button
              onClick={handleLaunch}
              className="group relative px-10 py-4 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/40 text-white font-bold text-lg tracking-wide hover:border-cyan-400/80 transition-all duration-300 hover:shadow-[0_0_40px_rgba(6,182,212,0.2)]"
            >
              {/* Animated ring */}
              <div className="absolute inset-[-2px] rounded-full border border-cyan-500/20 animate-spin" style={{ animationDuration: '6s' }} />
              
              <span className="relative flex items-center gap-3">
                <Compass className="h-5 w-5 text-cyan-400 group-hover:animate-spin" />
                Launch Voyage
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          )}
        </motion.div>

        {/* Skip to shop link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <Link
            href="/shop"
            className="text-xs text-white/30 hover:text-white/60 transition-colors font-mono tracking-wider uppercase"
          >
            Skip to catalog →
          </Link>
        </motion.div>
      </motion.div>

      {/* Bottom instruction */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center"
      >
        <div className="text-[10px] font-mono text-white/30 tracking-widest uppercase mb-2">
          Scroll or Press Arrow to Navigate
        </div>
        <svg width="20" height="20" viewBox="0 0 20 20" className="mx-auto text-white/20">
          <path d="M10 4 L10 16 M6 12 L10 16 L14 12" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      </motion.div>
    </div>
  );
}

/**
 * Zone 2: Nebula of Intentions — The zodiac calculator zone.
 * Floating in a colorful nebula cloud.
 */
export function NebulaZone({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full relative overflow-y-auto">
      {/* Nebula background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-radial from-purple-900/30 via-space-950 to-space-950" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-purple-600/5 blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-cyan-600/5 blur-[80px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] rounded-full bg-gold-500/3 blur-[60px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '4s' }} />
      </div>
      
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 py-12">
        {children}
      </div>
    </div>
  );
}

/**
 * Zone 3: Stargate — Stats and social proof flying through a data vortex.
 */
export function StargateZone({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full relative overflow-hidden flex items-center justify-center">
      {/* Vortex rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{ rotate: 360, scale: [1, 1.02, 1] }}
            transition={{ duration: 10 + i * 5, repeat: Infinity, ease: 'linear' }}
            className="absolute rounded-full border"
            style={{
              width: `${300 + i * 150}px`,
              height: `${300 + i * 150}px`,
              borderColor: `rgba(6, 182, 212, ${0.1 - i * 0.015})`,
              borderStyle: 'dashed',
            }}
          />
        ))}
      </div>
      
      {/* Data particles streaming inward */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              x: ['100vw', '50vw', '0vw'],
              y: [`${20 + Math.random() * 60}vh`, `${40 + Math.random() * 20}vh`, `${Math.random() * 100}vh`],
              opacity: [0, 0.6, 0],
              scale: [0.5, 1, 0.3],
            }}
            transition={{ duration: 4 + Math.random() * 3, repeat: Infinity, delay: i * 0.3 }}
            className="absolute w-1 h-1 bg-cyan-400/60 rounded-full"
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-5xl px-6">
        {children}
      </div>
    </div>
  );
}

/**
 * Zone 4: CelestialForge — Brand story in a space-station environment.
 */
export function CelestialForgeZone({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full relative overflow-y-auto">
      {/* Station viewport frame */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-space-950" />
        {/* Station panel lines */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
        
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(6,182,212,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(6,182,212,0.3) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
      </div>
      
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 py-12">
        {children}
      </div>
    </div>
  );
}

/**
 * Zone 5: ArtifactDiscovery — Products floating in zero-G.
 */
export function ArtifactDiscoveryZone({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full relative overflow-y-auto">
      {/* Deep space with distant stars */}
      <div className="absolute inset-0 bg-space-950">
        {/* Distant galaxy smudge */}
        <div className="absolute top-1/4 right-1/4 w-64 h-32 bg-purple-500/3 rounded-full blur-[60px] rotate-45" />
        <div className="absolute bottom-1/3 left-1/5 w-48 h-24 bg-cyan-500/3 rounded-full blur-[50px] -rotate-12" />
      </div>
      
      {/* Floating debris particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -20, 0],
              x: [0, Math.sin(i) * 10, 0],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 8 + i, repeat: Infinity, ease: 'linear' }}
            className="absolute w-1 h-1 bg-white/10 rounded-sm"
            style={{ left: `${10 + (i / 15) * 80}%`, top: `${20 + Math.random() * 60}%` }}
          />
        ))}
      </div>

      <div className="relative z-10 h-full overflow-y-auto px-6 py-12">
        {children}
      </div>
    </div>
  );
}

/**
 * Zone 6: ConstellationMap — Interactive zodiac star map.
 */
export function ConstellationMapZone({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full relative overflow-hidden flex items-center justify-center">
      {/* Star map grid */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-space-950" />
        {/* Constellation lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M 20 30 L 35 25 L 50 35 L 65 20 L 80 30" fill="none" stroke="rgba(212,175,55,0.5)" strokeWidth="0.1" />
          <path d="M 15 60 L 30 55 L 45 65 L 55 50 L 70 60 L 85 55" fill="none" stroke="rgba(168,85,247,0.5)" strokeWidth="0.1" />
          <path d="M 25 80 L 40 75 L 55 85 L 75 70" fill="none" stroke="rgba(6,182,212,0.5)" strokeWidth="0.1" />
          {/* Star points */}
          {Array.from({ length: 20 }).map((_, i) => (
            <circle key={i} cx={10 + Math.random() * 80} cy={10 + Math.random() * 80} r="0.3" fill="rgba(255,255,255,0.4)" />
          ))}
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-7xl px-6 overflow-y-auto h-full py-12 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}

/**
 * Zone 7: ArtisanOutpost — Space station docking with artisan info.
 */
export function ArtisanOutpostZone({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full relative overflow-y-auto">
      {/* Docking station ambient */}
      <div className="absolute inset-0 bg-space-950">
        {/* Warm interior glow */}
        <div className="absolute inset-0 bg-gradient-radial from-amber-900/5 via-transparent to-transparent" />
        
        {/* Station lights */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-gold-500/10 via-transparent to-gold-500/10" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-gold-500/10 via-transparent to-gold-500/10" />
      </div>

      <div className="relative z-10 h-full overflow-y-auto px-6 py-12">
        {children}
      </div>
    </div>
  );
}
