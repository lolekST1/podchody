// Nagrania głosu maskotek przez Gemini TTS: npm run nagrania
// Dla każdej gry z "motyw.maskotka.glos" nagrywa brakujące zdania z tekstyMowy(),
// usuwa nieużywane pliki i zapisuje listę app/nagrania/<id>.json.
// Klucz: zmienna GEMINI_API_KEY albo proxy, które dokleja go samo — nigdy w kodzie.
// Wymaga ffmpeg (PCM z Gemini → mp3).
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { tekstyMowy, plikNagrania } from '../app/js/logika.js';

// fetch w Node omija HTTPS_PROXY, dopóki nie włączy się NODE_USE_ENV_PROXY — uruchamiamy się jeszcze raz.
if ((process.env.HTTPS_PROXY || process.env.https_proxy) && !process.env.NODE_USE_ENV_PROXY) {
  const r = spawnSync(process.execPath, process.argv.slice(1), { stdio: 'inherit', env: { ...process.env, NODE_USE_ENV_PROXY: '1' } });
  process.exit(r.status ?? 1);
}

const MODEL = 'gemini-2.5-flash-preview-tts';
const ADRES = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const STYL = 'Powiedz ciepło, wesoło i powoli, jak do trzylatka, po polsku: ';
const NARAZ = 3;
const KATALOG = new URL('../app/nagrania/', import.meta.url).pathname;

const czekaj = (ms) => new Promise((ok) => setTimeout(ok, ms));

async function nagraj(glos, tekst) {
  for (let proba = 1; ; proba++) {
    const odp = await fetch(ADRES, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...(process.env.GEMINI_API_KEY && { 'x-goog-api-key': process.env.GEMINI_API_KEY }) },
      body: JSON.stringify({
        contents: [{ parts: [{ text: STYL + tekst }] }],
        generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: glos } } } },
      }),
    });
    const dane = await odp.json().catch(() => ({}));
    const czesc = dane.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
    if (odp.ok && czesc) {
      const hz = Number(/rate=(\d+)/.exec(czesc.inlineData.mimeType)?.[1] ?? 24000);
      return { pcm: Buffer.from(czesc.inlineData.data, 'base64'), hz };
    }
    // 429 = limit zapytań, 5xx = przeciążenie, 400 = model czasem odpowiada tekstem zamiast głosem.
    const blad = `${odp.status} ${dane.error?.message ?? 'brak dźwięku w odpowiedzi'}`.slice(0, 200);
    if (proba >= 6 || !(odp.ok || [400, 429, 500, 503].includes(odp.status))) throw new Error(blad);
    const pauza = Number(/"retryDelay":\s*"(\d+)s"/.exec(JSON.stringify(dane))?.[1] ?? 0) * 1000 || 2000 * 2 ** proba;
    console.log(`  ponawiam za ${Math.round(pauza / 1000)} s (${blad})`);
    await czekaj(pauza);
  }
}

function doMp3({ pcm, hz }, plik) {
  return new Promise((ok, nie) => {
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 's16le', '-ar', String(hz), '-ac', '1', '-i', 'pipe:0',
      '-codec:a', 'libmp3lame', '-b:a', '48k', plik], { stdio: ['pipe', 'inherit', 'inherit'] });
    ff.on('error', nie);
    ff.on('close', (kod) => (kod === 0 ? ok() : nie(new Error(`ffmpeg zakończył się kodem ${kod}`))));
    ff.stdin.end(pcm);
  });
}

const gry = JSON.parse(readFileSync(new URL('../app/gry/index.json', import.meta.url), 'utf8')).gry
  .map((id) => JSON.parse(readFileSync(new URL(`../app/gry/${id}.json`, import.meta.url), 'utf8')));
let bledy = 0;

for (const gra of gry) {
  const glos = gra.motyw.maskotka?.glos;
  if (!glos) continue;
  const katalog = `${KATALOG}${gra.id}/`;
  mkdirSync(katalog, { recursive: true });
  const potrzebne = new Map(tekstyMowy(gra).map((t) => [plikNagrania(glos, t), t]));
  const brakujace = [...potrzebne].filter(([p]) => !existsSync(`${katalog}${p}.mp3`));
  console.log(`${gra.id} (${glos}): ${potrzebne.size} zdań, do nagrania ${brakujace.length}`);

  const kolejka = [...brakujace];
  await Promise.all(Array.from({ length: NARAZ }, async () => {
    for (let z; (z = kolejka.shift());) {
      const [plik, tekst] = z;
      try {
        await doMp3(await nagraj(glos, tekst), `${katalog}${plik}.mp3`);
        console.log(`  ✓ ${plik}  ${tekst}`);
      } catch (e) {
        bledy += 1;
        console.log(`  ✗ ${plik}  ${tekst}\n    ${e.message}`);
      }
    }
  }));

  for (const f of readdirSync(katalog)) {
    if (!potrzebne.has(f.replace(/\.mp3$/, ''))) { unlinkSync(`${katalog}${f}`); console.log(`  usunięte: ${f}`); }
  }
  const pliki = [...potrzebne.keys()].filter((p) => existsSync(`${katalog}${p}.mp3`)).sort();
  writeFileSync(`${KATALOG}${gra.id}.json`, `${JSON.stringify({ glos, pliki }, null, 2)}\n`);
}

if (bledy) {
  console.log(`\nNie udało się nagrać ${bledy} zdań — uruchom skrypt jeszcze raz, dogra tylko brakujące.`);
  process.exit(1);
}
