// Vice Lights Cover Lab — cover layouts. Each layout returns panel rects as
// fractions of the canvas (x, y, w, h in 0..1) plus where the title block goes.
// Panel art: 9-panel grid like the official GTA 6 cover, hero-and-three, and
// the tilted snapshot from the 7-ace house reference.
export const LAYOUTS = {
  // 3x3 grid; the centre cell holds the title block, the 8 outer cells photos.
  nine: {
    label: '9-panel grid',
    title: 'center',
    panels(w, h) {
      const g = 0.012;
      const cw = (1 - g * 4) / 3;
      const ch = (1 - g * 4) / 3;
      const out = [];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          if (r === 1 && c === 1) continue;
          out.push({ x: g + c * (cw + g), y: g + r * (ch + g), w: cw, h: ch });
        }
      }
      return out;
    },
  },
  // One big hero panel, three small panels around it.
  hero: {
    label: 'Hero + three',
    title: 'bottom',
    panels(w, h) {
      const g = 0.012;
      return [
        { x: g, y: g, w: 0.62 - g, h: 0.64 - g },
        { x: 0.62 + g, y: g, w: 0.38 - g * 2, h: 0.31 - g },
        { x: 0.62 + g, y: 0.32 + g, w: 0.38 - g * 2, h: 0.32 - g },
        { x: g, y: 0.65 + g, w: 1 - g * 2, h: 0.35 - g * 2 },
      ];
    },
  },
  // Classic 2x2 poster grid.
  four: {
    label: 'Four-panel',
    title: 'bottom',
    panels(w, h) {
      const g = 0.012;
      const cw = (1 - g * 3) / 2;
      const ch = (1 - g * 3) / 2;
      return [
        { x: g, y: g, w: cw, h: ch },
        { x: g * 2 + cw, y: g, w: cw, h: ch },
        { x: g, y: g * 2 + ch, w: cw, h: ch },
        { x: g * 2 + cw, y: g * 2 + ch, w: cw, h: ch },
      ];
    },
  },
  // 3 columns x 2 rows, title band across the middle.
  six: {
    label: 'Six-panel',
    title: 'center-band',
    panels(w, h) {
      const g = 0.012;
      const cw = (1 - g * 4) / 3;
      const ch = (1 - g * 3) / 2;
      const out = [];
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 3; c++) {
          out.push({ x: g + c * (cw + g), y: g + r * (ch + g), w: cw, h: ch });
        }
      }
      return out;
    },
  },
  // One full-bleed photo, title overlaid at the bottom.
  full: {
    label: 'Full-bleed',
    title: 'bottom',
    panels(w, h) {
      return [{ x: 0, y: 0, w: 1, h: 1 }];
    },
  },
  // 2x2 grid with a tilted polaroid snapshot layered on top.
  tilted: {
    label: 'Tilted snapshot',
    title: 'bottom',
    snapshot: true,
    panels(w, h) {
      const g = 0.012;
      const cw = (1 - g * 3) / 2;
      const ch = (1 - g * 3) / 2;
      return [
        { x: g, y: g, w: cw, h: ch },
        { x: g * 2 + cw, y: g, w: cw, h: ch },
        { x: g, y: g * 2 + ch, w: cw, h: ch },
        { x: g * 2 + cw, y: g * 2 + ch, w: cw, h: ch },
      ];
    },
  },
};

// Panel frame: thick black comic inking + a thin neon band, per the 7-ace look.
export function inkPanel(ctx, x, y, w, h, scale) {
  ctx.save();
  ctx.lineWidth = Math.max(3, 7 * scale);
  ctx.strokeStyle = '#0a0618';
  ctx.strokeRect(x, y, w, h);
  ctx.lineWidth = Math.max(1, 2 * scale);
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.strokeRect(x + 3 * scale, y + 3 * scale, w - 6 * scale, h - 6 * scale);
  ctx.restore();
}
