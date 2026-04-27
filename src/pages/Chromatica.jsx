import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  const [musicMode, setMusicMode] = useState(true); // default WITH MUSIC
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [exiting, setExiting] = useState(false); // wheel particles flag for dissolve

  const playerRef = useRef(null);

  // Autoplay-muted on mount, then unmute on first user interaction (any
  // click/scroll/keypress). Most browsers permit muted autoplay; the unmute
  // is gated by interaction to satisfy autoplay-with-sound policies.
  useEffect(() => {
    const tryAutoplay = () => {
      if (!playerRef.current?.isReady?.()) return false;
      playerRef.current.mute();
      playerRef.current.play();
      return true;
    };
    // Poll briefly until the YT player is ready, then start muted playback.
    const poll = setInterval(() => {
      if (tryAutoplay()) clearInterval(poll);
    }, 200);

    let unmuted = false;
    const handleFirstInteraction = () => {
      if (unmuted) return;
      unmuted = true;
      if (musicMode && playerRef.current?.isReady?.()) {
        playerRef.current.unmute();
        playerRef.current.play();
      }
    };
    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });
    window.addEventListener('scroll', handleFirstInteraction, { once: true, passive: true });
    window.addEventListener('wheel', handleFirstInteraction, { once: true, passive: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true, passive: true });

    return () => {
      clearInterval(poll);
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('scroll', handleFirstInteraction);
      window.removeEventListener('wheel', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleSelect = (id) => {
    setExiting(true);
    setTimeout(() => {
      setSelectedId(id);
      setExiting(false);
    }, 400);
  };

  const handleBack = () => setSelectedId(null);

  const handleMusicMode = (enabled) => {
    setMusicMode(enabled);
    if (!playerRef.current) return;
    if (enabled) playerRef.current.play();
    else playerRef.current.pause();
  };

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
            {/* top-left wordmark */}
            <div
              className="absolute top-6 left-8 font-mono-c uppercase tracking-mono z-20"
              style={{ fontSize: 11, color: 'rgba(250,250,250,0.5)' }}
            >
              chromatica
            </div>

            {/* top-right meta */}
            <div className="absolute top-6 right-8 z-20 flex items-center gap-6">
              <button
                onClick={() => setCreditsOpen(true)}
                className="font-mono-c uppercase tracking-mono"
                style={{ fontSize: 11, color: 'rgba(250,250,250,0.5)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(250,250,250,0.9)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(250,250,250,0.5)')}
              >
                credits
              </button>
              <div
                className="font-mono-c uppercase tracking-mono"
                style={{ fontSize: 11, color: 'rgba(250,250,250,0.5)' }}
              >
                archive ∞
              </div>
            </div>

            {/* WHEEL — dead-centered in viewport */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="pointer-events-auto">
                <ColorWheel
                  colors={colors}
                  onSelect={handleSelect}
                  exiting={exiting}
                  burstSlot={
                    <LyricBurst
                      images={colors.map((c) => c.image).filter(Boolean)}
                      getCurrentTime={() => playerRef.current?.getCurrentTime?.() || 0}
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
              <div className="flex items-center gap-8">
                <ToggleBtn active={musicMode} onClick={() => handleMusicMode(true)}>
                  with music
                </ToggleBtn>
                <span style={{ color: 'rgba(250,250,250,0.2)' }}>·</span>
                <ToggleBtn active={!musicMode} onClick={() => handleMusicMode(false)}>
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
            onSelectCompanion={(id) => setSelectedId(id)}
          />
        )}
      </AnimatePresence>

      {/* CREDITS PANEL */}
      <AnimatePresence>
        {creditsOpen && <Credits onClose={() => setCreditsOpen(false)} />}
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
        fontSize: 11,
        letterSpacing: '0.15em',
        color: active ? 'rgba(250,250,250,1)' : 'rgba(250,250,250,0.4)',
        borderBottom: active ? '1px solid rgba(250,250,250,0.6)' : '1px solid transparent',
        paddingBottom: 3,
        transition: 'color 0.3s, border-color 0.3s'
      }}
    >
      {children}
    </button>
  );
}