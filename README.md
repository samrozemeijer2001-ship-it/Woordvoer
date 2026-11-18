# Woordpost

Elke dag een duur woord, een spreekwoord en een Wildcard. Een testmaand van 30 dagen, in de Button Petite-stijl.

## Online zetten met GitHub Pages

1. Maak een nieuwe repository op GitHub.
2. Upload alles uit deze map naar de hoofdmap van de repo: `index.html`, `assets/`, `content.json`, de iconen, `manifest.webmanifest` en de map `broncode/`. Zet de bestanden er los in, niet in een extra map.
3. Ga naar Settings, dan Pages. Kies bij Build and deployment: Deploy from a branch, branch `main`, map `/ (root)`, en klik op Save.
4. Na een minuut of twee staat de app op `https://<gebruikersnaam>.github.io/<repo>/`.

## Wat staat waar

- In de hoofdmap staat de gebouwde app. Die bestanden toont GitHub Pages.
- `broncode/` bevat de broncode (React, TypeScript, Vite), de Excel met alle kaarten, het importscript en de tests. Hoe je de inhoud aanpast, de startdatum instelt of een dag test, staat in `broncode/README.md`.

De startdatum (dag 1) staat nu op dinsdag 17 november 2026. Je past hem aan in `broncode/src/config.ts`. Draai daarna `npm run build` in `broncode/` en zet de nieuwe bestanden op GitHub.
