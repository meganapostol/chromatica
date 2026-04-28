import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import COLORS from '@/data/colors';
import { resolveImage } from '@/data/imageMap';
import ColorWheel, { WHEEL_SIZE, WHEEL_VOID_RADIUS } from '@/components/chromatica/ColorWheel';
import Chamber from '@/components/chromatica/Chamber';
import MusicPlayer from '@/components/chromatica/MusicPlayer';
import Credits from '@/components/chromatica/Credits';
import LyricBurst from '@/components/chromatica/LyricBurst';
import HeroBackdrop from '@/components/chromatica/HeroBackdrop';
import VoidBlobs from '@/components/chromatica/VoidBlobs';
import VoidPreview from '@/components/chromatica/VoidPreview';
import HoverBackdrop from '@/components/chromatica/HoverBackdrop';
import GuideAgent from '@/components/chromatica/GuideAgent';
import AudioWaveBars from '@/components/chromatica/AudioWaveBars';
import SoundwaveRing from '@/components/chromatica/SoundwaveRing';
import RainbowFinale from '@/components/chromatica/RainbowFinale';
import ProgressDashboard from '@/components/chromatica/ProgressDashboard';
import { setTotalColors } from '@/lib/chromatica-achievement';

// Drop a video at chromatica/public/hero.mp4 and uncomment the videoSrc below
// to swap the aurora gradient for cinematic footage.
const HERO_VIDEO_SRC = null; // e.g. '/hero.mp4'

