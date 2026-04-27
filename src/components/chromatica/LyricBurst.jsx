import React, { useEffect, useState, useRef } from 'react';

// Centerpiece photomontage: when the lyric "please don't ever take it from me"
// fires, the central void becomes a strobing window into nature.
//
// Approximate timestamps (seconds) of the lyric occurrences in
// Miyazaki (The Nature Version) by Paris Paloma. Edit if more precise
// timestamps become available.
export const LYRIC_TIMESTAMPS = [54, 115, 188];   // chorus 1, chorus 2, chorus 3
export const LYRIC_DURATION_S = 3.5;               // length of the phrase
const CUT_INTERVAL_MS = 200;                       // ~5 cuts/sec

// Drives a fast-cut nature montage rendered inside the wheel's central void.
// Receives `getCurrentTime()` (returns seconds) — typically wired to YT player.
export default function LyricBurst({ images = [], getCurrentTime, size = 720, voidRadius }) {
  const [active, setActive] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const lastFireRef = useRef(-1);
  const cutTimerRef = useRef(null);
  const endTimerRef = useRef(null);

  // Poll the player time and fire bursts on lyric hits.
  useEffect(() => {
    if (!images.length) return;
    const poll = setInterval(() => {
      let t;
      try { t = getCurrentTime?.(); } catch { return; }
      if (typeof t !== 'number' || isNaN(t)) return;

      for (const ts of LYRIC_TIMESTAMPS) {
        // Detect crossing into the lyric window once per occurrence.
        if (t >= ts && t < ts + 0.6 && lastFireRef.current !== ts) {
          lastFireRef.current = ts;
          fire();
        }
      }
      // Reset the fire-once latch when we're well past the window.
      if (lastFireRef.current >= 0 && t > lastFireRef.current + LYRIC_DURATION_S + 1) {
        lastFireRef.current = -1;
      }
    }, 150);
    return () => clearInterval(poll);
  }, [images, getCurrentTime]);

  const fire = () => {
    setActive(true);
    setImgIndex(Math.floor(Math.random() * images.length));

    clearInterval(cutTimerRef.current);
    cutTimerRef.current = setInterval(() => {
      setImgIndex((i) => (i + 1 + Math.floor(Math.random() * (images.length - 1))) % images.length);
    }, CUT_INTERVAL_MS);

    clearTimeout(endTimerRef.current);
    endTimerRef.current = setTimeout(() => {
      clearInterval(cutTimerRef.current);
      setActive(false);
    }, LYRIC_DURATION_S * 1000);
  };

  useEffect(() => () => {
    clearInterval(cutTimerRef.current);
    clearTimeout(endTimerRef.current);
  }, []);

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