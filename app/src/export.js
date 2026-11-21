// Vice Lights Cover Lab — PNG export. Renders the cover at the exact export
// size on an offscreen canvas, then downloads it with canvas.toBlob. No
// timestamps in filenames beyond the size: deterministic output bytes.
import { renderCoverTo } from './cover.js';

export const EXPORT_SIZES = [
  { id: '1080x1080', w: 1080, h: 1080 },
  { id: '1080x1350', w: 1080, h: 1350 },
  { id: '1920x1080', w: 1920, h: 1080 },
  { id: '1080x1920', w: 1080, h: 1920 },
];

export function renderExport(state, sizeId) {
  const size = EXPORT_SIZES.find((s) => s.id === sizeId) || EXPORT_SIZES[2];
  const canvas = document.createElement('canvas');
  renderCoverTo(canvas, state, size.w, size.h);
  return { canvas, size };
}

export function downloadCanvas(canvas, filename) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) { reject(new Error('export failed')); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      resolve(blob.size);
    }, 'image/png');
  });
}

export async function exportSize(state, sizeId) {
  const { canvas, size } = renderExport(state, sizeId);
  const bytes = await downloadCanvas(canvas, `vice-lights-cover-${size.id}.png`);
  return { size: size.id, bytes };
}

export async function exportAll(state) {
  const results = [];
  for (const s of EXPORT_SIZES) {
    results.push(await exportSize(state, s.id));
  }
  return results;
}
