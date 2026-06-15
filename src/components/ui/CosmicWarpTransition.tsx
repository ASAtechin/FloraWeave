'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from 'framer-motion';

/**
 * CosmicWarpTransition — Full-screen warp/hyperspace transition 
 * that plays between product selection steps. Creates the feeling 
 * of traveling through space at lightspeed toward the next destination.
 */

interface CosmicWarpTransitionProps {
  active: boolean;
  onComplete?: () => void;
  direction?: 'forward' | 'backward';
}

export function CosmicWarpTransition({ active, onComplete, direction = 'forward' }: CosmicWarpTransitionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const w = window.innerWidth;
    const h = window.innerHeight;
    const centerX = w / 2;
    const centerY = h / 2;

    interface WarpStar {
      x: number;
      y: number;
      z: number;
      prevZ: number;
      color: string;
    }

    const stars: WarpStar[] = Array.from({ length: 300 }, () => ({
      x: (Math.random() - 0.5) * w * 2,
      y: (Math.random() - 0.5) * h * 2,
      z: Math.random() * w,
      prevZ: 0,
      color: ['#d4af37', '#a855f7', '#06b6d4', '#ffffff', '#fbbf24'][Math.floor(Math.random() * 5)],
    }));

    let frame = 0;
    const totalFrames = 45; // ~750ms at 60fps
    const speed = direction === 'forward' ? 30 : -20;

    const animate = () => {
      frame++;
      const progress = frame / totalFrames;
      const easedProgress = 1 - Math.pow(1 - progress, 3); // ease-out cubic

      ctx.fillStyle = `rgba(2, 2, 10, ${0.15 + progress * 0.3})`;
      ctx.fillRect(0, 0, w, h);

      stars.forEach((star) => {
        star.prevZ = star.z;
        star.z -= speed * (1 + easedProgress * 3);

        if (star.z <= 0) {
          star.z = w;
          star.x = (Math.random() - 0.5) * w * 2;
          star.y = (Math.random() - 0.5) * h * 2;
          star.prevZ = star.z;
        }
        if (star.z > w) {
          star.z = 1;
          star.prevZ = star.z;
        }

        const sx = (star.x / star.z) * w * 0.5 + centerX;
        const sy = (star.y / star.z) * h * 0.5 + centerY;
        const psx = (star.x / star.prevZ) * w * 0.5 + centerX;
        const psy = (star.y / star.prevZ) * h * 0.5 + centerY;

        const size = Math.max(0.5, (1 - star.z / w) * 3);
        const alpha = Math.min(1, (1 - star.z / w) * 1.5 * easedProgress);

        // Draw streak line
        ctx.beginPath();
        ctx.strokeStyle = star.color;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = size;
        ctx.moveTo(psx, psy);
        ctx.lineTo(sx, sy);
        ctx.stroke();

        // Draw star point
        ctx.beginPath();
        ctx.fillStyle = star.color;
        ctx.arc(sx, sy, size * 0.8, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;

      // Central vortex glow
      const vortexGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 150 * easedProgress);
      vortexGradient.addColorStop(0, `rgba(212, 175, 55, ${0.2 * easedProgress})`);
      vortexGradient.addColorStop(0.5, `rgba(168, 85, 247, ${0.1 * easedProgress})`);
      vortexGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = vortexGradient;
      ctx.fillRect(0, 0, w, h);

      if (frame < totalFrames) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, direction, onComplete]);

  if (!active) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[100] pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </motion.div>
  );
}

/**
 * CosmicScrollJourney — Scroll-driven cosmic background that makes 
 * the user feel like they're traveling deeper into space as they 
 * scroll through products.
 */

interface CosmicScrollJourneyProps {
  children: React.ReactNode;
}

export function CosmicScrollJourney({ children }: CosmicScrollJourneyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });

  const bgY = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const starsY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const nebulaRotate = useTransform(scrollYProgress, [0, 1], [0, 30]);
  const nebulaScale = useTransform(scrollYProgress, [0, 1], [1, 1.3]);

  // Arrow indicators that pulse based on scroll progress
  const arrowOpacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [1, 0.3, 0.3, 0]);

  return (
    <div ref={containerRef} className="relative">
      {/* Parallax deep space layer */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ y: bgY }}
      >
        {/* Depth gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#02020a] via-[#050520] to-[#0a0830]" />
        
        {/* Floating nebula clouds */}
        <motion.div
          className="absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, rgba(168,85,247,0.4), transparent)',
            filter: 'blur(60px)',
            rotate: nebulaRotate,
            scale: nebulaScale,
          }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, rgba(212,175,55,0.3), transparent)',
            filter: 'blur(50px)',
            rotate: useTransform(nebulaRotate, (v) => -v),
          }}
        />
      </motion.div>

      {/* Star field with parallax */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{ y: starsY }}
      >
        <ScrollStarField />
      </motion.div>

      {/* Scroll direction arrows */}
      <motion.div
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        style={{ opacity: arrowOpacity }}
      >
        <motion.div
          className="flex flex-col items-center gap-1"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="text-xs text-gold-400/60 tracking-widest uppercase">Explore Deeper</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gold-400/60">
            <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gold-400/30 -mt-3">
            <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      </motion.div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

/* ─── Scroll-reactive star field ─── */

function ScrollStarField() {
  const stars = useRef(
    Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 200, // 200% height for scroll coverage
      size: 0.5 + Math.random() * 2,
      twinkleSpeed: 2 + Math.random() * 4,
      color: ['#ffffff', '#fbbf24', '#a78bfa', '#67e8f9'][Math.floor(Math.random() * 4)],
    }))
  ).current;

  return (
    <div className="absolute inset-0 w-full h-[200%]">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y / 2}%`,
            width: star.size,
            height: star.size,
            backgroundColor: star.color,
          }}
          animate={{
            opacity: [0.2, 0.9, 0.2],
            scale: [0.8, 1.3, 0.8],
          }}
          transition={{
            duration: star.twinkleSpeed,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: star.id * 0.05,
          }}
        />
      ))}
    </div>
  );
}

/**
 * CosmicProductReveal — Entrance animation for product cards
 * that makes products appear as if emerging from deep space.
 */

interface CosmicProductRevealProps {
  children: React.ReactNode;
  index: number;
  inView?: boolean;
}

export function CosmicProductReveal({ children, index, inView = true }: CosmicProductRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9, rotateX: 10 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1, rotateX: 0 } : {}}
      transition={{
        duration: 0.7,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{
        y: -8,
        scale: 1.02,
        transition: { duration: 0.3 },
      }}
      className="relative group"
    >
      {/* Cosmic entry trail */}
      <motion.div
        className="absolute -inset-2 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(135deg, rgba(212,175,55,0.05), rgba(168,85,247,0.05), rgba(6,182,212,0.05))',
          filter: 'blur(20px)',
        }}
      />
      {children}
    </motion.div>
  );
}
