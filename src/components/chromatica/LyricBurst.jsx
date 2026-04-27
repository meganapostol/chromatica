import React, { useEffect, useState, useRef } from 'react';

// Centerpiece photomontage in the wheel's central void.
//
// CHORUS-ONLY. While a chorus window is active, photos strobe at ~5 cuts/sec.
// Outside choruses the void shows the VoidBlobs instead — no slow photo
// cycling between choruses, that read as "weird" / generative.
//
// Tuning: the chorus windows below are GUESSES against
// "Miyazaki (The Nature Version)" by Paris Paloma. The first chorus
// begins on the line "I won't let you take it from me, changes the
// colour with the air that I breathe". To capture exact timestamps,
// click "with music", play through, and press `T` at the start and
// end of each chorus — the values get logged to the console (and to
// `window.__chromaticaChorusMarks`). Edit the array below to match.
export const CHORUSES = [
  { start: 48,  end: 70  },
  { start: 110, end: 132 },
  { start: 180, end: 218 }
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

    // 'B' = fire a manual 3.5s burst (visual test).
    // 'T' = log the player's current time so timestamps can be captured
    //       while listening. Logs to console + appends to
    //       window.__chromaticaChorusMarks for easy copy-paste.
    const onKey = (e) => {
      if (e.key === 'b' || e.key === 'B') {
        manualHold = true;
        startCutting();
        setActive(true);
        clearTimeout(manualEndTimerRef.current);
        manualEndTimerRef.current = setTimeout(() => {
          stopCutting();
          setActive(false);
          manualHold = false;
        }, MANUAL_BURST_MS);
        return;
      }
      if (e.key === 't' || e.key === 'T') {
        let now;
        try { now = getCurrentTime?.(); } catch { return; }
        if (typeof now !== 'number') return;
        if (!window.__chromaticaChorusMarks) window.__chromaticaChorusMarks = [];
        window.__chromaticaChorusMarks.push(Number(now.toFixed(2)));
        // eslint-disable-next-line no-console
        console.log('[chromatica] chorus mark:', now.toFixed(2),
          '| all marks:', window.__chromaticaChorusMarks);
      }
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
