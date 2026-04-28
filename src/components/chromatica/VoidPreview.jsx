import React from 'react';

// Shows the hovered color's photo inside the wheel's central void.
// Designed to be rendered inside ColorWheel's `voidSlot` (which is already
// a circular, clipped container sized to the inner void).
//
// Cross-fades when the hovered color changes; fades out when nothing is hovered.
export default function VoidPreview({ color }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        overflow: 'hidden',
        opacity: color ? 1 : 0,
        transition: 'opacity 0.35s ease-out',
        pointerEvents: 'none'
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
              filter: 'saturate(1.1) brightness(0.95)',
              animation: 'chromatica-fade-in 0.35s ease-out'
            }}
          />
          {/* subtle inner edge darken so the photo reads as held inside the portal */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse at center, transparent 55%, rgba(5,5,8,0.55) 100%)'
            }}
          />
        </>
      )}
    </div>
  );
}