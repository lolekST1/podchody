// Kopiuje biblioteki do app/vendor — aplikacja działa offline i bez kroku budowania,
// więc biblioteki muszą leżeć obok kodu, a nie w node_modules.
import { copyFileSync } from 'node:fs';
copyFileSync('node_modules/qrcode-generator/dist/qrcode.js', 'app/vendor/qrcode.js');
copyFileSync('node_modules/jsqr/dist/jsQR.js', 'app/vendor/jsQR.js');
console.log('Skopiowano qrcode.js i jsQR.js do app/vendor/');
