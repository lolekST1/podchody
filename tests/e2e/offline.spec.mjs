// Wymaganie 4: po pierwszym otwarciu gra działa bez internetu.
import { test, expect } from '@playwright/test';
import { spawn } from 'node:child_process';
import { gra, nagrywajMowe, ustawGre, skanuj, rozwiazStarszaka, zrzut } from './pomoc.mjs';

// Własny serwer, który test wyłącza — sama emulacja offline w Chromium nie obejmuje
// zapytań service workera, więc nie dowodziłaby, że gra idzie z pamięci telefonu.
const PORT = 8124;
test.use({ baseURL: `http://localhost:${PORT}/` });
let serwer;
test.beforeAll(async () => {
  serwer = spawn(process.execPath, ['scripts/serwer.mjs'], { env: { ...process.env, PORT: String(PORT) }, stdio: 'pipe' });
  await new Promise((ok) => serwer.stdout.once('data', ok));
});
test.afterAll(() => serwer?.kill());

test('po pierwszym otwarciu gra działa offline, także karty i strona wydruku', async ({ page, context }) => {
  await nagrywajMowe(page);
  await page.goto('./');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload(); // od teraz stroną zarządza service worker
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);

  serwer.kill();
  await new Promise((ok) => serwer.once('exit', ok));
  await context.setOffline(true);
  await ustawGre(page, { tryb: 'starszak' });
  await skanuj(page, 1);
  await expect(page.getByText(gra.stacje[0].starszak.zagadka)).toBeVisible();
  await rozwiazStarszaka(page, 'tygrys');
  await expect(page.locator('[data-szukana="2"]')).toBeVisible();
  await skanuj(page, 4);
  await expect(page.locator('[data-komunikat="za-wczesnie"]')).toBeVisible();
  await zrzut(page, 'offline-01-gra-bez-sieci');

  await page.goto('./druk.html');
  await expect(page.locator('[data-karta]')).toHaveCount(6);
  expect(await page.evaluate(() => navigator.onLine)).toBe(false);
  await context.setOffline(false);
});
