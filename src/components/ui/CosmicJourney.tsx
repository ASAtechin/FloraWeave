'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';

/**
 * CosmicJourney — An arrow-guided navigation overlay that makes users
 * feel like they are walking through the universe during product selection.
 * 
 * Features:
 * - Animated arrow path that guides the user forward
 * - Parallax star layers that shift as the user progresses
 * - Warp trail effect connecting each step
 * - Nebula particles that react to cursor/scroll
 */

interface CosmicJourneyProps {
  currentStep: number;
  totalSteps: number;
  children: React.ReactNode;
  onStepChange?: (step: number) => void;
}

interface StarParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  layer: number; // 1=far, 2=mid, 3=close
}

interface WarpTrail {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  opacity: number;
}

function generateStars(count: number): StarParticle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 0.5 + Math.random() * 2.5,
    opacity: 0.1 + Math.random() * 0.8,
    speed: 0.2 + Math.random() * 1.5,
    layer: Math.ceil(Math.random() * 3),
  }));
}

export default function CosmicJourney({ currentStep, totalSteps, children, onStepChange }: CosmicJourneyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stars] = useState(() => generateStars(150));
  const [warpActive, setWarpActive] = useState(false);
  const prevStep = useRef(currentStep);
  
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  
  const parallaxX = useSpring(useTransform(mouseX, [0, 1], [-15, 15]), { stiffness: 50, damping: 20 });
  const parallaxY = useSpring(useTransform(mouseY, [0, 1], [-10, 10]), { stiffness: 50, damping: 20 });

  // Progress through the cosmic path
  const progress = currentStep / (totalSteps - 1);

  // Trigger warp effect on step change
  useEffect(() => {
    if (currentStep !== prevStep.current) {
      setWarpActive(true);
      const timer = setTimeout(() => setWarpActive(false), 800);
      prevStep.current = currentStep;
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  // Canvas-based warp speed lines
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let warpLines: { x: number; y: number; length: number; speed: number; opacity: number }[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const generateWarpLines = () => {
      warpLines = Array.from({ length: 60 }, () => ({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        length: 20 + Math.random() * 80,
        speed: 3 + Math.random() * 8,
        opacity: 0.1 + Math.random() * 0.6,
      }));
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      if (warpActive) {
        if (warpLines.length === 0) generateWarpLines();

        warpLines.forEach((line) => {
          const gradient = ctx.createLinearGradient(
            line.x, line.y, line.x, line.y - line.length
          );
          gradient.addColorStop(0, `rgba(212, 175, 55, ${line.opacity})`);
          gradient.addColorStop(0.5, `rgba(168, 85, 247, ${line.opacity * 0.6})`);
          gradient.addColorStop(1, 'rgba(6, 182, 212, 0)');

          ctx.beginPath();
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1 + Math.random();
          ctx.moveTo(line.x, line.y);
          ctx.lineTo(line.x + (Math.random() - 0.5) * 2, line.y - line.length);
          ctx.stroke();

          line.y += line.speed;
          line.opacity *= 0.995;

          if (line.y > canvas.offsetHeight + line.length) {
            line.y = -line.length;
            line.x = Math.random() * canvas.offsetWidth;
            line.opacity = 0.1 + Math.random() * 0.6;
          }
        });
      } else {
        warpLines = [];
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [warpActive]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }, [mouseX, mouseY]);

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Deep space background */}
      <div className="absolute inset-0 bg-[#02020a]" />

      {/* Parallax Star Layers */}
      {[1, 2, 3].map((layer) => (
        <motion.div
          key={layer}
          className="absolute inset-0 pointer-events-none"
          style={{
            x: useTransform(parallaxX, (v) => v * layer * 0.5),
            y: useTransform(parallaxY, (v) => v * layer * 0.3),
          }}
        >
          {stars
            .filter((s) => s.layer === layer)
            .map((star) => (
              <motion.div
                key={star.id}
                className="absolute rounded-full"
                style={{
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  width: star.size,
                  height: star.size,
                  backgroundColor: layer === 3 ? '#fbbf24' : layer === 2 ? '#a78bfa' : '#ffffff',
                }}
                animate={{
                  opacity: [star.opacity * 0.5, star.opacity, star.opacity * 0.5],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 2 + star.speed,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: star.id * 0.02,
                }}
              />
            ))}
        </motion.div>
      ))}

      {/* Cosmic Nebula Gradient Shift */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: [
            'radial-gradient(ellipse at 20% 50%, rgba(168,85,247,0.08) 0%, transparent 60%)',
            'radial-gradient(ellipse at 80% 30%, rgba(212,175,55,0.06) 0%, transparent 60%)',
            'radial-gradient(ellipse at 50% 80%, rgba(6,182,212,0.07) 0%, transparent 60%)',
            'radial-gradient(ellipse at 20% 50%, rgba(168,85,247,0.08) 0%, transparent 60%)',
          ],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
      />

      {/* Warp Speed Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        style={{ opacity: warpActive ? 1 : 0, transition: 'opacity 0.3s ease' }}
      />

      {/* Cosmic Arrow Path Indicator */}
      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
        <CosmicArrowPath progress={progress} steps={totalSteps} currentStep={currentStep} />
      </div>

      {/* Content with entrance animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          className="relative z-30"
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 1.03 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {/* Cosmic Dust Particles floating forward */}
      <CosmicDust warpActive={warpActive} progress={progress} />
    </div>
  );
}

/* ─── Arrow Path: Animated SVG arrows showing journey through space ─── */

function CosmicArrowPath({ progress, steps, currentStep }: { progress: number; steps: number; currentStep: number }) {
  return (
    <div className="relative w-full h-20 flex items-center justify-center px-8">
      <svg className="w-full max-w-2xl h-16" viewBox="0 0 800 60" fill="none">
        {/* Main path line */}
        <motion.path
          d="M 40 30 C 150 30, 200 15, 300 30 S 450 45, 550 30 S 650 15, 760 30"
          stroke="rgba(99, 102, 241, 0.2)"
          strokeWidth="2"
          strokeDasharray="6 4"
          fill="none"
        />
        {/* Animated progress line */}
        <motion.path
          d="M 40 30 C 150 30, 200 15, 300 30 S 450 45, 550 30 S 650 15, 760 30"
          stroke="url(#arrowGradient)"
          strokeWidth="2.5"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: progress }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d4af37" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Step nodes along path */}
        {Array.from({ length: steps }).map((_, i) => {
          const t = i / (steps - 1);
          // Approximate positions along the cubic bezier
          const cx = 40 + t * 720;
          const cy = 30 + Math.sin(t * Math.PI * 2) * 10;
          const isActive = i === currentStep;
          const isCompleted = i < currentStep;

          return (
            <g key={i}>
              {/* Outer glow ring */}
              {isActive && (
                <motion.circle
                  cx={cx}
                  cy={cy}
                  r="12"
                  fill="none"
                  stroke="#d4af37"
                  strokeWidth="1"
                  filter="url(#glow)"
                  animate={{ r: [10, 14, 10], opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              {/* Node */}
              <motion.circle
                cx={cx}
                cy={cy}
                r={isActive ? 7 : 5}
                fill={isCompleted ? '#d4af37' : isActive ? '#a855f7' : 'rgba(99, 102, 241, 0.3)'}
                stroke={isActive ? '#d4af37' : 'transparent'}
                strokeWidth="2"
                animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              {/* Animated directional arrow between nodes */}
              {i < steps - 1 && (
                <motion.polygon
                  points={`${cx + 20},${cy} ${cx + 14},${cy - 4} ${cx + 14},${cy + 4}`}
                  fill={isCompleted ? '#d4af37' : 'rgba(99, 102, 241, 0.3)'}
                  animate={
                    isActive
                      ? { x: [0, 5, 0], opacity: [0.5, 1, 0.5] }
                      : {}
                  }
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
            </g>
          );
        })}

        {/* Leading arrow head at the progress front */}
        <motion.g
          animate={{ x: progress * 720 + 40 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.polygon
            points="0,-6 10,0 0,6"
            fill="#d4af37"
            filter="url(#glow)"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{ transformOrigin: 'center' }}
          />
        </motion.g>
      </svg>
    </div>
  );
}

/* ─── Cosmic Dust: Floating particles that accelerate during warp ─── */

function CosmicDust({ warpActive, progress }: { warpActive: boolean; progress: number }) {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1 + Math.random() * 3,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none z-5 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, rgba(212,175,55,0.8), rgba(168,85,247,0.4), transparent)`,
          }}
          animate={
            warpActive
              ? {
                  y: [0, -200],
                  x: [(Math.random() - 0.5) * 50, (Math.random() - 0.5) * 100],
                  opacity: [0.8, 0],
                  scale: [1, 0.3],
                }
              : {
                  y: [0, -20, 0],
                  opacity: [0.3, 0.7, 0.3],
                }
          }
          transition={
            warpActive
              ? { duration: 0.6, ease: 'easeOut' }
              : { duration: 3 + p.delay, repeat: Infinity, ease: 'easeInOut', delay: p.delay }
          }
        />
      ))}
    </div>
  );
}
