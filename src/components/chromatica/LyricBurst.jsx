import React, { useRef, useState } from 'react';

// Centerpiece in the wheel's central void.
//
// Plays the three chorus videos back-to-back on a perpetual loop, muted,
// clipped inside the void circle. When one video ends, the next one
// starts immediately — no pauses, no chorus timing.
const CHORUS_VIDEOS = [
  'https://github.com/meganapostol/chromaticavidcontent/raw/refs/heads/main/Miyazaki%20(1).mp4',
  'https://github.com/meganapostol/chromaticavidcontent/raw/refs/heads/main/Untitled%20design%20(3).mp4',
  'https://github.com/meganapostol/chromaticavidcontent/raw/refs/heads/main/Miyazaki%203.mp4'
];

export default function LyricBurst({ voidRadius, size = 720 }) {
  const [videoIndex, setVideoIndex] = useState(0);
  const videoRef = useRef(null);

  const handleEnded = () => {
    setVideoIndex((i) => (i + 1) % CHORUS_VIDEOS.length);
  };

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
          onEnded={handleEnded}
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