# Woordpost

Een dagelijks taalpakketje: één duur woord, één spreekwoord en één Wildcard, af en toe met een gouden Blast from the Past. Testversie voor 30 dagen, in de Button Petite-stijl. Gebouwd met React, TypeScript en Vite.

Voortgang staat alleen in de browser van de speler (localStorage). Er zijn geen accounts. Een naam en een character kies je lokaal bij Voortgang.

## Starten

Eenmalig: installeer [Node.js](https://nodejs.org) 20 of nieuwer. Daarna in deze map:

```
npm install
npm run dev
```

Open het adres dat verschijnt (meestal http://localhost:5173). Met `--host` staat de app ook op je wifi-netwerk: open het `Network`-adres op je telefoon.

Een nieuwe versie om online te zetten maak je zo:

```
npm run build
```

De build komt in de hoofdmap van de repo, één map boven `broncode/`: `index.html`, `assets/`, `content.json` en de iconen. Zet die bestanden op GitHub, en GitHub Pages toont de nieuwe versie. De app gebruikt relatieve paden en links met `#`, dus hij werkt ook in een submap.

## Excel opnieuw importeren

1. Pas `content/Woordpost-testmaand.xlsx` aan, of vervang hem door een nieuwe versie met dezelfde tabbladen en kolommen.
2. Draai:
   ```
   npm run import
   ```
   Een ander bestand importeer je met `node scripts/import-xlsx.mjs pad/naar/bestand.xlsx public/content.json`.
3. Draai `npm run build` en zet de bijgewerkte bestanden in de hoofdmap van de repo op GitHub.

Het script controleert op unieke ID's, lege verplichte velden, geldige dagverwijzingen, kloppende puzzeldagen, letteraantallen en hintposities. Fouten krijg je per tabblad en rij, bijvoorbeeld `Wildcards, rij 3: "spons" heeft 5 tekens, maar letters zegt 6`. Bij een fout wordt de bestaande `public/content.json` niet aangepast.

Voortgang hangt aan de vaste ID's (`W01`, `S01`, `P01`). Houd die ID's gelijk, dan blijft de voortgang van spelers staan na een nieuwe import. Verdwijnt er een ID, dan meldt het script dat. De voortgang met dat ID blijft bewaard, maar de kaart is dan niet meer te zien.

## Gezamenlijke startdatum

In `src/config.ts`:

```ts
export const START_DATE = '2026-11-17';
```

Dag 1 is die Nederlandse kalenderdag. De dag wordt berekend in de tijdzone Europe/Amsterdam, dus iedereen ziet op dezelfde Nederlandse datum dezelfde post en Wildcard, ook met een telefoon in een andere tijdzone. Wanneer iemand de app voor het eerst opent, verandert niets aan de planning. Pas de datum aan, draai `npm run build` en zet de bestanden op GitHub.

Vóór de startdatum toont Vandaag wanneer de eerste post komt. Na dag 30 staat er een melding dat de testmaand voorbij is. Het Archief blijft dan gewoon werken.

## Lokaal een dag testen

Zet `?testdag=` vóór de `#` in het adres:

```
http://localhost:5173/?testdag=8#/
```

De app doet dan alsof het dag 8 is, alleen in dat tabblad (sessionStorage). Bovenin staat een zwarte balk met een knop Stop, en `?testdag=uit` zet het ook uit. De gedeelde planning en de app van anderen veranderen niet.

Let op: wat je in testmodus speelt, telt mee in de voortgang van die browser. Test daarom in een privévenster of een ander browserprofiel.

Andere testhulpjes:

- `?simuleer=laadfout` doet alsof de dagpost niet geladen kan worden.
- `npm test` draait de unittests voor de spelregels, punten, datum, reservewoorden, Blast from the Past en opslagvalidatie.
- `e2e/scenarios.py` doorloopt de 9 testscenario's op telefoonformaat met Playwright. Start eerst `npm run build` en serveer de hoofdmap van de repo op poort 4173 (bijvoorbeeld `npx serve .. -l 4173`), daarna `python3 e2e/scenarios.py`.

## Hoe het in elkaar zit

| Map of bestand | Wat |
|---|---|
| `content/Woordpost-testmaand.xlsx` | Bron van alle kaarten en de planning |
| `scripts/import-xlsx.mjs` | Zet de Excel om naar `public/content.json` en controleert alles |
| `public/content.json` | De geïmporteerde inhoud die de app inleest |
| `src/config.ts` | Startdatum, tijdzone, punten, levels, Blast-regels |
| `src/rules.ts` | Spelregels als losse functies (punten, gokken, hints, reserve, Blast) |
| `src/progress.ts` | Voortgang: structuur, validatie, opslag met reservekopie |
| `src/content.ts` | Inhoud laden en valideren, met de laatst geldige kopie als vangnet |
| `src/screens/` | De schermen |
| `src/ui/` | Gezichten, characters, iconen, knoppen, kleurparen |
| `licenses/` | Fontlicenties (SIL OFL) voor Barlow Condensed en Rubik |

Inhoud, spelregels en voortgang staan los van elkaar. De voortgang heeft een versieveld (`version: 1`). Bij elke geslaagde opslag wordt ook een reservekopie geschreven. Is de hoofdkopie beschadigd, dan laadt de app de reservekopie. Zijn beide onleesbaar, dan overschrijft de app niets tot de speler zelf kiest voor Opnieuw beginnen. De oude gegevens worden dan apart bewaard. Een mislukte dagpost raakt de voortgang nooit aan.

## Spelregels in het kort

- Wildcard: drie geldige pogingen. Een leeg antwoord of een verkeerd aantal letters kost geen poging. Er is één hint (1 letter tot en met 5 letters, anders 2), en die kost 25 punten bij een goed antwoord.
- Punten: 100, 75 of 50 voor goed in poging 1, 2 of 3. Met hint 75, 50 of 25. Drie keer fout levert 0 punten op. Elke 300 punten ga je een level omhoog.
- Blast from the Past: hooguit één keer per 7 dagen, met een woord dat minstens 7 dagen eerder is bewaard. 'Wist ik nog' telt één keer als onthouden, behalve als het woord als 'Ken ik al' is gemarkeerd.
- In gedeelde uitslagen en links staat nooit het antwoord. De antwoorden zitten wel in `content.json`: voor deze test is er geen servercontrole.

## Afwijkingen van de briefing

- De voorbeeld-deeltekst gebruikte middenpunten. Die zijn in de huisstijl verboden, dus de uitslag staat op losse regels: `Woordpost Wildcard #012`, `Geraden in 2 van de 3 pogingen, zonder hint`, `75 punten`.
- Profielnaam en character zijn later toegevoegd. Ze staan lokaal en zijn optioneel. Op Vandaag kom je direct bij de post uit.
- Tekst op rood gebruikt de LEF-inkt `#3b0d06` voor genoeg contrast, net als in de Button Petite-kit.
