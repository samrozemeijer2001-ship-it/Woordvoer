#!/usr/bin/env node
// Zet Woordpost-testmaand.xlsx om naar de JSON die de app leest.
// Gebruik: node scripts/import-xlsx.mjs <invoer.xlsx> <uitvoer.json>
// Schrijft alleen als alles klopt. Bij fouten blijft de bestaande JSON staan.
import { unzipSync, strFromU8 } from 'fflate';
import { writeFileSync, renameSync, existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const [, , inPath = 'content/Woordpost-testmaand.xlsx', outPath = 'public/content.json'] = process.argv;

const SHEETS = {
  Dagplanning: ['dag', 'woord_id', 'spreekwoord_id', 'wildcard_id'],
  Woorden: ['id', 'woord', 'betekenis', 'voorbeeldzin', 'rol'],
  Spreekwoorden: ['id', 'spreekwoord', 'betekenis', 'situatie'],
  Wildcards: ['id', 'dag', 'raadsel', 'antwoord', 'letters', 'hintposities', 'uitleg'],
};

const errors = [];
const err = (sheet, row, msg) => errors.push(`${sheet}${row ? `, rij ${row}` : ''}: ${msg}`);

const clean = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();

// Kleine, afhankelijkheidsarme XLSX-lezer: werkt ook met bestanden uit Google Sheets, Numbers en generators.
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
const unxml = (s) => s.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (m, e) =>
  e[0] === '#' ? String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : (ENT[e] ?? m));
const attr = (tag, name) => { const m = tag.match(new RegExp(`\\b${name}="([^"]*)"`)); return m ? unxml(m[1]) : undefined; };
const texts = (xml) => [...xml.matchAll(/<(?:\w+:)?t\b[^>]*>([\s\S]*?)<\/(?:\w+:)?t>/g)].map((m) => unxml(m[1])).join('');
const colIndex = (ref) => { let n = 0; for (const ch of ref.replace(/\d+/g, '')) n = n * 26 + (ch.charCodeAt(0) - 64); return n; };

