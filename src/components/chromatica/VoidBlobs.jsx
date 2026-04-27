import React from 'react';

// Organic chromatic blob rings spinning inside the wheel's central area.
//
// Implementation: each blob is a span with an asymmetric border-radius
// (the wobbly organic outline) and a RADIAL-GRADIENT background that
// itself paints a ring of color (transparent center → colored band →
// transparent edge). No CSS masks involved — single radial-gradient
// background, broadly supported. Four blobs at different rotations and
// scales overlap, screen-blended into a chromatic prism.
export default function VoidBlobs() {
  const ring = (a, b) =>
    `radial-gradient(circle at 50% 50%, ` +
    `transparent 28%, ${a} 42%, ${b} 58%, ${a} 74%, transparent 92%)`;

  const blobStyle = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    borderRadius: '115% 140% 145% 110% / 125% 140% 110% 125%',
    mixBlendMode: 'screen',
    filter: 'blur(3px)'
  };

  const blobs = [
    {
      // warm: cinnabar / saffron
      background: ring('#E34234', '#F2A900'),
      transform: 'rotate(30deg) scale(1.04)'
    },
    {
      // cool: klein / maya
      background: ring('#002FA7', '#5BB7E5'),
      transform: 'rotate(60deg) scale(0.95)'
    },
    {
      // forest: malachite / chartreuse
      background: ring('#2E8B57', '#C0D725'),
      transform: 'rotate(90deg) scale(0.98)'
    },
    {
      // bloom: mauveine / cochineal
      background: ring('#8E4585', '#DC143C'),
      transform: 'rotate(120deg) scale(1.02)'
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
      <div
        style={{
          position: 'absolute',
          inset: 0,
          animation: 'chromatica-blobs-spin 18s linear infinite',
          transformOrigin: 'center center'
        }}
      >
        {blobs.map((blob, i) => (
          <span
            key={i}
            style={{
              ...blobStyle,
              ...blob
            }}
          />
        ))}
      </div>
    </div>
  );
}
