#!/usr/bin/env node
// Próbki lektora z Google Cloud Text-to-Speech do porównania z OpenAI (podglad/probki/).
// Te same dwa zdania co próbki OpenAI: Remek (głos męski) i Zuzia (głos żeński), w dwóch
// rodzinach głosów Google: Chirp 3 HD (gotowe głosy, bez opisu postaci) i Gemini TTS
// (głos sterowany opisem stylu, jak gpt-4o-mini-tts).
//
// Użycie: GOOGLE_TTS_API_KEY=... node scripts/probki-google.mjs
import { writeFile, mkdir } from 'node:fs/promises';

const KLUCZ = process.env.GOOGLE_TTS_API_KEY;
if (!KLUCZ) { console.error('Brak GOOGLE_TTS_API_KEY'); process.exit(1); }
const API = 'https://texttospeech.googleapis.com/v1';
const PROBKI = [
  { plik: 'remek', glosy: ['Puck', 'Charon'], styl: 'Mów po polsku jak ciepły, wesoły chłopięcy głos małego tygryska: powoli, prosto i bardzo wyraźnie, jak do trzylatka.',
    tekst: 'Wrrrum! Remku, tygrysy wsiadły na motory i schowały skarb! Pomożesz go znaleźć?' },
  { plik: 'zuzia', glosy: ['Leda', 'Kore'], styl: 'Mów po polsku słodkim, łagodnym, przytulnym dziewczęcym głosem pandy, powoli i czule, jak do siedmiolatki.',
    tekst: 'Cześć! Jestem Panda Pyzia. Schowałam skarb w bambusowym lesie. Pomożesz go znaleźć?' },
];
const MODELE_GEMINI = ['gemini-2.5-pro-tts', 'gemini-2.5-flash-tts'];

async function syntezuj(body) {
  const odp = await fetch(`${API}/text:synthesize?key=${KLUCZ}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  const j = await odp.json();
  if (!odp.ok) throw new Error(`${odp.status}: ${JSON.stringify(j.error ?? j).slice(0, 300)}`);
  return Buffer.from(j.audioContent, 'base64');
}

await mkdir('podglad/probki', { recursive: true });
// Jakie polskie głosy Chirp 3 HD są naprawdę dostępne — nazwy bywają zmieniane.
const lista = await (await fetch(`${API}/voices?languageCode=pl-PL&key=${KLUCZ}`)).json();
const chirp = (lista.voices ?? []).filter((v) => v.name.includes('Chirp3-HD')).map((v) => `${v.name} (${v.ssmlGender})`);
console.log(`Polskie głosy Chirp 3 HD: ${chirp.length ? chirp.join(', ') : 'brak'}`);

for (const p of PROBKI) {
  for (const glos of p.glosy) {
    const zapisz = async (nazwa, body) => {
      try { await writeFile(`podglad/probki/${p.plik}-${nazwa}.mp3`, await syntezuj(body)); console.log(`✓ ${p.plik}-${nazwa}`); }
      catch (e) { console.log(`✗ ${p.plik}-${nazwa}: ${e.message}`); }
    };
    await zapisz(`C-google-chirp3hd-${glos}`, {
      input: { text: p.tekst }, voice: { languageCode: 'pl-PL', name: `pl-PL-Chirp3-HD-${glos}` }, audioConfig: { audioEncoding: 'MP3' },
    });
    for (const model of MODELE_GEMINI) {
      await zapisz(`D-${model}-${glos}`, {
        input: { text: p.tekst, prompt: p.styl }, voice: { languageCode: 'pl-PL', name: glos, modelName: model }, audioConfig: { audioEncoding: 'MP3' },
      });
    }
  }
}
