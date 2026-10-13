// Kopiuje biblioteki i krój pisma do app/ — aplikacja działa offline i bez kroku budowania,
// więc wszystko musi leżeć obok kodu, a nie w node_modules.
import { copyFileSync } from 'node:fs';
copyFileSync('node_modules/qrcode-generator/dist/qrcode.js', 'app/vendor/qrcode.js');
copyFileSync('node_modules/jsqr/dist/jsQR.js', 'app/vendor/jsQR.js');
// Baloo 2 (SIL Open Font License) — zaokrąglony, czytelny krój; latin-ext ma polskie znaki.
for (const z of ['latin', 'latin-ext']) {
  copyFileSync(`node_modules/@fontsource-variable/baloo-2/files/baloo-2-${z}-wght-normal.woff2`, `app/fonty/baloo-2-${z}.woff2`);
}
console.log('Skopiowano biblioteki i fonty');
