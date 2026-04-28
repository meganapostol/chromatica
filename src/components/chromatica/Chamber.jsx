import React, { useEffect, useRef, useState } from 'react';
import ChamberImage from './ChamberImage';
import { mixWithBg } from '@/lib/chromatica-utils';

const stagger = {
  name: 0.18,
  hex: 0.26,
  etymology: 0.34,
  voice: 0.42,
  nature: 0.50,
  history: 0.58,
  companions: 0.66,
  back: 0.74
};

const fadeUp = (delay) => ({
  opacity: 0,
  animation: `chromatica-section-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s forwards`
});

export default function Chamber({ color, index, total, onBack, musicMode, allColors, onSelectCompanion }) {
  const containerRef = useRef(null);
  const [saturation, setSaturation] = useState(1);
  const [lostOpacity, setLostOpacity] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setSaturation(1);
    setLostOpacity(0);
    setScrolled(false);
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
  // We accelerate the mapping so the user reaches the "how we're losing her"
  // card after a small amount of scrolling — they don't have to traverse the
  // full text column.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      if (el.scrollTop > 8) setScrolled(true);
      const max = el.scrollHeight - el.clientHeight;
      if (max <= 0) return;
      const raw = Math.max(0, Math.min(1, el.scrollTop / max));
      // Reach full reveal at ~35% of available scroll, then hold.
      const p = Math.min(1, raw / 0.35);

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

  const glassBorder = mixWithBg(color.hex, 0.4);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onBack();
  };

  // As lostOpacity rises, the text card fades and scales up (zooming "into"
  // the photo behind it), and the inner "how we're losing her" card fades in.
  const textCardOpacity = Math.max(0, 1 - lostOpacity * 1.25);
  const textCardScale = 1 + lostOpacity * 0.08;
  const lostCardOpacity = Math.max(0, (lostOpacity - 0.55) / 0.45);

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
        className="relative overflow-hidden"
        style={{
          width: '100%',
          maxWidth: 1180,
          height: '88vh',
          maxHeight: 880,
          borderRadius: 18,
          border: `1px solid ${glassBorder}55`,
          boxShadow: `0 32px 96px rgba(0,0,0,0.55), 0 0 60px ${color.hex}22`,
          animation: 'chromatica-card-in 0.5s cubic-bezier(0.22, 1, 0.36, 1)'
        }}
      >
        {/* FULL-BLEED PHOTO: lives behind everything; desaturates with scroll */}
        <div className="absolute inset-0">
          <ChamberImage color={color} saturation={saturation} />
        </div>

        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={onBack}
          aria-label="close chamber"
          className="absolute font-mono-c uppercase tracking-mono"
          style={{
            top: 18,
            right: 18,
            zIndex: 20,
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

        {/* META indicator */}
        <div
          className="absolute font-mono-c uppercase tracking-mono"
          style={{
            top: 22,
            right: 110,
            zIndex: 19,
            fontSize: 10,
            color: 'rgba(250,250,250,0.7)',
            ...fadeUp(stagger.back)
          }}
        >
          chromatica · {String(index + 1).padStart(2, '0')}/30
        </div>

        {/* SCROLL HINT — directional. Shows ↓ at the top of the column, ↑
            once the user has reached the greyscale "how we're losing her"
            state. Clickable to jump to the opposite end. Hidden in the
            middle of the journey to avoid clutter. */}
        {(() => {
          const showDown = !scrolled && textCardOpacity > 0.85 && lostOpacity < 0.05;
          const showUp = lostCardOpacity > 0.6;
          const visible = showDown || showUp;
          const scrollToTop = () => {
            containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
          };
          const scrollToBottom = () => {
            const el = containerRef.current;
            if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
          };
          return (
            <button
              type="button"
              onClick={showUp ? scrollToTop : scrollToBottom}
              aria-label={showUp ? 'scroll back up' : 'scroll down'}
              className="absolute flex flex-col items-center gap-1.5"
              style={{
                zIndex: 18,
                bottom: 22,
                right: 0,
                width: '50%',
                opacity: visible ? 1 : 0,
                transition: 'opacity 0.4s ease-out, color 0.2s',
                color: 'rgba(248, 240, 227, 0.78)',
                background: 'none',
                border: 'none',
                cursor: visible ? 'pointer' : 'default',
                pointerEvents: visible ? 'auto' : 'none'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(248, 240, 227, 1)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(248, 240, 227, 0.78)')}
            >
              <span
                className="font-mono-c uppercase tracking-mono"
                style={{ fontSize: 10 }}
              >
                scroll {showUp ? 'back' : ''}
              </span>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: 14,
                  lineHeight: 1,
                  animation: 'chromatica-scroll-bounce 1.6s ease-in-out infinite'
                }}
              >
                {showUp ? '↑' : '↓'}
              </span>
            </button>
          );
        })()}

        {/* TEXT GLASS CARD — overlays photo on the right, fades & scales out as you scroll */}
        <div
          className="absolute inset-y-0 right-0 w-full md:w-1/2"
          style={{
            zIndex: 10,
            opacity: textCardOpacity,
            transform: `scale(${textCardScale})`,
            transformOrigin: 'center right',
            transition: 'opacity 0.3s ease-out, transform 0.4s ease-out',
            pointerEvents: textCardOpacity < 0.05 ? 'none' : 'auto'
          }}
        >
          <div
            ref={containerRef}
            className="relative h-full overflow-y-auto chromatica-scrollbar"
            style={{
              padding: '64px 48px 48px 48px',
              background: `linear-gradient(135deg, ${mixWithBg(color.hex, 0.22)} 0%, ${mixWithBg(color.hex, 0.08)} 100%)`,
              backgroundColor: 'rgba(10, 8, 14, 0.72)',
              backdropFilter: 'blur(22px) saturate(1.2)',
              WebkitBackdropFilter: 'blur(22px) saturate(1.2)',
              borderLeft: `1px solid ${glassBorder}33`
            }}
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

            <div className="mt-8 pb-16" style={fadeUp(stagger.companions)}>
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

        {/* INNER "HOW WE'RE LOSING HER" CARD — fades in once the photo is greyscale */}
        <div
          className="absolute inset-0 flex items-center justify-center p-10 md:p-16"
          style={{
            zIndex: 15,
            opacity: lostCardOpacity,
            transition: 'opacity 0.5s ease-out',
            pointerEvents: lostCardOpacity < 0.5 ? 'none' : 'auto'
          }}
        >
          <div
            className="relative"
            style={{
              maxWidth: 560,
              padding: '40px 44px',
              borderRadius: 14,
              backgroundColor: 'rgba(10, 8, 14, 0.55)',
              backdropFilter: 'blur(18px) saturate(1.1)',
              WebkitBackdropFilter: 'blur(18px) saturate(1.1)',
              border: '1px solid rgba(248, 240, 227, 0.18)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.55)',
              transform: `translateY(${(1 - lostCardOpacity) * 16}px)`,
              transition: 'transform 0.5s ease-out'
            }}
          >
            <div
              className="font-mono-c uppercase tracking-mono"
              style={{ fontSize: 11, color: 'rgba(250,250,250,0.6)', marginBottom: 18 }}
            >
              how we're losing her
            </div>
            <p
              className="font-display italic"
              style={{ fontSize: 22, lineHeight: 1.5, color: '#F8F0E3' }}
            >
              {color.lost}
            </p>
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