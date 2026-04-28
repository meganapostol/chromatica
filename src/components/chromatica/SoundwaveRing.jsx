import React, { useEffect, useRef } from 'react';

// Decorative soundwave that orbits the color wheel. Pure visual — the
// YouTube IFrame API doesn't expose raw audio data cross-origin, so each
// "bar" is a pseudo-random oscillator at its own frequency, producing a
// living, music-like wave around the wheel's perimeter.
//
// Bars are radial: anchored just outside the wheel's outer color ring
// and extending outward. Color is sampled from the Chromatica palette so
// the ring feels native to the wheel.
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

    // Each bar gets independent oscillator parameters for organic motion.
    const bars = Array.from({ length: BAR_COUNT }, (_, i) => ({
      color: PALETTE[i % PALETTE.length],
      freq1: 0.6 + Math.random() * 1.4,
      freq2: 1.2 + Math.random() * 2.4,
      phase: Math.random() * Math.PI * 2,
      base: 0.3 + Math.random() * 0.4
    }));

    const start = performance.now();

    const tick = (now) => {
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      // The wheel's outer color ring sits at ~0.42 of its viewBox; the
      // container is 78vh/78vw. Anchor bars just past the painted slabs.
      const innerR = Math.min(width, height) * 0.46;
      const maxBarLength = Math.min(width, height) * 0.06;

      for (let i = 0; i < BAR_COUNT; i++) {
        const b = bars[i];
        const wave =
          0.5 +
          0.35 * Math.sin(t * b.freq1 + b.phase) +
          0.25 * Math.sin(t * b.freq2 + b.phase * 1.7);
        const amp = Math.max(0.08, Math.min(1, wave * b.base + 0.25));
        const barLen = amp * maxBarLength;

        const angle = (i / BAR_COUNT) * Math.PI * 2 - Math.PI / 2;
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

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
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