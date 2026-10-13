// Podgląd maskotek (każdy gatunek w spoczynku i machający) i znaczników drogi w powiększeniu —
// do poprawiania rysunków. Użycie: node scripts/podglad-rysunkow.mjs <plik.png>
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { maskotkaSVG, GATUNKI } from '../app/js/maskotka.js';
import { pojazdSVG, POJAZDY } from '../app/js/sceny.js';

const css = readFileSync('app/css/styl.css', 'utf8');
const html = `<style>${css} body{background:#fff8e8} .rzad{display:flex;gap:14px;padding:14px;align-items:end}
.maskotka{width:180px} .m{width:200px} *{animation-play-state:paused!important}</style>
<div class="rzad">${Object.keys(GATUNKI).map((g) => `<div class="maskotka">${maskotkaSVG({ gatunek: g })}</div>`).join('')}</div>
<div class="rzad">${Object.keys(GATUNKI).map((g) => `<div class="maskotka cieszy">${maskotkaSVG({ gatunek: g })}</div>`).join('')}</div>
<div class="rzad">${POJAZDY.map((p) => `<div class="m">${pojazdSVG(p)}</div>`).join('')}</div>`;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1000, height: 760 } });
await p.setContent(html);
await p.waitForTimeout(300);
await p.screenshot({ path: process.argv[2], fullPage: true });
await b.close();
