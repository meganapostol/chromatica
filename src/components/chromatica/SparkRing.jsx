import React, { useEffect, useRef } from 'react';
import { hexToRgb } from '@/lib/chromatica-utils';

// Canvas-based "starfield + color explosions" around the wheel.
// Three particle layers:
//   1. Ambient stars     — drift slowly inward, twinkle, sampled from wheel hue
//   2. Diffraction stars — bigger, with cross-spike rays + glow halo
//   3. Burst embers      — spawn in clustered eruptions every few seconds
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
    const ringInner = size * 0.43;       // perimeter of the color ring
    const ringOuter = size * 0.495;      // edge of the visible spark zone
    const farReach  = size * 0.62;       // outer corona where strays drift

    // Sort colors by hueOrder so the angle-to-color mapping mirrors the wheel.
    const sorted = [...colors].sort((a, b) => a.hueOrder - b.hueOrder);

    function colorAtAngle(deg) {
      if (!sorted.length) return { r: 250, g: 250, b: 250 };
      const idx = Math.floor(((deg % 360 + 360) % 360) / (360 / 30)) % sorted.length;
      const c = sorted[idx % sorted.length] || sorted[0];
      return hexToRgb(c.hex);
    }

    // ---- Ambient layer (drifting stars) ----------------------------------
    const AMBIENT_COUNT = 220;
    const ambient = Array.from({ length: AMBIENT_COUNT }, () => spawnAmbient());

    function spawnAmbient() {
      const angle = Math.random() * Math.PI * 2;
      const r = ringOuter + Math.random() * (farReach - ringOuter);
      const isStar = Math.random() < 0.28;            // 28% diffraction stars
      return {
        kind: isStar ? 'star' : 'dot',
        angle,
        r,
        targetR: ringInner + Math.random() * (ringOuter - ringInner) * 0.7,
        speed: 0.05 + Math.random() * 0.09,
        size: isStar ? 1.6 + Math.random() * 2.4 : 0.8 + Math.random() * 1.6,
        life: Math.random(),
        decay: 0.0018 + Math.random() * 0.0026,
        twinkleSpeed: 0.04 + Math.random() * 0.08,
        twinklePhase: Math.random() * Math.PI * 2
      };
    }

    // ---- Burst layer (color explosions) ----------------------------------
    let bursts = [];
    let nextBurstAt = performance.now() + 1200 + Math.random() * 2400;

    function fireBurst(originAngle = null) {
      const angle = originAngle ?? Math.random() * Math.PI * 2;
      const ox = cx + Math.cos(angle) * (ringOuter + 4);
      const oy = cy + Math.sin(angle) * (ringOuter + 4);
      const count = 14 + Math.floor(Math.random() * 12);
      const deg = (angle * 180 / Math.PI + 90 + 360) % 360;
      const baseColor = colorAtAngle(deg);
      for (let i = 0; i < count; i++) {
        const spread = (Math.random() - 0.5) * 1.2;       // ±0.6 rad fan
        const dir = angle + spread;
        const speed = 0.6 + Math.random() * 1.6;
        bursts.push({
          x: ox,
          y: oy,
          vx: Math.cos(dir) * speed,
          vy: Math.sin(dir) * speed,
          life: 0,
          maxLife: 60 + Math.random() * 50,
          size: 1.4 + Math.random() * 2.4,
          color: jitter(baseColor, 28)
        });
      }
    }

    function jitter({ r, g, b }, amt) {
      return {
        r: clamp255(r + (Math.random() - 0.5) * amt),
        g: clamp255(g + (Math.random() - 0.5) * amt),
        b: clamp255(b + (Math.random() - 0.5) * amt)
      };
    }
    function clamp255(v) { return Math.max(0, Math.min(255, Math.round(v))); }

    // ---- Render helpers --------------------------------------------------
    function drawDot(x, y, p, alpha) {
      const { r, g, b } = colorAtAngle(angleAt(x, y));
      // Soft halo
      const halo = ctx.createRadialGradient(x, y, 0, x, y, p.size * 4);
      halo.addColorStop(0,   `rgba(${r}, ${g}, ${b}, ${alpha})`);
      halo.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${alpha * 0.35})`);
      halo.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = halo;
      ctx.fillRect(x - p.size * 4, y - p.size * 4, p.size * 8, p.size * 8);
      // Bright core
      ctx.beginPath();
      ctx.arc(x, y, p.size * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${Math.min(1, alpha * 1.4)})`;
      ctx.fill();
    }

    function drawStar(x, y, p, alpha) {
      const { r, g, b } = colorAtAngle(angleAt(x, y));
      // Wide saturated halo
      const halo = ctx.createRadialGradient(x, y, 0, x, y, p.size * 6);
      halo.addColorStop(0,   `rgba(${r}, ${g}, ${b}, ${alpha * 1.1})`);
      halo.addColorStop(0.35,`rgba(${r}, ${g}, ${b}, ${alpha * 0.5})`);
      halo.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = halo;
      ctx.fillRect(x - p.size * 6, y - p.size * 6, p.size * 12, p.size * 12);
      // Diffraction spikes (cross)
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.85})`;
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(x - p.size * 5, y); ctx.lineTo(x + p.size * 5, y);
      ctx.moveTo(x, y - p.size * 5); ctx.lineTo(x, y + p.size * 5);
      ctx.stroke();
      // White-hot core
      ctx.beginPath();
      ctx.arc(x, y, p.size * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${Math.min(1, alpha * 1.6)})`;
      ctx.fill();
    }

    function angleAt(x, y) {
      return ((Math.atan2(y - cy, x - cx) * 180 / Math.PI) + 90 + 360) % 360;
    }

    // ---- Tick ------------------------------------------------------------
    function tick(now) {
      ctx.clearRect(0, 0, size, size);
      ctx.globalCompositeOperation = 'lighter';

      // Ambient
      for (let i = 0; i < ambient.length; i++) {
        const p = ambient[i];
        p.r -= p.speed;
        p.life += p.decay;
        p.twinklePhase += p.twinkleSpeed;

        if (p.r < p.targetR || p.life > 1) {
          ambient[i] = spawnAmbient();
          continue;
        }

        const x = cx + Math.cos(p.angle) * p.r;
        const y = cy + Math.sin(p.angle) * p.r;
        const deg = (p.angle * 180 / Math.PI + 90 + 360) % 360;

        // Hover intensification: 3× alpha within ±14° of hovered angle.
        let alphaBoost = 1;
        if (hoveredAngle !== null) {
          const diff = Math.abs(((deg - hoveredAngle + 540) % 360) - 180);
          if (diff > 166) alphaBoost = 3;
        }

        const fade = Math.sin(p.life * Math.PI);
        const twinkle = 0.55 + 0.45 * Math.sin(p.twinklePhase);
        const baseAlpha = p.kind === 'star' ? 0.55 : 0.35;
        const alpha = baseAlpha * fade * twinkle * alphaBoost;

        if (p.kind === 'star') drawStar(x, y, p, alpha);
        else                   drawDot(x, y, p, alpha);
      }

      // Bursts (timer-driven explosions, every ~4–8s)
      if (now >= nextBurstAt) {
        fireBurst();
        nextBurstAt = now + 4000 + Math.random() * 4000;
      }
      for (let i = bursts.length - 1; i >= 0; i--) {
        const e = bursts[i];
        e.x += e.vx;
        e.y += e.vy;
        e.vx *= 0.985;          // mild drag
        e.vy *= 0.985;
        e.life += 1;
        if (e.life > e.maxLife) { bursts.splice(i, 1); continue; }

        const t = e.life / e.maxLife;
        const alpha = Math.sin(t * Math.PI) * 0.95;     // ramp up & out
        const grad = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.size * 5);
        grad.addColorStop(0,   `rgba(${e.color.r}, ${e.color.g}, ${e.color.b}, ${alpha})`);
        grad.addColorStop(0.4, `rgba(${e.color.r}, ${e.color.g}, ${e.color.b}, ${alpha * 0.35})`);
        grad.addColorStop(1,   'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(e.x - e.size * 5, e.y - e.size * 5, e.size * 10, e.size * 10);
        // White-hot core
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${Math.min(1, alpha * 1.4)})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
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
