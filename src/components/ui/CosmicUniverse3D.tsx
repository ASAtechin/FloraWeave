'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial, MeshTransmissionMaterial, Environment, Stars } from '@react-three/drei';
import * as THREE from 'three';

/**
 * CosmicUniverse3D — A full immersive WebGL 3D environment
 * featuring fluid particle simulations, abstract 3D objects,
 * cinematic camera motion, and a surreal digital universe.
 */

interface CosmicUniverse3DProps {
  intensity?: 'ambient' | 'active' | 'cinematic';
  interactionEnabled?: boolean;
}

export default function CosmicUniverse3D({ intensity = 'active', interactionEnabled = true }: CosmicUniverse3DProps) {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60, near: 0.1, far: 1000 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 1.5]}
      >
        <color attach="background" args={['#020208']} />
        <fog attach="fog" args={['#020208', 8, 40]} />
        
        {/* Ambient lighting */}
        <ambientLight intensity={0.1} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#d4af37" />
        <pointLight position={[-10, -5, -10]} intensity={0.3} color="#a855f7" />
        <pointLight position={[0, 5, -5]} intensity={0.2} color="#06b6d4" />

        {/* Core scene elements */}
        <ParticleField count={intensity === 'cinematic' ? 3000 : intensity === 'active' ? 2000 : 1000} />
        <FloatingOrbs />
        <NeonGrid />
        <AbstractNebula />
        <FluidRings />
        
        {/* Stars background */}
        <Stars radius={50} depth={60} count={2000} factor={3} saturation={0.5} fade speed={0.5} />
        
        {/* Camera animation */}
        <CinematicCamera enabled={interactionEnabled} />
      </Canvas>
    </div>
  );
}

/* ─── Particle Field: Thousands of glowing particles flowing through space ─── */

function ParticleField({ count }: { count: number }) {
  const meshRef = useRef<THREE.Points>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  const [positions, colors, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const siz = new Float32Array(count);

    const colorPalette = [
      new THREE.Color('#d4af37'), // Gold
      new THREE.Color('#a855f7'), // Purple
      new THREE.Color('#06b6d4'), // Cyan
      new THREE.Color('#ffffff'), // White
      new THREE.Color('#fbbf24'), // Amber
    ];

    for (let i = 0; i < count; i++) {
      // Distribute in a large sphere with clustering
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 3 + Math.random() * 20;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;

      siz[i] = 0.5 + Math.random() * 2;
    }

    return [pos, col, siz];
  }, [count]);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    const posArray = meshRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Gentle orbital flow
      const x = posArray[i3];
      const z = posArray[i3 + 2];
      const angle = 0.0003 + (i % 5) * 0.0001;
      
      posArray[i3] = x * Math.cos(angle) - z * Math.sin(angle);
      posArray[i3 + 2] = x * Math.sin(angle) + z * Math.cos(angle);
      
      // Vertical wave
      posArray[i3 + 1] += Math.sin(time * 0.2 + i * 0.01) * 0.002;
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true;
    
    // Slight rotation toward mouse
    meshRef.current.rotation.x += (mouseRef.current.y * 0.1 - meshRef.current.rotation.x) * 0.01;
    meshRef.current.rotation.y += (mouseRef.current.x * 0.1 - meshRef.current.rotation.y) * 0.01;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
          count={count}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
          count={count}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* ─── Floating Orbs: Abstract glowing spheres with distortion ─── */

