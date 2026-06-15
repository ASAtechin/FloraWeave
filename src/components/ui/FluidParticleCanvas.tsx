'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

/**
 * FluidParticleCanvas — A full-screen 2D canvas with fluid-simulation-inspired
 * particle motion. Creates a living, breathing atmosphere of glowing particles
 * that react to cursor movement and flow organically.
 */

interface FluidParticleCanvasProps {
  className?: string;
  particleCount?: number;
  mouseInfluence?: number;
  colorScheme?: 'cosmic' | 'gold' | 'neon';
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  trail: { x: number; y: number }[];
}

export default function FluidParticleCanvas({
  className = '',
  particleCount = 120,
  mouseInfluence = 150,
  colorScheme = 'cosmic',
}: FluidParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000, px: -1000, py: -1000 });
  const rafRef = useRef<number>(0);

  const colorPalettes = {
    cosmic: ['#d4af37', '#a855f7', '#06b6d4', '#fbbf24', '#c084fc', '#67e8f9'],
    gold: ['#d4af37', '#fbbf24', '#f59e0b', '#eab308', '#fcd34d', '#fde68a'],
    neon: ['#06b6d4', '#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f43f5e'],
  };

  const colors = colorPalettes[colorScheme];

  const createParticle = useCallback((x?: number, y?: number): Particle => {
    const canvas = canvasRef.current;
    const w = canvas?.offsetWidth || window.innerWidth;
    const h = canvas?.offsetHeight || window.innerHeight;

    return {
      x: x ?? Math.random() * w,
      y: y ?? Math.random() * h,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: 1 + Math.random() * 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 0.3 + Math.random() * 0.5,
      life: 0,
      maxLife: 200 + Math.random() * 400,
      trail: [],
    };
  }, [colors]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize particles
    particlesRef.current = Array.from({ length: particleCount }, () => createParticle());

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.px = mouseRef.current.x;
      mouseRef.current.py = mouseRef.current.y;
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    window.addEventListener('mousemove', handleMouse);

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    const animate = () => {
      // Semi-transparent clear for trails
      ctx.fillStyle = 'rgba(2, 2, 8, 0.08)';
      ctx.fillRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mdx = mouseRef.current.x - mouseRef.current.px;
      const mdy = mouseRef.current.y - mouseRef.current.py;

      particlesRef.current.forEach((p, i) => {
        p.life++;

        // Mouse fluid influence
        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouseInfluence && dist > 0) {
          const force = (mouseInfluence - dist) / mouseInfluence;
          const angle = Math.atan2(dy, dx);
          
          // Push away + add mouse velocity
          p.vx -= Math.cos(angle) * force * 0.3;
          p.vy -= Math.sin(angle) * force * 0.3;
          p.vx += mdx * force * 0.05;
          p.vy += mdy * force * 0.05;
        }

        // Organic flow (curl noise approximation)
        const noiseX = Math.sin(p.y * 0.005 + p.life * 0.01) * 0.02;
        const noiseY = Math.cos(p.x * 0.005 + p.life * 0.01) * 0.02;
        p.vx += noiseX;
        p.vy += noiseY;

        // Damping
        p.vx *= 0.98;
        p.vy *= 0.98;

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Store trail
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 8) p.trail.shift();

        // Wrap around edges
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        // Life cycle alpha
        const lifeRatio = p.life / p.maxLife;
        const fadeAlpha = lifeRatio < 0.1 ? lifeRatio * 10 : lifeRatio > 0.8 ? (1 - lifeRatio) * 5 : 1;
        const currentAlpha = p.alpha * fadeAlpha;

        // Draw trail
        if (p.trail.length > 2) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let t = 1; t < p.trail.length; t++) {
            ctx.lineTo(p.trail[t].x, p.trail[t].y);
          }
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = currentAlpha * 0.3;
          ctx.lineWidth = p.size * 0.5;
          ctx.stroke();
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = currentAlpha;
        ctx.fill();

        // Glow effect
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.5);
        gradient.addColorStop(0, p.color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.globalAlpha = currentAlpha * 0.3;
        ctx.fill();

        ctx.globalAlpha = 1;

        // Respawn dead particles
        if (p.life > p.maxLife) {
          particlesRef.current[i] = createParticle();
        }
      });

      // Draw connections between nearby particles
      ctx.globalAlpha = 0.1;
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const a = particlesRef.current[i];
          const b = particlesRef.current[j];
          const dist = Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
          if (dist < 100) {
            const alpha = (1 - dist / 100) * 0.15;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = a.color;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;

      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, [particleCount, mouseInfluence, createParticle]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ opacity: 0.7 }}
    />
  );
}

/**
 * GlowingCursor — Custom cursor trail effect with glowing particles
 */

export function GlowingCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const trails: { x: number; y: number; el: HTMLDivElement }[] = [];
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden;';
    document.body.appendChild(container);

    for (let i = 0; i < 6; i++) {
      const el = document.createElement('div');
      el.style.cssText = `
        position: absolute;
        width: ${8 - i}px;
        height: ${8 - i}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(212,175,55,${0.8 - i * 0.1}), transparent);
        pointer-events: none;
        transition: transform 0.1s ease;
        opacity: 0;
      `;
      container.appendChild(el);
      trails.push({ x: 0, y: 0, el });
    }

    let animId: number;
    const animate = (e: MouseEvent) => {
      trails.forEach((trail, i) => {
        const delay = i * 3;
        setTimeout(() => {
          trail.x = e.clientX;
          trail.y = e.clientY;
          trail.el.style.left = `${trail.x - (8 - i) / 2}px`;
          trail.el.style.top = `${trail.y - (8 - i) / 2}px`;
          trail.el.style.opacity = '1';
        }, delay * 16);
      });
    };

    window.addEventListener('mousemove', animate);

    return () => {
      window.removeEventListener('mousemove', animate);
      document.body.removeChild(container);
    };
  }, []);

  return null;
}
