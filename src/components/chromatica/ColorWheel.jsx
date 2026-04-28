import React, { useMemo, useState } from 'react';

const TOTAL_SECTORS = 30;
const GLYPHS = ['☉','☽','☿','♀','♁','♂','♃','♄','♅','♆','⚸','☊','☋','☌','☍','⚹','⚺','⚻','⚼','✦','✧','✶','❉','❋'];

function polar(cx, cy, r, angleDeg) {
  const a = (angleDeg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function sectorPath(cx, cy, rOuter, rInner, startDeg, endDeg) {
  const p1 = polar(cx, cy, rOuter, startDeg);
  const p2 = polar(cx, cy, rOuter, endDeg);
  const p3 = polar(cx, cy, rInner, endDeg);
  const p4 = polar(cx, cy, rInner, startDeg);
  const largeArc = endDeg - startDeg <= 180 ? 0 : 1;
  return [
    `M ${p1.x} ${p1.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${p4.x} ${p4.y}`,
    'Z'
  ].join(' ');
}

export const WHEEL_SIZE = 720;
export const WHEEL_VOID_RADIUS = WHEEL_SIZE * 0.18;

export default function ColorWheel({ colors = [], onSelect, exiting = false, burstSlot = null, onHoverAngle = null, voidSlot = null }) {
  const [hoverIdx, setHoverIdx] = useState(null);
  const [hoverAngle, setHoverAngle] = useState(null);

  const reportHover = (angle) => {
    setHoverAngle(angle);
    onHoverAngle?.(angle);
  };

  const SIZE = WHEEL_SIZE;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const rOuterColor = SIZE * 0.42;
  const rInnerColor = SIZE * 0.31;
  const rGlyph = SIZE * 0.27;
  const rVoid = SIZE * 0.18;
  const CREAM = '#F8F0E3';

  const sectorAngle = 360 / TOTAL_SECTORS;
  const gap = 1.5; // degrees gap between sectors

  // Map hueOrder-sorted colors to evenly-spaced sectors.
  const sectors = useMemo(() => {
    const sorted = [...colors].sort((a, b) => a.hueOrder - b.hueOrder);
    const arr = new Array(TOTAL_SECTORS).fill(null);
    sorted.forEach((c, i) => {
      const slot = Math.floor((i / Math.max(sorted.length, 1)) * TOTAL_SECTORS);
      let target = slot;
      while (arr[target] !== null) target = (target + 1) % TOTAL_SECTORS;
      arr[target] = c;
    });
    return arr;
  }, [colors]);

  return (
    <div
      className="relative"
      style={{
        width: 'min(78vh, 78vw)',
        height: 'min(78vh, 78vw)',
        maxWidth: 820,
        maxHeight: 820,
        opacity: exiting ? 0 : 1,
        transition: 'opacity 0.4s ease-out'
      }}
    >
      {/* HTML overlay slot for content drawn inside the glyph ring (e.g. blobs).
          Sized to fill the area inside the glyphs (just shy of the glyph ring at
          ~0.27 radius → 52% of the wheel diameter), clipped to a circle. */}
      {voidSlot && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div
            style={{
              width: '52%',
              aspectRatio: '1',
              borderRadius: '50%',
              overflow: 'hidden',
              mixBlendMode: 'screen',
              opacity: 0.95
            }}
          >
            {voidSlot}
          </div>
        </div>
      )}

      {/* SVG rings */}
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="absolute inset-0 w-full h-full"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {sectors.map((c, i) => c && (
            <filter key={`glow-${i}`} id={`glow-${i}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
          {/* Warm-cream glow filter for the structural ring tracks */}
          <filter id="track-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          {/* Center void radial gradient: warm charcoal with depth */}
          <radialGradient id="void-gradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1F1825" />
            <stop offset="55%" stopColor="#120F19" />
            <stop offset="100%" stopColor="#07060B" />
          </radialGradient>
          {/* Living chromatic glow inside the void — animates color over time */}
          <radialGradient id="void-living-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E34234" stopOpacity="0.75">
              <animate
                attributeName="stop-color"
                values="#E34234; #F2A900; #50A747; #5BB7E5; #1F4788; #8E4585; #DC143C; #E34234"
                dur="48s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="50%" stopColor="#1F4788" stopOpacity="0.25">
              <animate
                attributeName="stop-color"
                values="#1F4788; #8E4585; #DC143C; #E34234; #F2A900; #50A747; #5BB7E5; #1F4788"
                dur="48s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          {/* Soft cream pulse for individual glyphs */}
          <filter id="glyph-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="2.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Warm-cream luminous tracks beneath the color ring (decorative; never block clicks) */}
        <g style={{ pointerEvents: 'none' }}>
          <circle
            cx={cx} cy={cy} r={rOuterColor + 4}
            fill="none" stroke={CREAM} strokeWidth="1.6"
            opacity="0.22"
            style={{ filter: 'url(#track-glow)' }}
          />
          <circle
            cx={cx} cy={cy} r={rOuterColor + 4}
            fill="none" stroke={CREAM} strokeWidth="0.7"
            opacity="0.32"
            strokeDasharray="2 5"
          />
          <circle
            cx={cx} cy={cy} r={rInnerColor - 4}
            fill="none" stroke={CREAM} strokeWidth="1.6"
            opacity="0.22"
            style={{ filter: 'url(#track-glow)' }}
          />
          <circle
            cx={cx} cy={cy} r={rInnerColor - 4}
            fill="none" stroke={CREAM} strokeWidth="0.7"
            opacity="0.30"
          />
        </g>

        {/* Color ring */}
        <g className="rotate-color-ring" style={{ transformOrigin: `${cx}px ${cy}px` }}>
          {sectors.map((color, i) => {
            const start = i * sectorAngle + gap / 2;
            const end = (i + 1) * sectorAngle - gap / 2;
            const isHover = hoverIdx === i;
            const lift = isHover ? 1.02 : 1;
            const path = sectorPath(cx, cy, rOuterColor * lift, rInnerColor, start, end);

            if (!color) {
              // Empty sector, hairline arc placeholder
              return (
                <path
                  key={`empty-${i}`}
                  d={sectorPath(cx, cy, rOuterColor * 0.995, rOuterColor * 0.985, start, end)}
                  fill="rgba(250,250,250,0.08)"
                  onMouseEnter={() => { setHoverIdx(i); reportHover(start + sectorAngle / 2); }}
                  onMouseLeave={() => { setHoverIdx(null); reportHover(null); }}
                  style={{ cursor: 'help' }}
                >
                  <title>her chamber is being prepared</title>
                </path>
              );
            }

            // Staggered clockwise assembly: each slab fades in 80ms after its neighbour.
            const slabDelay = i * 0.08;
            return (
              <g
                key={color.id}
                style={{
                  opacity: 0,
                  transformOrigin: `${cx}px ${cy}px`,
                  animation: `slab-assemble 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${slabDelay}s forwards`
                }}
              >
                {/* Outer luminous glow — beefier so the wheel actually radiates */}
                <path
                  d={sectorPath(cx, cy, rOuterColor * lift + 18, rInnerColor - 8, start, end)}
                  fill={color.hex}
                  opacity={isHover ? 0.75 : 0.55}
                  style={{ filter: 'blur(16px)', pointerEvents: 'none' }}
                />
                <path
                  d={path}
                  fill={color.hex}
                  style={{
                    filter: isHover ? 'brightness(1.15)' : 'brightness(1)',
                    transition: 'filter 0.3s ease, d 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={() => { setHoverIdx(i); reportHover(start + sectorAngle / 2); }}
                  onMouseLeave={() => { setHoverIdx(null); reportHover(null); }}
                  onClick={() => onSelect(color.id)}
                >
                  <title>{color.name.toLowerCase()}</title>
                </path>
              </g>
            );
          })}
        </g>

        {/* Glyph ring (decorative; never blocks clicks on color sectors behind it) */}
        <g
          className="rotate-glyph-ring"
          style={{ transformOrigin: `${cx}px ${cy}px`, pointerEvents: 'none' }}
        >
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i / 24) * 360;
            const p = polar(cx, cy, rGlyph, angle);
            const glyph = GLYPHS[i % GLYPHS.length];
            // Each glyph slightly out of phase with its neighbours.
            const phaseDelay = (i * 0.18).toFixed(2);
            return (
              <text
                key={`glyph-${i}`}
                x={p.x}
                y={p.y}
                fontSize="19"
                fill={CREAM}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  userSelect: 'none',
                  filter: 'url(#glyph-glow)',
                  animation: `chromatica-glyph-pulse 3.6s ease-in-out ${phaseDelay}s infinite`
                }}
                transform={`rotate(${angle} ${p.x} ${p.y})`}
              >
                {glyph}
              </text>
            );
          })}
        </g>

        {/* Center void: warm charcoal base + a slow living chromatic glow.
            The breathing glow gives the void life even when no music is playing. */}
        <g style={{ pointerEvents: 'none' }}>
          <circle cx={cx} cy={cy} r={rVoid} fill="url(#void-gradient)" />
          <circle
            cx={cx} cy={cy} r={rVoid * 0.82}
            fill="url(#void-living-glow)"
            className="chromatica-void-glow"
            style={{ mixBlendMode: 'screen', transformOrigin: `${cx}px ${cy}px` }}
          />
        </g>
      </svg>

      {/* Lyric burst overlay slot: photomontage erupts inside the void */}
      {burstSlot}
    </div>
  );
}