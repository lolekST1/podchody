// Skaner w aplikacji na „prawdziwym” obrazie z kamery: Chromium podmienia aparat nagraniem
// z kodem QR karty nr 1 (tworzy je tests/e2e/przygotuj.mjs).
import { test, expect } from '@playwright/test';
import { gra, nagrywajMowe, ustawGre, zrzut } from './pomoc.mjs';
import { PLIK_KAMERY } from './przygotuj.mjs';

test.use({
  permissions: ['camera'],
  launchOptions: {
    ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}),
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-video-capture=${PLIK_KAMERY}`],
  },
});

test('przycisk „Skanuj kartę” czyta kod z aparatu i otwiera zagadkę', async ({ page }) => {
  await nagrywajMowe(page);
  await ustawGre(page, { tryb: 'maluch' });
  await page.getByRole('button', { name: /Skanuj kartę/ }).click();
  await expect(page.locator('#skaner')).toBeVisible();
  await expect(page.locator('[data-opcja]')).toHaveCount(gra.stacje[0].maluch.opcje.length, { timeout: 15_000 });
  await expect(page.locator('#skaner')).toBeHidden();
  // Po skanie w aplikacji mowa rusza sama — dotknięcie przycisku już było.
  expect(await page.evaluate(() => window.__mowaLog)).toContain(gra.stacje[0].maluch.zagadka);
  await zrzut(page, 'skaner-01-po-skanie');
});
