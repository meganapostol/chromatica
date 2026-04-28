import React, { useEffect, useRef } from 'react';

// Decorative multi-coloured "audio wave" bars pinned to the bottom of the
// screen. Pure visual — not wired to actual audio analysis. Each bar
// pseudo-randomly oscillates at its own frequency, creating a living
// waveform feel that reads as music.
//
// CURSOR INTERACTIVITY (organic, not snappy):
// - Smoothed mouse position (lerped each frame) so jitter and fast flicks
//   don't make the wave twitch.
// - Per-bar amplitude is also smoothed (low-pass) so swelling and
//   relaxing is continuous, not instant.
// - Wide Gaussian falloff so neighbouring bars rise together.
// - Directional "wake": a soft secondary lift trails behind the cursor's
//   recent direction of motion, like water moving with a finger.
const PALETTE = [
  '#E34234', '#FF7F50', '#E97451', '#E3A857', '#F2A900',
  '#FADA5E', '#C0D725', '#50A747', '#2E8B57', '#43B3AE',
  '#5BB7E5', '#26619C', '#002FA7', '#1F4788', '#8E4585',
  '#66023C', '#DC143C', '#E34234', '#F2A900', '#C0D725',
  '#43B3AE', '#5BB7E5', '#1F4788', '#8E4585', '#DC143C'
];

const BAR_COUNT = 180;

export default function AudioWaveBars({ active = true }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  // Raw + smoothed cursor x; velocity tracks recent x-motion for the wake.
  const mouseRef = useRef({
    rawX: -9999,
    x: -9999,
    smoothedX: -9999,
    vx: 0,
    active: false
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    let width = 0;
    let height = 0;

    const resize = () => {
      width = window.innerWidth;
      height = 90;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    // Each bar: oscillator params + a smoothed amplitude state.
    const bars = Array.from({ length: BAR_COUNT }, (_, i) => ({
      color: PALETTE[i % PALETTE.length],
      freq1: 0.6 + Math.random() * 1.4,
      freq2: 1.2 + Math.random() * 2.4,
      phase: Math.random() * Math.PI * 2,
      base: 0.25 + Math.random() * 0.35,
      amp: 0.2 // smoothed; eases toward target each frame
    }));

    const start = performance.now();
    let lastT = start;

    const tick = (now) => {
      const t = (now - start) / 1000;
      const dt = Math.min(0.05, (now - lastT) / 1000); // clamp for stability
      lastT = now;

      ctx.clearRect(0, 0, width, height);

      const gap = 2;
      const barWidth = Math.max(1, (width - gap * (BAR_COUNT + 1)) / BAR_COUNT);

      // Smooth the cursor x toward the raw x. Lower factor = lazier follow.
      const m = mouseRef.current;
      const followRate = 1 - Math.exp(-dt * 9);   // ~9 = comfortable lag
      const prevSmoothed = m.smoothedX;
      m.smoothedX = m.smoothedX + (m.rawX - m.smoothedX) * followRate;
      // Velocity decays toward instantaneous delta (smoothed).
      const instantVx = (m.smoothedX - prevSmoothed) / Math.max(dt, 0.001);
      m.vx = m.vx + (instantVx - m.vx) * (1 - Math.exp(-dt * 6));

      // Wake: a secondary "ghost" influence point trailing behind the cursor
      // in the direction it's moving from. Distance scales with speed.
      const wakeOffset = Math.max(-260, Math.min(260, -m.vx * 0.18));
      const wakeX = m.smoothedX + wakeOffset;
      const wakeStrength = Math.min(1, Math.abs(m.vx) / 1400);

      const influenceRadius = 220; // wider, softer than before

      for (let i = 0; i < BAR_COUNT; i++) {
        const b = bars[i];
        // Combine two sine waves at different frequencies for a more organic
        // bouncing pattern. Clamp into [0.08, 1].
        const wave =
          0.5 +
          0.35 * Math.sin(t * b.freq1 + b.phase) +
          0.25 * Math.sin(t * b.freq2 + b.phase * 1.7);
        let target = Math.max(0.08, Math.min(1, wave * b.base + 0.25));

        const x = gap + i * (barWidth + gap);
        const barCenter = x + barWidth / 2;

        if (m.active) {
          // Primary lift: gentle Gaussian centered on the smoothed cursor.
          const d1 = (barCenter - m.smoothedX) / influenceRadius;
          const lift = Math.exp(-d1 * d1 * 1.4) * 0.85;
          target += lift;

          // Wake lift: weaker, broader, behind the cursor's motion.
          if (wakeStrength > 0.05) {
            const d2 = (barCenter - wakeX) / (influenceRadius * 1.2);
            const wakeLift = Math.exp(-d2 * d2 * 1.0) * 0.45 * wakeStrength;
            target += wakeLift;
          }
        }

        target = Math.min(1, target);

        // Per-bar low-pass: amplitudes ease in/out, never snap.
        const easeRate = 1 - Math.exp(-dt * 7);
        b.amp = b.amp + (target - b.amp) * easeRate;

        const barH = b.amp * (height - 14);
        const y = height - barH - 6;

        // Vertical gradient: bar's color → translucent same color → fade.
        const grad = ctx.createLinearGradient(0, y, 0, y + barH);
        grad.addColorStop(0, b.color);
        grad.addColorStop(1, b.color + '33');

        ctx.fillStyle = grad;
        ctx.beginPath();
        const r = Math.min(barWidth / 2, 3);
        // Rounded-top bar.
        ctx.moveTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.lineTo(x + barWidth - r, y);
        ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + r);
        ctx.lineTo(x + barWidth, y + barH);
        ctx.lineTo(x, y + barH);
        ctx.closePath();
        ctx.fill();

        // Soft glow under the bar.
        ctx.fillStyle = b.color + '22';
        ctx.fillRect(x - 1, y + barH, barWidth + 2, 4);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    // Track cursor on window so the wave reacts even when the cursor is
    // technically above the visible band (the surrounding fade gradient).
    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const inBand = e.clientY >= rect.top - 60 && e.clientY <= rect.bottom + 20;
      mouseRef.current.rawX = e.clientX - rect.left;
      if (!mouseRef.current.active) {
        // First entry — seed smoothed position so it doesn't sweep across.
        mouseRef.current.smoothedX = mouseRef.current.rawX;
      }
      mouseRef.current.active = inBand;
    };
    const onMouseLeave = () => { mouseRef.current.active = false; };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed left-0 right-0 pointer-events-none"
      style={{
        bottom: 0,
        height: 90,
        zIndex: 25,
        opacity: active ? 0.85 : 0,
        transition: 'opacity 0.6s ease-out',
        background: 'linear-gradient(to top, rgba(10,8,14,0.55) 0%, rgba(10,8,14,0) 100%)',
        mixBlendMode: 'screen'
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
}