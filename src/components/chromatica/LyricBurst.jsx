import React, { useEffect, useState, useRef } from 'react';

// Centerpiece photomontage in the wheel's central void.
//
// CHORUS-ONLY. While a chorus window is active, photos strobe at ~5 cuts/sec.
// Outside choruses the void shows the VoidBlobs instead — no slow photo
// cycling between choruses, that read as "weird" / generative.
//
// Tuning: the chorus windows below are GUESSES against
// "Miyazaki (The Nature Version)" by Paris Paloma. If they don't match
// what you hear, edit start/end seconds. Press `B` while the wheel state
// is up to manually fire a burst (3.5s) for visual testing without waiting.
export const CHORUSES = [
  { start: 54,  end: 72  },
  { start: 115, end: 133 },
  { start: 188, end: 220 }
];

const CUT_INTERVAL_MS = 200;        // ~5 cuts/sec during chorus
const MANUAL_BURST_MS = 3500;       // length of a 'B'-key triggered burst

export default function LyricBurst({ images = [], getCurrentTime, voidRadius, size = 720 }) {
  const [active, setActive] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const cutTimerRef = useRef(null);
  const manualEndTimerRef = useRef(null);

  // Helpers ------------------------------------------------------------
  const startCutting = () => {
    clearInterval(cutTimerRef.current);
    setImgIndex(Math.floor(Math.random() * Math.max(images.length, 1)));
    cutTimerRef.current = setInterval(() => {
      setImgIndex((i) => {
        if (!images.length) return 0;
        return (i + 1 + Math.floor(Math.random() * (images.length - 1))) % images.length;
      });
    }, CUT_INTERVAL_MS);
  };
  const stopCutting = () => clearInterval(cutTimerRef.current);

  // Poll the YT player time. Active iff currentTime is inside any chorus window.
  useEffect(() => {
    if (!images.length) return;
    let manualHold = false;
    const poll = setInterval(() => {
      let t;
      try { t = getCurrentTime?.(); } catch { return; }
      if (manualHold) return; // manual burst takes precedence
      if (typeof t !== 'number' || isNaN(t) || t <= 0) {
        if (active) {
          stopCutting();
          setActive(false);
        }
        return;
      }
      const inChorus = CHORUSES.some((c) => t >= c.start && t <= c.end);
      setActive((wasActive) => {
        if (inChorus && !wasActive) startCutting();
        if (!inChorus && wasActive) stopCutting();
        return inChorus;
      });
    }, 150);

    // Manual fire via 'B' keypress — useful to verify the burst works
    // without sitting through 54s of intro.
    const onKey = (e) => {
      if (e.key !== 'b' && e.key !== 'B') return;
      manualHold = true;
      startCutting();
      setActive(true);
      clearTimeout(manualEndTimerRef.current);
      manualEndTimerRef.current = setTimeout(() => {
        stopCutting();
        setActive(false);
        manualHold = false;
      }, MANUAL_BURST_MS);
    };
    window.addEventListener('keydown', onKey);

    return () => {
      clearInterval(poll);
      stopCutting();
      clearTimeout(manualEndTimerRef.current);
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images, getCurrentTime]);

  if (!active || !images.length) return null;

  const cx = size / 2;
  const cy = size / 2;
  const r = voidRadius;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <clipPath id="lyric-burst-clip">
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
      </defs>
      <g clipPath="url(#lyric-burst-clip)">
        <image
          href={images[imgIndex]}
          x={cx - r}
          y={cy - r}
          width={r * 2}
          height={r * 2}
          preserveAspectRatio="xMidYMid slice"
          style={{
            filter: 'saturate(1.35) brightness(1.10)',
            animation: 'lyric-burst-flash 80ms ease-out'
          }}
        />
        {/* Bright ignition rim */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#FAFAFA" strokeWidth="1.5" opacity="0.55" />
      </g>
    </svg>
  );
}
