'use client';

import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';

/**
 * NeuralConstellation — An animated network of interconnected nodes
 * that form zodiac-like patterns. Nodes pulse and connections flow with energy.
 * Uses canvas for performance with 60fps animations.
 */

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  energy: number;
  phase: number;
  type: 'primary' | 'secondary' | 'tertiary';
}

interface NeuralConstellationProps {
  className?: string;
  nodeCount?: number;
  connectionDistance?: number;
  colorScheme?: 'zodiac' | 'neural' | 'quantum';
  interactive?: boolean;
  intensity?: 'subtle' | 'medium' | 'intense';
}

export function NeuralConstellation({
  className = '',
  nodeCount = 60,
  connectionDistance = 150,
  colorScheme = 'zodiac',
  interactive = true,
  intensity = 'medium',
}: NeuralConstellationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const nodesRef = useRef<Node[]>([]);

  const colors = useMemo(() => ({
    zodiac: { primary: '#d4af37', secondary: '#a855f7', tertiary: '#06b6d4', connection: '212, 175, 55' },
    neural: { primary: '#06b6d4', secondary: '#3b82f6', tertiary: '#8b5cf6', connection: '6, 182, 212' },
    quantum: { primary: '#ec4899', secondary: '#8b5cf6', tertiary: '#06b6d4', connection: '236, 72, 153' },
  })[colorScheme], [colorScheme]);

  const intensityConfig = useMemo(() => ({
    subtle: { speed: 0.15, pulseSpeed: 0.008, connectionAlpha: 0.08, nodeGlow: 4 },
    medium: { speed: 0.3, pulseSpeed: 0.015, connectionAlpha: 0.15, nodeGlow: 8 },
    intense: { speed: 0.5, pulseSpeed: 0.025, connectionAlpha: 0.25, nodeGlow: 12 },
  })[intensity], [intensity]);

  const initNodes = useCallback((width: number, height: number) => {
    const nodes: Node[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const type = i < nodeCount * 0.15 ? 'primary' : i < nodeCount * 0.45 ? 'secondary' : 'tertiary';
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * intensityConfig.speed,
        vy: (Math.random() - 0.5) * intensityConfig.speed,
        radius: type === 'primary' ? 3 : type === 'secondary' ? 2 : 1,
        energy: Math.random(),
        phase: Math.random() * Math.PI * 2,
        type,
      });
    }
    return nodes;
  }, [nodeCount, intensityConfig]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      nodesRef.current = initNodes(rect.width, rect.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const handleMouse = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    canvas.addEventListener('mousemove', handleMouse);
    canvas.addEventListener('mouseleave', () => { mouseRef.current = { x: -1000, y: -1000 }; });

    let time = 0;
    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);
      time += intensityConfig.pulseSpeed;

      const nodes = nodesRef.current;
      const mouse = mouseRef.current;

      // Update nodes
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        node.energy = 0.5 + 0.5 * Math.sin(time + node.phase);

        // Boundary wrapping
        if (node.x < 0) node.x = w;
        if (node.x > w) node.x = 0;
        if (node.y < 0) node.y = h;
        if (node.y > h) node.y = 0;

        // Mouse attraction for primary nodes
        if (interactive && node.type === 'primary') {
          const dx = mouse.x - node.x;
          const dy = mouse.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200 && dist > 0) {
            node.vx += (dx / dist) * 0.02;
            node.vy += (dy / dist) * 0.02;
          }
        }

        // Velocity damping
        node.vx *= 0.99;
        node.vy *= 0.99;
      }

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * intensityConfig.connectionAlpha;
            const energyBoost = (nodes[i].energy + nodes[j].energy) * 0.5;
            
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(${colors.connection}, ${alpha * energyBoost})`;
            ctx.lineWidth = alpha * 2;
            ctx.stroke();

            // Energy pulse along connection
            if (energyBoost > 0.7 && alpha > 0.1) {
              const pulsePos = (Math.sin(time * 3 + i) + 1) * 0.5;
              const px = nodes[i].x + (nodes[j].x - nodes[i].x) * pulsePos;
              const py = nodes[i].y + (nodes[j].y - nodes[i].y) * pulsePos;
              ctx.beginPath();
              ctx.arc(px, py, 1, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(${colors.connection}, ${alpha * 2})`;
              ctx.fill();
            }
          }
        }
      }

      // Draw nodes
      for (const node of nodes) {
        const glowSize = node.type === 'primary' ? intensityConfig.nodeGlow : intensityConfig.nodeGlow * 0.5;
        const nodeColor = node.type === 'primary' ? colors.primary : node.type === 'secondary' ? colors.secondary : colors.tertiary;
        
        // Glow
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, glowSize * node.energy);
        gradient.addColorStop(0, nodeColor + '80');
        gradient.addColorStop(1, nodeColor + '00');
        ctx.beginPath();
        ctx.arc(node.x, node.y, glowSize * node.energy, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * (0.8 + 0.4 * node.energy), 0, Math.PI * 2);
        ctx.fillStyle = nodeColor;
        ctx.fill();
      }

      // Mouse proximity ring
      if (interactive && mouse.x > 0) {
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 80, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${colors.connection}, 0.05)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouse);
    };
  }, [colors, connectionDistance, initNodes, intensityConfig, interactive]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-auto ${className}`}
      style={{ mixBlendMode: 'screen' }}
    />
  );
}

/**
 * ConstellationSection — A section with an animated neural constellation background
 * that activates when scrolled into view.
 */

export function ConstellationSection({ children, className = '', ...props }: {
  children: React.ReactNode;
  className?: string;
} & Omit<NeuralConstellationProps, 'className'>) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.1 });

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      {isInView && <NeuralConstellation {...props} />}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
