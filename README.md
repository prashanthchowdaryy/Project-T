# 🌹 Eternal Bloom

A full-screen digital artwork: a dark Matrix-like universe forms a glowing particle rose, then butterflies emerge from light.
Pure HTML + CSS + JS (Three.js via CDN). No build step, no backend.

## Files
`index.html` · `style.css` · `script.js` · `README.md`

## Run locally
ES modules need a web server (don't double-click the file):
```
python3 -m http.server 8000     # then open http://localhost:8000
```

## Deploy on GitHub Pages
1. Create a repo and upload these 4 files to the **root** (or push them with git).
2. Repo → **Settings → Pages** → Source: *Deploy from a branch* → Branch: `main`, folder `/ (root)` → Save.
3. After a minute your site is live at `https://<username>.github.io/<repo>/`.

All paths are relative and Three.js loads from jsDelivr, so nothing else is needed.

## Personalise
Edit the `CONFIG` object at the top of `script.js` (message lines, sub line, footer, button text, wish message).
Butterfly colours/sizes are in the `BF` array; petal count in `NP`.

## Interactions
Move mouse / finger: particles part around the cursor + parallax · Click/tap the rose: particle burst + released petals ·
**Make a Wish**: golden burst, brighter rose, butterflies swoop closer, wish message · ↻ top-right: replay the 15 s formation.
Particle counts and pixel ratio are reduced automatically on weaker devices.
