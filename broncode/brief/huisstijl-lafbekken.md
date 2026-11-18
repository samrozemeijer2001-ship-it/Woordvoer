# Huisstijl: "Lafbekken-stijl"

Bouw deze app in exact deze visuele stijl. De stijl moet speels, brutaal en handgemaakt aanvoelen, en mag absoluut NIET generiek of AI-gegenereerd ogen.

## Gevoel in één zin
Een minimalistisch, poster-achtig partyspel: grote vlakken felle kleur, enorme smalle hoofdletters, simpele tegel-smileys met karakter, en alles beweegt verend en bubbly.

## Harde verboden (belangrijk)
- GEEN pill shapes (geen volledig ronde knoppen of labels). Gebruik afgeronde rechthoeken.
- GEEN glow, neon, gradients, glassmorphism of blur-effecten.
- GEEN scheidingslijnen, randen of borders. Scheid dingen met ruimte of met een vlak in een iets andere tint.
- GEEN emoji's als iconen. Iconen zijn simpele, dikke, afgeronde lijntekeningen.
- GEEN middenpunten "·" tussen woorden. Gebruik ruimte, komma's of herschrijf.
- GEEN harde hoeken, nergens: ook niet in iconen of smileys.
- GEEN slagschaduwen op knoppen en kaarten (plat ontwerp).
- Geen zwevende/bobbing animaties die eindeloos op en neer gaan.

## Kleuren
Basis:
- Inkt (tekst, donkere vlakken): #141210
- Papier (lichte schermen, panelen): #fff6ea
- Pagina-achtergrond: #f3ede4

Werk met complete schermvlakken in één kleur, met een bijpassende "inktkleur" voor tekst en smiley erop. Elke kleur heeft een vaste partner (achtergrond / inkt):
- Mint #7fe0a8 / #0f5a3a
- Lichtblauw #7fb7ff / #14306b
- Lila #b98cff / #2b1360
- Kobalt #2747c9 / #d8e4ff
- Geel #ffcc2e / #a3300f
- Oranje #ff8a3d / #4a1a05
- Rood-oranje #ff5a3c / #fff3c4
- Diep paars #3a1a6b / #ff8fc8
- Roze #ff8fc8 / #6b0f3a
- Zwart #141210 / #ffd84a (geel) of #ff5a3c (rood) voor "events"

Regels:
- Schermen wisselen af tussen licht (papier) en volledig gekleurd.
- Koele kleuren (mint, blauw, lila, kobalt) = veilig/rustig. Warme kleuren (geel, oranje, rood, paars) = risico/spanning. Hoe intenser het moment, hoe donkerder en heftiger de kleur.
- De smiley neemt altijd de inktkleur van het vlak aan; hij staat niet in een eigen kader.
- Subtiele vlakken binnen een gekleurd scherm: inkt met lage dekking, bijvoorbeeld rgba(20,18,16,.06) tot .15. Dus nooit een randje, wel een iets donkerder vlak.

## Typografie
- Display: "Barlow Condensed", gewicht 900 (Black), ALTIJD HOOFDLETTERS, letter-spacing -0.005em, line-height strak (0.8 tot 0.95). Voor titels, knoppen, grote getallen en labels.
- Body: "Rubik", gewichten 400/600/700/800. Gewone zinnen in Rubik 800 voor nadruk; kleine meta-labels in Rubik 800 op 12 tot 13px met letter-spacing .04em.
- Schaal: durf heel groot te gaan. Hoofdgetallen 96 tot 128px, eventtitels 70 tot 104px, knoppen 26px, kaarttekst 20px.
- Tekst links uitgelijnd, behalve bij grote gecentreerde momenten.

## Vormen en maten
- Afrondingen: klein 12px, middel 16px, groot 22px. Knoppen 20px, grote tegels 28 tot 46px, onderpanelen 30px alleen aan de bovenkant.
- Knoppen: volle breedte, min. 62px hoog, Barlow 900 hoofdletters 26px, effen vlak, geen rand.
- Icon-knoppen: 44×44px, radius 14px, achtergrond inkt op 9% dekking.
- Invoervelden: wit vlak, radius 14px, geen rand, geen focus-glow.
- Ruime marges (24px aan de zijkanten), respecteer de safe areas van de iPhone.
- "Stickers" (kleine kaartjes met een actieve regel): 140px breed, radius 18px, iets scheef gedraaid (tussen -3 en 3 graden), horizontaal swipebaar.

## Smileys (het belangrijkste element)
Minimalistische gezichten: alleen ogen en mond, geen hoofdcirkel eromheen. Ze staan direct op het gekleurde vlak, of in een effen tegel (een afgerond vierkant, radius ongeveer 25% van de breedte).
Teken ze als SVG met viewBox "8 10 84 84", in één kleur (de inktkleur):
- Lijnstijl: fill none, stroke-width 8, stroke-linecap round, stroke-linejoin round.
- Gevulde stijl: fill én stroke in dezelfde kleur, stroke-width 7, linejoin round (zodat gevulde vormen ook zachte hoeken hebben).
- Ogen in een groep `.eyes` (met binnenin `.blink` voor de oogleden), mond in een groep `.mouth`, zodat ze los kunnen bewegen.