function FloatingOrbs() {
  return (
    <>
      {/* Central gold orb */}
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
        <mesh position={[3, 1, -2]}>
          <sphereGeometry args={[0.6, 64, 64]} />
          <MeshDistortMaterial
            color="#d4af37"
            emissive="#d4af37"
            emissiveIntensity={0.3}
            roughness={0.2}
            metalness={0.8}
            distort={0.3}
            speed={2}
            transparent
            opacity={0.7}
          />
        </mesh>
      </Float>

      {/* Nebula purple orb */}
      <Float speed={1.2} rotationIntensity={0.3} floatIntensity={1.5}>
        <mesh position={[-4, -1, -3]}>
          <sphereGeometry args={[0.8, 64, 64]} />
          <MeshDistortMaterial
            color="#a855f7"
            emissive="#7c3aed"
            emissiveIntensity={0.4}
            roughness={0.1}
            metalness={0.9}
            distort={0.4}
            speed={1.5}
            transparent
            opacity={0.6}
          />
        </mesh>
      </Float>

      {/* Cyan accent orb */}
      <Float speed={2} rotationIntensity={0.7} floatIntensity={0.8}>
        <mesh position={[1, -2, -4]}>
          <sphereGeometry args={[0.4, 64, 64]} />
          <MeshDistortMaterial
            color="#06b6d4"
            emissive="#06b6d4"
            emissiveIntensity={0.5}
            roughness={0.15}
            metalness={0.85}
            distort={0.5}
            speed={3}
            transparent
            opacity={0.65}
          />
        </mesh>
      </Float>

      {/* Tiny scattered orbs */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Float key={i} speed={1 + Math.random()} floatIntensity={0.5 + Math.random()}>
          <mesh
            position={[
              (Math.random() - 0.5) * 12,
              (Math.random() - 0.5) * 8,
              -2 - Math.random() * 10,
            ]}
          >
            <sphereGeometry args={[0.08 + Math.random() * 0.15, 16, 16]} />
            <meshStandardMaterial
              color={['#d4af37', '#a855f7', '#06b6d4', '#fbbf24'][i % 4]}
              emissive={['#d4af37', '#a855f7', '#06b6d4', '#fbbf24'][i % 4]}
              emissiveIntensity={0.8}
              transparent
              opacity={0.7}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

/* ─── Neon Grid: A fading holographic grid plane ─── */

function NeonGrid() {
  const gridRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.position.z = -5 + Math.sin(state.clock.elapsedTime * 0.1) * 0.5;
    }
  });

  return (
    <mesh ref={gridRef} rotation={[-Math.PI / 2.5, 0, 0]} position={[0, -3, -5]}>
      <planeGeometry args={[40, 40, 40, 40]} />
      <meshBasicMaterial
        color="#4a53b3"
        wireframe
        transparent
        opacity={0.08}
      />
    </mesh>
  );
}

/* ─── Abstract Nebula: Volumetric cloud-like shapes ─── */

function AbstractNebula() {
  const nebulaRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (nebulaRef.current) {
      nebulaRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      nebulaRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.08) * 0.2;
    }
  });

  return (
    <Float speed={0.5} floatIntensity={0.3}>
      <mesh ref={nebulaRef} position={[0, 0, -12]} scale={3}>
        <icosahedronGeometry args={[2, 3]} />
        <MeshDistortMaterial
          color="#1a1040"
          emissive="#4a2080"
          emissiveIntensity={0.15}
          roughness={0.9}
          metalness={0.1}
          distort={0.6}
          speed={0.8}
          transparent
          opacity={0.25}
          wireframe
        />
      </mesh>
    </Float>
  );
}

/* ─── Fluid Rings: Orbiting holographic rings ─── */

function FluidRings() {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = t * 0.2;
      ring1Ref.current.rotation.y = t * 0.1;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = t * 0.15 + 1;
      ring2Ref.current.rotation.z = t * 0.12;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.y = t * 0.18;
      ring3Ref.current.rotation.z = t * 0.08 + 2;
    }
  });

  return (
    <group position={[0, 0, -3]}>
      <mesh ref={ring1Ref}>
        <torusGeometry args={[2.5, 0.015, 16, 100]} />
        <meshBasicMaterial color="#d4af37" transparent opacity={0.3} />
      </mesh>
      <mesh ref={ring2Ref}>
        <torusGeometry args={[3, 0.01, 16, 100]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.2} />
      </mesh>
      <mesh ref={ring3Ref}>
        <torusGeometry args={[3.5, 0.008, 16, 100]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

/* ─── Cinematic Camera: Slow drift with mouse parallax ─── */

function CinematicCamera({ enabled }: { enabled: boolean }) {
  const { camera } = useThree();
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0, z: 8 });

  useEffect(() => {
    if (!enabled) return;
    const handleMouse = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, [enabled]);

  useFrame((state) => {
    if (!enabled) return;
    const t = state.clock.elapsedTime;
    
    // Slow cinematic drift
    targetRef.current.x = mouseRef.current.x * 1.5 + Math.sin(t * 0.1) * 0.3;
    targetRef.current.y = mouseRef.current.y * 0.8 + Math.cos(t * 0.08) * 0.2;
    
    // Smooth lerp to target
    camera.position.x += (targetRef.current.x - camera.position.x) * 0.02;
    camera.position.y += (targetRef.current.y - camera.position.y) * 0.02;
    camera.lookAt(0, 0, -2);
  });

  return null;
}
