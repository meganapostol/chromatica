import React, { useEffect, useRef } from 'react';

// Full-viewport grid of chromatic dots that repel away from the cursor
// and gently return to their resting position. Uses the Chromatica palette
// so the field feels native to the site.
//
// Pointer-events disabled so it never intercepts wheel/credit clicks —
// the cursor's repulsion is read globally via window mousemove instead.
const DEFAULT_PALETTE = [
  '#E34234', '#FF7F50', '#E97451', '#E3A857', '#F2A900',
  '#FADA5E', '#C0D725', '#2E8B57', '#43B3AE', '#5BB7E5',
  '#26619C', '#002FA7', '#8E4585', '#66023C', '#DC143C'
];

export default function InteractiveDots({
  colors = DEFAULT_PALETTE,
  spacing = 38,
  dotRadius = 3.4,
  repelForce = 0.45,
  repelDistance = 6000,
  returnSpeed = 1,
  opacity = 0.55,
  active = true
}) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const dotsRef = useRef([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const randomColor = () => colors[Math.floor(Math.random() * colors.length)];

    function initDots() {
      const dots = [];
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      for (let x = spacing / 2; x < w; x += spacing) {
        for (let y = spacing / 2; y < h; y += spacing) {
          dots.push({
            x, y,
            dx: x, dy: y,           // resting position
            color: randomColor(),
            radius: dotRadius
          });
        }
      }
      dotsRef.current = dots;
    }

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      initDots();
    }

    function animate() {
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      const mouse = mouseRef.current;
      const dots = dotsRef.current;

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        const disX = d.x - mouse.x;
        const disY = d.y - mouse.y;
        const ds = disX * disX + disY * disY;
        if (ds < repelDistance && ds > 0) {
          const angle = Math.atan2(disY, disX);
          const force = (repelDistance / ds) * repelForce;
          d.x += Math.cos(angle) * force;
          d.y += Math.sin(angle) * force;
        } else {
          if (d.x !== d.dx) d.x += (d.dx - d.x) * 0.02 * returnSpeed;
          if (d.y !== d.dy) d.y += (d.dy - d.y) * 0.02 * returnSpeed;
        }

        // Snap back if pushed off-canvas
        if (d.x < -50 || d.x > w + 50 || d.y < -50 || d.y > h + 50) {
          d.x = d.dx;
          d.y = d.dy;
        }

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
        ctx.fillStyle = d.color;
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    }

    function onMouseMove(e) {
      if (e.touches && e.touches.length) {
        mouseRef.current.x = e.touches[0].clientX;
        mouseRef.current.y = e.touches[0].clientY;
      } else {
        mouseRef.current.x = e.clientX;
        mouseRef.current.y = e.clientY;
      }
    }

    resize();
    animate();

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onMouseMove, { passive: true });

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onMouseMove);
    };
  }, [colors, spacing, dotRadius, repelForce, repelDistance, returnSpeed]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        opacity: active ? opacity : 0,
        transition: 'opacity 0.5s ease',
        mixBlendMode: 'screen'
      }}
    />
  );
}
