import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import COLORS from '@/data/colors';
import { resolveImage } from '@/data/imageMap';
import ColorWheel, { WHEEL_SIZE, WHEEL_VOID_RADIUS } from '@/components/chromatica/ColorWheel';
import Chamber from '@/components/chromatica/Chamber';
import MusicPlayer from '@/components/chromatica/MusicPlayer';
import Credits from '@/components/chromatica/Credits';
import LyricBurst from '@/components/chromatica/LyricBurst';

export default function Chromatica() {
  const [selectedId, setSelectedId] = useState(null);
  const [musicMode, setMusicMode] = useState(false); // default IN SILENCE — user opts into music
  const [creditsOpen, setCreditsOpen] = useState(false);

  const playerRef = useRef(null);

  // Music mode controller. No autoplay on mount — silence is the first
  // impression. When the user toggles "with music", we unmute & play
  // (their click is a user gesture, so this complies with autoplay policy).
  // Also re-asserts play on chamber / credits transitions because YT can
  // self-pause when modals stack over the iframe.
  useEffect(() => {
    if (!musicMode) {
      playerRef.current?.pause?.();
      return;
    }
    const tryPlay = () => {
      if (!playerRef.current?.isReady?.()) return false;
      playerRef.current.unmute();
      playerRef.current.play();
      return true;
    };
    if (tryPlay()) return;
    const poll = setInterval(() => {
      if (tryPlay()) clearInterval(poll);
    }, 200);
    return () => clearInterval(poll);
  }, [musicMode, creditsOpen, selectedId]);

  // Resolve image paths once.
  const colors = useMemo(
    () => COLORS.map((c) => ({ ...c, image: resolveImage(c.image) })),
    []
  );
  const sortedByHue = useMemo(
    () => [...colors].sort((a, b) => a.hueOrder - b.hueOrder),
    [colors]
  );

  const selected = colors.find((c) => c.id === selectedId) || null;
  const selectedIndex = sortedByHue.findIndex((c) => c.id === selectedId);

  // Stable callbacks so child effects don't re-fire on every parent render.
  // (Credits.jsx and ColorWheel both depend on these.)
  const handleSelect = useCallback((id) => setSelectedId(id), []);
  const handleBack = useCallback(() => setSelectedId(null), []);
  const handleCloseCredits = useCallback(() => setCreditsOpen(false), []);
  const handleSelectCompanion = useCallback((id) => setSelectedId(id), []);
  const enableMusic = useCallback(() => setMusicMode(true), []);
  const disableMusic = useCallback(() => setMusicMode(false), []);
  const openCredits = useCallback(() => setCreditsOpen(true), []);
  const getYTTime = useCallback(
    () => playerRef.current?.getCurrentTime?.() || 0,
    []
  );

  // Lock body scroll on the wheel state so transition doesn't jolt.
  useEffect(() => {
    document.body.style.overflow = selected ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [selected]);

  return (
    <div className="relative min-h-screen w-screen chromatica-vignette overflow-hidden">
      {/* WHEEL + CHAMBER share a single AnimatePresence so only one mounts at a time */}
      <AnimatePresence mode="wait">
        {!selected ? (
          <motion.div
            key="wheel-state"
            className="fixed inset-0 z-10 chromatica-vignette"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.5 } }}
            exit={{ opacity: 0, transition: { duration: 0.4 } }}
          >
            {/* top-left animated wordmark */}
            <ChromaticaWordmark />

            {/* top-right meta */}
            <div className="absolute top-6 right-8 z-20 flex items-center gap-6">
              <button
                type="button"
                onClick={openCredits}
                className="font-mono-c uppercase tracking-mono"
                style={{ fontSize: 11, color: 'rgba(248,240,227,0.6)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(248,240,227,1)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(248,240,227,0.6)')}
              >
                credits
              </button>
            </div>

            {/* WHEEL — dead-centered in viewport */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="pointer-events-auto">
                <ColorWheel
                  colors={colors}
                  onSelect={handleSelect}
                  burstSlot={
                    <LyricBurst
                      images={colors.map((c) => c.image).filter(Boolean)}
                      getCurrentTime={getYTTime}
                      size={WHEEL_SIZE}
                      voidRadius={WHEEL_VOID_RADIUS}
                    />
                  }
                />
              </div>
            </div>

            {/* bottom invitation + toggles (invitation fades in after the wheel finishes assembling) */}
            <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-4 z-20">
              <motion.div
                className="font-display italic"
                style={{ fontSize: 13, color: 'rgba(250,250,250,0.6)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 1.2, delay: 3.0 } }}
              >
                click any color to enter her chamber
              </motion.div>
              <div
                className="flex items-center gap-5"
                style={{
                  padding: '8px 20px',
                  borderRadius: 9999,
                  backgroundColor: 'rgba(15, 12, 18, 0.55)',
                  border: '1px solid rgba(248, 240, 227, 0.14)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)'
                }}
              >
                <ToggleBtn active={musicMode} onClick={enableMusic}>
                  with music
                </ToggleBtn>
                <span style={{ color: 'rgba(248,240,227,0.28)', fontSize: 12 }}>·</span>
                <ToggleBtn active={!musicMode} onClick={disableMusic}>
                  in silence
                </ToggleBtn>
              </div>
            </div>
          </motion.div>
        ) : (
          <Chamber
            key={selected.id}
            color={selected}
            index={selectedIndex >= 0 ? selectedIndex : 0}
            total={30}
            onBack={handleBack}
            musicMode={musicMode}
            allColors={colors}
            onSelectCompanion={handleSelectCompanion}
          />
        )}
      </AnimatePresence>

      {/* CREDITS PANEL */}
      <AnimatePresence>
        {creditsOpen && <Credits onClose={handleCloseCredits} />}
      </AnimatePresence>

      {/* PERSISTENT MUSIC PLAYER */}
      <MusicPlayer ref={playerRef} />
    </div>
  );
}

function ToggleBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="font-mono-c uppercase"
      style={{
        fontSize: 12,
        letterSpacing: '0.2em',
        color: active ? '#F8F0E3' : 'rgba(248,240,227,0.55)',
        borderBottom: active
          ? '1.5px solid rgba(248,240,227,0.85)'
          : '1.5px solid transparent',
        paddingBottom: 4,
        paddingTop: 2,
        cursor: 'pointer',
        transition: 'color 0.3s, border-color 0.3s'
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.color = 'rgba(248,240,227,0.9)';
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.color = 'rgba(248,240,227,0.55)';
      }}
    >
      {children}
    </button>
  );
}

// Animated wordmark: each letter cycles through the wheel's palette
// on a phase-offset loop. Drops in for the placeholder lowercase mono
// "chromatica" until Megan's hand-made logo arrives.
function ChromaticaWordmark() {
  const letters = 'CHROMATICA'.split('');
  return (
    <div
      className="absolute top-6 left-8 font-mono-c tracking-mono z-20 select-none"
      style={{ fontSize: 12, lineHeight: 1, fontWeight: 500 }}
      aria-label="Chromatica"
    >
      {letters.map((letter, i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{
            display: 'inline-block',
            animation: 'chromatica-letter-cycle 16s ease-in-out infinite',
            animationDelay: `${i * -1.6}s`,
            willChange: 'color'
          }}
        >
          {letter}
        </span>
      ))}
    </div>
  );
}