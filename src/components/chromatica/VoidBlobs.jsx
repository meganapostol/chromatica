import React from 'react';

// Solid chromatic blobs drifting and rotating inside the wheel's central void.
// Each blob is a SOLID radial-gradient orb (bright core → soft transparent
// edge) with an organic asymmetric border-radius. Multiple orbs overlap at
// different rotations and scales, screen-blended into a chromatic prism.
// No more donut rings. They actually look like color now.
export default function VoidBlobs() {
  // Solid orb fill: hot core in the center, fading out at the edges.
  const orb = (a, b) =>
    `radial-gradient(circle at 50% 50%, ${a} 0%, ${a} 25%, ${b} 55%, transparent 90%)`;

  const blobBase = {
    position: 'absolute',
    width: '85%',
    height: '85%',
    borderRadius: '60% 70% 65% 55% / 65% 55% 70% 60%',
    mixBlendMode: 'screen',
    filter: 'blur(14px)'
  };

  const blobs = [
    {
      // warm: cinnabar / saffron
      background: orb('#E34234', '#F2A900'),
      top: '5%', left: '10%',
      animation: 'chromatica-blob-drift-a 14s ease-in-out infinite alternate'
    },
    {
      // cool: klein / maya
      background: orb('#002FA7', '#5BB7E5'),
      top: '15%', left: '30%',
      animation: 'chromatica-blob-drift-b 17s ease-in-out infinite alternate'
    },
    {
      // forest: malachite / chartreuse
      background: orb('#2E8B57', '#C0D725'),
      bottom: '8%', left: '8%',
      animation: 'chromatica-blob-drift-c 19s ease-in-out infinite alternate'
    },
    {
      // bloom: mauveine / cochineal
      background: orb('#8E4585', '#DC143C'),
      bottom: '12%', right: '6%',
      animation: 'chromatica-blob-drift-d 16s ease-in-out infinite alternate'
    }
  ];

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
      {blobs.map((blob, i) => (
        <span key={i} style={{ ...blobBase, ...blob }} />
      ))}
    </div>
  );
}