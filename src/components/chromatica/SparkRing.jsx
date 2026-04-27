import React, { useEffect, useRef } from 'react';
import { hexToRgb } from '@/lib/chromatica-utils';

// Canvas-based ambient particle drift around the perimeter.
// Particles sample the nearest color slab and breathe at 15% opacity.
export default function SparkRing({ size = 720, colors = [], hoveredAngle = null }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const outerR = size * 0.495;
    const innerR = size * 0.43;

    // Sort colors by hueOrder so the angle-to-color mapping mirrors the wheel.
    const sorted = [...colors].sort((a, b) => a.hueOrder - b.hueOrder);

    function colorAtAngle(deg) {
      if (!sorted.length) return { r: 250, g: 250, b: 250 };
      const idx = Math.floor(((deg % 360 + 360) % 360) / (360 / 30)) % sorted.length;
      const c = sorted[idx % sorted.length] || sorted[0];
      return hexToRgb(c.hex);
    }

    const PARTICLE_COUNT = 130;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => spawn());

    function spawn() {
      const angle = Math.random() * Math.PI * 2;
      const r = outerR - Math.random() * 4;
      return {
        angle,
        r,
        targetR: innerR + Math.random() * (outerR - innerR),
        speed: 0.04 + Math.random() * 0.06, // inward drift
        size: 1.2 + Math.random() * 2.2,
        life: Math.random(),
        decay: 0.0025 + Math.random() * 0.003
      };
    }

    function tick() {
      ctx.clearRect(0, 0, size, size);
      ctx.globalCompositeOperation = 'lighter';

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.r -= p.speed;
        p.life += p.decay;

        if (p.r < p.targetR || p.life > 1) {
          particles[i] = spawn();
          continue;
        }

        const x = cx + Math.cos(p.angle) * p.r;
        const y = cy + Math.sin(p.angle) * p.r;
        const deg = (p.angle * 180 / Math.PI + 90 + 360) % 360;

        // hover intensification: 3x density on the matching arc
        let alphaBoost = 1;
        if (hoveredAngle !== null) {
          const diff = Math.abs(((deg - hoveredAngle + 540) % 360) - 180);
          if (diff > 168) alphaBoost = 2.4;
        }

        const { r, g, b } = colorAtAngle(deg);
        const fade = Math.sin(p.life * Math.PI);
        const alpha = 0.15 * fade * alphaBoost;

        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(tick);
    }
    tick();
    return () => cancelAnimationFrame(rafRef.current);
  }, [size, colors, hoveredAngle]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none rotate-spark-ring"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}