import React from 'react';

// Inside the wheel's central void: when a color is hovered, fade up its
// name centered in the black "mood ring" portal. The actual photo lives
// elsewhere (HoverBackdrop) as a full-page wash. The blobs continue to
// breathe in the void behind this label.
export default function VoidPreview({ color }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: color ? 1 : 0,
        transition: 'opacity 0.4s ease-out',
        pointerEvents: 'none',
        padding: '0 18%'
      }}
    >
      {color && (
        <div
          key={color.id}
          className="font-display"
          style={{
            textAlign: 'center',
            color: '#F8F0E3',
            fontSize: 'clamp(20px, 3.4vh, 36px)',
            fontWeight: 300,
            letterSpacing: '-0.01em',
            lineHeight: 1.05,
            textShadow: `0 0 32px ${color.hex}66, 0 2px 12px rgba(0,0,0,0.6)`,
            animation: 'chromatica-fade-in 0.35s ease-out'
          }}
        >
          {color.name.toLowerCase()}
        </div>
      )}
    </div>
  );
}