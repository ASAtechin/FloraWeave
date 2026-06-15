'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';

/**
 * SciFiHUD — Iron Man / Cyberpunk style Heads-Up Display overlay.
 * Corner brackets, scan lines, data readouts, and targeting reticles.
 */

// HUD Corner Brackets that frame content
export function HUDFrame({ children, className = '', active = true }: {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
}) {
  return (
    <div className={`relative group ${className}`}>
      {/* Corner brackets */}
      {active && (
        <>
          <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-cyan-400/60 rounded-tl-sm animate-hud-pulse" />
          <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-cyan-400/60 rounded-tr-sm animate-hud-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-cyan-400/60 rounded-bl-sm animate-hud-pulse" style={{ animationDelay: '0.4s' }} />
          <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-cyan-400/60 rounded-br-sm animate-hud-pulse" style={{ animationDelay: '0.6s' }} />
          
          {/* Scanning line */}
          <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
            <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent animate-hud-scan" />
          </div>
          
          {/* Data readout dots */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 flex gap-1">
            <div className="w-1 h-1 rounded-full bg-cyan-400/80 animate-pulse" />
            <div className="w-1 h-1 rounded-full bg-cyan-400/40" />
            <div className="w-1 h-1 rounded-full bg-cyan-400/80 animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
        </>
      )}
      {children}
    </div>
  );
}

// Targeting reticle that follows cursor on hover
export function TargetingReticle({ children, className = '' }: {
  children: React.ReactNode;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {children}
      <AnimatePresence>
        {isHovering && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="pointer-events-none absolute z-50"
            style={{ left: pos.x - 20, top: pos.y - 20 }}
          >
            <svg width="40" height="40" viewBox="0 0 40 40" className="animate-spin-slow">
              <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(6,182,212,0.4)" strokeWidth="0.5" strokeDasharray="4 4" />
              <circle cx="20" cy="20" r="10" fill="none" stroke="rgba(6,182,212,0.6)" strokeWidth="0.5" />
              <line x1="20" y1="4" x2="20" y2="12" stroke="rgba(6,182,212,0.5)" strokeWidth="0.5" />
              <line x1="20" y1="28" x2="20" y2="36" stroke="rgba(6,182,212,0.5)" strokeWidth="0.5" />
              <line x1="4" y1="20" x2="12" y2="20" stroke="rgba(6,182,212,0.5)" strokeWidth="0.5" />
              <line x1="28" y1="20" x2="36" y2="20" stroke="rgba(6,182,212,0.5)" strokeWidth="0.5" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Holographic data readout panel
export function HoloDataPanel({ data, className = '' }: {
  data: { label: string; value: string; color?: string }[];
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`font-mono text-[10px] uppercase tracking-widest space-y-1.5 ${className}`}
    >
      {data.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex items-center gap-2"
        >
          <div className={`w-1.5 h-1.5 rounded-full ${item.color || 'bg-cyan-400'} animate-pulse`} />
          <span className="text-white/40">{item.label}</span>
          <span className="text-cyan-300/80 ml-auto">{item.value}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}

// Sci-Fi scanning interface overlay
export function ScanInterface({ label = 'ANALYZING', progress = 0, active = false }: {
  label?: string;
  progress?: number;
  active?: boolean;
}) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center"
        >
          {/* Rotating outer ring */}
          <div className="absolute w-32 h-32 animate-spin" style={{ animationDuration: '8s' }}>
            <svg viewBox="0 0 128 128" className="w-full h-full">
              <circle cx="64" cy="64" r="60" fill="none" stroke="rgba(6,182,212,0.2)" strokeWidth="0.5" strokeDasharray="8 4" />
              <path d="M 64 4 A 60 60 0 0 1 124 64" fill="none" stroke="rgba(6,182,212,0.6)" strokeWidth="1" strokeLinecap="round" />
            </svg>
          </div>
          
          {/* Inner targeting diamond */}
          <motion.div
            animate={{ rotate: 45, scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-8 h-8 border border-cyan-400/50 absolute"
          />
          
          {/* Label */}
          <div className="absolute -bottom-8 text-[9px] font-mono text-cyan-400/70 tracking-[0.3em] uppercase">
            {label} {progress > 0 && `${Math.round(progress)}%`}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Cyberpunk glitch line divider
export function GlitchDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`relative h-px w-full overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent animate-glitch-shift" />
      <div className="absolute left-1/4 top-0 w-2 h-full bg-cyan-400/80 animate-glitch-flicker" />
      <div className="absolute right-1/3 top-0 w-1 h-full bg-purple-400/60 animate-glitch-flicker" style={{ animationDelay: '0.3s' }} />
    </div>
  );
}

// Floating holographic badge with projection effect
export function HoloBadge({ children, className = '' }: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Projection beam below */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-3/4 h-3 bg-gradient-to-b from-cyan-400/20 to-transparent blur-sm" />
      
      {/* Badge body */}
      <div className="relative px-3 py-1 bg-space-900/90 border border-cyan-500/30 rounded-sm backdrop-blur-md">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5" />
        <span className="relative text-[10px] font-mono uppercase tracking-widest text-cyan-300/90">
          {children}
        </span>
      </div>
      
      {/* Subtle flicker dots */}
      <div className="absolute -top-0.5 -right-0.5 w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
    </div>
  );
}

// Full-screen HUD chrome overlay (goes on top of everything)
export function HUDChrome({ visible = true }: { visible?: boolean }) {
  if (!visible) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-[60]">
      {/* Top-left data cluster */}
      <div className="absolute top-4 left-4 font-mono text-[9px] text-cyan-400/40 space-y-0.5 opacity-60">
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 bg-cyan-400/60 rounded-full animate-pulse" />
          SYS.CELESTIAL_ENGINE v3.2
        </div>
        <div>QUANTUM_STATE: COHERENT</div>
        <div>TIMELINE: OPTIMAL</div>
      </div>
      
      {/* Top-right coordinates */}
      <div className="absolute top-4 right-4 font-mono text-[9px] text-cyan-400/30 text-right space-y-0.5 opacity-60">
        <div>LAT: 12.9716° N</div>
        <div>LONG: 77.5946° E</div>
        <div className="text-gold-400/40">BANGALORE NEXUS</div>
      </div>
      
      {/* Bottom scanning bar */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-48">
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent relative overflow-hidden">
          <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-transparent to-cyan-400/60 animate-hud-sweep" />
        </div>
      </div>
      
      {/* Corner decorative lines */}
      <svg className="absolute top-0 left-0 w-20 h-20 opacity-30" viewBox="0 0 80 80">
        <path d="M 0 30 L 0 0 L 30 0" fill="none" stroke="rgba(6,182,212,0.4)" strokeWidth="0.5" />
        <circle cx="0" cy="0" r="2" fill="rgba(6,182,212,0.3)" />
      </svg>
      <svg className="absolute top-0 right-0 w-20 h-20 opacity-30" viewBox="0 0 80 80">
        <path d="M 80 30 L 80 0 L 50 0" fill="none" stroke="rgba(6,182,212,0.4)" strokeWidth="0.5" />
      </svg>
      <svg className="absolute bottom-0 left-0 w-20 h-20 opacity-30" viewBox="0 0 80 80">
        <path d="M 0 50 L 0 80 L 30 80" fill="none" stroke="rgba(6,182,212,0.4)" strokeWidth="0.5" />
      </svg>
      <svg className="absolute bottom-0 right-0 w-20 h-20 opacity-30" viewBox="0 0 80 80">
        <path d="M 80 50 L 80 80 L 50 80" fill="none" stroke="rgba(6,182,212,0.4)" strokeWidth="0.5" />
      </svg>
    </div>
  );
}
