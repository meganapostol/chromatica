import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
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
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.3 } }
});

export default function Chamber({ color, index, total, onBack, musicMode, allColors, onSelectCompanion }) {
  const containerRef = useRef(null);
  const [saturation, setSaturation] = useState(1);
  const [lostOpacity, setLostOpacity] = useState(0);

  // Reset on color change
  useEffect(() => {
    setSaturation(1);
    setLostOpacity(0);
    if (containerRef.current) containerRef.current.scrollTop = 0;
  }, [color.id]);

  // Path 2: timer-driven (with music)
  useEffect(() => {
    if (!musicMode) return;
    const HOLD_MS = 4000;       // 4s grace before she begins to fade
    const FADE_MS = 26000;      // ~30s total arc
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
        // ease-in-out
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
        // pure scroll-drive
        setSaturation(1 - p);
        setLostOpacity(p);
      } else {
        // music mode: scroll can pull desaturation forward but not reverse the timer
        setSaturation((s) => Math.min(s, 1 - p));
        setLostOpacity((o) => Math.max(o, p));
      }

      // scroll up past top => exit
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
    <motion.div
      key={color.id}
      ref={containerRef}
      className="fixed inset-0 overflow-y-auto overflow-x-hidden scroll-hide"
      style={{ backgroundColor: tint }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.4 } }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
    >
      {/* expanding stained gradient from center */}
      <motion.div
        aria-hidden
        className="fixed inset-0 pointer-events-none"
        initial={{ opacity: 0, scale: 0.2 }}
        animate={{ opacity: 1, scale: 1, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }}
        exit={{ opacity: 0, scale: 0.2, transition: { duration: 0.6 } }}
        style={{
          background: `radial-gradient(ellipse at center, ${mixWithBg(color.hex, 0.18)} 0%, ${tint} 55%, #050508 100%)`
        }}
      />

      {/* meta top right */}
      <motion.div
        {...fadeUp(stagger.back)}
        className="fixed top-6 right-6 font-mono-c text-[11px] tracking-mono uppercase"
        style={{ color: 'rgba(250,250,250,0.5)', zIndex: 30 }}
      >
        chromatica · {String(index + 1).padStart(2, '0')}/30
      </motion.div>

      <div className="relative grid grid-cols-2 min-h-screen" style={{ zIndex: 10 }}>
        {/* LEFT: image */}
        <motion.div
          {...fadeUp(stagger.image)}
          className="relative h-screen sticky top-0"
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
        </motion.div>

        {/* RIGHT: text column */}
        <div className="px-16 py-20 flex flex-col gap-10">
          <motion.button
            {...fadeUp(stagger.back)}
            onClick={onBack}
            className="self-start font-mono-c text-[11px] tracking-mono-tight uppercase"
            style={{ color: '#F8F0E3', opacity: 0.7 }}
            onMouseEnter={(e) => e.currentTarget.style.color = color.hex}
            onMouseLeave={(e) => e.currentTarget.style.color = '#F8F0E3'}
          >
            ← back to the wheel
          </motion.button>

          <div>
            <motion.h1
              {...fadeUp(stagger.name)}
              className="font-display tracking-display-tight"
              style={{ fontWeight: 600, fontSize: 80, lineHeight: 0.95, color: '#F8F0E3' }}
            >
              {color.name}
            </motion.h1>
            <motion.div
              {...fadeUp(stagger.hex)}
              className="font-mono-c uppercase mt-3"
              style={{ fontSize: 16, letterSpacing: '0.05em', color: 'rgba(250,250,250,0.6)', fontWeight: 500 }}
            >
              {color.hex}
            </motion.div>
          </div>

          <motion.div {...fadeUp(stagger.etymology)}>
            <div className="hairline mb-8" style={{ backgroundColor: mixWithBg(color.hex, 0.4) + '26' }} />
            <p className="font-body" style={{ fontSize: 18, lineHeight: 1.6, color: '#F8F0E3' }}>
              {color.etymology.narrative}
            </p>
          </motion.div>

          <motion.p
            {...fadeUp(stagger.voice)}
            className="font-display italic"
            style={{ fontSize: 22, lineHeight: 1.4, color: '#F8F0E3', opacity: 0.9, margin: '8px 0' }}
          >
            {color.voice}
          </motion.p>

          <motion.div {...fadeUp(stagger.nature)}>
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
          </motion.div>

          <motion.div {...fadeUp(stagger.history)}>
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
          </motion.div>

          <motion.div {...fadeUp(stagger.companions)} className="pb-24">
            <div className="hairline mb-8" style={{ backgroundColor: mixWithBg(color.hex, 0.4) + '26' }} />
            <SectionLabel>her companions</SectionLabel>
            <div className="flex gap-4 mt-5">
              {color.companions.map((hex, i) => {
                const match = allColors.find((c) => c.hex.toLowerCase() === hex.toLowerCase());
                const interactive = !!match;
                return (
                  <button
                    key={i}
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
          </motion.div>
        </div>
      </div>
    </motion.div>
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