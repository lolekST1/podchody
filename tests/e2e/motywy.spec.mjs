// Wszystkie gry z app/gry/index.json: każda ma swój motyw (maskotka, droga, kolory) i da się
// ją przejść do skarbu w trybie mieszanym; wybór gry na ekranie rodzica od razu zmienia motyw.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { nagrywajMowe, zrzut } from './pomoc.mjs';

const gry = JSON.parse(readFileSync('app/gry/index.json', 'utf8')).gry
  .map((id) => JSON.parse(readFileSync(`app/gry/${id}.json`, 'utf8')));

test.beforeEach(async ({ page }) => { await nagrywajMowe(page); });

for (const gra of gry) {
  test(`${gra.tytul}: motyw i przejście całej gry w trybie mieszanym`, async ({ page }) => {
    await page.goto(`./?g=${gra.id}`);
    await expect(page.locator('body')).toHaveAttribute('data-styl', gra.motyw.styl);
    await expect(page.locator(`.powitanie-gry svg[aria-label*="${gra.motyw.maskotka.imie}"]`)).toBeVisible();
    await page.locator('[data-tryb="mieszany"]').click();
    await page.locator('[data-wariant="dom"]').click();
    await page.locator('#pin').fill('1234');
    await page.getByRole('button', { name: /Zaczynamy/ }).click();
    await expect(page.locator('[data-wskazowka]')).toContainText(gra.start.dom.starszak);
    await expect(page.locator('.scena-maskotki .dymek')).toContainText(gra.motyw.powitanie.starszak);
    for (const s of gra.stacje) {
      await page.goto(`./?g=${gra.id}&s=${s.nr}&t=${s.token}`);
      await expect(page.getByText(s.starszak.zagadka)).toBeVisible();
      if (s.nr === 1) await zrzut(page, `motyw-${gra.id}-1-stacja`);
      await page.locator(`[data-czesc="maluch"] [data-opcja="${s.maluch.poprawna}"]`).click();
      await page.locator('[data-czesc="starszak"] input').fill(s.starszak.odpowiedzi[0]);
      await page.locator('[data-czesc="starszak"] button[type=submit]').click();
      if (s.nr < gra.stacje.length) {
        await expect(page.locator(`[data-szukana="${s.nr + 1}"]`)).toBeVisible();
        await expect(page.locator('.scena-maskotki .dymek')).toHaveText(gra.motyw.okrzyk);
        await expect(page.locator('[data-wskazowka]')).toContainText(s.wskazowka.dom.starszak);
      }
    }
    await expect(page.locator('[data-skarb]')).toContainText(gra.motyw.skarb.tytul);
    await page.locator('[data-skrzynia]').click();
    await page.waitForTimeout(900);
    await zrzut(page, `motyw-${gra.id}-2-skarb`);
  });
}

test('wybór gry na ekranie rodzica przebiera ekran w jej motyw i zachowuje wybory', async ({ page }) => {
  await page.goto('./');
  await page.locator('[data-tryb="starszak"]').click();
  await page.locator('[data-wariant="ogrod"]').click();
  await page.locator('#pin').fill('2468');
  for (const gra of gry) {
    await page.locator(`[data-gra="${gra.id}"]`).click();
    await expect(page.locator('body')).toHaveAttribute('data-styl', gra.motyw.styl);
    await expect(page.locator(`[data-gra="${gra.id}"]`)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-tryb="starszak"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-wariant="ogrod"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#pin')).toHaveValue('2468');
    await expect(page.locator('#link-druk')).toHaveAttribute('href', `druk.html?g=${gra.id}`);
  }
  await zrzut(page, 'motyw-wybor-gry');
});
