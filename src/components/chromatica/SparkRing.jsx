import React, { useEffect, useRef } from 'react';
import { hexToRgb } from '@/lib/chromatica-utils';

// Soft twinkling halo of stars at the color ring's outer edge.
// Burst/explosion layer was removed — it was choppy on lower-end machines
// and didn't translate to "celebration" the way it did on a high-end GPU.
// What remains is a quiet drift of color-sampled twinkles that breathe
// against the painted slabs.
export default function SparkRing({ colors = [], hoveredAngle = null, active = true }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const dimsRef = useRef({ w: 0, h: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      dimsRef.current = { w, h };
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }
    resize();
    window.addEventListener('resize', resize);

    function center() {
      const { w, h } = dimsRef.current;
      return { cx: w / 2, cy: h / 2 };
    }
    function wheelRadius() {
      const { w, h } = dimsRef.current;
      return Math.min(820, Math.min(w, h) * 0.78) / 2;
    }
    function colorRingOuter() {
      // SVG color outer ring sits at 0.42 of a 720 viewBox (container half = 360).
      // 302.4 / 360 = 0.84. Twinkles hug THIS, not the container edge.
      return wheelRadius() * 0.84;
    }

    const sorted = [...colors].sort((a, b) => a.hueOrder - b.hueOrder);

    function colorAtAngle(deg) {
      if (!sorted.length) return { r: 250, g: 250, b: 250 };
      const idx = Math.floor(((deg % 360 + 360) % 360) / (360 / 30)) % sorted.length;
      const c = sorted[idx % sorted.length] || sorted[0];
      return hexToRgb(c.hex);
    }
    function angleFromCenter(x, y) {
      const { cx, cy } = center();
      return ((Math.atan2(y - cy, x - cx) * 180 / Math.PI) + 90 + 360) % 360;
    }

    // ---- Inner ambient halo ----------------------------------------------
    const INNER_COUNT = 220;
    const inner = Array.from({ length: INNER_COUNT }, () => spawnInner());

    function spawnInner() {
      const colorR = colorRingOuter();
      const angle = Math.random() * Math.PI * 2;
      const r = colorR * (1.02 + Math.random() * 0.20);
      const isStar = Math.random() < 0.30;
      return {
        kind: isStar ? 'star' : 'dot',
        angle,
        r,
        targetR: colorR * (1.0 + Math.random() * 0.02),
        speed: 0.04 + Math.random() * 0.10,
        size: isStar ? 1.4 + Math.random() * 2.6 : 0.7 + Math.random() * 1.5,
        life: Math.random(),
        decay: 0.0014 + Math.random() * 0.0024,
        twinkleSpeed: 0.03 + Math.random() * 0.10,
        twinklePhase: Math.random() * Math.PI * 2
      };
    }

    function drawDot(x, y, p, alpha) {
      const { r, g, b } = colorAtAngle(angleFromCenter(x, y));
      const halo = ctx.createRadialGradient(x, y, 0, x, y, p.size * 4);
      halo.addColorStop(0,   `rgba(${r}, ${g}, ${b}, ${alpha})`);
      halo.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${alpha * 0.35})`);
      halo.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = halo;
      ctx.fillRect(x - p.size * 4, y - p.size * 4, p.size * 8, p.size * 8);
      ctx.beginPath();
      ctx.arc(x, y, p.size * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${Math.min(1, alpha * 1.4)})`;
      ctx.fill();
    }

    function drawStar(x, y, p, alpha) {
      const { r, g, b } = colorAtAngle(angleFromCenter(x, y));
      const halo = ctx.createRadialGradient(x, y, 0, x, y, p.size * 6);
      halo.addColorStop(0,    `rgba(${r}, ${g}, ${b}, ${alpha * 1.1})`);
      halo.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, ${alpha * 0.5})`);
      halo.addColorStop(1,    'rgba(0,0,0,0)');
      ctx.fillStyle = halo;
      ctx.fillRect(x - p.size * 6, y - p.size * 6, p.size * 12, p.size * 12);
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.85})`;
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(x - p.size * 5, y); ctx.lineTo(x + p.size * 5, y);
      ctx.moveTo(x, y - p.size * 5); ctx.lineTo(x, y + p.size * 5);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, p.size * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${Math.min(1, alpha * 1.6)})`;
      ctx.fill();
    }

    function tick() {
      const { w, h } = dimsRef.current;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';

      const { cx, cy } = center();

      for (let i = 0; i < inner.length; i++) {
        const p = inner[i];
        p.r -= p.speed;
        p.life += p.decay;
        p.twinklePhase += p.twinkleSpeed;

        if (p.r < p.targetR || p.life > 1) {
          inner[i] = spawnInner();
          continue;
        }
        const x = cx + Math.cos(p.angle) * p.r;
        const y = cy + Math.sin(p.angle) * p.r;
        const deg = (p.angle * 180 / Math.PI + 90 + 360) % 360;

        let alphaBoost = 1;
        if (hoveredAngle !== null) {
          const diff = Math.abs(((deg - hoveredAngle + 540) % 360) - 180);
          if (diff > 166) alphaBoost = 3;
        }

        const fade = Math.sin(p.life * Math.PI);
        const twinkle = 0.55 + 0.45 * Math.sin(p.twinklePhase);
        const baseAlpha = p.kind === 'star' ? 0.55 : 0.38;
        const alpha = baseAlpha * fade * twinkle * alphaBoost;

        if (p.kind === 'star') drawStar(x, y, p, alpha);
        else                   drawDot(x, y, p, alpha);
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [colors, hoveredAngle]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 1,
        mixBlendMode: 'screen',
        opacity: active ? 1 : 0,
        transition: 'opacity 0.5s ease'
      }}
    />
  );
}
