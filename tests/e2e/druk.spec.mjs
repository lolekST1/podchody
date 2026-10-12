// Wymaganie 6: karty A4 z dużym numerem, ikoną motywu i kodem QR, który naprawdę się skanuje.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { gra } from './pomoc.mjs';

async function odczytajKody(page) {
  await page.addScriptTag({ path: 'app/vendor/jsQR.js' });
  return page.evaluate(async () => {
    const wyniki = [];
    for (const el of document.querySelectorAll('.qr')) {
      const svg = new Blob([el.innerHTML], { type: 'image/svg+xml' });
      const img = new Image();
      img.src = URL.createObjectURL(svg);
      await img.decode();
      const c = document.createElement('canvas');
      c.width = c.height = 400;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, 400, 400);
      const d = ctx.getImageData(0, 0, 400, 400);
      wyniki.push({ oczekiwany: el.dataset.adres, odczytany: window.jsQR(d.data, 400, 400)?.data ?? null });
    }
    return wyniki;
  });
}

for (const wariant of ['dom', 'ogrod']) {
  test(`wydruk kart (${wariant}): 6 kart A4 + ściągawka, kody QR prowadzą do właściwych stacji`, async ({ page }) => {
    await page.setViewportSize({ width: 1000, height: 1400 });
    await page.goto('./druk.html');
    await expect(page.locator('body[data-gotowe]')).toBeAttached();
    if (wariant === 'ogrod') await page.locator('input[value=ogrod]').check();
    await page.locator('details summary').click();
    await page.locator('#baza').fill('https://lolekst1.github.io/podchody/');
    await page.locator('#baza').dispatchEvent('change');
    await expect(page.locator('[data-karta]')).toHaveCount(6);
    await expect(page.locator('[data-sciagawka]')).toContainText(gra.start[wariant].schowek);
    for (const s of gra.stacje) {
      const karta = page.locator(`[data-karta="${s.nr}"]`);
      await expect(karta.locator('.numer')).toHaveText(String(s.nr));
      await expect(karta.locator('.gora img')).toHaveCount(2);
    }
    const kody = await odczytajKody(page);
    expect(kody).toHaveLength(6);
    kody.forEach((k, i) => {
      expect(k.odczytany).toBe(k.oczekiwany);
      expect(k.odczytany).toBe(`https://lolekst1.github.io/podchody/?g=${gra.id}&s=${i + 1}&t=${gra.stacje[i].token}`);
    });
    await page.locator('[data-karta="1"]').screenshot({ path: `raport/druk-${wariant}-karta1.png` });
    await page.emulateMedia({ media: 'print' });
    const pdf = await page.pdf({ path: `raport/karty-${wariant}.pdf`, format: 'A4', printBackground: true, preferCSSPageSize: true });
    const strony = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) ?? []).length;
    expect(strony, 'ściągawka + 6 kart, każda na osobnej kartce').toBe(7);
  });
}

test('wydruk bez ściągawki ma tylko karty', async ({ page }) => {
  await page.goto('./druk.html');
  await expect(page.locator('body[data-gotowe]')).toBeAttached();
  await page.locator('#sciagawka').uncheck();
  await expect(page.locator('[data-sciagawka]')).toHaveCount(0);
  await expect(page.locator('[data-karta]')).toHaveCount(6);
});
