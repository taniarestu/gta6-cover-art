// Vice Lights Cover Lab — lettering: Anton title block, Pacifico neon script,
// badge ribbon, heat-meter stars, halftone dots. All drawn on canvas so the
// exported PNG carries the lettering exactly as previewed.
export function halftoneDots(ctx, x, y, w, h, dot, gap, color) {
  ctx.save();
  ctx.fillStyle = color;
  for (let yy = y; yy < y + h; yy += gap) {
    for (let xx = x; xx < x + w; xx += gap) {
      ctx.beginPath();
      ctx.arc(xx, yy, dot, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

// Sunset-gradient title text with a heavy black outline (GTA poster look).
export function drawTitle(ctx, text, x, y, size, maxW) {
  ctx.save();
  ctx.font = `${size}px Anton, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const grad = ctx.createLinearGradient(x - maxW / 2, y - size / 2, x + maxW / 2, y + size / 2);
  grad.addColorStop(0, '#ffd640');
  grad.addColorStop(0.35, '#ff7a18');
  grad.addColorStop(0.65, '#ff2e88');
  grad.addColorStop(1, '#7b2ff7');
  ctx.lineWidth = Math.max(4, size * 0.09);
  ctx.strokeStyle = '#0a0618';
  ctx.lineJoin = 'round';
  ctx.strokeText(text, x, y, maxW);
  ctx.fillStyle = grad;
  ctx.fillText(text, x, y, maxW);
  ctx.restore();
}

// Pacifico subtitle with a neon glow (shadowBlur) in cyan or pink.
export function drawScript(ctx, text, x, y, size, color = '#00e5ff') {
  ctx.save();
  ctx.font = `${size}px Pacifico, cursive`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = color;
  ctx.shadowBlur = size * 0.45;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, x, y);
  ctx.shadowBlur = size * 0.15;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

// Angled ribbon badge, e.g. "LEONIDA" or "★ HEAT 5".
export function drawRibbon(ctx, text, x, y, w, h, color = '#ff2e88') {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.06);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(w, 0);
  ctx.lineTo(w - h * 0.4, h);
  ctx.lineTo(h * 0.4, h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = `${Math.round(h * 0.52)}px Anton, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, h / 2 + 1);
  ctx.restore();
}

// Heat meter: 5 stars, filled ones glow gold.
export function drawHeatMeter(ctx, x, y, stars, size) {
  ctx.save();
  ctx.font = `${size}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < 5; i++) {
    const filled = i < stars;
    ctx.fillStyle = filled ? '#ffd640' : 'rgba(255,255,255,0.25)';
    if (filled) { ctx.shadowColor = '#ffd640'; ctx.shadowBlur = size * 0.4; }
    ctx.fillText('★', x + i * size * 1.15, y);
    ctx.shadowBlur = 0;
  }
  ctx.restore();
}

// Title block: halftone-backed band with big title + script subtitle.
// `box` is {x, y, w, h} in pixels; draws centred in the box.
export function drawTitleBlock(ctx, box, title, subtitle, scale) {
  const { x, y, w, h } = box;
  ctx.save();
  ctx.fillStyle = 'rgba(10,6,24,0.88)';
  ctx.fillRect(x, y, w, h);
  halftoneDots(ctx, x + 8 * scale, y + 6 * scale, w - 16 * scale, 14 * scale, 2.2 * scale, 9 * scale, 'rgba(255,46,136,0.7)');
  halftoneDots(ctx, x + 8 * scale, y + h - 20 * scale, w - 16 * scale, 14 * scale, 2.2 * scale, 9 * scale, 'rgba(0,229,255,0.7)');
  const titleSize = Math.min(h * 0.52, (w * 0.92) / Math.max(4, title.length * 0.58));
  drawTitle(ctx, title.toUpperCase(), x + w / 2, y + h * 0.42, titleSize, w * 0.94);
  if (subtitle) {
    drawScript(ctx, subtitle, x + w / 2, y + h * 0.82, Math.min(h * 0.22, 44 * scale), '#00e5ff');
  }
  ctx.restore();
}
