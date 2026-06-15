'use client';

import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

/**
 * GravitationalLens — Product card that warps space around it on hover.
 * Creates a black-hole-like gravitational distortion effect with
 * accretion disk glow, spacetime curvature rings, and light bending.
 */

interface GravitationalLensCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  intensity?: 'subtle' | 'medium' | 'intense';
}

export function GravitationalLensCard({
  children,
  className = '',
  glowColor = 'rgba(212, 175, 55, 0.3)',
  intensity = 'medium',
}: GravitationalLensCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  
  // Smooth spring values for card rotation
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [8, -8]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-8, 8]), { stiffness: 200, damping: 20 });
  
  // Gravitational pull effect
  const pullX = useSpring(useTransform(mouseX, [0, 0.5, 1], [-3, 0, 3]), { stiffness: 300, damping: 25 });
  const pullY = useSpring(useTransform(mouseY, [0, 0.5, 1], [-3, 0, 3]), { stiffness: 300, damping: 25 });

  const distortionScale = intensity === 'subtle' ? 0.5 : intensity === 'medium' ? 1 : 1.5;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); mouseX.set(0.5); mouseY.set(0.5); }}
      style={{ 
        rotateX, 
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className={`relative group cursor-pointer ${className}`}
    >
      {/* Gravitational field rings */}
      <motion.div
        animate={isHovered ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.4 }}
        className="absolute -inset-8 pointer-events-none"
      >
        {/* Outer spacetime curvature */}
        <div className="absolute inset-0 rounded-[32px] border border-white/[0.03] animate-spin" style={{ animationDuration: '20s' }} />
        <div className="absolute inset-2 rounded-[28px] border border-white/[0.04] animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
        <div className="absolute inset-4 rounded-[24px] border border-white/[0.05] animate-spin" style={{ animationDuration: '25s' }} />
        
        {/* Accretion disk glow */}
        <div 
          className="absolute inset-0 rounded-[32px] blur-xl opacity-50"
          style={{ background: `radial-gradient(ellipse at center, ${glowColor}, transparent 70%)` }}
        />
      </motion.div>

      {/* Main card body */}
      <motion.div
        style={{ x: pullX, y: pullY }}
        className="relative z-10 rounded-2xl overflow-hidden bg-space-900/80 border border-white/[0.08] backdrop-blur-xl shadow-2xl"
      >
        {/* Inner holographic sheen */}
        <motion.div
          style={{
            background: useTransform(
              mouseX,
              [0, 0.5, 1],
              [
                'linear-gradient(135deg, rgba(6,182,212,0.05) 0%, transparent 50%)',
                'linear-gradient(135deg, transparent 0%, rgba(212,175,55,0.03) 50%, transparent 100%)',
                'linear-gradient(225deg, rgba(168,85,247,0.05) 0%, transparent 50%)',
              ]
            )
          }}
          className="absolute inset-0 pointer-events-none z-20 transition-opacity duration-300"
        />

        {/* Light refraction edge */}
        <motion.div
          animate={isHovered ? { opacity: 0.6 } : { opacity: 0 }}
          className="absolute inset-0 pointer-events-none z-20"
          style={{
            background: 'conic-gradient(from 0deg, transparent, rgba(6,182,212,0.1), transparent, rgba(168,85,247,0.1), transparent)',
            borderRadius: '16px',
          }}
        />
        
        {children}
      </motion.div>

      {/* Hawking radiation particles */}
      <motion.div
        animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
        className="absolute -inset-4 pointer-events-none"
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            animate={isHovered ? {
              x: [0, Math.cos(i * Math.PI / 4) * 30 * distortionScale],
              y: [0, Math.sin(i * Math.PI / 4) * 30 * distortionScale],
              opacity: [0, 0.6, 0],
              scale: [0, 1, 0],
            } : {}}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.25 }}
            className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full bg-cyan-400/60"
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

/**
 * EventHorizonButton — A button that creates a singularity collapse on click.
 */

export function EventHorizonButton({ children, onClick, className = '' }: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const [isCollapsing, setIsCollapsing] = useState(false);

  const handleClick = () => {
    setIsCollapsing(true);
    setTimeout(() => {
      setIsCollapsing(false);
      onClick?.();
    }, 600);
  };

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(6,182,212,0.2)' }}
      whileTap={{ scale: 0.98 }}
      animate={isCollapsing ? { scale: [1, 0.95, 1.05, 1] } : {}}
      className={`relative overflow-hidden group ${className}`}
    >
      {/* Singularity pulse on click */}
      {isCollapsing && (
        <motion.div
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 rounded-full bg-white/20 pointer-events-none"
          style={{ transformOrigin: 'center' }}
        />
      )}
      
      {/* Orbital energy ring on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-[-1px] rounded-[inherit] bg-gradient-conic from-cyan-500/30 via-transparent via-purple-500/30 via-transparent to-cyan-500/30 animate-spin" style={{ animationDuration: '3s' }} />
      </div>
      
      {/* Inner content */}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
