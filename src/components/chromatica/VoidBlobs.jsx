import React from 'react';

// Organic chromatic ring blobs spinning inside the wheel's central area.
//
// Faithful to the original AnimatedBlobs technique: each "blob" is a span
// with an asymmetric border-radius (gives the organic shape) and a thick
// transparent border. A two-layer CSS mask hollows out the inside, so what
// you see is a thick wobbly ring of color, not a filled shape.
// All four spans share the same gridArea so they stack; the parent rotates
// them as a group, then each blob tilts at its own angle inside.
//
// mix-blend-mode: screen lets the rings layer into a soft prismatic
// gradient where they overlap.
export default function VoidBlobs() {
  const blobStyle = {
    aspectRatio: '1',
    display: 'block',
    gridArea: 'stack',
    backgroundSize: 'calc(100% + 10%)',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    border: '8% solid transparent',
    borderRadius: '115% 140% 145% 110% / 125% 140% 110% 125%',
    maskImage: 'linear-gradient(transparent, transparent), linear-gradient(black, white)',
    WebkitMaskImage: 'linear-gradient(transparent, transparent), linear-gradient(black, white)',
    maskClip: 'padding-box, border-box',
    WebkitMaskClip: 'padding-box, border-box',
    maskComposite: 'intersect',
    WebkitMaskComposite: 'source-in',
    mixBlendMode: 'screen',
    width: '92%',
    filter: 'blur(0.6%)'
  };

  const blobs = [
    {
      // warm — cinnabar / saffron
      backgroundImage: 'linear-gradient(#E34234, #F2A900, #E34234)',
      transform: 'rotate(30deg) scale(1.03)'
    },
    {
      // cool — klein / maya
      backgroundImage: 'linear-gradient(#002FA7, #5BB7E5, #002FA7)',
      transform: 'rotate(60deg) scale(0.95)'
    },
    {
      // forest — malachite / chartreuse
      backgroundImage: 'linear-gradient(#2E8B57, #C0D725, #2E8B57)',
      transform: 'rotate(90deg) scale(0.97)'
    },
    {
      // bloom — mauveine / cochineal
      backgroundImage: 'linear-gradient(#8E4585, #DC143C, #8E4585)',
      transform: 'rotate(120deg) scale(1.02)'
    }
  ];

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderRadius: '50%'
      }}
      aria-hidden="true"
    >
      <div style={{ display: 'grid', gridTemplateAreas: "'stack'", width: '100%', height: '100%' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateAreas: "'stack'",
            gridArea: 'stack',
            width: '100%',
            height: '100%',
            placeItems: 'center',
            animation: 'chromatica-blobs-spin 14s linear infinite'
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
    </div>
  );
}
