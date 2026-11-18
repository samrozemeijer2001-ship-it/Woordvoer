Bouw een werkende, Nederlandstalige webapp genaamd Woordpost. Ik voeg mijn Button Petite-brandguide en het Excel-bestand Woordpost-testmaand.xlsx toe. Gebruik de brandguide als visuele referentie en het Excel-bestand als bron voor de kaarten, puzzels en dagplanning.

Ik wil de app kunnen openen, gebruiken en testen. Maak daarom een werkende versie met de echte inhoud uit Excel en laat een preview zien als je omgeving dat ondersteunt.

## 1. Het idee

Woordpost is een dagelijks taalpakketje dat je op je telefoon opent. Elke dag krijg je:

- Eén duur woord, met een betekenis in gewone taal en een herkenbare voorbeeldzin.
- Eén spreekwoord, met een betekenis in gewone taal en een situatie waarin je het kunt gebruiken.
- Eén Wildcard, een cryptische woordpuzzel die voor alle spelers op die dag hetzelfde is.
- Af en toe een vierde, gouden kaart genaamd Blast from the Past, met een woord dat je eerder hebt bewaard.

Het openen van de envelop moet voelen als een klein dagelijks ritueel. De losse kaarten moeten makkelijk en snel te lezen zijn. De Wildcard is het onderdeel waar je langer bij blijft hangen en dat je naar vrienden kunt sturen.

Dit is een testversie voor 30 dagen. Iedereen kan direct spelen. Bewaar persoonlijke voortgang lokaal in dezelfde browser. Accounts, inloggen, cloudsync, profielkeuze en foto-upload vallen buiten deze versie.

## 2. Techniek en structuur

Gebruik React, TypeScript en Vite als je vanuit een leeg project begint. Als het bestaande project al een andere stack gebruikt, werk dan binnen die stack.

Scheid de geïmporteerde kaartinhoud, de spelregels en de persoonlijke voortgang. Gebruik de vaste ID’s uit Excel om kaarten, puzzels, scores en voortgang aan elkaar te koppelen. De app moet kunnen doorgroeien naar meer inhoud en eventueel later naar accounts.

Maak de app mobile-first. Zorg dat hij ook prettig werkt op desktop. Gebruik toegankelijke knoppen en invoervelden met duidelijke labels, zichtbare focus en feedback in tekst. Houd animaties kort en respecteer de instelling voor minder beweging.

## 3. Button Petite-stijl

Volg mijn bijgevoegde brandguide. Gebruik zware, compacte koppen, korte teksten, ronde kaarten en krachtige effen kleurvlakken. Geef de grote speelse knoppen een donkere, vaste onderrand zoals in de brandguide. Gebruik de gele Button Petite-smiley als zegel op de envelop.

Gebruik deze kleurverdeling binnen de bestaande kleurparen:

- Paper als basis.
- Geel voor de envelop en de gouden bonuskaart.
- Mint voor het dure woord.
- Lichtblauw voor het spreekwoord.
- Kobalt voor de Wildcard.
- Mint voor het positieve resultaat, met geel voor de verdiende punten.

Laat de kleurvlakken en characters het beeld bepalen. Vermijd fotografie, papiertextuur en decoratie die de schermen druk maakt. De characters horen bij het ontwerp. De speler hoeft er geen te kiezen. Houd het aantal tekstlabels laag en gebruik duidelijke Nederlandse knopteksten, zoals ‘Open je pakketje’, ‘Doe een gok’ en ‘Daag een vriend uit’.

## 4. Navigatie

Gebruik drie vaste tabs onderaan:

- Vandaag
- Bewaard
- Archief

Het huidige level is bovenaan Vandaag zichtbaar. Tik erop om het scherm Voortgang te openen. Gebruik bij kaartdetails een duidelijke manier om terug te gaan naar het pakketje of de tab waar je vandaan kwam.

## 5. Vandaag en de envelop

Bij het eerste bezoek land je direct op Vandaag. Als het pakketje voor die dag nog dicht is, zie je een grote gele envelop met het smileyzegel en de knop ‘Open je pakketje’.

Bij het openen gaat de envelop kort open en verschijnen de drie reguliere kaarten:

1. Duur woord
2. Spreekwoord
3. Wildcard

Alleen op een bonusdag verschijnt Blast from the Past als vierde kaart. Toon op het overzicht welk soort kaart het is. Het woord of spreekwoord zelf wordt zichtbaar zodra je die kaart opent. ‘Schertsend’ is bijvoorbeeld de inhoud van Duur woord en krijgt geen eigen tegel in het pakketoverzicht.

