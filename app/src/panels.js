// Vice Lights Cover Lab — per-panel photos: cover-fit draw with pan/zoom.
// Each panel keeps its own photo index, zoom and pan offset. Photos are HTML
// Image objects loaded from user files (FileReader data URLs) or the bundled
// samples. No network, no upload: everything stays in the browser.
export class PhotoPool {
  constructor() {
    this.images = []; // { img, name }
  }
  add(img, name) {
    this.images.push({ img, name });
    return this.images.length - 1;
  }
  get(i) {
    if (!this.images.length) return null;
    return this.images[((i % this.images.length) + this.images.length) % this.images.length];
  }
  get count() {
    return this.images.length;
  }
}

// Draw one photo cover-fitting a rect, honouring zoom (1 = fit) and pan offsets
// (fractions of the rect). The image is clipped to the rect.
export function drawPhotoCover(ctx, img, rect, zoom = 1, panX = 0, panY = 0) {
  const { x, y, w, h } = rect;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  const scale = Math.max(w / img.width, h / img.height) * zoom;
  const dw = img.width * scale;
  const dh = img.height * scale;
  const dx = x + (w - dw) / 2 + panX * w;
  const dy = y + (h - dh) / 2 + panY * h;
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

// Load an image from a data URL; resolves with the HTMLImageElement.
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('could not load image'));
    img.src = src;
  });
}

// Read a File as a data URL (user upload path).
export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(new Error('could not read file'));
    r.readAsDataURL(file);
  });
}
