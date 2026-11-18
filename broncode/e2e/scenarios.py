"""Loopt de 9 testscenario's uit de briefing door op telefoonformaat.
Gebruik: npm run build && npx vite preview --port 4173 &  dan  python3 e2e/scenarios.py
Vereist: pip install playwright && playwright install chromium (of een lokale Chrome via CHROME=pad)."""
import asyncio, json, os, sys
from playwright.async_api import async_playwright, expect

BASE = os.environ.get('BASE', 'http://localhost:4173/')
CHROME = os.environ.get('CHROME')
SHOTS = os.environ.get('SHOTS', '/tmp/shots')
os.makedirs(SHOTS, exist_ok=True)
FIXED = '2026-11-17T10:00:00+01:00'  # dag 1 bij startdatum 2026-11-17
ok = []

def passed(n, msg):
    ok.append(n); print(f'  OK  scenario {n}: {msg}')

async def progress(pg):
    return json.loads(await pg.evaluate("localStorage.getItem('woordpost:voortgang')") or 'null')

async def shot(pg, name, full=False):
    await pg.wait_for_timeout(700)
    await pg.screenshot(path=f'{SHOTS}/{name}.png', full_page=full)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(**({'executable_path': CHROME} if CHROME else {}))
        ctx = await b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, timezone_id='Europe/Amsterdam')
        pg = await ctx.new_page()
        await pg.clock.set_fixed_time(FIXED)
        errors = []
        pg.on('pageerror', lambda e: errors.append(str(e)))

        # 1. Envelop openen, woord en spreekwoord lezen, kaart bewaren en terugvinden
        await pg.goto(BASE)
        await pg.get_by_role('button', name='Open je pakketje').click()
        await expect(pg.get_by_text('DRIE KAARTEN')).to_be_visible()
        await pg.get_by_role('button', name='DUUR WOORD').click()
        await expect(pg.get_by_role('heading', name='MEESMUILEN')).to_be_visible()
        await pg.get_by_role('button', name='Bewaar dit woord').click()
        await expect(pg.get_by_text('Bewaard.')).to_be_visible()
        await pg.get_by_role('button', name='Terug naar je pakketje').click()
        await pg.get_by_role('button', name='SPREEKWOORD').click()
        await expect(pg.get_by_text('MEN MOET DE HUID')).to_be_visible()
        await pg.get_by_role('button', name='Bewaar dit spreekwoord').click()
        await pg.goto(BASE + '#/bewaard')
        await pg.get_by_label('Zoek op woord, spreekwoord of betekenis').fill('glimlach')
        await expect(pg.locator('.menu-item')).to_have_count(1)
        await expect(pg.locator('.menu-item').first).to_contain_text('MEESMUILEN')
        await pg.get_by_label('Zoek op woord, spreekwoord of betekenis').fill('')
        await expect(pg.locator('.menu-item')).to_have_count(2)
        await shot(pg, 's1-bewaard')
        passed(1, 'pakket geopend, woord en spreekwoord bewaard en teruggevonden via zoeken')

        # 2. Ken ik al en herladen
        await pg.goto(BASE + '#/dag/1/woord')
        await pg.get_by_role('button', name='Ken ik al').click()
        await expect(pg.get_by_role('heading', name='DIFFUUS')).to_be_visible()
        await pg.reload()
        await expect(pg.get_by_role('heading', name='DIFFUUS')).to_be_visible()
        pr = await progress(pg)
        assert pr['days']['1']['replacements'] == ['W31'] and pr['words']['W01']['known'] == 1
        await shot(pg, 's2-reservewoord', True)
        passed(2, 'Ken ik al toont reservewoord Diffuus, blijft staan na herladen')

        # 3 + 4. Verkeerde lengte, foute gok, hint, herladen, goed raden
        await pg.goto(BASE + '#/dag/1/wildcard')
        field = pg.get_by_label('Jouw antwoord')
        await field.fill('mond')
        await pg.get_by_role('button', name='Doe een gok').click()
        await expect(pg.locator('#wc-msg')).to_contain_text('het woord heeft er 7')
        await expect(pg.get_by_label('Nog 3 van de 3 kansen')).to_be_visible()
        await field.fill('verhaal')
        await pg.get_by_role('button', name='Doe een gok').click()
        await expect(pg.locator('#wc-msg')).to_contain_text('Nog 2 kansen')
        await expect(field).to_have_value('')
        await pg.get_by_role('button', name='VRAAG EEN HINT').click()
        await pg.get_by_role('button', name='Toon de hint').click()
        await expect(pg.locator('.box.hint')).to_have_count(2)
        await shot(pg, 's3-hint')
        await pg.reload()
        await expect(pg.locator('.box.hint')).to_have_count(2)
        await expect(pg.get_by_label('Nog 2 van de 3 kansen')).to_be_visible()
        await expect(pg.get_by_role('button', name='VRAAG EEN HINT')).to_have_count(0)
        await field.fill('  GeRucht ')
        await pg.get_by_role('button', name='Doe een gok').click()
        await expect(pg.get_by_role('heading', name='GERADEN')).to_be_visible()
        await expect(pg.locator('.points-num')).to_have_text('+50')
        await expect(pg.get_by_text('Met hint')).to_be_visible()
        await shot(pg, 's3-resultaat', True)
        await pg.reload()
        await expect(pg.locator('.points-num')).to_have_text('+50')
        await expect(pg.get_by_label('Jouw antwoord')).to_have_count(0)
        passed(3, 'lengtefout kost geen poging, foute gok, hint met 2 letters, goed in poging 2 = 50 punten')
        passed(4, 'pogingen, hintletters en punten blijven gelijk na herladen tijdens en na de puzzel')

        # Deeltekst bevat nooit het antwoord
        await ctx.grant_permissions(['clipboard-read', 'clipboard-write'])
        await pg.get_by_role('button', name='Deel je resultaat').click()
        clip = await pg.evaluate('navigator.clipboard.readText()')
        assert 'gerucht' not in clip.lower() and 'Geraden in 2 van de 3 pogingen, met hint' in clip, clip
        await pg.get_by_role('button', name='Daag een vriend uit').click()
        clip2 = await pg.evaluate('navigator.clipboard.readText()')
        assert '#/puzzel/P01' in clip2 and 'gerucht' not in clip2.lower(), clip2
        share_url = clip2.split('\n')[-1]

        # 5. Drie keer fout op dag 2 (testdag)
        await pg.goto(BASE + '?testdag=2#/')
        await expect(pg.get_by_text('Testdag 2')).to_be_visible()
        await pg.get_by_role('button', name='Open je pakketje').click()
        await pg.locator('.pkg-tile', has_text='WILDCARD').click()
        for g in ['appel', 'peren', 'lepel']:
            await pg.get_by_label('Jouw antwoord').fill(g)
            await pg.get_by_role('button', name='Doe een gok').click()
        await expect(pg.get_by_role('heading', name='NIET GERADEN')).to_be_visible()
        await expect(pg.get_by_text('SPONS', exact=True)).to_be_visible()
        await expect(pg.get_by_text('Een spons neemt gemorst water op')).to_be_visible()
        await expect(pg.locator('.points-num')).to_have_text('+0')
        await shot(pg, 's5-niet-geraden', True)
        passed(5, 'drie fouten: uitleg en antwoord zichtbaar, 0 punten, invoer dicht')

        # 6. Zelfde puzzel via Archief en deel-URL: score telt één keer
        await pg.goto(BASE + '?testdag=3#/archief')
        await pg.get_by_role('button', name='Dag 1,').click()
        await pg.locator('.pkg-tile', has_text='WILDCARD').click()
        await expect(pg.locator('.points-num')).to_have_text('+50')
        await pg.goto(share_url.replace('http://localhost:4173/', BASE))
        await expect(pg.locator('.points-num')).to_have_text('+50')
        pr = await progress(pg)
        total = sum(x['points'] for x in pr['puzzles'].values() if x['status'] != 'playing')
        assert total == 50 and len(pr['puzzles']) == 2, pr['puzzles']
        await pg.goto(BASE + '#/puzzel/P30')
        await expect(pg.get_by_text('NOG NIET BESCHIKBAAR')).to_be_visible()
        await pg.goto(BASE + '#/puzzel/P99')
        await expect(pg.get_by_text('ONBEKENDE WILDCARD')).to_be_visible()
        # een nieuwe speler opent de link direct
        fresh = await b.new_context(viewport={'width': 390, 'height': 844}, timezone_id='Europe/Amsterdam')
        fp = await fresh.new_page(); await fp.clock.set_fixed_time('2026-11-20T10:00:00+01:00')
        await fp.goto(BASE + '#/puzzel/P01')
        await expect(fp.get_by_text('Ik reis van mond tot mond')).to_be_visible()
        await expect(fp.get_by_text('gerucht', exact=False)).to_have_count(0)
        await fresh.close()
        passed(6, 'Archief en deel-URL tonen hetzelfde resultaat, totaal blijft 50; toekomstig en onbekend ID geven een melding; vriend kan direct spelen')

        # 7. Blast from the Past op dag 8 (woord W01 bewaard op dag 1)
        await pg.goto(BASE + '?testdag=8#/')
        await pg.get_by_role('button', name='Open je pakketje').click()
        await expect(pg.get_by_text('VIER KAARTEN')).to_be_visible()
        await shot(pg, 's7-vier-kaarten')
        await pg.get_by_role('button', name='BLAST FROM THE PAST').click()
        await expect(pg.locator('.flip-front .h-word')).to_have_text('MEESMUILEN')
        await shot(pg, 's7-blast-voor')
        await pg.get_by_role('button', name='Draai om').click()
        await shot(pg, 's7-blast-achter')
        await pg.get_by_role('button', name='Wist ik nog').click()
        await pg.reload()
        await expect(pg.locator('.result-note')).to_be_visible()
        pr = await progress(pg)
        # W01 is als 'Ken ik al' gemarkeerd in scenario 2, dus telt niet als nieuw onthouden woord
        await pg.goto(BASE + '#/voortgang')
        await expect(pg.locator('.stat').nth(1)).to_contain_text('0')
        # tweede ronde met een woord dat de speler niet kende
        assert pr['days']['8']['blast'] == {'wordId': 'W01', 'result': 'knew'}
        await pg.evaluate("""() => { const p = JSON.parse(localStorage.getItem('woordpost:voortgang'));
            p.words.W02 = { opened: 2, saved: true, savedDay: 2, savedAt: 1 }; localStorage.setItem('woordpost:voortgang', JSON.stringify(p)); }""")
        await pg.goto(BASE + '?testdag=15#/')
        await pg.get_by_role('button', name='Open je pakketje').click()
        await pg.get_by_role('button', name='BLAST FROM THE PAST').click()
        await pg.get_by_role('button', name='Draai om').click()
        await pg.get_by_role('button', name='Wist ik nog').click()
        await pg.reload()
        await expect(pg.get_by_role('button', name='Wist ik nog')).to_have_count(0)
        await pg.goto(BASE + '#/voortgang')
        await expect(pg.locator('.stat').nth(1)).to_contain_text('1')
        await shot(pg, 's7-voortgang', True)
        passed(7, "Blast op dag 8 en 15; 'Wist ik nog' telt één keer, en niet voor een woord dat als 'Ken ik al' was gemarkeerd")

        # 8. Laadfout en beschadigde opslag
        before = await pg.evaluate("localStorage.getItem('woordpost:voortgang')")
        await pg.goto(BASE + '?simuleer=laadfout#/')
        await pg.reload()
        await expect(pg.get_by_text('NIET AANGEKOMEN')).to_be_visible()
        await shot(pg, 's8-laadfout')
        assert await pg.evaluate("localStorage.getItem('woordpost:voortgang')") == before
        await pg.get_by_role('button', name='Probeer opnieuw').click()
        await expect(pg.get_by_text('LEVEL 1')).to_be_visible()
        await pg.evaluate("localStorage.setItem('woordpost:voortgang', '{kapot')")
        await pg.reload()
        await expect(pg.get_by_text('laatst geldige kopie')).to_be_visible()
        await expect(pg.get_by_role('button', name='Level 1, 50 punten. Bekijk je voortgang')).to_be_visible()
        await pg.evaluate("localStorage.setItem('woordpost:voortgang','{kapot'); localStorage.setItem('woordpost:voortgang:backup','ook kapot')")
        await pg.reload()
        await expect(pg.get_by_text('onleesbaar')).to_be_visible()
        await pg.goto(BASE + '#/bewaard/woord/W05')
        await pg.get_by_role('button', name='Bewaar dit woord').click()
        await shot(pg, 's8-onleesbaar')
        assert await pg.evaluate("localStorage.getItem('woordpost:voortgang')") == '{kapot'
        await pg.evaluate("(v) => localStorage.setItem('woordpost:voortgang', v)", before)
        await pg.reload()
        passed(8, 'laadfout laat voortgang ongemoeid; kapotte opslag laadt de reservekopie; onleesbare opslag wordt niet overschreven')

        # 9. Zelfde Nederlandse datum = zelfde Wildcard, ongeacht tijdzone van het toestel
        seen = []
        for tz, t in [('America/Los_Angeles', '2026-11-18T22:30:00Z'), ('Asia/Tokyo', '2026-11-18T22:30:00Z'),
                      ('Europe/Amsterdam', '2026-11-18T22:30:00Z'), ('Europe/London', '2026-11-18T23:30:00Z')]:
            c = await b.new_context(viewport={'width': 390, 'height': 844}, timezone_id=tz)
            q = await c.new_page(); await q.clock.set_fixed_time(t)
            await q.goto(BASE)
            await q.get_by_role('button', name='Open je pakketje').click()
            await q.locator('.pkg-tile', has_text='WILDCARD').click()
            await expect(q.locator('.riddle')).to_be_visible()
            seen.append((tz, t, await q.locator('.meta').first.inner_text()))
            await c.close()
        print('     ', seen)
        assert seen[0][2] == seen[1][2] == seen[2][2] == 'WILDCARD #002' and seen[3][2] == 'WILDCARD #003'
        passed(9, 'om 23:30 Nederlandse tijd op 18 nov zien LA, Tokio en Amsterdam allemaal #002; na middernacht #003')

        # extra schermen
        await pg.goto(BASE + '#/archief'); await shot(pg, 'x-archief')
        await pg.goto(BASE + '#/voortgang')
        await pg.get_by_role('button', name='Kies een naam en character').click()
        await pg.get_by_label('Naam').fill('Sam')
        await pg.get_by_role('radio', name='Ster').click()
        await shot(pg, 'x-profiel')
        await pg.get_by_role('button', name='Bewaar profiel').click()
        await pg.goto(BASE + '#/'); await shot(pg, 'x-vandaag-profiel')
        await pg.goto(BASE + '#/bewaard/spreekwoord/S01')
        await pg.get_by_role('button', name='Herhaal dit spreekwoord').click()
        await pg.get_by_role('button', name='Toon de betekenis').click()
        await pg.get_by_role('button', name='Wist ik nog').click()
        await shot(pg, 'x-herhaling', True)
        pr = await progress(pg)
        assert pr['profile'] == {'name': 'Sam', 'character': 'ster'} and pr['proverbs']['S01']['remembered']
        print('JS-fouten:', errors or 'geen')
        await b.close()
    print(f'\n{len(set(ok))} van 9 scenario\'s geslaagd')

asyncio.run(main())
