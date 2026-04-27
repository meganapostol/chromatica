import React, { useEffect, useRef } from 'react';
import { hexToRgb } from '@/lib/chromatica-utils';

// Tight ring of fireworks hugging the color ring's outer edge.
//   1. INNER ambient — dense halo at the slab perimeter, twinkling
//   2. EXPLOSIONS    — clusters of 3-6 simultaneous bursts at the perimeter,
//                      short-lived so they stay tight rather than drifting
// (Constellation field removed — InteractiveDots is the broader chromatic
//  layer now; this component is purely the close-in celebration.)
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
    // Container radius (the wheel's bounding square half-width). The visible
    // colored sectors only fill 0.84 of this — the rest is empty space we
    // don't want sparks drifting through. Use colorRingOuter() for the
    // actual outer edge of the painted ring.
    function wheelRadius() {
      const { w, h } = dimsRef.current;
      return Math.min(820, Math.min(w, h) * 0.78) / 2;
    }
    function colorRingOuter() {
      // SVG color ring outer = 0.42 of 720 viewBox; container half = 360.
      // 302.4 / 360 = 0.84. Sparks should hug THIS, not the container edge.
      return wheelRadius() * 0.84;
    }
    function maxReach() {
      const { w, h } = dimsRef.current;
      return Math.sqrt(w * w + h * h) / 2;
    }

    // Sort colors by hueOrder so angle-to-color mapping mirrors the wheel.
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
    function jitter({ r, g, b }, amt) {
      const c = (v) => Math.max(0, Math.min(255, Math.round(v + (Math.random() - 0.5) * amt)));
      return { r: c(r), g: c(g), b: c(b) };
    }

    // ---- LAYER 1: INNER AMBIENT (close to wheel, drift inward) -----------
    const INNER_COUNT = 320;
    const inner = Array.from({ length: INNER_COUNT }, () => spawnInner());

    function spawnInner() {
      const colorR = colorRingOuter();
      const angle = Math.random() * Math.PI * 2;
      // Spawn in a tight halo right at the color ring's outer edge.
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

    // (Constellation removed — InteractiveDots covers the broader field.)

    // ---- LAYER 3: EXPLOSIONS (clustered bursts close to the wheel) -------
    let bursts = [];
    let nextBurstAt = performance.now() + 400;

    function fireBurst(originAngle = null) {
      const colorR = colorRingOuter();
      const { cx, cy } = center();
      const angle = originAngle ?? Math.random() * Math.PI * 2;
      const ox = cx + Math.cos(angle) * (colorR * 1.01);
      const oy = cy + Math.sin(angle) * (colorR * 1.01);
      const count = 22 + Math.floor(Math.random() * 16);
      const deg = (angle * 180 / Math.PI + 90 + 360) % 360;
      const baseColor = colorAtAngle(deg);
      for (let i = 0; i < count; i++) {
        const spread = (Math.random() - 0.5) * 1.4;
        const dir = angle + spread;
        // Tight ring of fireworks: low velocity + short life, so they stay
        // a tight halo at the color ring's edge instead of drifting off.
        const speed = 0.35 + Math.random() * 1.0;
        bursts.push({
          x: ox,
          y: oy,
          vx: Math.cos(dir) * speed,
          vy: Math.sin(dir) * speed,
          life: 0,
          maxLife: 38 + Math.random() * 36,
          size: 1.5 + Math.random() * 2.2,
          color: jitter(baseColor, 30)
        });
      }
    }
    function fireBurstCluster() {
      // 4–8 simultaneous bursts at random angles — fast cadence celebration.
      const n = 4 + Math.floor(Math.random() * 5);
      for (let i = 0; i < n; i++) {
        fireBurst(Math.random() * Math.PI * 2);
      }
    }

    // ---- RENDER HELPERS --------------------------------------------------
    function drawDot(x, y, p, alpha, color) {
      const { r, g, b } = color || colorAtAngle(angleFromCenter(x, y));
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

    function drawStar(x, y, p, alpha, color) {
      const { r, g, b } = color || colorAtAngle(angleFromCenter(x, y));
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

    // ---- TICK ------------------------------------------------------------
    function tick(now) {
      const { w, h } = dimsRef.current;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';

      const { cx, cy } = center();

      // INNER ambient
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

      // EXPLOSIONS — fast cadence. New cluster every 500–1100ms.
      // 70% chance of a follow-up cluster ~180ms later, 35% chance of a
      // second follow-up ~360ms later. Layered, constant celebration.
      if (now >= nextBurstAt) {
        fireBurstCluster();
        if (Math.random() < 0.7) setTimeout(() => fireBurstCluster(), 180);
        if (Math.random() < 0.35) setTimeout(() => fireBurstCluster(), 360);
        nextBurstAt = now + 500 + Math.random() * 600;
      }
      for (let i = bursts.length - 1; i >= 0; i--) {
        const e = bursts[i];
        e.x += e.vx;
        e.y += e.vy;
        e.vx *= 0.991;
        e.vy *= 0.991;
        e.life += 1;
        // Cull when offscreen or expired
        if (e.life > e.maxLife || e.x < -50 || e.x > w + 50 || e.y < -50 || e.y > h + 50) {
          bursts.splice(i, 1);
          continue;
        }
        const t = e.life / e.maxLife;
        const alpha = Math.sin(t * Math.PI) * 1.0;
        const grad = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.size * 6);
        grad.addColorStop(0,    `rgba(${e.color.r}, ${e.color.g}, ${e.color.b}, ${alpha})`);
        grad.addColorStop(0.35, `rgba(${e.color.r}, ${e.color.g}, ${e.color.b}, ${alpha * 0.45})`);
        grad.addColorStop(1,    'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(e.x - e.size * 6, e.y - e.size * 6, e.size * 12, e.size * 12);
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${Math.min(1, alpha * 1.4)})`;
        ctx.fill();
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
