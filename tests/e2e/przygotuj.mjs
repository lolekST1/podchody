// Przed testami: nagranie „kamery” z kodem QR karty nr 1 (format Y4M), którym Chromium
// podmienia aparat — dzięki temu skaner w aplikacji jest sprawdzany na prawdziwym obrazie.
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
const qrcode = require('qrcode-generator');

export const PLIK_KAMERY = 'test-results/kamera-karta1.y4m';

export default function przygotuj() {
  const gra = JSON.parse(readFileSync('app/gry/tygrysy-i-motory.json', 'utf8'));
  const s = gra.stacje[0];
  const qr = qrcode(0, 'M');
  qr.addData(`https://lolekst1.github.io/podchody/?g=${gra.id}&s=${s.nr}&t=${s.token}`);
  qr.make();
  const W = 640, H = 480, n = qr.getModuleCount();
  const modul = Math.floor(360 / (n + 8));
  const bok = modul * (n + 8);
  const x0 = (W - bok) / 2 | 0, y0 = (H - bok) / 2 | 0;
  const y = Buffer.alloc(W * H, 200);
  for (let py = 0; py < bok; py++) {
    for (let px = 0; px < bok; px++) {
      const r = Math.floor(py / modul) - 4, c = Math.floor(px / modul) - 4;
      const ciemny = r >= 0 && c >= 0 && r < n && c < n && qr.isDark(r, c);
      y[(y0 + py) * W + x0 + px] = ciemny ? 16 : 235;
    }
  }
  const uv = Buffer.alloc((W / 2) * (H / 2) * 2, 128);
  const klatka = Buffer.concat([Buffer.from('FRAME\n'), y, uv]);
  mkdirSync('test-results', { recursive: true });
  mkdirSync('raport', { recursive: true });
  writeFileSync(PLIK_KAMERY, Buffer.concat([Buffer.from(`YUV4MPEG2 W${W} H${H} F10:1 Ip A1:1 C420jpeg\n`), klatka, klatka, klatka]));
}
