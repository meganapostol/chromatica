import React, { useEffect, useRef, useState } from 'react';
import { onAchievement, getAchievementState } from '@/lib/chromatica-achievement';

// Visual progress dashboard. Shows the user how far through Chromatica
// they've come — which chambers they've visited, which they've fully
// "held" (read to greyscale), and which are still locked. Plus credits
// progress and the rainbow-finale unlock state.
//
// Tiers per color tile:
//   • locked   — never opened; rendered dim & desaturated with a hairline
//   • visited  — opened, but greyscale not reached; rendered in full color
//   • held     — fully read to greyscale; rendered in color with a checkmark
export default function ProgressDashboard({ colors, onClose, onSelect }) {
  const [state, setState] = useState(getAchievementState);

  useEffect(() => {
    const off = onAchievement((evt) => {
      if (evt.type === 'progress' || evt.type === 'unlocked') {
        setState(getAchievementState());
      }
    });
    return off;
  }, []);

  // Latest-ref so esc handler doesn't re-bind on every state change.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCloseRef.current?.(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, []);

  const visitedSet = new Set(state.visited || []);
  const lostSet = new Set(state.lost || []);
  const total = colors.length;
  const visitedCount = colors.filter((c) => visitedSet.has(c.id)).length;
  const heldCount = colors.filter((c) => lostSet.has(c.id)).length;

  // Sort by hue so the dashboard reads as a rainbow ribbon.
  const sorted = [...colors].sort((a, b) => a.hueOrder - b.hueOrder);

  const visitedPct = Math.round((visitedCount / total) * 100);
  const heldPct = Math.round((heldCount / total) * 100);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[80] flex items-center justify-center p-6"
      style={{
        backgroundColor: 'rgba(5, 5, 8, 0.78)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        animation: 'chromatica-fade-in 0.3s ease-out'
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="relative overflow-y-auto scroll-hide"
        style={{
          width: '100%',
          maxWidth: 880,
          maxHeight: '88vh',
          backgroundColor: '#0A0A0F',
          border: '1px solid rgba(248, 240, 227, 0.14)',
          borderRadius: 14,
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.6)'
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="close progress"
          className="sticky float-right font-mono-c uppercase tracking-mono"
          style={{
            top: 16, right: 16, marginRight: 16, marginTop: 16,
            fontSize: 11, color: 'rgba(250,250,250,0.7)', zIndex: 2,
            backgroundColor: 'rgba(15, 12, 18, 0.7)',
            border: '1px solid rgba(248, 240, 227, 0.18)',
            borderRadius: 9999, padding: '6px 14px', cursor: 'pointer'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(250,250,250,1)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(250,250,250,0.7)')}
        >
          × close
        </button>

        <div className="px-10 py-14">
          <div
            className="font-mono-c uppercase tracking-mono"
            style={{ fontSize: 11, color: 'rgba(250,250,250,0.6)', marginBottom: 12 }}
          >
            your progress
          </div>
          <h2
            className="font-display tracking-display-tight"
            style={{ fontSize: 44, fontWeight: 600, lineHeight: 1.05, color: '#F8F0E3', marginBottom: 8 }}
          >
            how much of her you've held
          </h2>
          <p
            className="font-display italic"
            style={{ fontSize: 18, lineHeight: 1.5, color: 'rgba(250,250,250,0.7)', marginBottom: 36 }}
          >
            each color you visit lights up. each one you read to the end is held forever.
          </p>

          {/* Stat strip */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Stat label="visited"  value={`${visitedCount} / ${total}`} pct={visitedPct} />
            <Stat label="held"     value={`${heldCount} / ${total}`}    pct={heldPct} />
            <Stat
              label="credits"
              value={state.creditsRead ? 'read' : 'unread'}
              pct={state.creditsRead ? 100 : 0}
            />
          </div>

          {/* Combined progress bar — visited (faint) overlaid by held (bright) */}
          <ProgressBar visitedPct={visitedPct} heldPct={heldPct} />

          {/* Finale state */}
          <div
            style={{
              marginTop: 18,
              marginBottom: 36,
              padding: '14px 18px',
              borderRadius: 12,
              border: state.unlocked
                ? '1px solid rgba(248, 240, 227, 0.4)'
                : '1px solid rgba(248, 240, 227, 0.12)',
              backgroundColor: state.unlocked
                ? 'rgba(248, 240, 227, 0.06)'
                : 'rgba(15, 12, 18, 0.55)'
            }}
          >
            <div
              className="font-mono-c uppercase tracking-mono"
              style={{ fontSize: 10, color: 'rgba(250,250,250,0.55)', marginBottom: 6 }}
            >
              rainbow finale
            </div>
            <div
              className="font-display italic"
              style={{ fontSize: 16, color: '#F8F0E3', lineHeight: 1.5 }}
            >
              {state.unlocked
                ? 'unlocked. you held every one of her.'
                : `hold every color and read the credits to unlock. ${heldCount}/${total} held${state.creditsRead ? ' · credits read' : ''}.`}
            </div>
          </div>

          {/* Color grid */}
          <div
            className="font-mono-c uppercase tracking-mono"
            style={{ fontSize: 11, color: 'rgba(250,250,250,0.6)', marginBottom: 14 }}
          >
            chambers
          </div>
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))' }}
          >
            {sorted.map((c) => {
              const isHeld = lostSet.has(c.id);
              const isVisited = visitedSet.has(c.id);
              const tier = isHeld ? 'held' : isVisited ? 'visited' : 'locked';
              return (
                <ChamberTile
                  key={c.id}
                  color={c}
                  tier={tier}
                  onSelect={() => {
                    onSelect?.(c.id);
                    onClose?.();
                  }}
                />
              );
            })}
          </div>

          <div
            className="font-mono-c uppercase tracking-mono"
            style={{ fontSize: 10, color: 'rgba(250,250,250,0.45)', marginTop: 28, lineHeight: 1.7 }}
          >
            <span style={{ color: 'rgba(250,250,250,0.7)' }}>● held</span>{'   '}
            <span style={{ color: 'rgba(250,250,250,0.5)' }}>○ visited</span>{'   '}
            <span style={{ color: 'rgba(250,250,250,0.3)' }}>· locked</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, pct }) {
  return (
    <div
      style={{
        padding: '14px 16px',
        borderRadius: 10,
        backgroundColor: 'rgba(15, 12, 18, 0.55)',
        border: '1px solid rgba(248, 240, 227, 0.12)'
      }}
    >
      <div
        className="font-mono-c uppercase tracking-mono"
        style={{ fontSize: 10, color: 'rgba(250,250,250,0.55)', marginBottom: 6 }}
      >
        {label}
      </div>
      <div
        className="font-display"
        style={{ fontSize: 26, color: '#F8F0E3', lineHeight: 1, fontWeight: 500 }}
      >
        {value}
      </div>
      <div
        className="font-mono-c"
        style={{ fontSize: 10, color: 'rgba(250,250,250,0.45)', marginTop: 6 }}
      >
        {pct}%
      </div>
    </div>
  );
}

function ProgressBar({ visitedPct, heldPct }) {
  return (
    <div
      style={{
        position: 'relative',
        height: 10,
        borderRadius: 9999,
        backgroundColor: 'rgba(248, 240, 227, 0.08)',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          width: `${visitedPct}%`,
          background: 'linear-gradient(90deg, rgba(248,240,227,0.25), rgba(248,240,227,0.45))',
          transition: 'width 0.6s ease-out'
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          width: `${heldPct}%`,
          background: 'linear-gradient(90deg, #E34234, #F2A900, #C0D725, #2E8B57, #5BB7E5, #1F4788, #8E4585, #DC143C)',
          backgroundSize: '200% 100%',
          animation: 'chromatica-aurora-drift 8s ease-in-out infinite alternate',
          transition: 'width 0.6s ease-out'
        }}
      />
    </div>
  );
}

function ChamberTile({ color, tier, onSelect }) {
  const isLocked = tier === 'locked';
  const isVisited = tier === 'visited';
  const isHeld = tier === 'held';

  return (
    <button
      type="button"
      onClick={onSelect}
      className="relative text-left"
      title={`${color.name.toLowerCase()} · ${tier}`}
      style={{
        aspectRatio: '1',
        borderRadius: 10,
        overflow: 'hidden',
        border: isHeld
          ? '1px solid rgba(248,240,227,0.55)'
          : isVisited
          ? '1px solid rgba(248,240,227,0.3)'
          : '1px solid rgba(248,240,227,0.1)',
        backgroundColor: color.hex,
        filter: isLocked ? 'grayscale(1) brightness(0.45)' : 'none',
        cursor: 'pointer',
        transition: 'transform 0.2s, filter 0.3s, border-color 0.2s',
        boxShadow: isHeld ? `0 0 22px ${color.hex}66` : 'none'
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
    >
      {/* Gradient veil so the label is always readable */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.7) 100%)'
        }}
      />
      {/* Status badge */}
      <div
        className="font-mono-c uppercase tracking-mono"
        style={{
          position: 'absolute',
          top: 8, right: 8,
          fontSize: 9,
          padding: '3px 7px',
          borderRadius: 9999,
          color: isHeld ? '#0A0A0F' : '#F8F0E3',
          backgroundColor: isHeld
            ? 'rgba(248,240,227,0.95)'
            : isVisited
            ? 'rgba(15,12,18,0.6)'
            : 'rgba(15,12,18,0.55)',
          border: isHeld ? 'none' : '1px solid rgba(248,240,227,0.25)'
        }}
      >
        {isHeld ? '✓ held' : isVisited ? 'visited' : 'locked'}
      </div>
      {/* Label */}
      <div
        style={{
          position: 'absolute',
          left: 10, right: 10, bottom: 8,
          color: '#F8F0E3'
        }}
      >
        <div
          className="font-display"
          style={{ fontSize: 14, lineHeight: 1.15, fontWeight: 500 }}
        >
          {color.name.toLowerCase()}
        </div>
        <div
          className="font-mono-c"
          style={{ fontSize: 9, color: 'rgba(248,240,227,0.65)', marginTop: 2 }}
        >
          {color.hex}
        </div>
      </div>
    </button>
  );
}