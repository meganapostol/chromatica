import React from 'react';

// Always-on chromatic underlayer behind the entire site.
// Until a real video lands at /hero.mp4 (or whatever path you set), this
// renders a slow drifting aurora made of overlapping radial gradients —
// the page now breathes color even before you touch it.
//
// To swap in a real cinematic hero: drop a file at `chromatica/public/hero.mp4`
// (or pass `videoSrc="/your-file.mp4"`) and the video version takes over.
export default function HeroBackdrop({ videoSrc, opacity = 0.28 }) {
  if (videoSrc) {
    return (
      <video
        aria-hidden="true"
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover pointer-events-none"
        style={{
          zIndex: 0,
          opacity,
          mixBlendMode: 'screen'
        }}
        src={videoSrc}
      />
    );
  }

  return (
    <>
      {/* Aurora — slow drifting chromatic clouds */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none chromatica-aurora"
        style={{ zIndex: 0 }}
      />
      {/* Soft warm wash so the deepest blacks aren't quite black */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          background: 'radial-gradient(ellipse at 50% 45%, rgba(58, 38, 28, 0.18), transparent 65%)'
        }}
      />
    </>
  );
}
