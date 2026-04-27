import React, { useMemo, useState } from 'react';
import SparkRing from './SparkRing';

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

export default function ColorWheel({ colors = [], onSelect, exiting = false }) {
  const [hoverIdx, setHoverIdx] = useState(null);
  const [hoverAngle, setHoverAngle] = useState(null);

  const SIZE = 720;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const rOuterColor = SIZE * 0.42;
  const rInnerColor = SIZE * 0.31;
  const rGlyph = SIZE * 0.27;
  const rVoid = SIZE * 0.18;

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
      {/* Spark ring (canvas) */}
      <div className="absolute inset-0">
        <div className="w-full h-full relative">
          <SparkRingWrapper colors={colors} hoveredAngle={hoverAngle} />
        </div>
      </div>

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
        </defs>

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
                  onMouseEnter={() => { setHoverIdx(i); setHoverAngle(start + sectorAngle / 2); }}
                  onMouseLeave={() => { setHoverIdx(null); setHoverAngle(null); }}
                  style={{ cursor: 'help' }}
                >
                  <title>her chamber is being prepared</title>
                </path>
              );
            }

            return (
              <g key={color.id}>
                {/* Outer luminous glow */}
                <path
                  d={sectorPath(cx, cy, rOuterColor * lift + 12, rInnerColor - 4, start, end)}
                  fill={color.hex}
                  opacity={isHover ? 0.55 : 0.4}
                  style={{ filter: 'blur(12px)', pointerEvents: 'none' }}
                />
                <path
                  d={path}
                  fill={color.hex}
                  style={{
                    filter: isHover ? 'brightness(1.15)' : 'brightness(1)',
                    transition: 'filter 0.3s ease, d 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={() => { setHoverIdx(i); setHoverAngle(start + sectorAngle / 2); }}
                  onMouseLeave={() => { setHoverIdx(null); setHoverAngle(null); }}
                  onClick={() => onSelect(color.id)}
                >
                  <title>{color.name.toLowerCase()}</title>
                </path>
              </g>
            );
          })}
        </g>

        {/* Glyph ring */}
        <g
          className="rotate-glyph-ring"
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        >
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i / 24) * 360;
            const p = polar(cx, cy, rGlyph, angle);
            const glyph = GLYPHS[i % GLYPHS.length];
            return (
              <text
                key={`glyph-${i}`}
                x={p.x}
                y={p.y}
                fontSize="14"
                fill="rgba(252, 247, 232, 0.48)"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontFamily: 'JetBrains Mono, monospace', userSelect: 'none' }}
                transform={`rotate(${angle} ${p.x} ${p.y})`}
              >
                {glyph}
              </text>
            );
          })}
        </g>

        {/* Center void */}
        <circle cx={cx} cy={cy} r={rVoid} fill="#050508" />
        <circle cx={cx} cy={cy} r={rVoid} fill="none" stroke="rgba(250,250,250,0.08)" strokeWidth="1" />
      </svg>
    </div>
  );
}

function SparkRingWrapper({ colors, hoveredAngle }) {
  // Wrapper to size the canvas to the parent square at 720px logical.
  return <SparkRing size={720} colors={colors} hoveredAngle={hoveredAngle} />;
}