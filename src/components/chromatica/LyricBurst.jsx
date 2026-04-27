import React, { useEffect, useState, useRef } from 'react';

// Centerpiece photomontage in the wheel's central void.
//
// Two intensity tiers:
//   AMBIENT  — whenever music is playing, photos cycle slowly (~1 cut/sec)
//              at low opacity. The void is always alive while the song is on.
//   CHORUS   — inside any window in CHORUSES, photos cut fast (~5/sec) at full
//              opacity for the whole window length, not a 3.5s phrase.
//
// Approximate chorus windows for Miyazaki (Nature Version) by Paris Paloma.
// **These are guesses — tune to taste against the actual track.**
export const CHORUSES = [
  { start: 54,  end: 72  },
  { start: 115, end: 133 },
  { start: 188, end: 220 }
];

const AMBIENT_CUT_MS = 1100;   // ~0.9 cuts/sec — slow, contemplative
const CHORUS_CUT_MS  = 200;    // ~5 cuts/sec — strobing
const AMBIENT_OPACITY = 0.30;
const CHORUS_OPACITY  = 1.0;

export default function LyricBurst({ images = [], getCurrentTime, voidRadius, size = 720 }) {
  const [mode, setMode] = useState('off'); // 'off' | 'ambient' | 'chorus'
  const [imgIndex, setImgIndex] = useState(0);
  const cutTimerRef = useRef(null);

  // Poll the player time and pick the right intensity tier.
  useEffect(() => {
    if (!images.length) return;

    const setCutInterval = (ms) => {
      clearInterval(cutTimerRef.current);
      cutTimerRef.current = setInterval(() => {
        setImgIndex((i) => (i + 1 + Math.floor(Math.random() * (images.length - 1))) % images.length);
      }, ms);
    };

    const poll = setInterval(() => {
      let t;
      try { t = getCurrentTime?.(); } catch { return; }
      if (typeof t !== 'number' || isNaN(t) || t <= 0) {
        // No music → no montage.
        if (mode !== 'off') {
          clearInterval(cutTimerRef.current);
          setMode('off');
        }
        return;
      }

      const inChorus = CHORUSES.some((c) => t >= c.start && t <= c.end);
      const next = inChorus ? 'chorus' : 'ambient';
      if (next !== mode) {
        if (mode === 'off' || next === 'chorus' || (mode === 'chorus' && next === 'ambient')) {
          setImgIndex(Math.floor(Math.random() * images.length));
          setCutInterval(next === 'chorus' ? CHORUS_CUT_MS : AMBIENT_CUT_MS);
        }
        setMode(next);
      }
    }, 200);

    return () => {
      clearInterval(poll);
      clearInterval(cutTimerRef.current);
    };
  }, [images, getCurrentTime, mode]);

  if (mode === 'off' || !images.length) return null;

  const cx = size / 2;
  const cy = size / 2;
  const r = voidRadius;
  const opacity = mode === 'chorus' ? CHORUS_OPACITY : AMBIENT_OPACITY;
  const sat = mode === 'chorus' ? 1.35 : 1.10;
  const bright = mode === 'chorus' ? 1.10 : 0.95;
  const rim = mode === 'chorus' ? 0.55 : 0.18;

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
      <g
        clipPath="url(#lyric-burst-clip)"
        style={{
          opacity,
          transition: 'opacity 0.5s ease-out'
        }}
      >
        <image
          href={images[imgIndex]}
          x={cx - r}
          y={cy - r}
          width={r * 2}
          height={r * 2}
          preserveAspectRatio="xMidYMid slice"
          style={{
            filter: `saturate(${sat}) brightness(${bright})`,
            animation: mode === 'chorus'
              ? 'lyric-burst-flash 80ms ease-out'
              : 'lyric-burst-flash 600ms ease-out'
          }}
        />
        {/* Rim ring — bright on chorus, soft on ambient */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#FAFAFA" strokeWidth="1.5" opacity={rim} />
      </g>
    </svg>
  );
}