Vaste set uitdrukkingen (paden om over te nemen):
- relieved (opgelucht, lijn): ogen "M26 40 q8 -8 16 0 M58 40 q8 -8 16 0", mond "M30 62 q20 16 40 0"
- sleepy (slaperig, lijn): ogen "M27 40 q7 6 14 0 M59 40 q7 6 14 0", mond "M44 66 q6 4 12 0"
- meh (meh): links een streepje-oog "M29 37.5 h10", rechts een stip-oog r=5 op (66,38), mond recht "M34 66 h32"
- happy (blij, gevuld): stip-ogen r=4 op (34,38) en (66,38), open lach "M24 54 q26 36 52 0 z"
- smirk (grijns): stip-ogen, scheve lijnmond "M32 62 q18 12 38 -6"
- stars (sterogen): twee afgeronde sterretjes als ogen, grote open lach "M26 62 q24 32 48 0 z"
- shock (geschrokken): grote stip-ogen r=6, ovale mond (ellips rx 7, ry 10 op 50,70)
- panic (paniek, lijn): ogen als > < "M25 31 q15 7 15 9 q0 2 -15 9 M75 31 q-15 7 -15 9 q0 2 15 9", golvende mond "M26 76 q6 -12 12 0 q6 12 12 0 q6 -12 12 0 q6 12 12 0"

De uitdrukking past bij de situatie: hoe beter het afloopt, hoe blijer; hoe heftiger het misloopt, hoe paniekeriger.

Animatie van de smileys (moet natuurlijk en levend voelen, niet mechanisch):
- Knipperen: willekeurig elke 2,4 tot 6,5 seconden. Oogleden scaleY van 1 naar 0.08 en terug, in 170 tot 230ms, easing cubic-bezier(.4,0,.2,1). In 18% van de gevallen een dubbele knipper (tweede na 280ms).
- Rondkijken: elke 1,3 tot 3,8 seconden schuiven de ogen naar een willekeurige plek (bijv. 7px links, 6px rechts, iets omhoog, of terug naar het midden). Duur 380ms plus extra bij grotere afstand, easing cubic-bezier(.33,0,.15,1). De mond beweegt 30% mee, met 60ms vertraging. Bij een grote blikwisseling soms een knipper.
- Verschijnen: een "pop": van scale .2 en rotate -14deg naar normaal, met de spring-curve.
- Niet zweven. Respecteer prefers-reduced-motion (dan geen animatie).

## Beweging en animatie
Alles voelt bubbly, verend en soepel.
- Spring-curve (de hoofdcurve): cubic-bezier(.34, 1.56, .64, 1)
- Zachte curve: cubic-bezier(.22, 1, .36, 1)
- Elementen komen binnen: van translateY(22px) scale(.96) en opacity 0 naar normaal, met de spring.
- Knoppen bij indrukken: scale naar ongeveer .92 tot .96 en terugveren (.35s spring).
- Getallen die veranderen: kleine "bump" van scale .8 naar 1.
- Onderpanelen en sheets schuiven van onderen in met een kleine overshoot van maximaal 14px. Laat het paneel 80px onder het scherm doorlopen, zodat er bij het doorschieten nooit een gat of onderrand zichtbaar is.
- Modals: van translateY(-40%) scale(.9) naar het midden, met de spring.
- Stickers plakken erop: vallen van boven in, licht gedraaid, met de spring. Weghalen: omhoog wegdraaien en vervagen.
- Een "verborgen" tegel wiebelt rustig (rotatie ±2deg, scale 1.02, 2,6s loop) tot je erop tikt, en opent dan met een clip-path die uitzet.
- Grote dramatische momenten: hoofdletters die licht trillen (jitter in 2 stappen) of een knipperende flash op zwart.
- Toasts schuiven van boven in en weer weg, zwart vlak met witte tekst.
- Vasthouden-knoppen: een vlak dat van links naar rechts volloopt terwijl je vasthoudt.

## Interface-patronen
- Eén telefoon, één duidelijke actie per scherm. Grote raakvlakken.
- Keuzes als twee grote kleurvlakken die het scherm verdelen, elk met een smiley en een enorm woord.
- Menu-items: afgerond vlak (radius 18px) met links een gekleurde icoontegel (48×48, radius 14px, in een kleurpaar uit het palet) en rechts een titel in Barlow plus een kleine uitleg in Rubik.
- Segment-schakelaars: vlak met lage dekking, actieve optie gevuld; geen pill.
- Gebruik op iOS de haptics: een lichte tik bij gewone knoppen en een medium tik bij belangrijke momenten.

## Toon van de teksten
Nuchter, droog en een tikje brutaal. Kort en direct, geen uitroeptekens-overload, geen emoji's, niet cringe.