// Vice Lights Cover Lab — gradient-map colour grades + grain + vignette.
// A grade maps each pixel's luminance through a colour ramp (Vice City sunset,
// neon pink/teal, golden hour, Vice night, noir). Deterministic: grain uses a
// seeded PRNG, never Math.random or Date.now.
export const GRADES = {
  sunset: {
    label: 'Sunset',
    stops: [[0, 26, 11, 46], [0.25, 123, 47, 247], [0.5, 255, 46, 136], [0.75, 255, 122, 24], [1, 255, 233, 176]],
    strength: 0.55,
  },
  neon: {
    label: 'Neon',
    stops: [[0, 5, 5, 20], [0.3, 30, 20, 90], [0.55, 255, 46, 136], [0.8, 0, 229, 255], [1, 230, 255, 255]],
    strength: 0.6,
  },
  golden: {
    label: 'Golden hour',
    stops: [[0, 32, 16, 8], [0.3, 140, 70, 10], [0.55, 255, 122, 24], [0.8, 255, 214, 64], [1, 255, 246, 200]],
    strength: 0.55,
  },
  night: {
    label: 'Vice night',
    stops: [[0, 6, 8, 26], [0.3, 24, 18, 70], [0.55, 59, 29, 143], [0.8, 123, 47, 247], [1, 160, 230, 255]],
    strength: 0.6,
  },
  noir: {
    label: 'Noir',
    stops: [[0, 8, 8, 10], [0.35, 70, 70, 78], [0.7, 160, 160, 168], [1, 245, 245, 248]],
    strength: 0.7,
  },
};

// Seeded PRNG (mulberry32) so grain is identical on every render.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildLut(stops) {
  const lut = new Uint8Array(256 * 3);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    let a = stops[0];
    let b = stops[stops.length - 1];
    for (let s = 0; s < stops.length - 1; s++) {
      if (t >= stops[s][0] && t <= stops[s + 1][0]) { a = stops[s]; b = stops[s + 1]; break; }
    }
    const f = (t - a[0]) / Math.max(1e-9, b[0] - a[0]);
    lut[i * 3] = a[1] + (b[1] - a[1]) * f;
    lut[i * 3 + 1] = a[2] + (b[2] - a[2]) * f;
    lut[i * 3 + 2] = a[3] + (b[3] - a[3]) * f;
  }
  return lut;
}

// Apply a grade in place on the canvas. Strength blends graded vs original.
export function applyGrade(canvas, gradeName) {
  const grade = GRADES[gradeName] || GRADES.sunset;
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const lut = buildLut(grade.stops);
  const s = grade.strength;
  for (let i = 0; i < d.length; i += 4) {
    const lum = Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]);
    const li = lum * 3;
    d[i] = d[i] * (1 - s) + lut[li] * s;
    d[i + 1] = d[i + 1] * (1 - s) + lut[li + 1] * s;
    d[i + 2] = d[i + 2] * (1 - s) + lut[li + 2] * s;
  }
  ctx.putImageData(img, 0, 0);
}

export function addGrain(canvas, amount = 0.05) {
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  const rnd = mulberry32(1337);
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (rnd() - 0.5) * 255 * amount;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
}

export function addVignette(canvas, strength = 0.45) {
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.75);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, `rgba(5,2,16,${strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}
