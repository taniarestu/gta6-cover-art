// Vice Lights Cover Lab — entrypoint (Node 22, standard library only).
// Hands the offline cover-maker app in: copies app/ and screenshots/ beside
// this file into the output directory and writes dossier.json with the
// vendored make.fun library. Deterministic: no clock, no random, no network.
// Run locally:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Serve locally: node serve.ts  (then http://localhost:8080)
import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Authored check: refuse a broken handoff instead of submitting an empty app.
if (!existsSync(join(here, 'app', 'index.html'))) {
  throw new Error('app/index.html is missing — cannot build the entry');
}

function copyTree(src, dest) {
  mkdirSync(dest, { recursive: true });
  cpSync(src, dest, { recursive: true });
  return readdirSync(dest, { recursive: true }).length;
}

mkdirSync(outDir, { recursive: true });
const appEntries = copyTree(join(here, 'app'), join(outDir, 'app'));
const shotEntries = existsSync(join(here, 'screenshots'))
  ? copyTree(join(here, 'screenshots'), join(outDir, 'screenshots'))
  : 0;

// The scorer's own caps: only text_max_bytes shapes the bytes; the rest refuse
// an entry the scorer would refuse (more than 4 screenshots or one over
// 256 KiB; more than 993 files in app/ or 48 MiB of app files in all).
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);

console.log(`Vice Lights Cover Lab: ${appEntries} app entries, ${shotEntries} screenshots, dossier ${dossier.length} bytes`);
