// Small color helpers. No external libs.

export function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const v = h.length === 3
    ? h.split('').map((c) => c + c).join('')
    : h.padEnd(6, '0').slice(0, 6);
  const num = parseInt(v, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

export function rgbaFromHex(hex, alpha = 1) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Mix hex with #0A0A0F at given alpha (subtle wash).
export function mixWithBg(hex, alpha = 0.06, bg = '#0A0A0F') {
  const a = hexToRgb(hex);
  const b = hexToRgb(bg);
  const r = Math.round(b.r + (a.r - b.r) * alpha);
  const g = Math.round(b.g + (a.g - b.g) * alpha);
  const bl = Math.round(b.b + (a.b - b.b) * alpha);
  return `rgb(${r}, ${g}, ${bl})`;
}