import React from 'react';

// Organic chromatic blob rings spinning inside the wheel's central area.
//
// Implementation: each blob span has an asymmetric border-radius (the wobbly
// organic shape), a thick chromatic gradient background, and a single
// radial-gradient mask that hollows out the center — so what you see is a
// thick wobbly RING of color, not a filled blob. Single-mask is broadly
// supported (Chrome, Safari, Firefox); the dual-mask + mask-composite
// trick was rendering invisibly in some browsers.
//
// mix-blend-mode: screen layers the rings into a soft prism where they
// overlap. Higher opacity + heavier blur = the blob actually reads against
// the deep void instead of "wisp of a prayer."
export default function VoidBlobs() {
  // Hollow-ring mask: transparent at center, opaque on the ring, soft fade
  // back to transparent on the outermost edge so it blooms.
  const RING_MASK =
    'radial-gradient(circle at 50% 50%, transparent 36%, ' +
    'rgba(0,0,0,0.3) 46%, black 58%, black 90%, ' +
    'rgba(0,0,0,0.4) 96%, transparent 100%)';

  const blobStyle = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    borderRadius: '115% 140% 145% 110% / 125% 140% 110% 125%',
    backgroundSize: '120% 120%',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    mask: RING_MASK,
    WebkitMask: RING_MASK,
    filter: 'blur(2px)',
    mixBlendMode: 'screen',
    opacity: 1
  };

  const blobs = [
    {
      // warm — cinnabar / saffron / cinnabar
      backgroundImage: 'linear-gradient(135deg, #E34234, #F2A900, #E34234)',
      transform: 'rotate(30deg) scale(1.04)'
    },
    {
      // cool — klein / maya / klein
      backgroundImage: 'linear-gradient(135deg, #002FA7, #5BB7E5, #002FA7)',
      transform: 'rotate(60deg) scale(0.96)'
    },
    {
      // forest — malachite / chartreuse / malachite
      backgroundImage: 'linear-gradient(135deg, #2E8B57, #C0D725, #2E8B57)',
      transform: 'rotate(90deg) scale(0.98)'
    },
    {
      // bloom — mauveine / cochineal / mauveine
      backgroundImage: 'linear-gradient(135deg, #8E4585, #DC143C, #8E4585)',
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
