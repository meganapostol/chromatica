import React from 'react';

// Full-bleed background wash for the hovered color. Sits between the
// HeroBackdrop (aurora) and the wheel itself, fading in beneath everything
// when a color is hovered. Subtle — the wheel stays the protagonist.
export default function HoverBackdrop({ color }) {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 1,
        opacity: color ? 1 : 0,
        transition: 'opacity 0.6s ease-out'
      }}
    >
      {color && (
        <>
          <img
            key={color.id}
            src={color.image}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'saturate(1.05) brightness(0.55) blur(2px)',
              opacity: 0.55,
              animation: 'chromatica-fade-in 0.6s ease-out'
            }}
          />
          {/* Vignette + warm darken so UI keeps contrast */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(ellipse at center, rgba(10,8,14,0.35) 0%, rgba(7,6,11,0.78) 75%, rgba(5,5,8,0.92) 100%)'
            }}
          />
        </>
      )}
    </div>
  );
}