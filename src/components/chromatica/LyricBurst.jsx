import React, { useEffect, useState, useRef } from 'react';

// Centerpiece photomontage: while the chorus plays, the central void
// becomes a strobing window into nature — color cuts every ~200ms for
// the entire chorus length.
//
// Approximate chorus windows (start, end in seconds) for
// Miyazaki (The Nature Version) by Paris Paloma. Tune if the
// timing drifts against the actual track.
export const CHORUSES = [
  { start: 54,  end: 72  }, // chorus 1
  { start: 115, end: 133 }, // chorus 2
  { start: 188, end: 220 }  // final chorus / outro (often longer)
];
const CUT_INTERVAL_MS = 200;                       // ~5 cuts/sec

// Drives a fast-cut nature montage rendered inside the wheel's central void.
// Receives `getCurrentTime()` (returns seconds) — typically wired to YT player.
export default function LyricBurst({ images = [], getCurrentTime, size = 720, voidRadius }) {
  const [active, setActive] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const cutTimerRef = useRef(null);

  // Poll the player time. Active whenever current time sits inside any chorus window.
  useEffect(() => {
    if (!images.length) return;
    const poll = setInterval(() => {
      let t;
      try { t = getCurrentTime?.(); } catch { return; }
      if (typeof t !== 'number' || isNaN(t)) return;

      const inChorus = CHORUSES.some((c) => t >= c.start && t <= c.end);
      setActive((wasActive) => {
        if (inChorus && !wasActive) {
          // Entering chorus — pick a starting image and start cutting.
          setImgIndex(Math.floor(Math.random() * images.length));
          clearInterval(cutTimerRef.current);
          cutTimerRef.current = setInterval(() => {
            setImgIndex((i) => (i + 1 + Math.floor(Math.random() * (images.length - 1))) % images.length);
          }, CUT_INTERVAL_MS);
        }
        if (!inChorus && wasActive) {
          // Leaving chorus — stop cutting.
          clearInterval(cutTimerRef.current);
        }
        return inChorus;
      });
    }, 150);
    return () => {
      clearInterval(poll);
      clearInterval(cutTimerRef.current);
    };
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
            filter: 'saturate(1.25) brightness(1.05)',
            animation: 'lyric-burst-flash 80ms ease-out'
          }}
        />
        {/* faint white pulse rim to read as ignition */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#FAFAFA" strokeWidth="1.5" opacity="0.4" />
      </g>
    </svg>
  );
}