// Vice Lights Cover Lab — boot, state, event wiring, ?shot= scenes.
// Editor preview renders live on every state change. Shot scenes (?shot=cover
// | editor | portrait | square) render a fixed scene for screenshots and set
// window.__shotReady when the frame is painted.
import { LAYOUTS } from './layouts.js';
import { renderCoverTo } from './cover.js';
import { exportSize, exportAll, EXPORT_SIZES } from './export.js';
import { PhotoPool, loadImage, readFileAsDataURL } from './panels.js';

const $ = (sel) => document.querySelector(sel);
const canvas = $('#coverCanvas');

const state = {
  layout: 'nine',
  grade: 'sunset',
  title: 'VICE LIGHTS',
  subtitle: 'welcome to Leonida',
  size: '1920x1080',
  photos: new PhotoPool(),
  zooms: {},
  pans: {},
  selectedPanel: 0,
};

// --- Undo / redo (snapshots of the editable state, photos excluded) ---
const history = [];
let future = [];
function snapshot() {
  return JSON.stringify({ layout: state.layout, grade: state.grade, title: state.title, subtitle: state.subtitle, size: state.size, zooms: state.zooms, pans: state.pans });
}
function restore(json) {
  const s = JSON.parse(json);
  Object.assign(state, s);
  syncControls();
}
function pushHistory() {
  history.push(snapshot());
  if (history.length > 40) history.shift();
  future = [];
}
function undo() {
  if (!history.length) return;
  future.push(snapshot());
  restore(history.pop());
  render();
}
function redo() {
  if (!future.length) return;
  history.push(snapshot());
  restore(future.pop());
  render();
}

// --- Preview sizing from the chosen export aspect ---
function previewSize() {
  const s = EXPORT_SIZES.find((x) => x.id === state.size) || EXPORT_SIZES[2];
  const scale = Math.min(960 / s.w, 720 / s.h, 1);
  return { w: Math.round(s.w * scale), h: Math.round(s.h * scale) };
}

function render() {
  const { w, h } = previewSize();
  renderCoverTo(canvas, state, w, h);
}