Bij terugkomst op dezelfde dag blijft het pakket geopend als je het al hebt geopend. Laat zien welke kaarten je hebt bekeken en of je de Wildcard al hebt afgerond.

## 6. Duur woord

Toon het woord als grote titel, met de korte betekenis en de voorbeeldzin uit Excel. Gebruik de goedgekeurde teksten uit het bestand. Houd de uitleg in gewone taal. Ga de betekenis niet automatisch herschrijven of uitbreiden.

Acties op de kaart:

- Bewaar of verwijder uit Bewaard.
- Deel het woord met de betekenis en eventueel de voorbeeldzin.
- ‘Ken ik al’ toont een ongezien reservewoord, zolang er nog een beschikbaar is. Leg de keuze voor die dag vast, zodat herladen hetzelfde vervangende woord toont. Bied bij een lege reservevoorraad een korte, duidelijke melding.
- ‘Zelf gebruikt’ laat de speler aangeven dat die het woord zelf in een gesprek of tekst heeft gebruikt.

Houd bij welke woorden geopend zijn, welke de speler al kende, welke zijn bewaard en welke zelf gebruikt zijn. Gebruik daarvoor per status de vaste woord-ID.

## 7. Spreekwoord

Toon het spreekwoord, de betekenis en de herkenbare gebruikssituatie uit Excel. De kaart is bedoeld om te lezen en kan worden bewaard en gedeeld.

Gebruik de bestaande tekst uit Excel. Bijvoorbeeld bij een ouder spreekwoord met een onbekend woord blijft de korte uitleg van dat woord onderdeel van de betekenis.

## 8. De dagelijkse Wildcard

Iedereen krijgt op dezelfde kalenderdag hetzelfde raadsel, hetzelfde antwoord en dezelfde vaste hintletters. Bereken het dagnummer vanuit één instelbare startdatum en de tijdzone Europe/Amsterdam. Het eerste bezoek of de installatie van een individuele speler mag de planning niet verschuiven.

Toon op het puzzelscherm:

- Het cryptische raadsel.
- Het aantal letters en één vakje per letter.
- Het aantal resterende kansen.
- Een duidelijk antwoordveld en de knop ‘Doe een gok’.
- De knop ‘Vraag een hint’, zolang de hint nog beschikbaar is.

De spelregels:

- Iedere speler krijgt drie geldige pogingen.
- Een leeg antwoord of een antwoord met het verkeerde aantal letters kost geen poging. Geef in dat geval een korte melding.
- Vergelijk zonder hoofdletterverschil en negeer spaties aan het begin en eind.
- Na een fout antwoord blijft het raadsel zichtbaar. Geef duidelijk aan hoeveel kansen over zijn en laat de speler makkelijk opnieuw typen. Geef geen letterfeedback op losse pogingen.
- Iedere speler kan één keer een hint gebruiken. Bij een antwoord tot en met vijf letters verschijnt één letter. Vanaf zes letters verschijnen twee letters. Gebruik de posities uit Excel, geteld vanaf 1.
- Een hint kost geen poging. Maak vooraf duidelijk dat een goed antwoord met hint 25 punten minder oplevert.
- Onthulde letters en resterende kansen blijven na herladen staan.

Punten:

| Correct bij | Zonder hint | Met hint |
| Eerste poging | 100 | 75 |
| Tweede poging | 75 | 50 |
| Derde poging | 50 | 25 |

Na drie foute pogingen krijgt de speler nul punten. Rond de puzzel na een juist antwoord of drie fouten af en sluit de invoer. Per puzzel-ID mag maximaal één resultaat punten opleveren. Een reload, oude link of bezoek via Archief herstart de puzzel niet.

## 9. Resultaat en delen met vrienden

Na afloop toont het resultaatscherm:

- Of je het woord hebt geraden.
- Het juiste antwoord en de uitleg waarom het bij het raadsel past.
- Je verdiende punten.
- Het aantal gebruikte pogingen en of je een hint hebt gebruikt.
- Je huidige level en hoeveel punten nog nodig zijn voor het volgende level.

Begin op level 1 en verhoog het level iedere 300 punten. Bereken totaalpunten en level uit afgeronde puzzelresultaten.

Voeg twee deelacties toe:

