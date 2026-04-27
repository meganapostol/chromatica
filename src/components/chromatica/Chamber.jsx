import React, { useEffect, useRef, useState } from 'react';
import ChamberImage from './ChamberImage';
import { mixWithBg } from '@/lib/chromatica-utils';

const stagger = {
  image: 0.20,
  name: 0.32,
  hex: 0.40,
  etymology: 0.48,
  voice: 0.56,
  nature: 0.64,
  history: 0.72,
  companions: 0.80,
  back: 0.88
};

// CSS-driven fade-up replacing the framer-motion variants.
// Removing framer-motion from this file ends the insertBefore crashes
// that fired when chamber/credits transitions collided with React's
// reconciler.
const fadeUp = (delay) => ({
  opacity: 0,
  animation: `chromatica-section-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s forwards`
});

export default function Chamber({ color, index, total, onBack, musicMode, allColors, onSelectCompanion }) {
  const containerRef = useRef(null);
  const [saturation, setSaturation] = useState(1);
  const [lostOpacity, setLostOpacity] = useState(0);

  useEffect(() => {
    setSaturation(1);
    setLostOpacity(0);
    if (containerRef.current) containerRef.current.scrollTop = 0;
  }, [color.id]);

  // Path 2: timer-driven (with music)
  useEffect(() => {
    if (!musicMode) return;
    const HOLD_MS = 4000;
    const FADE_MS = 26000;
    let start = null;
    let raf;

    const step = (t) => {
      if (start === null) start = t;
      const elapsed = t - start;
      if (elapsed < HOLD_MS) {
        setSaturation(1);
        setLostOpacity(0);
      } else {
        const p = Math.min(1, (elapsed - HOLD_MS) / FADE_MS);
        const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        setSaturation(1 - eased);
        setLostOpacity(eased);
      }
      if (elapsed < HOLD_MS + FADE_MS) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [color.id, musicMode]);

  // Path 1: scroll-driven (in silence). Also active in music mode for independent reading.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight;
      if (max <= 0) return;
      const p = Math.max(0, Math.min(1, el.scrollTop / max));

      if (!musicMode) {
        setSaturation(1 - p);
        setLostOpacity(p);
      } else {
        setSaturation((s) => Math.min(s, 1 - p));
        setLostOpacity((o) => Math.max(o, p));
      }

      if (el.scrollTop < -40) onBack();
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [musicMode, onBack]);

  // Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onBack(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onBack]);

  const tint = mixWithBg(color.hex, 0.06);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-y-auto overflow-x-hidden scroll-hide"
      style={{ backgroundColor: tint }}
    >
      {/* expanding stained gradient from center */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${mixWithBg(color.hex, 0.18)} 0%, ${tint} 55%, #050508 100%)`,
          opacity: 0,
          transform: 'scale(0.2)',
          animation: 'chromatica-chamber-stain 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards'
        }}
      />

      {/* meta top right */}
      <div
        className="fixed top-6 right-6 font-mono-c text-[11px] tracking-mono uppercase"
        style={{ color: 'rgba(250,250,250,0.5)', zIndex: 30, ...fadeUp(stagger.back) }}
      >
        chromatica · {String(index + 1).padStart(2, '0')}/30
      </div>

      <div className="relative grid grid-cols-2 min-h-screen" style={{ zIndex: 10 }}>
        {/* LEFT: image */}
        <div
          className="relative h-screen sticky top-0"
          style={fadeUp(stagger.image)}
        >
          <ChamberImage color={color} saturation={saturation} />
          <div className="absolute bottom-8 left-8 right-8">
            <div
              className="font-display italic text-[14px] leading-relaxed"
              style={{
                color: 'rgba(250,250,250,0.6)',
                opacity: lostOpacity,
                transition: 'opacity 0.4s ease-out'
              }}
            >
              where she's being lost: {color.lost}
            </div>
          </div>
        </div>

        {/* RIGHT: text column */}
        <div className="px-16 py-20 flex flex-col gap-10">
          <button
            type="button"
            onClick={onBack}
            className="self-start font-mono-c text-[11px] tracking-mono-tight uppercase"
            style={{ color: '#F8F0E3', ...fadeUp(stagger.back) }}
            onMouseEnter={(e) => (e.currentTarget.style.color = color.hex)}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#F8F0E3')}
          >
            ← back to the wheel
          </button>

          <div>
            <h1
              className="font-display tracking-display-tight"
              style={{ fontWeight: 600, fontSize: 80, lineHeight: 0.95, color: '#F8F0E3', ...fadeUp(stagger.name) }}
            >
              {color.name}
            </h1>
            <div
              className="font-mono-c uppercase mt-3"
              style={{ fontSize: 16, letterSpacing: '0.05em', color: 'rgba(250,250,250,0.6)', fontWeight: 500, ...fadeUp(stagger.hex) }}
            >
              {color.hex}
            </div>
          </div>

          <div style={fadeUp(stagger.etymology)}>
            <div className="hairline mb-8" style={{ backgroundColor: mixWithBg(color.hex, 0.4) + '26' }} />
            <p className="font-body" style={{ fontSize: 18, lineHeight: 1.6, color: '#F8F0E3' }}>
              {color.etymology.narrative}
            </p>
          </div>

          <p
            className="font-display italic"
            style={{ fontSize: 22, lineHeight: 1.4, color: '#F8F0E3', margin: '8px 0', ...fadeUp(stagger.voice) }}
          >
            {color.voice}
          </p>

          <div style={fadeUp(stagger.nature)}>
            <div className="hairline mb-8" style={{ backgroundColor: mixWithBg(color.hex, 0.4) + '26' }} />
            <SectionLabel>where she lives in nature</SectionLabel>
            <ul className="space-y-2 mt-4">
              {color.nature.map((n, i) => (
                <li key={i} className="font-body flex gap-3" style={{ fontSize: 18, lineHeight: 1.6, color: '#F8F0E3' }}>
                  <span style={{ color: 'rgba(248,240,227,0.4)' }}>·</span>
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </div>

          <div style={fadeUp(stagger.history)}>
            <div className="hairline mb-8" style={{ backgroundColor: mixWithBg(color.hex, 0.4) + '26' }} />
            <SectionLabel>where she lives in history</SectionLabel>
            <ul className="space-y-2 mt-4">
              {color.history.map((n, i) => (
                <li key={i} className="font-body flex gap-3" style={{ fontSize: 18, lineHeight: 1.6, color: '#F8F0E3' }}>
                  <span style={{ color: 'rgba(248,240,227,0.4)' }}>·</span>
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pb-24" style={fadeUp(stagger.companions)}>
            <div className="hairline mb-8" style={{ backgroundColor: mixWithBg(color.hex, 0.4) + '26' }} />
            <SectionLabel>her companions</SectionLabel>
            <div className="flex gap-4 mt-5">
              {color.companions.map((hex, i) => {
                const match = allColors.find((c) => c.hex.toLowerCase() === hex.toLowerCase());
                const interactive = !!match;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => interactive && onSelectCompanion(match.id)}
                    disabled={!interactive}
                    className="rounded-md transition-transform"
                    style={{
                      width: 60,
                      height: 60,
                      backgroundColor: hex,
                      cursor: interactive ? 'pointer' : 'default',
                      boxShadow: `0 0 24px ${hex}33`,
                      outline: '1px solid rgba(250,250,250,0.08)'
                    }}
                    onMouseEnter={(e) => interactive && (e.currentTarget.style.transform = 'translateY(-2px)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                    title={hex}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div
      className="font-mono-c uppercase tracking-mono-tight"
      style={{ fontSize: 11, color: 'rgba(250,250,250,0.6)' }}
    >
      {children}
    </div>
  );
}
