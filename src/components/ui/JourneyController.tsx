'use client';

import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';

/**
 * JourneyController — The heart of the sci-fi browsing experience.
 * 
 * Hijacks scroll to create zone-based navigation. Each child "Zone" 
 * is a full-viewport destination. Scrolling/arrow keys trigger 
 * hyperspace-style transitions between zones.
 * 
 * Think: Mass Effect galaxy map meets Apple's AirPods Pro page.
 */

interface JourneyZone {
  id: string;
  label: string;
  icon?: string;
  color?: string;
}

interface JourneyContextType {
  currentZone: number;
  totalZones: number;
  navigateTo: (index: number) => void;
  next: () => void;
  prev: () => void;
  isTransitioning: boolean;
  progress: number; // 0-1 overall progress
  direction: 'forward' | 'backward';
  zones: JourneyZone[];
}

const JourneyContext = createContext<JourneyContextType>({
  currentZone: 0,
  totalZones: 0,
  navigateTo: () => {},
  next: () => {},
  prev: () => {},
  isTransitioning: false,
  progress: 0,
  direction: 'forward',
  zones: [],
});

export const useJourney = () => useContext(JourneyContext);

interface JourneyControllerProps {
  children: React.ReactNode;
  zones: JourneyZone[];
  transitionDuration?: number;
  className?: string;
}

export function JourneyController({
  children,
  zones,
  transitionDuration = 1200,
  className = '',
}: JourneyControllerProps) {
  const [currentZone, setCurrentZone] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrollTime = useRef(0);
  const touchStartY = useRef(0);

  const totalZones = zones.length;
  const progress = totalZones > 1 ? currentZone / (totalZones - 1) : 0;

  const navigateTo = useCallback((index: number) => {
    if (isTransitioning || index === currentZone) return;
    if (index < 0 || index >= totalZones) return;
    
    setDirection(index > currentZone ? 'forward' : 'backward');
    setIsTransitioning(true);
    setCurrentZone(index);
    
    setTimeout(() => setIsTransitioning(false), transitionDuration);
  }, [currentZone, isTransitioning, totalZones, transitionDuration]);

  const next = useCallback(() => navigateTo(currentZone + 1), [currentZone, navigateTo]);
  const prev = useCallback(() => navigateTo(currentZone - 1), [currentZone, navigateTo]);

  // Scroll hijack
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastScrollTime.current < transitionDuration + 200) return;
      lastScrollTime.current = now;

      if (e.deltaY > 30) next();
      else if (e.deltaY < -30) prev();
    };

    // Keyboard navigation
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        prev();
      } else if (e.key >= '1' && e.key <= '9') {
        const idx = parseInt(e.key) - 1;
        if (idx < totalZones) navigateTo(idx);
      }
    };

    // Touch navigation
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      const diff = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(diff) > 50) {
        if (diff > 0) next();
        else prev();
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      container.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
    window.addEventListener('keydown', handleKey);

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchend', handleTouchEnd);
      }
      window.removeEventListener('keydown', handleKey);
    };
  }, [next, prev, navigateTo, totalZones, transitionDuration]);

  return (
    <JourneyContext.Provider value={{ currentZone, totalZones, navigateTo, next, prev, isTransitioning, progress, direction, zones }}>
      <div ref={containerRef} className={`relative h-screen w-full overflow-hidden ${className}`}>
        {/* Hyperspace Transition Overlay */}
        <HyperspaceTransition active={isTransitioning} direction={direction} />
        
        {/* Zone Content */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentZone}
            custom={direction}
            variants={zoneVariants}
            initial="enter"
            animate="active"
            exit="exit"
            transition={{ duration: transitionDuration / 1000, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            {React.Children.toArray(children)[currentZone]}
          </motion.div>
        </AnimatePresence>

        {/* Orbital Progress Navigator */}
        <OrbitalNavigator />

        {/* Zone Navigation Arrows */}
        <ZoneArrows />

        {/* Zone Label HUD */}
        <ZoneLabelHUD />
      </div>
    </JourneyContext.Provider>
  );
}

// Animation variants for zone transitions
const zoneVariants = {
  enter: (direction: string) => ({
    opacity: 0,
    scale: direction === 'forward' ? 0.8 : 1.2,
    filter: 'blur(20px) brightness(2)',
    z: direction === 'forward' ? -500 : 500,
  }),
  active: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px) brightness(1)',
    z: 0,
  },
  exit: (direction: string) => ({
    opacity: 0,
    scale: direction === 'forward' ? 1.3 : 0.7,
    filter: 'blur(15px) brightness(0.5)',
    z: direction === 'forward' ? 500 : -500,
  }),
};

/**
 * HyperspaceTransition — Full-screen warp effect during zone changes.
 */
