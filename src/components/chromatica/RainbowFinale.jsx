import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { onAchievement } from '@/lib/chromatica-achievement';

// Floods the entire viewport with rainbow confetti the moment the user
// has visited every color's greyscale state AND scrolled to the end of
// the credits. Also surfaces a soft italic "thank you" banner that fades
// out on its own.
const RAINBOW = [
  '#E34234', '#FF7F50', '#F2A900', '#FADA5E', '#C0D725',
  '#50A747', '#2E8B57', '#43B3AE', '#5BB7E5', '#26619C',
  '#002FA7', '#8E4585', '#DC143C', '#FAFAFA'
];

export default function RainbowFinale() {
  const [active, setActive] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const canvasRef = useRef(null);
  const myConfettiRef = useRef(null);

  useEffect(() => {
    const off = onAchievement((evt) => {
      if (evt.type === 'unlocked') {
        setActive(true);
        setShowBanner(true);
        // Hide banner after a beat — confetti runs longer.
        setTimeout(() => setShowBanner(false), 6500);
        setTimeout(() => setActive(false), 9000);
      }
    });
    return off;
  }, []);

  // Bind a dedicated confetti canvas so we don't fight the rest of the page.
  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const myConfetti = confetti.create(canvasRef.current, {
      resize: true,
      useWorker: true
    });
    myConfettiRef.current = myConfetti;

    // Big opening burst from the center.
    myConfetti({
      particleCount: 220,
      spread: 160,
      startVelocity: 55,
      origin: { x: 0.5, y: 0.55 },
      colors: RAINBOW,
      scalar: 1.1,
      ticks: 320
    });

    // Side cannons — keep firing for ~5s so the page really does flood.
    const end = Date.now() + 5000;
    const cannon = () => {
      if (Date.now() > end) return;
      myConfetti({
        particleCount: 8,
        angle: 60,
        spread: 70,
        startVelocity: 55,
        origin: { x: 0, y: 0.7 },
        colors: RAINBOW,
        ticks: 280
      });
      myConfetti({
        particleCount: 8,
        angle: 120,
        spread: 70,
        startVelocity: 55,
        origin: { x: 1, y: 0.7 },
        colors: RAINBOW,
        ticks: 280
      });
      requestAnimationFrame(cannon);
    };
    cannon();

    // Slow drift from the top — the "flood" feel.
    const driftEnd = Date.now() + 7000;
    const drift = () => {
      if (Date.now() > driftEnd) return;
      myConfetti({
        particleCount: 4,
        spread: 360,
        startVelocity: 18,
        gravity: 0.55,
        origin: { x: Math.random(), y: -0.05 },
        colors: RAINBOW,
        scalar: 0.9,
        ticks: 360
      });
      setTimeout(drift, 100);
    };
    drift();

    return () => {
      try { myConfetti.reset?.(); } catch { /* */ }
    };
  }, [active]);

  if (!active) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 200
        }}
      />
      {showBanner && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            top: '38%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 201,
            padding: '24px 40px',
            borderRadius: 16,
            backgroundColor: 'rgba(15, 12, 18, 0.78)',
            border: '1px solid rgba(248, 240, 227, 0.28)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            color: '#F8F0E3',
            textAlign: 'center',
            boxShadow: '0 24px 80px rgba(0,0,0,0.55)',
            animation: 'chromatica-fade-in 0.7s ease-out',
            pointerEvents: 'none',
            maxWidth: '90vw'
          }}
        >
          <div
            className="font-mono-c uppercase tracking-mono"
            style={{ fontSize: 11, color: 'rgba(248,240,227,0.65)', marginBottom: 12 }}
          >
            you held every one of her
          </div>
          <div
            className="font-display italic"
            style={{ fontSize: 30, lineHeight: 1.25 }}
          >
            thank you for staying for the whole song.
          </div>
        </div>
      )}
    </>
  );
}