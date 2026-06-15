'use client';

import { useEffect, useRef } from 'react';

export default function StellarSky() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Track active target slug
    let activeSlug: string | null = null;
    let activeScale = 0;

    const handleCelestialFocus = (e: Event) => {
      const customEvent = e as CustomEvent;
      activeSlug = customEvent.detail?.slug || null;
    };

    window.addEventListener('celestial-focus', handleCelestialFocus);

    let mouseX = width / 2;
    let mouseY = height / 2;
    let mouseActive = false;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      mouseActive = true;
    };

    const handleMouseLeave = () => {
      mouseActive = false;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      generateGalaxy(Math.min(2000, Math.floor((width * height) / 700))); // Natural density
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    // Mature, natural galaxy particle system
    class Particle {
      angle: number;
      radius: number;
      zOffset: number;
      size: number;
      color: string;
      speed: number;
      
      // Interaction physics
      ix: number = 0;
      iy: number = 0;
      ivx: number = 0;
      ivy: number = 0;

      constructor(maxRadius: number) {
        // Exponential distribution for dense core, sparse edges
        const rDist = Math.pow(Math.random(), 2.5);
        this.radius = rDist * maxRadius;

        // 2 main spiral arms + scattered dust
        const isArm = Math.random() > 0.3;
        let baseAngle = Math.random() * Math.PI * 2;
        if (isArm) {
          const arm = Math.floor(Math.random() * 2) * Math.PI;
          // Curve the arms gracefully
          baseAngle = arm - (this.radius * 0.003) + (Math.random() - 0.5) * 0.6;
        }
        
        this.angle = baseAngle;
        
        // Z-offset for thickness. Core is bulky, edges are flat
        const thickness = Math.max(1, 40 * Math.pow((1 - rDist), 2));
        this.zOffset = (Math.random() - 0.5) * thickness;

        // Sizes: mostly tiny, some prominent
        this.size = Math.random() > 0.95 ? Math.random() * 1.5 + 0.5 : Math.random() * 0.6 + 0.1;

        // Velocity: Keplerian-like orbits (slower at edges, faster at core)
        this.speed = 0.0002 + (1 - rDist) * 0.0008;

        // Natural stellar colors: white, pale blue, pale gold/orange
        const colors = [
          'rgba(255, 255, 255, 0.8)',
          'rgba(224, 242, 254, 0.7)', // sky-100
          'rgba(254, 243, 199, 0.8)', // amber-100
          'rgba(253, 230, 138, 0.6)', // amber-200
          'rgba(148, 163, 184, 0.4)', // slate-400 (dust)
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update(mx: number, my: number, cx: number, cy: number, mActive: boolean) {
        // Majestic, slow rotation
        this.angle -= this.speed;
        
        // Base positions (perspective squash applied later during draw)
        const bx = Math.cos(this.angle) * this.radius;
        const by = Math.sin(this.angle) * this.radius * 0.4 + this.zOffset; // 0.4 squashes the Y axis

        let targetIx = 0;
        let targetIy = 0;

        // Subtle, fluid interaction
        if (mActive) {
          const screenX = cx + bx + this.ix;
          const screenY = cy + by + this.iy;
          
          const dx = mx - screenX;
          const dy = my - screenY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 180) {
            // Gentle fluid push
            const force = Math.pow((180 - dist) / 180, 2);
            targetIx = -(dx / dist) * force * 20;
            targetIy = -(dy / dist) * force * 20;
          }
        }

        // Smooth spring physics for returning to orbit
        this.ivx += (targetIx - this.ix) * 0.02;
        this.ivy += (targetIy - this.iy) * 0.02;
        this.ivx *= 0.92; // fluid friction
        this.ivy *= 0.92;
        
        this.ix += this.ivx;
        this.iy += this.ivy;
      }

      draw(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
        const x = cx + Math.cos(this.angle) * this.radius + this.ix;
        const y = cy + Math.sin(this.angle) * this.radius * 0.4 + this.zOffset + this.iy;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(x, y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    let particles: Particle[] = [];
    const generateGalaxy = (count: number) => {
      particles = [];
      const maxRadius = Math.max(width, height) * 0.7;
      for (let i = 0; i < count; i++) {
        particles.push(new Particle(maxRadius));
      }
    };

    // Initialize planets
    const planets = [
      {
        name: 'Helios (The Sun)',
        slug: 'aura-alignment-thread-bracelet',
        tagline: 'Vitality & Core Life Aura',
        radius: 0,
        size: 32,
        color: '#FBBF24',
        glowColor: 'rgba(251, 191, 36, 0.35)',
        speed: 0,
        angle: 0,
        hasRings: false,
        ringsColor: '',
        moons: 0,
        currentX: 0,
        currentY: 0
      },
      {
        name: 'Luna (The Moon)',
        slug: 'celestial-constellation-drop-earrings',
        tagline: 'Intuitive Reflection & Quartz Tides',
        radius: 110,
        size: 14,
        color: '#E2E8F0',
        glowColor: 'rgba(226, 232, 240, 0.3)',
        speed: 0.006,
        angle: Math.random() * Math.PI * 2,
        hasRings: false,
        ringsColor: '',
        moons: 0,
        currentX: 0,
        currentY: 0
      },
      {
        name: 'Venus (Ishtar)',
        slug: 'zodiac-silk-cord-anklet',
        tagline: 'Love, Beauty & Organic Pearl Resonance',
        radius: 180,
        size: 16,
        color: '#F472B6',
        glowColor: 'rgba(244, 114, 182, 0.25)',
        speed: 0.004,
        angle: Math.random() * Math.PI * 2,
        hasRings: false,
        ringsColor: '',
        moons: 0,
        currentX: 0,
        currentY: 0
      },
      {
        name: 'Gaia (Earth Portal)',
        slug: 'fallback-earth',
        tagline: 'Grounding Roots & Elemental Sync',
        radius: 250,
        size: 17,
        color: '#38BDF8',
        glowColor: 'rgba(56, 189, 248, 0.25)',
        speed: 0.003,
        angle: Math.random() * Math.PI * 2,
        hasRings: false,
        ringsColor: '',
        moons: 1,
        currentX: 0,
        currentY: 0
      },
      {
        name: 'Jupiter (Guru)',
        slug: 'zodiac-flower-anklets',
        tagline: 'Abundance & 12-Flower Stellar Cycle',
        radius: 330,
        size: 24,
        color: '#F59E0B',
        glowColor: 'rgba(245, 158, 11, 0.25)',
        speed: 0.0018,
        angle: Math.random() * Math.PI * 2,
        hasRings: true,
        ringsColor: 'rgba(245, 158, 11, 0.15)',
        moons: 2,
        currentX: 0,
        currentY: 0
      },
      {
        name: 'Nebula Andromeda',
        slug: 'zodiac-birth-flower-keepsake-gift-set',
        tagline: 'Ultimate Keepsake Cosmic Synthesis',
        radius: 410,
        size: 20,
        color: '#C084FC',
        glowColor: 'rgba(192, 132, 252, 0.3)',
        speed: 0.001,
        angle: Math.random() * Math.PI * 2,
        hasRings: false,
        ringsColor: '',
        moons: 0,
        currentX: 0,
        currentY: 0
      }
    ];

    handleResize();

    let camX = 0;
    let camY = 0;

    const draw = () => {
      // 1. Draw solid deep space background
      ctx.globalCompositeOperation = 'source-over';
      const bgGradient = ctx.createRadialGradient(
        width * 0.5,
        height * 0.5,
        0,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.8
      );
      bgGradient.addColorStop(0, '#03030a');
      bgGradient.addColorStop(0.5, '#010105');
      bgGradient.addColorStop(1, '#000000');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Camera Parallax
      let targetCamX = 0;
      let targetCamY = 0;
      if (mouseActive) {
        targetCamX = (mouseX - width / 2) * 0.03;
        targetCamY = (mouseY - height / 2) * 0.03;
      }
      camX += (targetCamX - camX) * 0.05;
      camY += (targetCamY - camY) * 0.05;

      const centerX = width * 0.5 - camX;
      const centerY = height * 0.5 - camY;

      // 2. Galactic Core Glow
      ctx.globalCompositeOperation = 'screen';
      const coreGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, width * 0.4);
      coreGlow.addColorStop(0, 'rgba(251, 191, 36, 0.08)');  // Golden core
      coreGlow.addColorStop(0.3, 'rgba(56, 189, 248, 0.03)'); // Blue outer halo
      coreGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = coreGlow;
      ctx.beginPath();
      // Squashed ellipse to match galaxy perspective
      ctx.ellipse(centerX, centerY, width * 0.4, width * 0.16, 0, 0, Math.PI * 2);
      ctx.fill();

      // 3. Render Galaxy Particles
      ctx.globalCompositeOperation = 'lighter';
      particles.forEach(p => {
        p.update(mouseX, mouseY, centerX, centerY, mouseActive);
        p.draw(ctx, centerX, centerY);
      });

      // 4. Render Planets (Overlaid seamlessly)
      ctx.globalCompositeOperation = 'source-over';
      
      let speedModifier = 1.0;
      if (mouseActive) {
        const dx = mouseX - centerX;
        const dy = mouseY - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        speedModifier = 1.0 + Math.max(0, 1.5 * (1 - dist / 500));
      }

      if (activeSlug) {
        activeScale += (1.0 - activeScale) * 0.08;
      } else {
        activeScale += (0 - activeScale) * 0.08;
      }

      // Orbits
      planets.forEach((planet) => {
        if (planet.radius > 0) {
          planet.angle += planet.speed * speedModifier;

          const isHighlighted = activeSlug === planet.slug;

          ctx.strokeStyle = isHighlighted
            ? `rgba(245, 158, 11, ${0.12 + activeScale * 0.25})`
            : 'rgba(99, 102, 241, 0.06)';
          ctx.lineWidth = isHighlighted ? 1.5 : 0.8;
          ctx.beginPath();
          // Draw elliptical orbits matched with parallax center
          ctx.ellipse(centerX, centerY, planet.radius * 1.15, planet.radius * 0.85, 0.08, 0, Math.PI * 2);
          ctx.stroke();

          const a = planet.radius * 1.15;
          const b = planet.radius * 0.85;
          const tiltAngle = 0.08;

          const rawX = Math.cos(planet.angle) * a;
          const rawY = Math.sin(planet.angle) * b;

          planet.currentX = centerX + (rawX * Math.cos(tiltAngle) - rawY * Math.sin(tiltAngle));
          planet.currentY = centerY + (rawX * Math.sin(tiltAngle) + rawY * Math.cos(tiltAngle));
        } else {
          planet.currentX = centerX;
          planet.currentY = centerY;
        }
      });

      // Planets & Moons
      planets.forEach((planet) => {
        const isHighlighted = activeSlug === planet.slug;
        const focusScale = isHighlighted ? (1.0 + activeScale * 0.75) : 1.0;
        const currentSize = planet.size * focusScale;

        // Interaction line
        if (isHighlighted && mouseActive) {
          ctx.strokeStyle = `rgba(245, 158, 11, ${activeScale * 0.2})`;
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 6]);
          ctx.beginPath();
          ctx.moveTo(mouseX, mouseY);
          ctx.lineTo(planet.currentX, planet.currentY);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Atmosphere glow
        const glowRad = currentSize * 2.8;
        const radGlow = ctx.createRadialGradient(
          planet.currentX,
          planet.currentY,
          currentSize * 0.2,
          planet.currentX,
          planet.currentY,
          glowRad
        );
        
        const coreGlowColor = isHighlighted ? 'rgba(251, 191, 36, 0.45)' : planet.glowColor;
        radGlow.addColorStop(0, coreGlowColor);
        radGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = radGlow;
        ctx.beginPath();
        ctx.arc(planet.currentX, planet.currentY, glowRad, 0, Math.PI * 2);
        ctx.fill();

        // Planet core
        ctx.fillStyle = planet.color;
        ctx.beginPath();
        ctx.arc(planet.currentX, planet.currentY, currentSize * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Rings
        if (planet.hasRings) {
          ctx.strokeStyle = planet.ringsColor;
          ctx.lineWidth = 3.5 * focusScale;
          ctx.beginPath();
          ctx.ellipse(planet.currentX, planet.currentY, currentSize * 1.0, currentSize * 0.35, -0.2, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Moons
        if (planet.moons > 0) {
          const time = Date.now() * 0.0025;
          for (let m = 0; m < planet.moons; m++) {
            const moonAngle = time + (m * Math.PI);
            const mDist = currentSize * 0.8 + (m * 8);
            const moonX = planet.currentX + Math.cos(moonAngle) * mDist;
            const moonY = planet.currentY + Math.sin(moonAngle) * mDist * 0.6;

            ctx.fillStyle = 'rgba(226, 232, 240, 0.6)';
            ctx.beginPath();
            ctx.arc(moonX, moonY, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Info Card
        if (isHighlighted && activeScale > 0.05) {
          ctx.save();
          ctx.globalAlpha = activeScale;
          
          const boxW = 200;
          const boxH = 50;
          const boxX = planet.currentX + currentSize * 0.6 + 12;
          const boxY = planet.currentY - boxH * 0.5;

          ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(planet.currentX + currentSize * 0.5, planet.currentY);
          ctx.lineTo(boxX, planet.currentY);
          ctx.stroke();

          ctx.fillStyle = 'rgba(2, 2, 10, 0.85)';
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(boxX, boxY, boxW, boxH, 8);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 11px system-ui, sans-serif';
          ctx.fillText(planet.name, boxX + 10, boxY + 18);

          ctx.fillStyle = '#FBBF24';
          ctx.font = '9px system-ui, sans-serif';
          ctx.fillText(planet.tagline, boxX + 10, boxY + 34);

          ctx.restore();
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('celestial-focus', handleCelestialFocus);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
