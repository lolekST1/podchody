// Generuje ikony PNG (iOS nie przyjmuje SVG jako ikony ekranu głównego) z ikony.svg.
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
const svg = readFileSync('app/ikony/ikona.svg', 'utf8');
const przegladarka = await chromium.launch();
for (const rozmiar of [180, 192, 512]) {
  const strona = await przegladarka.newPage({ viewport: { width: rozmiar, height: rozmiar } });
  await strona.setContent(`<style>html,body{margin:0}svg{width:${rozmiar}px;height:${rozmiar}px;display:block}</style>${svg}`);
  await strona.screenshot({ path: `app/ikony/ikona-${rozmiar}.png`, omitBackground: true });
  await strona.close();
}
await przegladarka.close();
console.log('Ikony PNG gotowe');
