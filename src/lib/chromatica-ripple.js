// Tiny pub/sub bus for cross-component ripple events.
// The ColorWheel's glyph-ring drag-snap fires `emitRipple({ angle })`,
// and SoundwaveRing subscribes to render a localized ripple at that angle.
//
// Kept dependency-free so it works inside requestAnimationFrame loops
// without React re-renders.
const listeners = new Set();

export function emitRipple(payload) {
  for (const fn of listeners) {
    try { fn(payload); } catch { /* swallow listener errors */ }
  }
}

export function onRipple(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}