function syncControls() {
  document.querySelectorAll('[data-layout]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.layout === state.layout)));
  document.querySelectorAll('[data-grade]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.grade === state.grade)));
  document.querySelectorAll('[data-size]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.size === state.size)));
  $('#titleInput').value = state.title;
  $('#subtitleInput').value = state.subtitle;
  $('#zoomRange').value = Math.round((state.zooms[state.selectedPanel] || 1.2) * 100);
}

async function loadSamples() {
  for (const name of ['neon-street.jpg', 'sunset-car.jpg']) {
    try {
      const img = await loadImage(`samples/${name}`);
      state.photos.add(img, name);
    } catch (e) { /* sample missing: placeholder panels stay */ }
  }
  render();
}

// --- Panel hit test (preview coordinates -> panel index) ---
function panelAt(clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  const fx = (clientX - r.left) / r.width;
  const fy = (clientY - r.top) / r.height;
  const rects = (LAYOUTS[state.layout] || LAYOUTS.nine).panels(1, 1);
  for (let i = 0; i < rects.length; i++) {
    const p = rects[i];
    if (fx >= p.x && fx <= p.x + p.w && fy >= p.y && fy <= p.y + p.h) return i;
  }
  return 0;
}

// --- Wiring ---
function wire() {
  $('#photoInput').addEventListener('change', async (e) => {
    for (const file of e.target.files) {
      try {
        const img = await loadImage(await readFileAsDataURL(file));
        state.photos.add(img, file.name);
      } catch (err) { /* skip unreadable file */ }
    }
    render();
  });
  $('#sampleBtn').addEventListener('click', loadSamples);
  document.querySelectorAll('[data-layout]').forEach((b) => b.addEventListener('click', () => {
    pushHistory();
    state.layout = b.dataset.layout;
    syncControls();
    render();
  }));
  document.querySelectorAll('[data-grade]').forEach((b) => b.addEventListener('click', () => {
    pushHistory();
    state.grade = b.dataset.grade;
    syncControls();
    render();
  }));
  document.querySelectorAll('[data-size]').forEach((b) => b.addEventListener('click', () => {
    pushHistory();
    state.size = b.dataset.size;
    syncControls();
    render();
  }));
  $('#titleInput').addEventListener('input', (e) => { state.title = e.target.value; render(); });
  $('#titleInput').addEventListener('change', pushHistory);
  $('#subtitleInput').addEventListener('input', (e) => { state.subtitle = e.target.value; render(); });
  $('#subtitleInput').addEventListener('change', pushHistory);
  $('#zoomRange').addEventListener('input', (e) => {
    state.zooms[state.selectedPanel] = e.target.value / 100;
    render();
  });
  $('#exportBtn').addEventListener('click', () => exportSize(state, state.size));
  $('#exportAllBtn').addEventListener('click', () => exportAll(state));
  $('#undoBtn').addEventListener('click', undo);
  $('#redoBtn').addEventListener('click', redo);

  let dragging = null;
  canvas.addEventListener('pointerdown', (e) => {
    state.selectedPanel = panelAt(e.clientX, e.clientY);
    dragging = { x: e.clientX, y: e.clientY };
    canvas.setPointerCapture(e.pointerId);
    syncControls();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const r = canvas.getBoundingClientRect();
    const pan = state.pans[state.selectedPanel] || { x: 0, y: 0 };
    pan.x += (e.clientX - dragging.x) / r.width;
    pan.y += (e.clientY - dragging.y) / r.height;
    state.pans[state.selectedPanel] = pan;
    dragging = { x: e.clientX, y: e.clientY };
    render();
  });
  canvas.addEventListener('pointerup', () => { dragging = null; });
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const z = state.zooms[state.selectedPanel] || 1.2;
    state.zooms[state.selectedPanel] = Math.min(3, Math.max(1, z - Math.sign(e.deltaY) * 0.1));
    syncControls();
    render();
  }, { passive: false });
}

// --- Shot scenes for screenshots ---
async function runShot(shot) {
  await loadSamples();
  const scenes = {
    cover: { w: 1280, h: 720, layout: 'nine', grade: 'sunset' },
    portrait: { w: 1024, h: 1280, layout: 'hero', grade: 'neon' },
    square: { w: 1080, h: 1080, layout: 'tilted', grade: 'golden' },
  };
  const scene = scenes[shot];
  if (scene) {
    // Pure-cover scenes hide the editor chrome so the frame is only the cover.
    document.querySelector('header').style.display = 'none';
    document.querySelector('aside').style.display = 'none';
    document.querySelector('footer').style.display = 'none';
    document.querySelector('.preview').style.padding = '0';
    document.querySelector('.stage').style.border = '0';
    document.querySelector('.stage').style.padding = '0';
    // Pin the canvas to exact screenshot pixels (CSS max-width would shrink it).
    canvas.style.width = scene.w + 'px';
    canvas.style.height = scene.h + 'px';
    canvas.style.maxWidth = 'none';
    state.layout = scene.layout;
    state.grade = scene.grade;
    renderCoverTo(canvas, state, scene.w, scene.h);
  } else {
    // Editor scene keeps the full UI: controls + live preview.
    render();
  }
  window.__shotReady = true;
}

// --- Boot ---
async function boot() {
  wire();
  syncControls();
  try {
    await Promise.all([document.fonts.load('16px Anton'), document.fonts.load('16px Pacifico')]);
    await document.fonts.ready;
  } catch (e) { /* fonts fall back to sans-serif */ }
  const shot = new URLSearchParams(location.search).get('shot');
  if (shot) {
    await runShot(shot);
  } else {
    await loadSamples();
    render();
  }
}

boot();
