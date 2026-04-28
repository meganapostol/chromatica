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

  // Path 1: scroll-driven (silence). Active in both modes for independent reading.
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
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [musicMode]);

  // Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onBack(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onBack]);

  const tint = mixWithBg(color.hex, 0.06);
  const glassBorder = mixWithBg(color.hex, 0.4);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onBack();
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 flex items-center justify-center p-6 md:p-10"
      style={{
        backgroundColor: 'rgba(5, 5, 8, 0.55)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        animation: 'chromatica-fade-in 0.3s ease-out'
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="relative grid grid-cols-1 md:grid-cols-2 overflow-hidden"
        style={{
          width: '100%',
          maxWidth: 1180,
          height: '88vh',
          maxHeight: 880,
          borderRadius: 18,
          background: `linear-gradient(135deg, ${mixWithBg(color.hex, 0.18)} 0%, ${tint} 100%)`,
          backgroundColor: 'rgba(10, 8, 14, 0.55)',
          backdropFilter: 'blur(22px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(22px) saturate(1.2)',
          border: `1px solid ${glassBorder}55`,
          boxShadow: `0 32px 96px rgba(0,0,0,0.55), 0 0 60px ${color.hex}22`,
          animation: 'chromatica-card-in 0.5s cubic-bezier(0.22, 1, 0.36, 1)'
        }}
      >
        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={onBack}
          aria-label="close chamber"
          className="absolute font-mono-c uppercase tracking-mono"
          style={{
            top: 18,
            right: 18,
            zIndex: 5,
            fontSize: 11,
            color: 'rgba(248,240,227,0.85)',
            backgroundColor: 'rgba(15, 12, 18, 0.65)',
            border: '1px solid rgba(248, 240, 227, 0.22)',
            borderRadius: 9999,
            padding: '7px 14px',
            cursor: 'pointer',
            transition: 'background-color 0.2s, color 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(15, 12, 18, 0.9)';
            e.currentTarget.style.color = '#FAFAFA';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(15, 12, 18, 0.65)';
            e.currentTarget.style.color = 'rgba(248,240,227,0.85)';
          }}
        >
          × close
        </button>

        {/* META top-right under close button */}
        <div
          className="absolute font-mono-c uppercase tracking-mono"
          style={{
            top: 22,
            right: 110,
            zIndex: 4,
            fontSize: 10,
            color: 'rgba(250,250,250,0.45)',
            ...fadeUp(stagger.back)
          }}
        >
          chromatica · {String(index + 1).padStart(2, '0')}/30
        </div>

        {/* LEFT: image */}
        <div
          className="relative h-full hidden md:block"
          style={fadeUp(stagger.image)}
        >
          <ChamberImage color={color} saturation={saturation} />
          <div className="absolute bottom-6 left-6 right-6">
            <div
              className="font-display italic text-[14px] leading-relaxed"
              style={{
                color: 'rgba(250,250,250,0.7)',
                opacity: lostOpacity,
                transition: 'opacity 0.4s ease-out'
              }}
            >
              where she's being lost: {color.lost}
            </div>
          </div>
        </div>

        {/* RIGHT: scrollable text column */}
        <div
          ref={containerRef}
          className="relative overflow-y-auto scroll-hide"
          style={{ padding: '64px 48px 48px 48px' }}
        >
          <div>
            <h1
              className="font-display tracking-display-tight"
              style={{ fontWeight: 600, fontSize: 64, lineHeight: 0.95, color: '#F8F0E3', ...fadeUp(stagger.name) }}
            >
              {color.name}
            </h1>
            <div
              className="font-mono-c uppercase mt-3"
              style={{ fontSize: 14, letterSpacing: '0.05em', color: 'rgba(250,250,250,0.6)', fontWeight: 500, ...fadeUp(stagger.hex) }}
            >
              {color.hex}
            </div>
          </div>

          <div className="mt-8" style={fadeUp(stagger.etymology)}>
            <div className="hairline mb-6" style={{ backgroundColor: mixWithBg(color.hex, 0.4) + '26' }} />
            <p className="font-body" style={{ fontSize: 17, lineHeight: 1.6, color: '#F8F0E3' }}>
              {color.etymology.narrative}
            </p>
          </div>

          <p
            className="font-display italic mt-6"
            style={{ fontSize: 22, lineHeight: 1.4, color: '#F8F0E3', ...fadeUp(stagger.voice) }}
          >
            {color.voice}
          </p>

          <div className="mt-8" style={fadeUp(stagger.nature)}>
            <div className="hairline mb-6" style={{ backgroundColor: mixWithBg(color.hex, 0.4) + '26' }} />
            <SectionLabel>where she lives in nature</SectionLabel>
            <ul className="space-y-2 mt-4">
              {color.nature.map((n, i) => (
                <li key={i} className="font-body flex gap-3" style={{ fontSize: 16, lineHeight: 1.6, color: '#F8F0E3' }}>
                  <span style={{ color: 'rgba(248,240,227,0.4)' }}>·</span>
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8" style={fadeUp(stagger.history)}>
            <div className="hairline mb-6" style={{ backgroundColor: mixWithBg(color.hex, 0.4) + '26' }} />
            <SectionLabel>where she lives in history</SectionLabel>
            <ul className="space-y-2 mt-4">
              {color.history.map((n, i) => (
                <li key={i} className="font-body flex gap-3" style={{ fontSize: 16, lineHeight: 1.6, color: '#F8F0E3' }}>
                  <span style={{ color: 'rgba(248,240,227,0.4)' }}>·</span>
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 pb-4" style={fadeUp(stagger.companions)}>
            <div className="hairline mb-6" style={{ backgroundColor: mixWithBg(color.hex, 0.4) + '26' }} />
            <SectionLabel>her companions</SectionLabel>
            <div className="flex gap-3 mt-4 flex-wrap">
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
                      width: 52,
                      height: 52,
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