- ‘Deel je resultaat’ deelt bijvoorbeeld ‘Woordpost · Wildcard #012 · Geraden in 2 van de 3 pogingen · zonder hint · 75 punten’. Het antwoord staat nooit in de gedeelde uitslag. Bij drie fouten kun je de uitslag ook delen.
- ‘Daag een vriend uit’ deelt een URL met het vaste puzzel-ID. De ontvanger kan die puzzel direct spelen, zonder account, ook als de link pas een paar dagen later wordt geopend.

Gebruik het systeemdeelmenu waar beschikbaar en bied anders een kopieeractie aan. Een oude deel-URL opent die specifieke puzzel en verandert de huidige dagpost niet. Een gedeelde link en dezelfde puzzel via Vandaag of Archief gebruiken dezelfde lokale voortgang. Bij een onbekend of toekomstig puzzel-ID toon je een korte melding en een terugknop.

De antwoorden zitten voor deze lokale test in de appdata. Houd ze uit het zichtbare puzzelscherm en uit gedeelde links of resultaten. Er is geen aanvullende servercontrole nodig voor deze test.

## 10. Blast from the Past

Laat af en toe een vierde, gouden kaart verschijnen, ongeveer één keer per week zodra er een geschikt woord beschikbaar is.

- Kies uit woorden die de speler minstens zeven dagen geleden heeft bewaard.
- Houd de keuze voor de betreffende dag stabiel, ook bij herladen.
- Toon op de voorkant alleen het woord. Laat de speler eerst zelf bedenken wat het betekent.
- Toon na omdraaien de betekenis en een voorbeeld. Gebruik de voorbeeldzin uit Excel als er geen tweede zin is.
- Bied ‘Wist ik nog’ en ‘Nog eens laten terugkomen’ aan.
- ‘Wist ik nog’ laat het woord één keer meetellen bij onthouden woorden, zolang het nooit als ‘Ken ik al’ is gemarkeerd.
- ‘Nog eens laten terugkomen’ laat het woord beschikbaar voor een volgende bonuskaart.
- Verschijnt er een gouden kaart, dan bevat het pakket ook gewoon het nieuwe woord, het spreekwoord en de Wildcard van die dag.

## 11. Bewaard

Maak een overzicht van opgeslagen woorden en spreekwoorden. Laat zoeken op woord, spreekwoord en betekenis. Het overzicht moet ook goed werken als de collectie nog leeg is.

Vanuit Bewaard kun je:

- De volledige kaart opnieuw openen.
- De kaart delen of uit Bewaard verwijderen.
- Bij een spreekwoord een korte herhaling starten. Toon eerst alleen het spreekwoord, laat de speler de betekenis bedenken en onthul die daarna. De speler kan aangeven of die het nog wist.

Een kaart uit Bewaard verwijderen mag de ontdekking, leerhistorie of punten niet wissen.

## 12. Archief

Toon afgelopen dagen met de datum en of het pakket is geopend. Een gemist pakket kun je later alsnog openen. Toekomstige dagpost is nog gesloten. Na dag 30 verschijnt op Vandaag een duidelijke melding dat de testmaand is afgelopen. Reeds vrijgegeven pakketjes en afgeronde puzzels blijven beschikbaar in Archief.

Ondersteun ook de periode vóór de ingestelde startdatum met een duidelijke melding wanneer de eerste dagpost beschikbaar komt.

## 13. Voortgang en woordenschat

Maak een scherm dat laat zien wat je sinds je begon hebt gedaan en geleerd. Toon:

- Huidig level, totaalpunten en punten tot het volgende level.
- Woorden ontdekt: het aantal unieke woorden waarvan je de inhoud hebt geopend.
- Nieuwe woorden onthouden: het aantal unieke woorden dat je bij een latere herhaling met ‘Wist ik nog’ hebt gemarkeerd en dat je niet als ‘Ken ik al’ hebt aangegeven.
- Woorden zelf gebruikt: het aantal unieke woorden waarvoor ‘Zelf gebruikt’ is aangevinkt.
- Spreekwoorden ontdekt: het aantal unieke spreekwoorden dat je hebt geopend.
- Spreekwoorden onthouden: het aantal unieke spreekwoorden dat je tijdens een herhaling naar eigen inschatting nog wist.

Gebruik duidelijke labels. ‘Onthouden’ is wat de speler zelf heeft aangegeven bij een herhaling. Alleen een kaart openen of bewaren telt als ontdekken of bewaren. Bij een nieuwe speler zien de statistieken er leeg uit met echte nullen. Voeg geen fictieve voorbeeldscores toe aan het profiel.

