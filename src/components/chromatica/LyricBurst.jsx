import React, { useEffect, useState, useRef } from 'react';

// Centerpiece in the wheel's central void.
//
// CHORUS-ONLY video montage. While a chorus window is active, ONE of the
// three chorus videos plays (muted, looping) clipped inside the central
// void circle. Each new chorus picks a random video — videos vary in
// length, so randomising avoids a predictable "this one always plays
// here" feel.
//
// Outside choruses the void shows the VoidBlobs instead.
//
// Tuning: chorus windows are GUESSES. Press `T` while music is playing
// to log the current time and capture exact timestamps.
export const CHORUSES = [
  { start: 48,  end: 70  },
  { start: 110, end: 132 },
  { start: 180, end: 218 }
];

const CHORUS_VIDEOS = [
  'https://github.com/meganapostol/chromaticavidcontent/raw/refs/heads/main/Miyazaki%20(1).mp4',
  'https://github.com/meganapostol/chromaticavidcontent/raw/refs/heads/main/Untitled%20design%20(3).mp4',
  'https://github.com/meganapostol/chromaticavidcontent/raw/refs/heads/main/Miyazaki%203.mp4'
];

const MANUAL_BURST_MS = 6000; // length of a 'B'-key triggered burst

export default function LyricBurst({ getCurrentTime, voidRadius, size = 720 }) {
  const [active, setActive] = useState(false);
  const [videoIndex, setVideoIndex] = useState(0);
  const manualEndTimerRef = useRef(null);
  const lastIndexRef = useRef(-1); // remember last pick to avoid repeats

  const pickRandomVideo = () => {
    if (CHORUS_VIDEOS.length <= 1) return 0;
    let next;
    do {
      next = Math.floor(Math.random() * CHORUS_VIDEOS.length);
    } while (next === lastIndexRef.current);
    lastIndexRef.current = next;
    return next;
  };

  // Poll the YT player time. Active iff currentTime is inside any chorus window.
  useEffect(() => {
    let manualHold = false;

    const poll = setInterval(() => {
      let t;
      try { t = getCurrentTime?.(); } catch { return; }
      if (manualHold) return; // manual burst takes precedence
      if (typeof t !== 'number' || isNaN(t) || t <= 0) {
        if (active) setActive(false);
        return;
      }
      const inChorus = CHORUSES.some((c) => t >= c.start && t <= c.end);
      setActive((wasActive) => {
        if (inChorus && !wasActive) {
          // Pick a random (non-repeating) video each time a chorus starts.
          setVideoIndex(pickRandomVideo());
        }
        return inChorus;
      });
    }, 150);

    // 'B' = fire a manual 6s burst (visual test).
    // 'T' = log the player's current time for capturing chorus timestamps.
    const onKey = (e) => {
      if (e.key === 'b' || e.key === 'B') {
        manualHold = true;
        setVideoIndex(pickRandomVideo());
        setActive(true);
        clearTimeout(manualEndTimerRef.current);
        manualEndTimerRef.current = setTimeout(() => {
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
      clearTimeout(manualEndTimerRef.current);
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getCurrentTime]);

  if (!active) return null;

  const r = voidRadius;
  const diameter = r * 2;

  return (
    <div
      className="absolute inset-0 pointer-events-none flex items-center justify-center"
      style={{ zIndex: 4 }}
      aria-hidden="true"
    >
      <div
        style={{
          width: diameter,
          height: diameter,
          borderRadius: '50%',
          overflow: 'hidden',
          boxShadow: '0 0 0 1.5px rgba(250,250,250,0.55)',
          animation: 'chromatica-fade-in 0.4s ease-out'
        }}
      >
        <video
          key={CHORUS_VIDEOS[videoIndex]}
          src={CHORUS_VIDEOS[videoIndex]}
          autoPlay
          loop
          muted
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'saturate(1.25) brightness(1.05)'
          }}
        />
      </div>
    </div>
  );
}