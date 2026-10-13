// Podgląd maskotki (w każdym nastroju) i motorka w dużym powiększeniu — do poprawiania rysunków.
// Użycie: node scripts/podglad-rysunkow.mjs <plik.png>
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
const css = readFileSync('app/css/styl.css', 'utf8');
const { maskotkaSVG } = await import('../app/js/maskotka.js');
const { motorekSVG } = await import('../app/js/sceny.js');
const nastroje = ['', 'macha', 'cieszy', 'smutny'];
const html = `<style>${css} body{background:#fff8e8} .rzad{display:flex;gap:20px;padding:20px;align-items:end}
.maskotka{width:220px} .m{width:300px} *{animation-play-state:paused!important}</style>
<div class="rzad">${nastroje.map((n) => `<div class="maskotka ${n}">${maskotkaSVG()}</div>`).join('')}</div>
<div class="rzad"><div class="m">${motorekSVG()}</div><div class="m motorek jedzie" style="position:static;translate:none;width:300px">${motorekSVG()}</div></div>`;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1000, height: 560 } });
await p.setContent(html);
await p.waitForTimeout(300);
await p.screenshot({ path: process.argv[2] });
await b.close();
