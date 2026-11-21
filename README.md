# gta6-cover-art

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/taniarestu/gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/taniarestu/gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

**Vice Lights Cover Lab** — turn your photo + caption into a GTA 6-style cover
art. An offline web app: pick a layout, pick a sunset/neon grade, type a
title, export a share-ready PNG. Photos never leave your machine.

## How to use

1. Open `app/index.html` in a desktop browser, or run `node serve.ts` and
   open http://localhost:8080.
2. Add one or more photos (or use the bundled samples).
3. Pick a layout (9-panel grid, hero + three, four-panel, six-panel,
   full-bleed, tilted snapshot) and a grade (sunset, neon, golden hour,
   Vice night, noir).
4. Type a title and a subtitle, drag panels to reposition, scroll to zoom.
5. Pick an export size and hit **Export PNG** — or export all four sizes at
   once (1080×1080, 1080×1350, 1920×1080, 1080×1920 story).

## Features

- 6 layouts including the 9-panel grid from the official GTA 6 cover, with
  comic-style panel inking, banding, and a tilted polaroid snapshot.
- 5 gradient-map colour grades with grain + vignette (deterministic renders).
- Anton display lettering with a sunset gradient + halftone title block, and a
  Pacifico neon-script subtitle. Heat-meter stars + Leonida ribbon badge.
- Undo / redo, per-panel pan + zoom, fully offline (fonts bundled locally).

## Run locally

```sh
node serve.ts
# open http://localhost:8080
```

## License

MIT — see `LICENSE`. Fonts Anton and Pacifico are licensed under the SIL Open
Font License 1.1 — see `app/fonts/OFL.txt`. Sample photos are original
procedural art made for this entry.
