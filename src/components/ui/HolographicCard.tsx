'use client';

import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

/**
 * HolographicCard — A floating glassmorphism card with layered depth animations,
 * holographic reflections, and 3D tilt on mouse interaction.
 * 
 * Creates the feeling of floating holographic interfaces in a digital universe.
 */

interface HolographicCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  delay?: number;
  floating?: boolean;
  holographic?: boolean;
}

export default function HolographicCard({
  children,
  className = '',
  glowColor = 'rgba(212, 175, 55, 0.15)',
  delay = 0,
  floating = true,
  holographic = true,
}: HolographicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(mouseY, [0, 1], [8, -8]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-8, 8]), { stiffness: 150, damping: 20 });

  // Holographic gradient position
  const gradientX = useTransform(mouseX, [0, 1], [0, 100]);
  const gradientY = useTransform(mouseY, [0, 1], [0, 100]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative group ${className}`}
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: floating ? rotateX : 0,
        rotateY: floating ? rotateY : 0,
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
    >
      {/* Outer glow */}
      <motion.div
        className="absolute -inset-1 rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(600px at ${gradientX}% ${gradientY}%, ${glowColor}, transparent 70%)`,
          filter: 'blur(20px)',
        }}
      />

      {/* Holographic shimmer layer */}
      {holographic && (
        <motion.div
          className="absolute inset-0 rounded-[22px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 overflow-hidden z-10 pointer-events-none"
          style={{
            background: `
              linear-gradient(
                ${useTransform(mouseX, [0, 1], [105, 255])}deg,
                transparent 0%,
                rgba(212, 175, 55, 0.05) 20%,
                rgba(168, 85, 247, 0.08) 40%,
                rgba(6, 182, 212, 0.05) 60%,
                transparent 100%
              )
            `,
          }}
        />
      )}

      {/* Main card body */}
      <div
        className={`
          relative rounded-[22px] overflow-hidden z-20
          bg-[rgba(8,8,30,0.6)] backdrop-blur-xl
          border border-white/[0.08]
          shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]
          transition-all duration-500
          group-hover:border-white/[0.15]
          group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1),0_0_40px_${glowColor.replace('0.15', '0.1')}]
        `}
      >
        {/* Scan line effect */}
        {holographic && isHovered && (
          <motion.div
            className="absolute inset-0 pointer-events-none z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold-400/30 to-transparent"
              animate={{ top: ['0%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>
        )}

        {/* Content */}
        <div className="relative z-20">{children}</div>

        {/* Bottom edge glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-gold-400/20 to-transparent" />
      </div>

      {/* Floating depth shadow */}
      {floating && (
        <motion.div
          className="absolute inset-4 -bottom-2 rounded-[22px] -z-10"
          style={{
            background: 'rgba(0,0,0,0.3)',
            filter: 'blur(20px)',
            transform: 'translateY(10px) scaleX(0.9)',
          }}
          animate={isHovered ? { opacity: 0.6, y: 15 } : { opacity: 0.3, y: 10 }}
          transition={{ duration: 0.4 }}
        />
      )}
    </motion.div>
  );
}

/**
 * HolographicBadge — A smaller holographic element for labels/tags
 */

interface HolographicBadgeProps {
  children: React.ReactNode;
  color?: 'gold' | 'purple' | 'cyan' | 'white';
}

export function HolographicBadge({ children, color = 'gold' }: HolographicBadgeProps) {
  const colors = {
    gold: { bg: 'rgba(212, 175, 55, 0.1)', border: 'rgba(212, 175, 55, 0.3)', text: '#fbbf24' },
    purple: { bg: 'rgba(168, 85, 247, 0.1)', border: 'rgba(168, 85, 247, 0.3)', text: '#c084fc' },
    cyan: { bg: 'rgba(6, 182, 212, 0.1)', border: 'rgba(6, 182, 212, 0.3)', text: '#67e8f9' },
    white: { bg: 'rgba(255, 255, 255, 0.05)', border: 'rgba(255, 255, 255, 0.2)', text: '#f8fafc' },
  };

  const c = colors[color];

  return (
    <motion.span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm"
      style={{
        backgroundColor: c.bg,
        borderWidth: 1,
        borderColor: c.border,
        color: c.text,
      }}
      whileHover={{ scale: 1.05, boxShadow: `0 0 15px ${c.border}` }}
    >
      {children}
    </motion.span>
  );
}

/**
 * FloatingInterface — A container that creates the floating holographic panel effect
 */

interface FloatingInterfaceProps {
  children: React.ReactNode;
  position?: 'left' | 'center' | 'right';
  depth?: number;
}

export function FloatingInterface({ children, position = 'center', depth = 0 }: FloatingInterfaceProps) {
  const positionStyles = {
    left: 'mr-auto',
    center: 'mx-auto',
    right: 'ml-auto',
  };

  return (
    <motion.div
      className={`relative ${positionStyles[position]}`}
      initial={{ opacity: 0, z: -50, rotateY: position === 'left' ? 5 : position === 'right' ? -5 : 0 }}
      animate={{ opacity: 1, z: depth, rotateY: 0 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      style={{
        transformStyle: 'preserve-3d',
        transform: `translateZ(${depth}px)`,
      }}
    >
      {/* Interface frame lines */}
      <div className="absolute -top-2 -left-2 w-4 h-4 border-t border-l border-gold-400/30" />
      <div className="absolute -top-2 -right-2 w-4 h-4 border-t border-r border-gold-400/30" />
      <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b border-l border-gold-400/30" />
      <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b border-r border-gold-400/30" />

      {/* Subtle corner dots */}
      <div className="absolute -top-1 -left-1 w-1.5 h-1.5 rounded-full bg-gold-400/50" />
      <div className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-gold-400/50" />
      <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 rounded-full bg-nebula-400/50" />
      <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 rounded-full bg-nebula-400/50" />

      {children}
    </motion.div>
  );
}