export default function Chromatica() {
  const [selectedId, setSelectedId] = useState(null);
  const [musicMode, setMusicMode] = useState(false); // default IN SILENCE — user opts into music
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const [hoveredColor, setHoveredColor] = useState(null);

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

  // Seed achievement tracker with the actual color count.
  useEffect(() => { setTotalColors(colors.length); }, [colors.length]);
  const sortedByHue = useMemo(
    () => [...colors].sort((a, b) => a.hueOrder - b.hueOrder),
    [colors]
  );

  const selected = colors.find((c) => c.id === selectedId) || null;
  const selectedIndex = sortedByHue.findIndex((c) => c.id === selectedId);

  // Stable callbacks so child effects don't re-fire on every parent render.
  // (Credits.jsx and ColorWheel both depend on these.)
  const handleSelect = useCallback((id) => setSelectedId(id), []);
  const handleHoverColor = useCallback((color) => setHoveredColor(color), []);
  const handleBack = useCallback(() => setSelectedId(null), []);
  const handleCloseCredits = useCallback(() => setCreditsOpen(false), []);
  const handleSelectCompanion = useCallback((id) => setSelectedId(id), []);
  const handlePrev = useCallback(() => {
    if (!sortedByHue.length) return;
    setSelectedId((curr) => {
      const idx = sortedByHue.findIndex((c) => c.id === curr);
      if (idx === -1) return curr;
      return sortedByHue[(idx - 1 + sortedByHue.length) % sortedByHue.length].id;
    });
  }, [sortedByHue]);
  const handleNext = useCallback(() => {
    if (!sortedByHue.length) return;
    setSelectedId((curr) => {
      const idx = sortedByHue.findIndex((c) => c.id === curr);
      if (idx === -1) return curr;
      return sortedByHue[(idx + 1) % sortedByHue.length].id;
    });
  }, [sortedByHue]);
  const enableMusic = useCallback(() => setMusicMode(true), []);
  const disableMusic = useCallback(() => setMusicMode(false), []);
  const openCredits = useCallback(() => setCreditsOpen(true), []);
  const openProgress = useCallback(() => setProgressOpen(true), []);
  const handleCloseProgress = useCallback(() => setProgressOpen(false), []);
  const getYTTime = useCallback(
    () => playerRef.current?.getCurrentTime?.() || 0,
    []
  );

  // Lock body scroll on the wheel state so transition doesn't jolt.
  useEffect(() => {
    document.body.style.overflow = selected ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [selected]);

  // Arrow keys navigate to the previous/next color (in hue order) while
  // a chamber is open. Wraps around at both ends. Ignored if the user is
  // typing in an input/textarea/contenteditable element.
  useEffect(() => {
    if (!selected) return;
    const onKey = (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      const target = e.target;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) return;
      if (sortedByHue.length === 0) return;
      const idx = sortedByHue.findIndex((c) => c.id === selected.id);
      if (idx === -1) return;
      const nextIdx = e.key === 'ArrowRight'
        ? (idx + 1) % sortedByHue.length
        : (idx - 1 + sortedByHue.length) % sortedByHue.length;
      e.preventDefault();
      setSelectedId(sortedByHue[nextIdx].id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected, sortedByHue]);

  return (
    <div className="relative min-h-screen w-screen chromatica-vignette overflow-hidden">
      {/* AMBIENT HERO — drifting aurora (or video, if HERO_VIDEO_SRC is set) */}
      <HeroBackdrop videoSrc={HERO_VIDEO_SRC} />

      {/* HOVER BACKDROP — hovered color's photo washes the entire page */}
      <HoverBackdrop color={hoveredColor} />

      {/* WHEEL — always mounted, faded by CSS when a chamber is open.
          We deliberately do NOT use AnimatePresence to swap wheel↔chamber:
          framer-motion's PresenceChild was crashing React's reconciler with
          insertBefore errors on color clicks. A plain CSS opacity fade gives
          the same visual transition without any DOM-tree gymnastics. */}
      <div
        className="fixed inset-0 z-10"
        style={{
          pointerEvents: selected ? 'none' : 'auto'
        }}
      >
        {/* TOP NAV — a real header bar with its own translucent background,
            hairline divider, and backdrop blur. Holds: [music player anchored
            top-left in MusicPlayer.jsx] [logo dead-centered] [toggle | credits]. */}
        <div
          className="fixed left-0 right-0 z-30 flex items-center"
          style={{
            top: 0,
            height: 84,
            padding: '0 28px',
            backgroundColor: 'rgba(10, 8, 14, 0.62)',
            backdropFilter: 'blur(14px) saturate(1.1)',
            WebkitBackdropFilter: 'blur(14px) saturate(1.1)',
            borderBottom: '1px solid rgba(248, 240, 227, 0.12)',
            boxShadow: '0 6px 24px rgba(0, 0, 0, 0.35)'
          }}
        >
          {/* spacer for the music player on the left so the centered logo
              isn't visually shoved off-axis */}
          <div style={{ flex: 1 }} />

          {/* CHROMATICA wordmark, true center */}
          <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'center' }}>
            <ChromaticaWordmark />
          </div>

          {/* right: with music / in silence + credits */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 24 }}>
            <div
              className="flex items-center gap-4"
              style={{
                padding: '7px 18px',
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
            <button
              type="button"
              onClick={openProgress}
              className="font-mono-c uppercase tracking-mono"
              style={{ fontSize: 11, color: 'rgba(248,240,227,0.7)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(248,240,227,1)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(248,240,227,0.7)')}
            >
              progress
            </button>
            <button
              type="button"
              onClick={openCredits}
              className="font-mono-c uppercase tracking-mono"
              style={{ fontSize: 11, color: 'rgba(248,240,227,0.7)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(248,240,227,1)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(248,240,227,0.7)')}
            >
              credits
            </button>
          </div>
        </div>

        {/* "click any color" — its OWN pill, ABOVE the wheel, readable on
            any background. Sits just under the nav. CSS-driven fade-in,
            no framer-motion (which had been causing insertBefore crashes). */}
        <div
          className="absolute left-0 right-0 z-20 flex justify-center"
          style={{
            top: 110,
            opacity: 0,
            animation: 'chromatica-prompt-in 1s ease-out 1.6s forwards'
          }}
        >
          <div
            className="font-display italic"
            style={{
              fontSize: 14,
              color: '#F8F0E3',
              padding: '8px 22px',
              borderRadius: 9999,
              backgroundColor: 'rgba(15, 12, 18, 0.6)',
              border: '1px solid rgba(248, 240, 227, 0.18)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}
          >
            click any color to enter her chamber
          </div>
        </div>

        {/* WHEEL — dead-centered in viewport */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto relative">
            <SoundwaveRing active={musicMode} />
            <ColorWheel
              colors={colors}
              onSelect={handleSelect}
              onHoverColor={handleHoverColor}
              voidSlot={
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  <VoidBlobs />
                </div>
              }
              voidLabelSlot={<VoidPreview color={hoveredColor} />}
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

        {/* GUIDE AGENT — first-visit walkthrough + occasional idle nudges */}
        <GuideAgent onWheelState={!selected} />
      </div>

      {/* CHAMBER & CREDITS slots — ALWAYS rendered as siblings of the wheel
          wrapper, even when empty. This keeps the Chromatica root's
          children list stable across selection changes, which prevents the
          insertBefore crashes that happened when the chamber div mounted
          mid-commit alongside the wheel's opacity transition. The heavy
          Chamber/Credits components are still conditionally mounted INSIDE
          their stable wrappers — only the wrappers themselves are
          permanent. */}
      <div
        className="fixed inset-0 z-20"
        style={{ pointerEvents: selected ? 'auto' : 'none' }}
      >
        {selected && (
          <Chamber
            color={selected}
            index={selectedIndex >= 0 ? selectedIndex : 0}
            total={30}
            onBack={handleBack}
            onPrev={handlePrev}
            onNext={handleNext}
            musicMode={musicMode}
            allColors={colors}
            onSelectCompanion={handleSelectCompanion}
          />
        )}
      </div>

      <div
        className="fixed inset-0 z-[80]"
        style={{ pointerEvents: creditsOpen ? 'auto' : 'none' }}
      >
        {creditsOpen && <Credits onClose={handleCloseCredits} />}
      </div>

      <div
        className="fixed inset-0 z-[80]"
        style={{ pointerEvents: progressOpen ? 'auto' : 'none' }}
      >
        {progressOpen && (
          <ProgressDashboard
            colors={colors}
            onClose={handleCloseProgress}
            onSelect={handleSelect}
          />
        )}
      </div>

      {/* PERSISTENT MUSIC PLAYER */}
      <MusicPlayer ref={playerRef} />

      {/* AUDIO-WAVE BARS — only when "with music" is active */}
      <AudioWaveBars active={musicMode} />

      {/* RAINBOW FINALE — fires once the user has seen every color in
          greyscale AND scrolled to the bottom of the credits */}
      <RainbowFinale />
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

// Painted CHROMATICA wordmark — Megan's hand-lettered logo, breathing softly.
// The PNG lives in /public/Biro Script Plus.png (transparent BG, 2000×500).
// Typographic wordmark with per-letter chromatic color cycle.
//
// To swap the font: change WORDMARK_FONT to one of the listed presets
// below — index.html already preloads all three. Adjust SIZE to taste
// (calligraphic fonts usually need to be larger than serifs to read).
const WORDMARK_PRESETS = {
  jost:      { family: "'Jost', sans-serif",          weight: 500, size: 28, spacing: '0.18em',  top: 14, left: 28, uppercase: true },
  tangerine: { family: "'Tangerine', cursive",        weight: 700, size: 68, spacing: '0.01em',  top: -2, left: 28 },
  italianno: { family: "'Italianno', cursive",        weight: 400, size: 64, spacing: '0.01em',  top: 0,  left: 28 },
  playfair:  { family: "'Playfair Display', serif",   weight: 800, size: 32, spacing: '-0.01em', top: 12, left: 28, italic: true },
  cormorant: { family: "'Cormorant Garamond', serif", weight: 600, size: 38, spacing: '0.005em', top: 14, left: 28, italic: true }
};
const WORDMARK_FONT = 'jost';   // ← change this to swap

// Centered in the nav bar; top/left positioning is handled by the parent flex.
function ChromaticaWordmark() {
  const preset = WORDMARK_PRESETS[WORDMARK_FONT];
  const word = preset.uppercase ? 'CHROMATICA' : 'Chromatica';
  const letters = word.split('');
  return (
    <div
      className="select-none"
      style={{
        fontFamily: preset.family,
        fontSize: preset.size,
        fontWeight: preset.weight,
        fontStyle: preset.italic ? 'italic' : 'normal',
        letterSpacing: preset.spacing,
        lineHeight: 1,
        animation: 'chromatica-logo-breathe 7s ease-in-out infinite'
      }}
      aria-label="Chromatica"
    >
      {letters.map((letter, i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{
            display: 'inline-block',
            animation: 'chromatica-letter-cycle 18s ease-in-out infinite',
            animationDelay: `${i * -1.8}s`,
            willChange: 'color, text-shadow'
          }}
        >
          {letter}
        </span>
      ))}
    </div>
  );
}