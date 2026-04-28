import React, { useEffect, useRef, useState } from 'react';

// Centerpiece in the wheel's central void.
//
// Plays the three videos back-to-back on a perpetual loop, muted, clipped
// inside the void circle. When a video ends — OR errors, OR stalls — the
// next one starts immediately so it can never get stuck on a single clip.
const CHORUS_VIDEOS = [
  'https://github.com/meganapostol/chromaticavidcontent/raw/refs/heads/main/Miyazaki%20(1).mp4',
  'https://github.com/meganapostol/chromaticavidcontent/raw/refs/heads/main/Untitled%20design%20(3).mp4',
  'https://github.com/meganapostol/chromaticavidcontent/raw/refs/heads/main/Miyazaki%203.mp4'
];

export default function LyricBurst({ voidRadius }) {
  const [videoIndex, setVideoIndex] = useState(0);
  const videoRef = useRef(null);
  const lastTimeRef = useRef(0);
  const stallCountRef = useRef(0);

  const advance = () => {
    lastTimeRef.current = 0;
    stallCountRef.current = 0;
    setVideoIndex((i) => (i + 1) % CHORUS_VIDEOS.length);
  };

  // Watchdog: if the video's currentTime hasn't advanced for ~2s while it's
  // supposed to be playing, skip to the next one. Covers stalled loads,
  // decoder hiccups, network drops.
  useEffect(() => {
    const id = setInterval(() => {
      const v = videoRef.current;
      if (!v) return;
      // If ended but onEnded didn't fire for some reason, skip.
      if (v.ended) { advance(); return; }
      // If it's not paused but currentTime hasn't moved, count a stall.
      if (!v.paused) {
        if (v.currentTime === lastTimeRef.current) {
          stallCountRef.current += 1;
          // 2 consecutive stalls (~2s) — skip.
          if (stallCountRef.current >= 2) advance();
        } else {
          stallCountRef.current = 0;
          lastTimeRef.current = v.currentTime;
        }
      }
      // If paused unexpectedly, try to resume.
      if (v.paused && !v.ended) {
        v.play().catch(() => { /* ignore — autoplay blockers, etc. */ });
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);

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
          boxShadow: '0 0 0 1.5px rgba(250,250,250,0.55)'
        }}
      >
        <video
          key={CHORUS_VIDEOS[videoIndex]}
          ref={videoRef}
          src={CHORUS_VIDEOS[videoIndex]}
          autoPlay
          muted
          playsInline
          onEnded={advance}
          onError={advance}
          onStalled={advance}
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