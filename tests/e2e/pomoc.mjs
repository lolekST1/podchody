import { readFileSync } from 'node:fs';
import { expect } from '@playwright/test';

export const gra = JSON.parse(readFileSync('app/gry/tygrysy-i-motory.json', 'utf8'));
export const adres = (nr, token = gra.stacje[nr - 1].token) => `./?g=${gra.id}&s=${nr}&t=${token}`;

// Zastępuje syntezę mowy i odtwarzanie nagrań nagrywarką: test widzi, co telefon
// przeczytałby dziecku (__mowa), a osobno — czy głosem syntezy, czy z nagrania.
export async function nagrywajMowe(page) {
  await page.addInitScript(() => {
    window.__mowa = [];
    window.__synteza = [];
    window.__nagrania = [];
    document.addEventListener('mowa', (e) => { if (e.detail.trwa) window.__mowa.push(e.detail.tekst); });
    const synteza = {
      speak: (w) => { window.__synteza.push(w.text); w.onstart?.(); setTimeout(() => w.onend?.(), 10); },
      cancel: () => {},
      getVoices: () => [],
      addEventListener: () => {},
    };
    Object.defineProperty(window, 'speechSynthesis', { value: synteza, configurable: true });
    HTMLMediaElement.prototype.play = function play() {
      window.__nagrania.push(this.src);
      setTimeout(() => this.dispatchEvent(new Event('ended')), 10);
      return Promise.resolve();
    };
  });
}
export const mowa = (page) => page.evaluate(() => window.__mowa);

export async function ustawGre(page, { tryb, wariant = 'dom', pin = '2580' }) {
  await page.goto('./');
  await page.locator(`[data-tryb="${tryb}"]`).click();
  await page.locator(`[data-wariant="${wariant}"]`).click();
  await page.locator('#pin').fill(pin);
  await page.getByRole('button', { name: /Zaczynamy/ }).click();
  await expect(page.locator('[data-szukana="1"]')).toBeVisible();
}

// Symuluje zeskanowanie karty aparatem telefonu: przeglądarka otwiera adres z kodu.
export async function skanuj(page, nr, token) {
  await page.goto(adres(nr, token));
}

export async function rozwiazMalucha(page, nr) {
  const s = gra.stacje[nr - 1];
  await page.locator(`[data-czesc="maluch"] [data-opcja="${s.maluch.poprawna}"]`).click();
}
export async function rozwiazStarszaka(page, odpowiedz) {
  const pole = page.locator('[data-czesc="starszak"] input');
  await pole.fill(odpowiedz);
  await page.locator('[data-czesc="starszak"] button[type=submit]').click();
}
export const zrzut = (page, nazwa) => page.screenshot({ path: `raport/${nazwa}.png`, fullPage: true });