## 14. Lokale opslag en laadfouten

Bewaar alles in dezelfde browser met stabiele kaart- en puzzel-ID’s. Sla minimaal op:

- Geopende dagpakketjes en kaarten.
- Status per woord en spreekwoord, inclusief bewaard, bekend, onthouden en zelf gebruikt waar van toepassing.
- Het gekozen reservewoord per dag.
- De gekozen bonuskaart en het herhaalresultaat.
- Wildcard-pogingen, hintgebruik en afgeronde resultaten.

Houd persoonlijke voortgang gescheiden van kaartinhoud en dagplanning. Gebruik een versieveld en bewaar een laatst geldige lokale kopie. Valideer wat je inleest. Een mislukte dagpost, ongeldige link, kapotte import of fout tijdens het lezen mag een bestaande stand nooit vervangen door lege gegevens. Probeer bij beschadigde gegevens de laatst geldige kopie te laden. Als lezen of schrijven niet lukt, geef dat duidelijk aan. Geef alleen aan dat iets is bewaard als de schrijfactie gelukt is.

Toon bij de opslaginformatie dat de voortgang aan deze browser is gekoppeld. Bij het wissen van browsergegevens of bij overstappen naar een ander toestel is de voortgang niet automatisch beschikbaar.

## 15. Excel-import

Gebruik het aangeleverde Woordpost-testmaand.xlsx. De eerste rij bevat de kolomnamen:

- Dagplanning: dag, woord_id, spreekwoord_id, wildcard_id
- Woorden: id, woord, betekenis, voorbeeldzin, rol
- Spreekwoorden: id, spreekwoord, betekenis, situatie
- Wildcards: id, dag, raadsel, antwoord, letters, hintposities, uitleg

De Excel bevat 30 dagpakketten, 45 woorden, 45 spreekwoorden en 30 Wildcards. Woorden met rol ‘reserve’ zijn voor ‘Ken ik al’. Gebruik voor de dagelijkse kaarten de verwijzingen uit Dagplanning. De extra spreekwoorden buiten de planning zijn voorraad.

Maak een herhaalbaar script dat de XLSX omzet naar JSON voor de app. Valideer op unieke ID’s, ontbrekende verplichte velden, geldige dagverwijzingen, overeenkomende puzzeldagen, letteraantallen en geldige hintposities. Hintposities staan in één kolom, gescheiden door een komma, en zijn ééngebaseerd. Wijs fouten bij voorkeur aan met tabblad en rij. Verander de vaste ID’s niet tijdens de import.

Gebruik de geïmporteerde JSON in de app. De browser hoeft de XLSX niet live te openen. Maak het mogelijk de inhoud vanuit een bijgewerkt Excel-bestand opnieuw te importeren zonder voortgang met bestaande ID’s kwijt te raken.

## 16. Opleveren en controleren

Lever de werkende app op met de echte geïmporteerde inhoud. Voeg een korte README toe met:

- Hoe ik de app start.
- Hoe ik de Excel opnieuw importeer.
- Waar ik de gezamenlijke startdatum instel.
- Hoe ik lokaal een dag kan testen zonder de openbare dagplanning te wijzigen.

Controleer de app op telefoonformaat. Loop in elk geval deze scenario’s na:

1. Envelop openen, woord en spreekwoord lezen, kaart bewaren en terugvinden.
2. ‘Ken ik al’ gebruiken en controleren dat hetzelfde reservewoord na herladen blijft staan.
3. Een verkeerd aantal letters invoeren, een geldige foute gok doen, een hint vragen en daarna goed raden.
4. Herladen tijdens de Wildcard en na de uitslag. Pogingen, hintletters en punten blijven gelijk.
5. Drie keer fout raden, de uitleg zien en nul punten krijgen.
6. Dezelfde eerdere puzzel via Archief en via een deel-URL openen. De score telt één keer.
7. Een woord via Blast from the Past herhalen en controleren dat het aantal onthouden woorden één keer omhooggaat.
8. Een laadfout simuleren terwijl er al voortgang bestaat. De opgeslagen voortgang blijft behouden.
9. Controleren dat spelers op dezelfde Nederlandse kalenderdatum dezelfde Wildcard zien.

Geef na het bouwen kort aan welke scenario’s je hebt gecontroleerd en wat ik nog moet instellen om met vrienden aan de testmaand te beginnen.