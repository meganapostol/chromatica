import React, { useEffect, useRef, useState } from 'react';

// Non-interactive guide. Pops a series of small italic banners that teach
// users what to do, then fucks off. Cannot accept questions. Re-shows
// occasional hints later if the user is hovering on the wheel state for
// a while without clicking anything.
//
// The first walkthrough fires once per browser (gated by localStorage).
// Hints are gated by user activity heuristics so they don't nag.
const STORAGE_KEY = 'chromatica.guide.seenIntro.v1';

const INTRO_STEPS = [
  { text: 'welcome to chromatica.',                                   delay:  800, duration: 3500 },
  { text: 'each color holds her own chamber.',                        delay: 4500, duration: 4000 },
  { text: 'click any color to enter her.',                            delay: 9000, duration: 4500 },
  { text: 'turn on the music and the chambers will tell you how she lived.', delay: 14000, duration: 5500 },
  { text: 'her companions at the foot of each chamber link to related colors.', delay: 20000, duration: 5500 }
];

// Wheel-state idle nudges (re-fired periodically if the user is just sitting).
const IDLE_HINTS = [
  'try clicking a color you have never heard of.',
  'switch to "with music" — she\'s scored.',
  'each chamber slowly desaturates while you read her. that\'s the point.',
  'press the credits link if you want the artist\'s statement.'
];

export default function GuideAgent({ onWheelState = true }) {
  const [activeText, setActiveText] = useState(null);
  const introTimersRef = useRef([]);
  const idleTimerRef = useRef(null);
  const lastInteractionRef = useRef(Date.now());

  // First-visit walkthrough.
  useEffect(() => {
    if (!onWheelState) return;
    let seen = false;
    try { seen = !!localStorage.getItem(STORAGE_KEY); } catch { /* localStorage blocked */ }
    if (seen) return;

    const timers = [];
    INTRO_STEPS.forEach((step) => {
      timers.push(setTimeout(() => setActiveText(step.text), step.delay));
      timers.push(setTimeout(() => setActiveText((t) => (t === step.text ? null : t)), step.delay + step.duration));
    });
    timers.push(setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* ignore */ }
    }, INTRO_STEPS[INTRO_STEPS.length - 1].delay + INTRO_STEPS[INTRO_STEPS.length - 1].duration));

    introTimersRef.current = timers;
    return () => timers.forEach(clearTimeout);
  }, [onWheelState]);

  // Idle nudges: if the user has been on the wheel for >40s with no clicks,
  // pop a single hint. After that, every ~50s while idle.
  useEffect(() => {
    if (!onWheelState) return;
    const bumpInteraction = () => { lastInteractionRef.current = Date.now(); };
    window.addEventListener('click', bumpInteraction);
    window.addEventListener('keydown', bumpInteraction);

    let i = 0;
    const tick = () => {
      const idleMs = Date.now() - lastInteractionRef.current;
      if (idleMs > 40000) {
        const hint = IDLE_HINTS[i % IDLE_HINTS.length];
        i++;
        setActiveText(hint);
        setTimeout(() => setActiveText((t) => (t === hint ? null : t)), 5500);
        lastInteractionRef.current = Date.now() - 0; // reset so it doesn't re-fire immediately
      }
    };
    idleTimerRef.current = setInterval(tick, 12000);

    return () => {
      window.removeEventListener('click', bumpInteraction);
      window.removeEventListener('keydown', bumpInteraction);
      clearInterval(idleTimerRef.current);
    };
  }, [onWheelState]);

  if (!activeText) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: 110,
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '10px 22px',
        borderRadius: 9999,
        backgroundColor: 'rgba(15, 12, 18, 0.78)',
        border: '1px solid rgba(248, 240, 227, 0.22)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        color: '#F8F0E3',
        fontFamily: "'Cormorant Garamond', serif",
        fontStyle: 'italic',
        fontSize: 15,
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
        zIndex: 70,
        animation: 'chromatica-guide-fade 0.5s ease-out',
        pointerEvents: 'none'
      }}
    >
      {activeText}
    </div>
  );
}
