import React from 'react';

// Animated chromatic life inside the wheel's central void.
// Three layers stacked with mix-blend-mode: screen.
//   1. Slow conic gradient — the full hue circle, rotating
//   2. Counter-rotating radial blobs — depth and asymmetry
//   3. Soft inner core glow — keeps the very centre warm
//
// All decorative, pointer-events-none, clipped to a circle by the
// ColorWheel voidSlot wrapper.
export default function VoidBlobs() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '50%'
      }}
      aria-hidden="true"
    >
      {/* Layer 1: conic-gradient rainbow, slow clockwise */}
      <div
        style={{
          position: 'absolute',
          inset: '-15%',
          background:
            'conic-gradient(from 0deg at 50% 50%, ' +
            '#E34234 0%, #F2A900 14%, #C0D725 28%, #2E8B57 42%, ' +
            '#5BB7E5 56%, #1F4788 70%, #8E4585 84%, #DC143C 100%)',
          filter: 'blur(28px) saturate(1.05)',
          mixBlendMode: 'screen',
          opacity: 0.55,
          animation: 'chromatica-blobs-spin 32s linear infinite',
          transformOrigin: 'center center'
        }}
      />

      {/* Layer 2: counter-rotating radial blobs for depth */}
      <div
        style={{
          position: 'absolute',
          inset: '-10%',
          background:
            'radial-gradient(circle at 28% 32%, rgba(227, 66, 52, 0.55), transparent 40%),' +
            'radial-gradient(circle at 72% 28%, rgba(0, 47, 167, 0.55), transparent 42%),' +
            'radial-gradient(circle at 70% 72%, rgba(46, 139, 87, 0.50), transparent 42%),' +
            'radial-gradient(circle at 28% 72%, rgba(142, 69, 133, 0.55), transparent 42%)',
          filter: 'blur(18px)',
          mixBlendMode: 'screen',
          opacity: 0.85,
          animation: 'chromatica-blobs-spin 22s linear infinite reverse',
          transformOrigin: 'center center'
        }}
      />

      {/* Layer 3: warm inner core so the very centre never reads as black */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 50% 50%, rgba(248, 200, 140, 0.30) 0%, rgba(120, 60, 70, 0.20) 35%, transparent 70%)',
          mixBlendMode: 'screen',
          animation: 'chromatica-void-breathe 14s ease-in-out infinite',
          transformOrigin: 'center center'
        }}
      />
    </div>
  );
}
