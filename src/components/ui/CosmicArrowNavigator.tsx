'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

/**
 * CosmicArrowNavigator — Directional arrow-based navigation component
 * that creates the sensation of flying through space toward the next step.
 * 
 * Used in product selection flow, wizard, and category browsing.
 */

interface CosmicArrowNavigatorProps {
  direction: 'forward' | 'backward';
  onClick: () => void;
  disabled?: boolean;
  label?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export default function CosmicArrowNavigator({
  direction,
  onClick,
  disabled = false,
  label,
  variant = 'primary',
}: CosmicArrowNavigatorProps) {
  const arrowRef = useRef<HTMLDivElement>(null);
  
  const variantStyles = {
    primary: 'bg-gradient-to-r from-gold-500 via-nebula-500 to-teal-500',
    secondary: 'border border-gold-500/30 bg-space-900/60 backdrop-blur-sm',
    ghost: 'bg-transparent',
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative flex items-center gap-3 px-6 py-3 rounded-full
        ${variantStyles[variant]}
        ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
        transition-all duration-300 overflow-hidden
      `}
      whileHover={!disabled ? { scale: 1.05, boxShadow: '0 0 30px rgba(212,175,55,0.3)' } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
    >
      {/* Warp streak background on hover */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: direction === 'forward'
            ? 'linear-gradient(90deg, transparent, rgba(212,175,55,0.1), rgba(168,85,247,0.1), transparent)'
            : 'linear-gradient(270deg, transparent, rgba(212,175,55,0.1), rgba(168,85,247,0.1), transparent)',
        }}
      />

      {/* Backward arrow */}
      {direction === 'backward' && (
        <CosmicArrow direction="left" active={!disabled} />
      )}

      {/* Label */}
      {label && (
        <span className={`
          relative z-10 text-sm font-medium tracking-wide
          ${variant === 'primary' ? 'text-space-950' : 'text-foreground'}
        `}>
          {label}
        </span>
      )}

      {/* Forward arrow */}
      {direction === 'forward' && (
        <CosmicArrow direction="right" active={!disabled} />
      )}

      {/* Trailing star particles */}
      {!disabled && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-gold-400"
              style={{
                left: direction === 'forward' ? `${20 + i * 15}%` : `${80 - i * 15}%`,
                top: `${40 + (Math.random() - 0.5) * 30}%`,
              }}
              animate={{
                x: direction === 'forward' ? [0, -20, 0] : [0, 20, 0],
                opacity: [0, 0.8, 0],
                scale: [0.5, 1.2, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}
    </motion.button>
  );
}

/* ─── Animated Arrow with cosmic trail ─── */

function CosmicArrow({ direction, active }: { direction: 'left' | 'right'; active: boolean }) {
  const isRight = direction === 'right';

  return (
    <div className="relative flex items-center">
      {/* Trail lines */}
      {active && (
        <motion.div
          className="absolute flex gap-0.5"
          style={{
            [isRight ? 'right' : 'left']: '100%',
            flexDirection: isRight ? 'row-reverse' : 'row',
          }}
          animate={{
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {[12, 8, 5].map((w, i) => (
            <motion.div
              key={i}
              className="h-[1.5px] rounded-full"
              style={{
                width: w,
                background: 'linear-gradient(90deg, rgba(212,175,55,0.6), transparent)',
                opacity: 1 - i * 0.3,
              }}
              animate={{
                scaleX: [1, 1.3, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </motion.div>
      )}

      {/* Main arrow SVG */}
      <motion.svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        className="relative z-10"
        animate={active ? { x: isRight ? [0, 3, 0] : [0, -3, 0] } : {}}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.path
          d={isRight
            ? 'M5 12h14M13 5l7 7-7 7'
            : 'M19 12H5M11 19l-7-7 7-7'
          }
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={active ? { pathLength: [0.7, 1, 0.7] } : { pathLength: 1 }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.svg>

      {/* Glow tip */}
      {active && (
        <motion.div
          className="absolute w-2 h-2 rounded-full bg-gold-400"
          style={{
            [isRight ? 'right' : 'left']: -2,
            filter: 'blur(2px)',
          }}
          animate={{
            opacity: [0.4, 1, 0.4],
            scale: [0.8, 1.5, 0.8],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </div>
  );
}
