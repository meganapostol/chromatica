import React, { useState } from 'react';
import { mixWithBg } from '@/lib/chromatica-utils';

// Chamber nature image with: chromatic shimmer, scroll/timer-driven desaturation,
// and a graceful fallback if the image fails to load.
export default function ChamberImage({ color, saturation }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const fallback = mixWithBg(color.hex, 0.6);

  const sat = Math.max(0, Math.min(1, saturation));

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{ backgroundColor: fallback }}
    >
      {!errored && (
        <img
          src={color.image}
          alt={color.name}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className="absolute inset-0 w-full h-full object-cover chromatic-breathe"
          style={{
            '--sat': sat,
            filter: `saturate(${sat}) hue-rotate(0deg)`,
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.6s ease-out, filter 0.2s linear'
          }}
        />
      )}

      {/* Fallback overlay (shows beneath the image so the column never reads as void) */}
      {(errored || !loaded) && (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${color.hex} 0%, ${mixWithBg(color.hex, 0.8)} 50%, ${mixWithBg(color.hex, 0.5)} 100%)`,
            opacity: 0.6
          }}
        />
      )}

      {/* subtle inner darken at edges */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 60%, rgba(5,5,8,0.55) 100%)'
      }} />
    </div>
  );
}