#!/usr/bin/env node
// Nagrania lektora (mp3) przez OpenAI TTS dla wszystkich kwestii, które gry mówią na głos.
// Gra odtwarza nagranie, a gdy go brak — czyta syntezą przeglądarki (app/js/mowa.js).
// Wzorowane na tools/generate-tts.mjs z gry Esperanta-Aventura.
//
// Użycie:
//   node scripts/generuj-mowe.mjs                                    # wszystkie gry
//   node scripts/generuj-mowe.mjs --gra stadnina-lucji
// Klucz: sekret sieciowy środowiska Claude (dokleja nagłówek Authorization do zapytań na
// api.openai.com — klucza nie widać w kontenerze) albo zmienna OPENAI_API_KEY na komputerze.
//   node scripts/generuj-mowe.mjs --dry-run                          # lista kwestii, bez API
//   ... --regen "kryjówka|Brawo"                                      # nagraj ponownie pasujące
//
// Bezpieczne do przerwania i ponownego uruchomienia: pomija kwestie z gotowym plikiem.
// Głos i styl lektora są w pliku gry (motyw.lektor) — zmiana głosu albo tekstu daje
// nową nazwę pliku, więc telefon nie odtworzy starego nagrania z pamięci podręcznej.

import { readFile, writeFile, mkdir, readdir, unlink, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { wszystkieKwestie } from '../app/js/kwestie.js';

const APP = path.resolve('app');
// Przypięta wersja modelu: alias bez daty może po cichu zmienić głos między nagraniami.
// Alternatywa: OPENAI_TTS_MODEL=gpt-audio-1.5 (model rozmowy z głosem, czyta przez czat;
// każde nagranie sprawdzamy z jego transkrypcją, bo potrafi zmienić słowo).
const MODEL = process.env.OPENAI_TTS_MODEL ?? 'gpt-4o-mini-tts-2025-12-15';
const API = 'https://api.openai.com/v1/audio/speech';
const API_CZAT = 'https://api.openai.com/v1/chat/completions';
const czat = MODEL.startsWith('gpt-audio');
const porownaj = (t) => t.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const ROWNOLEGLE = 4;

const ZASADY = `You are the narrator of a Polish children's treasure-hunt game.
Speak ONLY in Polish, with native, natural Polish pronunciation — like a professional Polish voice actor
recording a children's audiobook. Never use English pronunciation or English intonation.
Read exactly the given text: do not add, skip or translate any words.
Read numbers as Polish words. Pronounce Polish sounds carefully: ą, ę, ł, ś, ć, ź, ż, rz, sz, cz, dż.
Rolled Polish "r". Short natural pauses after commas and full stops. Clear, warm, friendly, never shouting.`;

const argumenty = process.argv.slice(2);
const opcja = (nazwa) => { const i = argumenty.indexOf(nazwa); return i > -1 ? argumenty[i + 1] : null; };
const dryRun = argumenty.includes('--dry-run');
const tylkoGra = opcja('--gra');
const regen = opcja('--regen') ? new RegExp(opcja('--regen'), 'i') : null;

const istnieje = (p) => stat(p).then(() => true, () => false);

function nazwaPliku(lektor, tekst) {
  const hash = createHash('sha256').update(`${MODEL}|${lektor.glos}|${lektor.tempo}|${lektor.styl}|${tekst}`).digest('hex').slice(0, 12);
  return `${hash}.mp3`;
}

async function zapytanie(klucz, url, body) {
  for (let proba = 1; ; proba++) {
    const odp = await fetch(url, {
      method: 'POST',
      headers: { ...(klucz ? { Authorization: `Bearer ${klucz}` } : {}), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (odp.ok) return odp;
    const blad = await odp.text().catch(() => '');
    if (odp.status === 401) throw new Error('OpenAI 401: brak klucza — ustaw sekret sieciowy dla api.openai.com albo zmienną OPENAI_API_KEY');
    if (proba >= 3 || (odp.status < 500 && odp.status !== 429)) throw new Error(`OpenAI ${odp.status}: ${blad.slice(0, 200)}`);
    await new Promise((r) => setTimeout(r, 2000 * proba));
  }
}

async function nagraj(klucz, lektor, tekst) {
  const styl = `${ZASADY}\n\nCharacter and style (in Polish): ${lektor.styl}`;
  if (!czat) {
    const body = { model: MODEL, voice: lektor.glos, input: tekst, response_format: 'mp3', speed: lektor.tempo ?? 1 };
    if (MODEL.startsWith('gpt-4o-mini-tts')) body.instructions = styl;
    return Buffer.from(await (await zapytanie(klucz, API, body)).arrayBuffer());
  }
  for (let proba = 1; proba <= 3; proba++) {
    const odp = await zapytanie(klucz, API_CZAT, {
      model: MODEL, modalities: ['text', 'audio'], audio: { voice: lektor.glos, format: 'mp3' },
      messages: [
        { role: 'system', content: `You are a voice actor. ${styl}\nRead the user's message aloud exactly, word for word, and say nothing else.` },
        { role: 'user', content: tekst },
      ],
    });
    const audio = (await odp.json()).choices[0].message.audio;
    if (porownaj(audio.transcript ?? '') === porownaj(tekst)) return Buffer.from(audio.data, 'base64');
    console.warn(`    ↻ model powiedział co innego: „${audio.transcript}” — próba ${proba + 1}`);
  }
  throw new Error('model nie odczytał tekstu dosłownie');
}

async function main() {
  const klucz = process.env.OPENAI_API_KEY;
  if (!klucz && !dryRun) console.log('Brak OPENAI_API_KEY w zmiennych — zakładam sekret sieciowy środowiska (nagłówek dokleja serwer pośredniczący).');
  const ids = JSON.parse(await readFile(path.join(APP, 'gry/index.json'), 'utf8')).gry.filter((id) => !tylkoGra || id === tylkoGra);
  let nowe = 0, pominiete = 0, bledy = 0;

  for (const id of ids) {
    const gra = JSON.parse(await readFile(path.join(APP, `gry/${id}.json`), 'utf8'));
    const lektor = gra.motyw.lektor;
    if (!lektor) { console.log(`— ${id}: brak motyw.lektor, pomijam`); continue; }
    const katalog = path.join(APP, 'audio', id);
    await mkdir(katalog, { recursive: true });
    const kwestie = wszystkieKwestie(gra);
    console.log(`\n${gra.tytul}: ${kwestie.length} kwestii, głos ${lektor.glos} (${lektor.plec ?? '?'})`);

    const manifest = {};
    const zadania = [];
    for (const tekst of kwestie) {
      const plik = nazwaPliku(lektor, tekst);
      const sciezka = path.join(katalog, plik);
      manifest[tekst] = `audio/${id}/${plik}`;
      if (!(regen?.test(tekst)) && await istnieje(sciezka)) { pominiete++; continue; }
      if (dryRun) { console.log(`  [dry-run] ${tekst}`); nowe++; continue; }
      zadania.push({ tekst, sciezka });
    }

    const pracownik = async () => {
      while (zadania.length) {
        const { tekst, sciezka } = zadania.shift();
        try {
          await writeFile(sciezka, await nagraj(klucz, lektor, tekst));
          nowe++;
          console.log(`  ✓ ${tekst}`);
        } catch (e) {
          bledy++;
          delete manifest[tekst]; // bez pliku nie ma wpisu — gra użyje syntezy
          console.error(`  ✗ ${tekst}\n    ${e.message}`);
        }
      }
    };
    await Promise.all(Array.from({ length: ROWNOLEGLE }, pracownik));

    if (!dryRun) {
      const posortowany = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b, 'pl')));
      await writeFile(path.join(katalog, 'manifest.json'), `${JSON.stringify(posortowany, null, 2)}\n`);
      // Nagrania starych wersji tekstów są już niepotrzebne — nie wozimy ich w repo.
      const uzywane = new Set(Object.values(posortowany).map((p) => path.basename(p)));
      for (const f of await readdir(katalog)) {
        if (f.endsWith('.mp3') && !uzywane.has(f)) await unlink(path.join(katalog, f));
      }
    }
  }
  console.log(`\nGotowe: ${nowe} nowych, ${pominiete} już było, ${bledy} błędów.`);
  if (bledy) process.exitCode = 1;
}

main();
