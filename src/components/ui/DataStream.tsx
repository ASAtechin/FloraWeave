'use client';

import React, { useRef, useEffect, useMemo } from 'react';

/**
 * DataStream — Matrix/cyberpunk-style cascading data visualization.
 * Renders flowing symbols, glyphs, and zodiac characters in columns
 * like digital rain, but with celestial/astrological symbols.
 */

interface DataStreamProps {
  className?: string;
  opacity?: number;
  speed?: 'slow' | 'medium' | 'fast';
  density?: 'sparse' | 'medium' | 'dense';
  colorScheme?: 'cyan' | 'gold' | 'mixed';
}

// Celestial/zodiac/runic symbols for the data rain
const GLYPHS = '♈♉♊♋♌♍♎♏♐♑♒♓☉☽★⚡⟡◇△▽○●◈⬡⬢⟐⟡∞≋≈∿∾⊕⊗⊙⊚⌬⍟⎔⎈⏣⏥⌖';

export function DataStream({
  className = '',
  opacity = 0.15,
  speed = 'medium',
  density = 'medium',
  colorScheme = 'cyan',
}: DataStreamProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const config = useMemo(() => ({
    speed: { slow: 0.5, medium: 1, fast: 1.8 }[speed],
    columnGap: { sparse: 40, medium: 25, dense: 15 }[density],
    colors: {
      cyan: { head: '#06b6d4', body: '#0891b2', tail: '#164e63' },
      gold: { head: '#fbbf24', body: '#d97706', tail: '#78350f' },
      mixed: { head: '#06b6d4', body: '#a855f7', tail: '#1e1b4b' },
    }[colorScheme],
  }), [speed, density, colorScheme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let columns: { y: number; speed: number; chars: string[]; length: number; delay: number }[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      const numCols = Math.floor(rect.width / config.columnGap);
      columns = Array.from({ length: numCols }, (_, i) => ({
        y: -Math.random() * rect.height,
        speed: (0.5 + Math.random() * 0.8) * config.speed,
        chars: Array.from({ length: 15 + Math.floor(Math.random() * 10) }, () =>
          GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        ),
        length: 8 + Math.floor(Math.random() * 12),
        delay: Math.random() * 200,
      }));
    };
    resize();
    window.addEventListener('resize', resize);

    let frame = 0;
    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      
      // Fade previous frame (trail effect)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, w, h);

      frame++;

      ctx.font = '12px monospace';
      ctx.textAlign = 'center';

      for (let i = 0; i < columns.length; i++) {
        const col = columns[i];
        if (frame < col.delay) continue;

        const x = i * config.columnGap + config.columnGap / 2;
        col.y += col.speed;

        // Draw characters in the column
        for (let j = 0; j < col.length; j++) {
          const charY = col.y - j * 16;
          if (charY < -20 || charY > h + 20) continue;

          const charIndex = (Math.floor(col.y / 16) + j) % col.chars.length;
          const char = col.chars[charIndex];

          // Head character (brightest)
          if (j === 0) {
            ctx.fillStyle = config.colors.head;
            ctx.globalAlpha = 0.9;
            // Occasional character mutation
            if (Math.random() < 0.05) {
              col.chars[charIndex] = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
            }
          } else if (j < col.length * 0.4) {
            ctx.fillStyle = config.colors.body;
            ctx.globalAlpha = 0.6 - (j / col.length) * 0.3;
          } else {
            ctx.fillStyle = config.colors.tail;
            ctx.globalAlpha = 0.3 - (j / col.length) * 0.25;
          }

          ctx.fillText(char, x, charY);
        }

        // Reset when off screen
        if (col.y - col.length * 16 > h) {
          col.y = -Math.random() * 100;
          col.speed = (0.5 + Math.random() * 0.8) * config.speed;
        }
      }

      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [config]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ opacity, mixBlendMode: 'screen' }}
    />
  );
}

/**
 * DNAHelix — Double helix animation representing zodiac genetics/destiny.
 * Uses SVG with animated paths that twist and pulse.
 */

export function DNAHelix({ className = '', height = 400 }: { className?: string; height?: number }) {
  const points = 20;
  const amplitude = 30;
  const verticalSpacing = height / points;

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <svg viewBox={`0 0 100 ${height}`} className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="helix-grad-1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#a855f7" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="helix-grad-2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d4af37" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#ec4899" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#d4af37" stopOpacity="0.7" />
          </linearGradient>
        </defs>

        {/* Strand 1 */}
        <path
          d={Array.from({ length: points }, (_, i) => {
            const y = i * verticalSpacing;
            const x = 50 + Math.sin((i / points) * Math.PI * 4) * amplitude;
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
          }).join(' ')}
          fill="none"
          stroke="url(#helix-grad-1)"
          strokeWidth="1.5"
          className="animate-helix-twist-1"
        />

        {/* Strand 2 */}
        <path
          d={Array.from({ length: points }, (_, i) => {
            const y = i * verticalSpacing;
            const x = 50 + Math.sin((i / points) * Math.PI * 4 + Math.PI) * amplitude;
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
          }).join(' ')}
          fill="none"
          stroke="url(#helix-grad-2)"
          strokeWidth="1.5"
          className="animate-helix-twist-2"
        />

        {/* Cross-links (base pairs) */}
        {Array.from({ length: Math.floor(points / 2) }, (_, i) => {
          const idx = i * 2 + 1;
          const y = idx * verticalSpacing;
          const x1 = 50 + Math.sin((idx / points) * Math.PI * 4) * amplitude;
          const x2 = 50 + Math.sin((idx / points) * Math.PI * 4 + Math.PI) * amplitude;
          return (
            <line
              key={i}
              x1={x1} y1={y} x2={x2} y2={y}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="0.5"
              strokeDasharray="2 2"
              className="animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          );
        })}

        {/* Node points */}
        {Array.from({ length: points }, (_, i) => {
          const y = i * verticalSpacing;
          const x = 50 + Math.sin((i / points) * Math.PI * 4) * amplitude;
          return (
            <circle
              key={`n1-${i}`}
              cx={x} cy={y} r="1.5"
              fill="#06b6d4"
              opacity={0.6 + 0.4 * Math.sin(i * 0.5)}
              className="animate-pulse"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          );
        })}
      </svg>
    </div>
  );
}
