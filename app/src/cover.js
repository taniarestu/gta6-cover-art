// Vice Lights Cover Lab — cover render engine.
// Pipeline: draw photos into an offscreen canvas -> grade + grain + vignette
// -> composite onto the target canvas -> crisp lettering, ribbon, heat meter,
// tilted snapshot on top. No timestamps, no unseeded random: renders are
// deterministic for the same state.
import { LAYOUTS, inkPanel } from './layouts.js';
import { applyGrade, addGrain, addVignette } from './grades.js';
import { drawTitleBlock, drawRibbon, drawHeatMeter } from './lettering.js';
import { drawPhotoCover } from './panels.js';

function placeholderPhoto(ctx, rect, i) {
  const cols = [['#ff2e88', '#7b2ff7'], ['#ff7a18', '#ff2e88'], ['#00e5ff', '#7b2ff7'], ['#ffd640', '#ff7a18']];
  const [a, b] = cols[i % cols.length];
  const g = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
  g.addColorStop(0, a);
  g.addColorStop(1, b);
  ctx.fillStyle = g;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = `${Math.round(rect.h * 0.16)}px Anton, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('YOUR PHOTO', rect.x + rect.w / 2, rect.y + rect.h / 2);
}

function titleBox(layout, W, H) {
  const kind = LAYOUTS[layout].title;
  if (kind === 'center') {
    const g = 0.012;
    const cw = (1 - g * 4) / 3;
    const ch = (1 - g * 4) / 3;
    return { x: (g + cw + g) * W, y: (g + ch + g) * H, w: cw * W, h: ch * H };
  }
  if (kind === 'center-band') {
    return { x: 0.04 * W, y: 0.42 * H, w: 0.92 * W, h: 0.16 * H };
  }
  return { x: 0.04 * W, y: 0.8 * H, w: 0.92 * W, h: 0.16 * H };
}

export function renderCoverTo(canvas, state, W, H) {
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const scale = W / 1080;
  const layout = LAYOUTS[state.layout] || LAYOUTS.nine;

  // --- Photo layer (offscreen, graded) ---
  const off = document.createElement('canvas');
  off.width = W;
  off.height = H;
  const octx = off.getContext('2d');
  octx.fillStyle = '#0b1026';
  octx.fillRect(0, 0, W, H);
  const rects = layout.panels(W, H);
  rects.forEach((r, i) => {
    const px = { x: r.x * W, y: r.y * H, w: r.w * W, h: r.h * H };
    const photo = state.photos.get(i);
    if (photo) {
      drawPhotoCover(octx, photo.img, px, state.zooms[i] || 1.2, state.pans[i]?.x || 0, state.pans[i]?.y || 0);
    } else {
      placeholderPhoto(octx, px, i);
    }
    inkPanel(octx, px.x, px.y, px.w, px.h, scale);
  });
  applyGrade(off, state.grade);
  addGrain(off, 0.04);
  addVignette(off, 0.4);
  ctx.drawImage(off, 0, 0);

  // --- Tilted snapshot (crisp, on top) ---
  if (layout.snapshot) {
    const photo = state.photos.get(1) || state.photos.get(0);
    const sw = W * 0.34;
    const sh = H * 0.3;
    const cx = W * 0.62;
    const cy = H * 0.42;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.1);
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 30 * scale;
    ctx.shadowOffsetY = 12 * scale;
    ctx.fillStyle = '#fdfdf8';
    ctx.fillRect(-sw / 2, -sh / 2, sw, sh + sh * 0.22);
    ctx.shadowColor = 'transparent';
    if (photo) {
      drawPhotoCover(ctx, photo.img, { x: -sw / 2 + 10 * scale, y: -sh / 2 + 10 * scale, w: sw - 20 * scale, h: sh - 20 * scale }, 1.3, 0, 0);
    } else {
      placeholderPhoto(ctx, { x: -sw / 2 + 10 * scale, y: -sh / 2 + 10 * scale, w: sw - 20 * scale, h: sh - 20 * scale }, 1);
    }
    ctx.fillStyle = '#222';
    ctx.font = `${Math.round(22 * scale + 10)}px Pacifico, cursive`;
    ctx.textAlign = 'center';
    ctx.fillText('Leonida nights', 0, sh / 2 + sh * 0.1);
    ctx.restore();
  }

  // --- Lettering layer (crisp) ---
  const box = titleBox(state.layout, W, H);
  drawTitleBlock(ctx, box, state.title || 'VICE LIGHTS', state.subtitle || '', scale);
  drawRibbon(ctx, 'LEONIDA', W * 0.03, H * 0.03, W * 0.16, H * 0.045, '#ff2e88');
  // Heat meter, right-aligned with a margin so the 5th star never clips.
  const starSize = Math.max(14, Math.min(H * 0.028, W * 0.03));
  drawHeatMeter(ctx, W * 0.98 - starSize * 5 * 1.15, H * 0.055, 5, starSize);
}
