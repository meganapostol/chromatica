import React, { useEffect, useRef } from 'react';
import { hexToRgb } from '@/lib/chromatica-utils';

// Full-viewport starfield + color celebration around the wheel.
// Three layers, all drifting:
//   1. INNER ambient   — dense ring hugging the wheel, drifts inward, twinkles
//   2. CONSTELLATION   — distant stars across the entire viewport
//   3. EXPLOSIONS      — clustered bursts (3-6 fire simultaneously) close to
//                        the wheel — the celebration, not a sparse trickle
//
// The canvas is fixed to the viewport (`fixed inset-0`) so particles never
// hit a 720px box edge. `active` controls fade — never unmount.
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
      // Wheel = min(78vh, 78vw), capped at 820. Half is the radius.
      return Math.min(820, Math.min(w, h) * 0.78) / 2;
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
      const wR = wheelRadius();
      const angle = Math.random() * Math.PI * 2;
      // Spawn between wheel perimeter and ~1.6× wheel radius
      const r = wR * (1.05 + Math.random() * 0.55);
      const isStar = Math.random() < 0.30;
      return {
        kind: isStar ? 'star' : 'dot',
        angle,
        r,
        targetR: wR * (1.0 + Math.random() * 0.05),
        speed: 0.04 + Math.random() * 0.10,
        size: isStar ? 1.4 + Math.random() * 2.6 : 0.7 + Math.random() * 1.5,
        life: Math.random(),
        decay: 0.0014 + Math.random() * 0.0024,
        twinkleSpeed: 0.03 + Math.random() * 0.10,
        twinklePhase: Math.random() * Math.PI * 2
      };
    }

    // ---- LAYER 2: CONSTELLATION (sparse, all over viewport) ---------------
    const CONST_COUNT = 220;
    let constellation = [];
    function spawnConstellation() {
      const { w, h } = dimsRef.current;
      const wR = wheelRadius();
      // Avoid the wheel area — place in a viewport ring outside it.
      let x, y, dist;
      let attempts = 0;
      do {
        x = Math.random() * w;
        y = Math.random() * h;
        const { cx, cy } = center();
        dist = Math.hypot(x - cx, y - cy);
        attempts++;
      } while (dist < wR * 1.1 && attempts < 8);
      return {
        x, y,
        size: 0.6 + Math.random() * 1.6,
        twinkleSpeed: 0.012 + Math.random() * 0.04,
        twinklePhase: Math.random() * Math.PI * 2,
        baseAlpha: 0.18 + Math.random() * 0.32,
        kind: Math.random() < 0.18 ? 'star' : 'dot',
        // Hue tint for constellation: pull from the wheel's palette so distant
        // stars echo the colors (very slowly varied).
        colorAngle: Math.random() * 360,
        life: Math.random(),
        decay: 0.0006 + Math.random() * 0.0012
      };
    }
    function rebuildConstellation() {
      constellation = Array.from({ length: CONST_COUNT }, () => spawnConstellation());
    }
    rebuildConstellation();

    // ---- LAYER 3: EXPLOSIONS (clustered bursts close to the wheel) -------
    let bursts = [];
    let nextBurstAt = performance.now() + 400;

    function fireBurst(originAngle = null) {
      const wR = wheelRadius();
      const { cx, cy } = center();
      const angle = originAngle ?? Math.random() * Math.PI * 2;
      const ox = cx + Math.cos(angle) * (wR * 1.05);
      const oy = cy + Math.sin(angle) * (wR * 1.05);
      const count = 26 + Math.floor(Math.random() * 18);
      const deg = (angle * 180 / Math.PI + 90 + 360) % 360;
      const baseColor = colorAtAngle(deg);
      for (let i = 0; i < count; i++) {
        const spread = (Math.random() - 0.5) * 1.6;       // ±0.8 rad fan
        const dir = angle + spread;
        // Lower velocity so bursts stay close to the wheel — celebration,
        // not stars drifting off into deep space.
        const speed = 0.6 + Math.random() * 1.8;
        bursts.push({
          x: ox,
          y: oy,
          vx: Math.cos(dir) * speed,
          vy: Math.sin(dir) * speed,
          life: 0,
          maxLife: 60 + Math.random() * 60,
          size: 1.6 + Math.random() * 2.6,
          color: jitter(baseColor, 32)
        });
      }
    }
    function fireBurstCluster() {
      // 3–6 simultaneous bursts at random angles — actually feels like a
      // celebration instead of one lonely firework at a time.
      const n = 3 + Math.floor(Math.random() * 4);
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

      // CONSTELLATION (distant stars)
      for (let i = 0; i < constellation.length; i++) {
        const s = constellation[i];
        s.life += s.decay;
        s.twinklePhase += s.twinkleSpeed;
        if (s.life > 1) { constellation[i] = spawnConstellation(); continue; }

        const fade = Math.sin(s.life * Math.PI);
        const twinkle = 0.45 + 0.55 * Math.sin(s.twinklePhase);
        const alpha = s.baseAlpha * fade * twinkle;
        const color = colorAtAngle(s.colorAngle);

        if (s.kind === 'star') drawStar(s.x, s.y, s, alpha, color);
        else                   drawDot(s.x, s.y, s, alpha, color);
      }

      // EXPLOSIONS — fire a cluster (3–6 simultaneous bursts) every 1.5–3s.
      // Plus a 40% chance of a follow-up cluster ~250ms later for layered
      // celebration energy.
      if (now >= nextBurstAt) {
        fireBurstCluster();
        if (Math.random() < 0.4) {
          setTimeout(() => fireBurstCluster(), 240);
        }
        nextBurstAt = now + 1500 + Math.random() * 1500;
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
