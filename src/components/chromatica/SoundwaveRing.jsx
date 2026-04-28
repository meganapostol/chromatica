import React, { useEffect, useRef } from 'react';
import { onRipple } from '@/lib/chromatica-ripple';

// Decorative soundwave that orbits the color wheel.
//
// Now also receives ripple pulses (via the chromatica-ripple bus) when the
// glyph ring snaps to a color sector after a drag. Each pulse is a brief
// localized swell that radiates outward around the perimeter from the
// snap angle, then dies out.
const PALETTE = [
  '#E34234', '#FF7F50', '#E97451', '#E3A857', '#F2A900',
  '#FADA5E', '#C0D725', '#50A747', '#2E8B57', '#43B3AE',
  '#5BB7E5', '#26619C', '#002FA7', '#1F4788', '#8E4585',
  '#66023C', '#DC143C', '#E34234', '#F2A900', '#C0D725',
  '#43B3AE', '#5BB7E5', '#1F4788', '#8E4585', '#DC143C'
];

const BAR_COUNT = 180;

export default function SoundwaveRing({ active = true }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  // Active ripples: { angle (rad), birth (ms), strength }
  const ripplesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    let width = 0;
    let height = 0;

    const resize = () => {
      width = canvas.parentElement?.clientWidth || 600;
      height = canvas.parentElement?.clientHeight || 600;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    // Each bar gets its own oscillator + a smoothed amplitude state.
    const bars = Array.from({ length: BAR_COUNT }, (_, i) => ({
      color: PALETTE[i % PALETTE.length],
      freq1: 0.6 + Math.random() * 1.4,
      freq2: 1.2 + Math.random() * 2.4,
      phase: Math.random() * Math.PI * 2,
      base: 0.3 + Math.random() * 0.4,
      amp: 0.3
    }));

    const start = performance.now();
    let lastT = start;

    const tick = (now) => {
      const t = (now - start) / 1000;
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const innerR = Math.min(width, height) * 0.46;
      const maxBarLength = Math.min(width, height) * 0.06;

      // Cull dead ripples (>1.4s old).
      const RIPPLE_LIFE = 1400;
      ripplesRef.current = ripplesRef.current.filter((r) => now - r.birth < RIPPLE_LIFE);

      for (let i = 0; i < BAR_COUNT; i++) {
        const b = bars[i];
        const wave =
          0.5 +
          0.35 * Math.sin(t * b.freq1 + b.phase) +
          0.25 * Math.sin(t * b.freq2 + b.phase * 1.7);
        let target = Math.max(0.08, Math.min(1, wave * b.base + 0.25));

        const angle = (i / BAR_COUNT) * Math.PI * 2 - Math.PI / 2;

        // Ripple contribution: each active ripple expands a Gaussian-shaped
        // arc band outward from its origin angle, peaks early, fades out.
        for (const r of ripplesRef.current) {
          const age = (now - r.birth) / RIPPLE_LIFE; // 0..1
          // Angular distance, wrapped to [0, π].
          let ad = Math.abs(angle - r.angle);
          if (ad > Math.PI) ad = Math.PI * 2 - ad;
          // Front of the ripple sweeps outward in angle.
          const front = age * Math.PI * 0.9;
          const dFromFront = ad - front;
          // Bell curve hugging the front, narrows + fades over life.
          const widthA = 0.35 * (1 - age * 0.6);
          const envelope = Math.exp(-(dFromFront * dFromFront) / (widthA * widthA));
          const decay = 1 - age;
          target += envelope * decay * r.strength * 0.8;
        }

        target = Math.min(1.4, target);

        const easeRate = 1 - Math.exp(-dt * 8);
        b.amp = b.amp + (target - b.amp) * easeRate;

        const barLen = Math.min(1.4, b.amp) * maxBarLength;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const x1 = cx + cos * innerR;
        const y1 = cy + sin * innerR;
        const x2 = cx + cos * (innerR + barLen);
        const y2 = cy + sin * (innerR + barLen);

        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, b.color);
        grad.addColorStop(1, b.color + '00');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    // Subscribe to ripple events from the wheel snap.
    const off = onRipple(({ angle, strength = 1 }) => {
      ripplesRef.current.push({
        angle,
        birth: performance.now(),
        strength
      });
      // Cap concurrent ripples so a furious user can't melt the canvas.
      if (ripplesRef.current.length > 6) ripplesRef.current.shift();
    });

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      off();
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        opacity: active ? 0.85 : 0,
        transition: 'opacity 0.6s ease-out',
        mixBlendMode: 'screen',
        zIndex: 2
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  );
}