function HyperspaceTransition({ active, direction }: { active: boolean; direction: string }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 z-50 pointer-events-none overflow-hidden"
        >
          {/* Speed lines */}
          {Array.from({ length: 40 }).map((_, i) => {
            const angle = (i / 40) * 360;
            const isForward = direction === 'forward';
            return (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 0, 
                  scaleX: 0,
                }}
                animate={{ 
                  opacity: [0, 0.8, 0],
                  scaleX: [0, 1, 0.5],
                }}
                transition={{ duration: 0.8, delay: i * 0.01 }}
                className="absolute top-1/2 left-1/2 h-[1px] origin-left"
                style={{
                  width: `${60 + Math.random() * 40}%`,
                  transform: `rotate(${angle}deg)`,
                  background: `linear-gradient(90deg, transparent, ${
                    i % 3 === 0 ? 'rgba(6,182,212,0.6)' : i % 3 === 1 ? 'rgba(168,85,247,0.4)' : 'rgba(212,175,55,0.5)'
                  }, transparent)`,
                }}
              />
            );
          })}
          
          {/* Central flash */}
          <motion.div
            animate={{ scale: [0, 3, 0], opacity: [0, 0.3, 0] }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-white/20 blur-xl"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * OrbitalNavigator — Shows journey progress as an orbital path.
 * Fixed on the right side of the viewport.
 */
function OrbitalNavigator() {
  const { currentZone, totalZones, navigateTo, zones, isTransitioning } = useJourney();

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-0">
      {/* Orbital path line */}
      <div className="absolute inset-y-0 right-1/2 w-[1px] bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent" />
      
      {zones.map((zone, i) => {
        const isActive = i === currentZone;
        const isPast = i < currentZone;
        
        return (
          <button
            key={zone.id}
            onClick={() => navigateTo(i)}
            disabled={isTransitioning}
            className="relative group py-3 px-2"
            title={zone.label}
          >
            {/* Node */}
            <motion.div
              animate={{
                scale: isActive ? 1.4 : 1,
                backgroundColor: isActive ? 'rgba(6,182,212,0.9)' : isPast ? 'rgba(212,175,55,0.6)' : 'rgba(255,255,255,0.15)',
                boxShadow: isActive ? '0 0 12px rgba(6,182,212,0.5)' : 'none',
              }}
              className="w-2.5 h-2.5 rounded-full border border-white/20 transition-colors"
            />
            
            {/* Label tooltip */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-space-900/95 border border-cyan-500/30 rounded px-2.5 py-1 whitespace-nowrap backdrop-blur-sm">
                <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-wider">
                  {zone.icon} {zone.label}
                </span>
              </div>
            </div>

            {/* Active zone ring */}
            {isActive && (
              <motion.div
                animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 m-auto w-2.5 h-2.5 rounded-full border border-cyan-400/50"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * ZoneArrows — Bottom-center navigation arrows for zone jumping.
 */
function ZoneArrows() {
  const { next, prev, currentZone, totalZones, isTransitioning } = useJourney();

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4">
      {/* Previous */}
      <motion.button
        onClick={prev}
        disabled={currentZone === 0 || isTransitioning}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-10 h-10 rounded-full border border-white/10 bg-space-900/80 backdrop-blur flex items-center justify-center text-white/60 hover:text-cyan-400 hover:border-cyan-500/40 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </motion.button>

      {/* Zone counter */}
      <div className="font-mono text-[10px] text-white/40 tracking-widest min-w-[60px] text-center">
        <span className="text-cyan-400">{String(currentZone + 1).padStart(2, '0')}</span>
        <span className="mx-1">/</span>
        <span>{String(totalZones).padStart(2, '0')}</span>
      </div>

      {/* Next */}
      <motion.button
        onClick={next}
        disabled={currentZone === totalZones - 1 || isTransitioning}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-10 h-10 rounded-full border border-white/10 bg-space-900/80 backdrop-blur flex items-center justify-center text-white/60 hover:text-cyan-400 hover:border-cyan-500/40 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </motion.button>
    </div>
  );
}

/**
 * ZoneLabelHUD — Shows current zone name in top-left HUD style.
 */
function ZoneLabelHUD() {
  const { currentZone, zones, isTransitioning } = useJourney();
  const zone = zones[currentZone];

  return (
    <div className="fixed top-6 left-6 z-40">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentZone}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3"
        >
          {/* Zone icon */}
          <div className="w-8 h-8 rounded border border-cyan-500/30 bg-space-900/80 backdrop-blur flex items-center justify-center text-sm">
            {zone?.icon || '◆'}
          </div>
          
          {/* Zone info */}
          <div>
            <div className="font-mono text-[9px] text-cyan-400/60 uppercase tracking-[0.3em]">
              Zone {String(currentZone + 1).padStart(2, '0')}
            </div>
            <div className="text-sm font-bold text-white/90 tracking-wide">
              {zone?.label}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/**
 * JourneyZoneWrapper — Wraps content inside a zone with proper layout.
 */
export function JourneyZone({ children, className = '' }: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`h-screen w-full overflow-y-auto overflow-x-hidden ${className}`}>
      {children}
    </div>
  );
}
