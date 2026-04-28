import React, { useEffect, useMemo, useRef, useState } from 'react';
import { emitRipple } from '@/lib/chromatica-ripple';

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

export default function ColorWheel({ colors = [], onSelect, exiting = false, burstSlot = null, onHoverAngle = null, onHoverColor = null, voidSlot = null, voidLabelSlot = null }) {
  const [hoverIdx, setHoverIdx] = useState(null);
  const [hoverAngle, setHoverAngle] = useState(null);

  // ---------- Glyph ring drag-to-spin ----------
  // Rotation is owned in JS now. Default behaviour: slow auto-spin (CCW,
  // matching the original CSS animation pace). User can grab the glyph
  // ring and fling it; on release, momentum carries it with friction
  // until it snaps to the nearest of TOTAL_SECTORS centers and we emit
  // a ripple to the SoundwaveRing.
  const [glyphRotation, setGlyphRotation] = useState(0); // degrees
  const glyphRingRef = useRef(null);
  const dragStateRef = useRef({
    dragging: false,
    lastAngle: 0,        // last pointer angle (deg) relative to wheel center
    velocity: 0,         // deg/sec
    lastT: 0,
    rotation: 0,
    // history for velocity smoothing
    history: []
  });

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

  // Animation loop: drives auto-spin, drag follow, momentum + snap.
  useEffect(() => {
    let raf;
    let snappingTo = null;        // target rotation while snapping
    const AUTO_SPIN = -360 / 90;  // deg/sec, matches old 90s CCW CSS animation
    const FRICTION = 1.6;          // deg/sec^2 magnitude — gentle decay
    const SNAP_VEL_THRESHOLD = 12; // |deg/sec| below which we lock to snap
    const SECTOR = 360 / TOTAL_SECTORS;

    const step = (now) => {
      const ds = dragStateRef.current;
      const dt = ds.lastT ? Math.min(0.05, (now - ds.lastT) / 1000) : 0;
      ds.lastT = now;

      let next = ds.rotation;

      if (ds.dragging) {
        // Position is set directly by pointer handlers; just publish.
        next = ds.rotation;
        snappingTo = null;
      } else if (Math.abs(ds.velocity) > SNAP_VEL_THRESHOLD) {
        // Coast with friction.
        next = ds.rotation + ds.velocity * dt;
        const decay = Math.exp(-dt * FRICTION);
        ds.velocity = ds.velocity * decay;
        ds.rotation = next;
        snappingTo = null;
      } else if (snappingTo !== null) {
        // Ease into the snap target.
        const diff = snappingTo - ds.rotation;
        if (Math.abs(diff) < 0.05) {
          ds.rotation = snappingTo;
          next = snappingTo;
          // Emit a ripple at the angle of the sector now under the top
          // (12 o'clock = -90deg in screen-space).
          const snapAngleDeg = -90 - snappingTo; // sector center under top
          const angleRad = (snapAngleDeg * Math.PI) / 180;
          emitRipple({ angle: angleRad, strength: 1 });
          snappingTo = null;
        } else {
          const ease = 1 - Math.exp(-dt * 9);
          ds.rotation = ds.rotation + diff * ease;
          next = ds.rotation;
        }
      } else if (Math.abs(ds.velocity) > 0.01) {
        // Below the snap threshold but still drifting — initiate snap.
        const target = Math.round(ds.rotation / SECTOR) * SECTOR;
        snappingTo = target;
        ds.velocity = 0;
        next = ds.rotation;
      } else {
        // Idle: gentle auto-spin.
        next = ds.rotation + AUTO_SPIN * dt;
        ds.rotation = next;
      }

      setGlyphRotation(next);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Pointer handlers on the glyph ring group.
  const getPointerAngle = (e) => {
    const el = glyphRingRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI;
  };

  const onGlyphPointerDown = (e) => {
    e.preventDefault();
    const ds = dragStateRef.current;
    ds.dragging = true;
    ds.velocity = 0;
    ds.lastAngle = getPointerAngle(e);
    ds.history = [{ a: ds.lastAngle, t: performance.now() }];
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* */ }
  };

  const onGlyphPointerMove = (e) => {
    const ds = dragStateRef.current;
    if (!ds.dragging) return;
    const a = getPointerAngle(e);
    let delta = a - ds.lastAngle;
    // Wrap delta to [-180, 180] so a jump across the 180° seam doesn't
    // launch the ring at orbital velocity.
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    ds.rotation += delta;
    ds.lastAngle = a;
    const now = performance.now();
    ds.history.push({ a, t: now });
    // Keep only last 80ms of samples for velocity estimation.
    while (ds.history.length > 1 && now - ds.history[0].t > 80) {
      ds.history.shift();
    }
  };

  const endDrag = () => {
    const ds = dragStateRef.current;
    if (!ds.dragging) return;
    ds.dragging = false;
    // Estimate velocity from the recent history window.
    if (ds.history.length >= 2) {
      const first = ds.history[0];
      const last = ds.history[ds.history.length - 1];
      let totalDelta = 0;
      for (let i = 1; i < ds.history.length; i++) {
        let d = ds.history[i].a - ds.history[i - 1].a;
        if (d > 180) d -= 360;
        if (d < -180) d += 360;
        totalDelta += d;
      }
      const dtSec = (last.t - first.t) / 1000;
      ds.velocity = dtSec > 0 ? totalDelta / dtSec : 0;
      // Cap absurd velocities.
      ds.velocity = Math.max(-1200, Math.min(1200, ds.velocity));
    }
  };

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
            // CSS class + custom property keeps the animation OUT of the inline
            // `style` object — so re-renders (e.g. hover state changes) don't
            // re-apply the animation and re-trigger the fade-in flicker.
            return (
              <g
                key={color.id}
                className="chromatica-slab"
                style={{
                  transformOrigin: `${cx}px ${cy}px`,
                  '--slab-delay': `${i * 0.08}s`
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
                  onMouseEnter={() => {
                    setHoverIdx(i);
                    reportHover(start + sectorAngle / 2);
                    onHoverColor?.(color);
                  }}
                  onMouseLeave={() => {
                    setHoverIdx(null);
                    reportHover(null);
                    onHoverColor?.(null);
                  }}
                  onClick={() => onSelect(color.id)}
                >
                  <title>{color.name.toLowerCase()}</title>
                </path>
              </g>
            );
          })}
        </g>

        {/* Glyph ring — interactive: drag to spin with momentum + snap.
            We render an invisible thick ring under the glyphs as the actual
            hit target so the user can grab anywhere along the ring band,
            not just the glyph characters themselves. The color sectors
            inside still receive clicks because the hit ring sits at the
            glyph radius (between sectors and void). */}
        <g
          ref={glyphRingRef}
          style={{
            transformOrigin: `${cx}px ${cy}px`,
            transform: `rotate(${glyphRotation}deg)`,
            cursor: 'grab',
            touchAction: 'none'
          }}
          onPointerDown={onGlyphPointerDown}
          onPointerMove={onGlyphPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerLeave={endDrag}
        >
          {/* Invisible draggable ring band */}
          <circle
            cx={cx}
            cy={cy}
            r={rGlyph}
            fill="none"
            stroke="rgba(0,0,0,0.001)"
            strokeWidth={42}
            style={{ cursor: 'grab' }}
          />
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i / 24) * 360;
            const p = polar(cx, cy, rGlyph, angle);
            const glyph = GLYPHS[i % GLYPHS.length];
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
                  animation: `chromatica-glyph-pulse 3.6s ease-in-out ${phaseDelay}s infinite`,
                  pointerEvents: 'none'
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

      {/* Foreground label slot — renders ABOVE the SVG without any blend
          mode so cream text stays readable on the dark void. */}
      {voidLabelSlot && (
        <div
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
          style={{ zIndex: 5 }}
        >
          <div style={{ width: '52%', aspectRatio: '1' }}>
            {voidLabelSlot}
          </div>
        </div>
      )}
    </div>
  );
}