function openWorkbook(file) {
  const zip = unzipSync(new Uint8Array(readFileSync(file)));
  const get = (path) => { const k = Object.keys(zip).find((z) => z.toLowerCase() === path.replace(/^\//, '').toLowerCase()); return k ? strFromU8(zip[k]).replace(/^\uFEFF/, '').replace(/<(\/?)[A-Za-z_][\w.-]*:/g, '<$1') : null; };
  const resolveTarget = (base, target) => {
    if (target.startsWith('/')) return target.slice(1);
    const parts = base.split('/').slice(0, -1);
    for (const seg of target.split('/')) { if (seg === '..') parts.pop(); else if (seg !== '.') parts.push(seg); }
    return parts.join('/');
  };
  const rootRels = get('_rels/.rels') || '';
  const wbRel = [...rootRels.matchAll(/<Relationship\b[^>]*>/g)].map((m) => m[0]).find((t) => /officeDocument"/.test(attr(t, 'Type') + '"'));
  const wbPath = wbRel ? resolveTarget('', attr(wbRel, 'Target')) : 'xl/workbook.xml';
  const wbXml = get(wbPath);
  if (!wbXml) throw new Error('Geen geldig Excel-bestand: workbook ontbreekt');
  const relsPath = wbPath.replace(/[^/]+$/, (f) => `_rels/${f}.rels`);
  const rels = new Map([...(get(relsPath) || '').matchAll(/<Relationship\b[^>]*>/g)].map((m) => [attr(m[0], 'Id'), m[0]]));
  let shared = [];
  for (const r of rels.values()) if (/sharedStrings"?$/.test(attr(r, 'Type'))) {
    const xml = get(resolveTarget(wbPath, attr(r, 'Target'))) || '';
    shared = [...xml.matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) => texts(m[1]));
  }
  const sheets = {};
  for (const m of wbXml.matchAll(/<sheet\b[^>]*>/g)) {
    const name = attr(m[0], 'name');
    const rid = attr(m[0], 'r:id');
    const rel = rels.get(rid);
    if (!rel) continue;
    const xml = get(resolveTarget(wbPath, attr(rel, 'Target'))) || '';
    const rows = new Map();
    for (const rm of xml.matchAll(/<row\b([^>]*)>([\s\S]*?)<\/row>/g)) {
      const rnum = Number(attr(rm[1], 'r'));
      const cells = [];
      for (const cm of rm[2].matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
        const t = attr(cm[1], 't'); const ref = attr(cm[1], 'r'); const inner = cm[2] || '';
        const v = (inner.match(/<v>([\s\S]*?)<\/v>/) || [])[1];
        let val = '';
        if (t === 's') val = shared[Number(v)] ?? '';
        else if (t === 'inlineStr') val = texts(inner);
        else if (v != null) val = unxml(v);
        cells[colIndex(ref)] = val;
      }
      rows.set(rnum, cells);
    }
    sheets[name] = rows;
  }
  return sheets;
}

function readSheets(file) {
  const wb = openWorkbook(file);
  const out = {};
  for (const [name, cols] of Object.entries(SHEETS)) {
    const ws = wb[name];
    if (!ws) { err(name, 0, 'tabblad ontbreekt'); out[name] = []; continue; }
    const header = (ws.get(1) || []).map((h) => clean(h).toLowerCase());
    const idx = {};
    for (const col of cols) {
      const i = header.indexOf(col);
      if (i < 0) err(name, 1, `kolom "${col}" ontbreekt`);
      idx[col] = i;
    }
    const rows = [];
    for (const r of [...ws.keys()].sort((a, b) => a - b)) {
      if (r === 1) continue;
      const cells = ws.get(r);
      const rec = { _row: r };
      let any = false;
      for (const col of cols) {
        const v = idx[col] > 0 ? clean(cells[idx[col]]) : '';
        if (v) any = true;
        rec[col] = v;
      }
      if (any) rows.push(rec);
    }
    out[name] = rows;
  }
  return out;
}

function requireFields(sheet, rows, fields) {
  for (const r of rows) for (const f of fields) if (!r[f]) err(sheet, r._row, `veld "${f}" is leeg`);
}
function uniqueIds(sheet, rows, key = 'id') {
  const seen = new Map();
  for (const r of rows) {
    if (!r[key]) continue;
    if (seen.has(r[key])) err(sheet, r._row, `${key} "${r[key]}" komt ook voor op rij ${seen.get(r[key])}`);
    else seen.set(r[key], r._row);
  }
}
const toInt = (s) => (/^\d+$/.test(s) ? Number(s) : NaN);

let raw;
try { raw = readSheets(resolve(inPath)); }
catch (e) { console.error(`Kan ${inPath} niet lezen: ${e.message}. De bestaande ${outPath} is niet aangepast.`); process.exit(1); }

// Woorden
requireFields('Woorden', raw.Woorden, SHEETS.Woorden);
uniqueIds('Woorden', raw.Woorden);
for (const r of raw.Woorden) {
  const rol = r.rol.toLowerCase();
  if (r.rol && rol !== 'dagkaart' && rol !== 'reserve') err('Woorden', r._row, `rol "${r.rol}" moet "dagkaart" of "reserve" zijn`);
}
const words = raw.Woorden.map((r) => ({ id: r.id, woord: r.woord, betekenis: r.betekenis, voorbeeldzin: r.voorbeeldzin, rol: r.rol.toLowerCase() }));

// Spreekwoorden
requireFields('Spreekwoorden', raw.Spreekwoorden, SHEETS.Spreekwoorden);
uniqueIds('Spreekwoorden', raw.Spreekwoorden);
const proverbs = raw.Spreekwoorden.map((r) => ({ id: r.id, spreekwoord: r.spreekwoord, betekenis: r.betekenis, situatie: r.situatie }));

// Wildcards
requireFields('Wildcards', raw.Wildcards, SHEETS.Wildcards.filter((f) => f !== 'hintposities'));
uniqueIds('Wildcards', raw.Wildcards);
const puzzles = [];
for (const r of raw.Wildcards) {
  const answer = r.antwoord.trim();
  const letters = toInt(r.letters);
  const dag = toInt(r.dag);
  if (Number.isNaN(dag) || dag < 1) err('Wildcards', r._row, `dag "${r.dag}" is geen geldig dagnummer`);
  if (Number.isNaN(letters)) err('Wildcards', r._row, `letters "${r.letters}" is geen getal`);
  else if ([...answer].length !== letters) err('Wildcards', r._row, `"${answer}" heeft ${[...answer].length} tekens, maar letters zegt ${letters}`);
  if (/\s/.test(answer)) err('Wildcards', r._row, `antwoord "${answer}" bevat een spatie`);
  const pos = r.hintposities.split(',').map((s) => s.trim()).filter(Boolean).map(toInt);
  const expected = letters <= 5 ? 1 : 2;
  if (pos.length !== expected) err('Wildcards', r._row, `${letters} letters vraagt ${expected} hintpositie(s), gevonden: "${r.hintposities}"`);
  for (const p of pos) if (Number.isNaN(p) || p < 1 || p > letters) err('Wildcards', r._row, `hintpositie "${p}" ligt buiten 1 tot ${letters}`);
  if (new Set(pos).size !== pos.length) err('Wildcards', r._row, 'dubbele hintpositie');
  puzzles.push({ id: r.id, dag, raadsel: r.raadsel, antwoord: answer.toLowerCase(), letters, hintposities: pos, uitleg: r.uitleg });
}

// Dagplanning
requireFields('Dagplanning', raw.Dagplanning, SHEETS.Dagplanning);
uniqueIds('Dagplanning', raw.Dagplanning, 'dag');
const wordById = new Map(words.map((w) => [w.id, w]));
const provIds = new Set(proverbs.map((p) => p.id));
const puzById = new Map(puzzles.map((p) => [p.id, p]));
const days = [];
const usedWord = new Map(), usedProv = new Map(), usedPuz = new Map();
for (const r of raw.Dagplanning) {
  const dag = toInt(r.dag);
  if (Number.isNaN(dag) || dag < 1) { err('Dagplanning', r._row, `dag "${r.dag}" is geen geldig dagnummer`); continue; }
  const w = wordById.get(r.woord_id);
  if (!w) err('Dagplanning', r._row, `woord_id "${r.woord_id}" bestaat niet in Woorden`);
  else if (w.rol !== 'dagkaart') err('Dagplanning', r._row, `woord_id "${r.woord_id}" heeft rol "${w.rol}", verwacht "dagkaart"`);
  if (!provIds.has(r.spreekwoord_id)) err('Dagplanning', r._row, `spreekwoord_id "${r.spreekwoord_id}" bestaat niet in Spreekwoorden`);
  const p = puzById.get(r.wildcard_id);
  if (!p) err('Dagplanning', r._row, `wildcard_id "${r.wildcard_id}" bestaat niet in Wildcards`);
  else if (p.dag !== dag) err('Dagplanning', r._row, `wildcard "${p.id}" staat in Wildcards op dag ${p.dag}, hier op dag ${dag}`);
  for (const [map, key] of [[usedWord, 'woord_id'], [usedProv, 'spreekwoord_id'], [usedPuz, 'wildcard_id']]) {
    if (map.has(r[key])) err('Dagplanning', r._row, `${key} "${r[key]}" is ook ingepland op rij ${map.get(r[key])}`);
    else map.set(r[key], r._row);
  }
  days.push({ dag, woordId: r.woord_id, spreekwoordId: r.spreekwoord_id, wildcardId: r.wildcard_id });
}
days.sort((a, b) => a.dag - b.dag);
days.forEach((d, i) => { if (d.dag !== i + 1) err('Dagplanning', 0, `dagen lopen niet aaneen: dag ${i + 1} ontbreekt`); });
for (const p of puzzles) if (!usedPuz.has(p.id)) err('Wildcards', raw.Wildcards.find((r) => r.id === p.id)?._row, `wildcard "${p.id}" staat niet in Dagplanning`);

if (errors.length) {
  console.error(`Import gestopt, ${errors.length} fout(en). De bestaande ${outPath} is niet aangepast.\n`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}

// Waarschuw als een eerder geïmporteerd ID verdwijnt: voortgang met dat ID blijft bewaard, maar de kaart is dan niet meer te tonen.
if (existsSync(outPath)) {
  try {
    const prev = JSON.parse(readFileSync(outPath, 'utf8'));
    const now = new Set([...words, ...proverbs, ...puzzles].map((x) => x.id));
    const gone = [...(prev.words || []), ...(prev.proverbs || []), ...(prev.puzzles || [])].map((x) => x.id).filter((id) => !now.has(id));
    if (gone.length) console.warn(`Let op: deze ID's stonden in de vorige import en ontbreken nu: ${gone.join(', ')}`);
  } catch { /* vorige JSON onleesbaar, gewoon overschrijven */ }
}

const content = {
  version: 1,
  importedAt: new Date().toISOString(),
  source: inPath.split(/[\\/]/).pop(),
  days, words, proverbs, puzzles,
};
const tmp = outPath + '.tmp';
writeFileSync(tmp, JSON.stringify(content, null, 1));
renameSync(tmp, outPath);
const reserve = words.filter((w) => w.rol === 'reserve').length;
console.log(`Klaar: ${days.length} dagen, ${words.length} woorden (${reserve} reserve), ${proverbs.length} spreekwoorden, ${puzzles.length} Wildcards -> ${outPath}`);
