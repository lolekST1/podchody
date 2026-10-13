#!/usr/bin/env node
// Sprawdza nagrania lektora: dekoduje każde mp3 w przeglądarce (Web Audio) i mierzy
// głośność i długość. OpenAI TTS potrafi oddać prawie ciche nagranie albo „dogadać”
// coś od siebie (za długie). Z --usun kasuje podejrzane pliki — ponowne
// `node scripts/generuj-mowe.mjs` nagra je od nowa.
//
// Użycie: node scripts/sprawdz-nagrania.mjs [--usun]
import { chromium } from '@playwright/test';
import { readFile, readdir, unlink } from 'node:fs/promises';
import path from 'node:path';

const APP = path.resolve('app');
const usun = process.argv.includes('--usun');
const przegladarka = await chromium.launch();
const strona = await przegladarka.newPage();
await strona.setContent('<p>sprawdzanie</p>');

let zle = 0, wszystkie = 0;
for (const id of await readdir(path.join(APP, 'audio')).catch(() => [])) {
  const manifest = JSON.parse(await readFile(path.join(APP, 'audio', id, 'manifest.json'), 'utf8').catch(() => '{}'));
  for (const [tekst, plik] of Object.entries(manifest)) {
    wszystkie++;
    const dane = (await readFile(path.join(APP, plik))).toString('base64');
    const wynik = await strona.evaluate(async (b64) => {
      const bajty = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      const ctx = new OfflineAudioContext(1, 1, 44100);
      const bufor = await ctx.decodeAudioData(bajty.buffer);
      const kanal = bufor.getChannelData(0);
      let szczyt = 0;
      for (let i = 0; i < kanal.length; i++) szczyt = Math.max(szczyt, Math.abs(kanal[i]));
      return { czas: bufor.duration, szczyt };
    }, dane);
    // Polski lektor dla dzieci: ok. 12–15 znaków na sekundę; daleko poza tym = coś nie tak.
    const oczekiwany = tekst.length / 13;
    const problem = wynik.szczyt < 0.05 ? 'prawie cisza'
      : wynik.czas < 0.35 ? 'za krótkie'
      : wynik.czas > oczekiwany * 2.6 + 2.5 ? 'za długie' : null;
    if (problem) {
      zle++;
      console.log(`✗ ${id}: ${problem} (${wynik.czas.toFixed(1)} s, szczyt ${wynik.szczyt.toFixed(2)}) — ${tekst}`);
      if (usun) await unlink(path.join(APP, plik));
    }
  }
}
await przegladarka.close();
console.log(`\nSprawdzono ${wszystkie} nagrań, podejrzanych: ${zle}${usun && zle ? ' (usunięte — uruchom generuj-mowe.mjs ponownie)' : ''}.`);
if (zle) process.exitCode = 1;
