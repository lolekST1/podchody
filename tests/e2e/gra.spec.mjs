// Pełne przejścia przykładowej gry w widoku telefonu (Pixel 7) — wymagania 2, 3, 5.
import { test, expect } from '@playwright/test';
import { gra, adres, nagrywajMowe, mowa, ustawGre, skanuj, rozwiazMalucha, rozwiazStarszaka, zrzut } from './pomoc.mjs';

test.beforeEach(async ({ page }) => { await nagrywajMowe(page); });

// Odpowiedzi tak, jak wpisze je dziecko: wielkie litery, bez ogonków, z literówką, całym zdaniem.
const ODPOWIEDZI_DZIECI = ['KOT', 'kask', 'dziesiec', 'benzyne', 'na czerwonym', 'to jest Ulica'];

test('starszak: cała gra od startu do skarbu, odpowiedzi z literówkami', async ({ page }) => {
  await ustawGre(page, { tryb: 'starszak' });
  await expect(page.locator('[data-wskazowka]')).toContainText(gra.start.dom.starszak);
  await zrzut(page, 'starszak-00-start');
  for (const s of gra.stacje) {
    await skanuj(page, s.nr);
    await expect(page.getByText(s.starszak.zagadka)).toBeVisible();
    await expect(page.locator('[data-czesc="maluch"]')).toHaveCount(0);
    if (s.nr === 1) {
      await zrzut(page, 'starszak-01-zagadka');
      for (let i = 0; i < 3; i++) await rozwiazStarszaka(page, 'lew');
      await expect(page.locator('.komunikat')).toContainText('zaczyna się na „K”');
      await zrzut(page, 'starszak-02-podpowiedz-po-3-bledach');
    }
    await rozwiazStarszaka(page, ODPOWIEDZI_DZIECI[s.nr - 1]);
    await expect(page.locator('.komunikat')).toContainText('Dobra odpowiedź');
    if (s.nr < gra.stacje.length) {
      await expect(page.locator(`[data-szukana="${s.nr + 1}"]`)).toBeVisible();
      await expect(page.locator('[data-wskazowka]')).toContainText(s.wskazowka.dom.starszak);
      if (s.nr === 1) await zrzut(page, 'starszak-03-wskazowka');
    }
  }
  await expect(page.locator('[data-skarb]')).toBeVisible();
  await expect(page.locator('[data-skarb]')).toContainText(gra.stacje[5].wskazowka.dom.starszak);
  await zrzut(page, 'starszak-04-skarb');
});

test('maluch: cała gra obrazkami, zagadki czytane na głos', async ({ page }) => {
  await ustawGre(page, { tryb: 'maluch' });
  expect((await mowa(page)).join(' ')).toContain(gra.start.dom.maluch);
  await zrzut(page, 'maluch-00-start');
  for (const s of gra.stacje) {
    await skanuj(page, s.nr);
    await expect(page.locator('[data-opcja]')).toHaveCount(s.maluch.opcje.length);
    await expect(page.locator('[data-czesc="starszak"]')).toHaveCount(0);
    await expect(page.locator('input')).toHaveCount(0);
    // Przycisk „Posłuchaj” zawsze jest — po skanie aparatem mowa bez dotknięcia bywa zablokowana.
    await page.getByRole('button', { name: /Posłuchaj zagadki/ }).click();
    expect(await mowa(page)).toContain(s.maluch.zagadka);
    if (s.nr === 1) {
      await zrzut(page, 'maluch-01-zagadka');
      const zla = s.maluch.poprawna === 0 ? 1 : 0;
      await page.locator(`[data-opcja="${zla}"]`).click();
      await expect(page.locator(`[data-opcja="${zla}"]`)).toHaveClass(/zla/);
      expect((await mowa(page)).at(-1)).toContain('Spróbuj jeszcze raz');
      await expect(page.locator('[data-szukana]')).toHaveCount(0);
    }
    await rozwiazMalucha(page, s.nr);
    if (s.nr < gra.stacje.length) {
      await expect(page.locator(`[data-szukana="${s.nr + 1}"]`)).toBeVisible();
      await expect(page.locator('[data-wskazowka]')).toContainText(s.wskazowka.dom.maluch);
      expect((await mowa(page)).at(-1)).toContain(s.wskazowka.dom.maluch);
      if (s.nr === 1) await zrzut(page, 'maluch-02-wskazowka');
    }
  }
  await expect(page.locator('[data-skarb]')).toBeVisible();
  expect((await mowa(page)).at(-1)).toContain(gra.motyw.skarb.tytul);
  await zrzut(page, 'maluch-03-skarb');
});

test('maluch: maskotka mówi własnym głosem z nagrań, bez syntezy systemowej', async ({ page }) => {
  await ustawGre(page, { tryb: 'maluch' });
  await skanuj(page, 1);
  await page.getByRole('button', { name: /Posłuchaj zagadki/ }).click();
  await expect.poll(() => page.evaluate(() => window.__nagrania.length)).toBeGreaterThan(1);
  const nagrania = await page.evaluate(() => window.__nagrania);
  for (const src of nagrania) expect(src).toMatch(/^blob:|\/nagrania\/tygrysy-i-motory\/[0-9a-f]{8}\.mp3$/);
  expect(await page.evaluate(() => window.__synteza)).toEqual([]);
});

test('mieszany w ogrodzie: na każdej stacji trzeba rozwiązać obie zagadki', async ({ page }) => {
  await ustawGre(page, { tryb: 'mieszany', wariant: 'ogrod' });
  await expect(page.locator('[data-wskazowka]')).toContainText(gra.start.ogrod.starszak);
  for (const s of gra.stacje) {
    await skanuj(page, s.nr);
    await expect(page.locator('[data-czesc="maluch"]')).toBeVisible();
    await expect(page.locator('[data-czesc="starszak"]')).toBeVisible();
    if (s.nr === 1) await zrzut(page, 'mieszany-01-stacja');
    await rozwiazMalucha(page, s.nr);
    await expect(page.locator('[data-czesc="maluch"]')).toContainText('Brawo');
    await page.waitForTimeout(1300);
    await expect(page.locator('[data-szukana]'), 'sam maluch nie wystarcza').toHaveCount(0);
    await rozwiazStarszaka(page, s.starszak.odpowiedzi[0]);
    if (s.nr < gra.stacje.length) {
      await expect(page.locator(`[data-szukana="${s.nr + 1}"]`)).toBeVisible();
      await expect(page.locator('[data-wskazowka]')).toContainText(s.wskazowka.ogrod.starszak);
      if (s.nr === 1) await zrzut(page, 'mieszany-02-wskazowka');
    }
  }
  await expect(page.locator('[data-skarb]')).toContainText(gra.stacje[5].wskazowka.ogrod.starszak);
  await zrzut(page, 'mieszany-03-skarb');
});

test('skanowanie poza kolejnością nie zdradza zagadki', async ({ page }) => {
  await skanuj(page, 1);
  await expect(page.locator('[data-komunikat="nie-rozpoczeta"]')).toBeVisible();
  await expect(page.getByText(gra.stacje[0].starszak.zagadka)).toHaveCount(0);

  await ustawGre(page, { tryb: 'mieszany' });
  await skanuj(page, 3);
  await expect(page.locator('[data-komunikat="za-wczesnie"]')).toContainText('To jeszcze nie ta kryjówka');
  await expect(page.locator('[data-komunikat="za-wczesnie"]')).toContainText('kartę nr 1');
  const tresc = await page.locator('main').innerText();
  expect(tresc).not.toContain(gra.stacje[2].starszak.zagadka);
  expect(tresc).not.toContain(gra.stacje[2].maluch.zagadka);
  await expect(page.locator('[data-opcja], input')).toHaveCount(0);
  await zrzut(page, 'kolejnosc-01-nie-ta-kryjowka');

  await page.getByRole('button', { name: /Gdzie szukać karty nr 1/ }).click();
  await expect(page.locator('[data-szukana="1"]')).toBeVisible();

  await skanuj(page, 2, 'podrobka');
  await expect(page.locator('[data-komunikat="obca"]')).toBeVisible();

  await skanuj(page, 1);
  await rozwiazMalucha(page, 1);
  await rozwiazStarszaka(page, 'kot');
  await expect(page.locator('[data-szukana="2"]')).toBeVisible();
  await skanuj(page, 1);
  await expect(page.locator('[data-komunikat="juz-byla"]')).toContainText('karty nr 2');
});

test('postęp przeżywa przeładowanie i zamknięcie karty przeglądarki', async ({ page, context }) => {
  await ustawGre(page, { tryb: 'starszak' });
  await skanuj(page, 1);
  await rozwiazStarszaka(page, 'kot');
  await expect(page.locator('[data-szukana="2"]')).toBeVisible();
  await skanuj(page, 2);
  await page.reload();
  // Otwarta zagadka zostaje otwarta — nie trzeba szukać karty od nowa.
  await expect(page.getByText(gra.stacje[1].starszak.zagadka)).toBeVisible();
  const nowa = await context.newPage();
  await nowa.goto('./');
  await expect(nowa.locator('.naglowek .postep')).toContainText('1 / 6');
  expect(page.url()).not.toContain('t=');
});

test('panel rodzica: PIN, podgląd, pominięcie zgubionej karty, cofnięcie, zmiana trybu, reset', async ({ page }) => {
  await ustawGre(page, { tryb: 'starszak', pin: '2580' });
  await page.getByRole('button', { name: /Rodzic/ }).click();
  for (const c of '1111') await page.locator(`[data-cyfra="${c}"]`).click();
  await expect(page.locator('.komunikat')).toContainText('Zły PIN');
  await expect(page.getByText('Przejdź do następnej stacji')).toHaveCount(0);
  for (const c of '2580') await page.locator(`[data-cyfra="${c}"]`).click();
  await expect(page.locator('[data-postep]')).toContainText('0 z 6');
  await expect(page.locator('[data-stacja="1"]')).toContainText(gra.start.dom.schowek);
  await zrzut(page, 'rodzic-01-panel');

  await page.getByRole('button', { name: /Przejdź do następnej stacji/ }).click();
  await expect(page.locator('[data-szukana="2"]')).toBeVisible();
  await expect(page.locator('main')).toContainText('Rodzic przesunął grę dalej');
  await expect(page.locator('[data-wskazowka]')).toContainText(gra.stacje[0].wskazowka.dom.starszak);
  await skanuj(page, 2);
  await expect(page.getByText(gra.stacje[1].starszak.zagadka)).toBeVisible();

  await page.getByRole('button', { name: /Rodzic/ }).click();
  for (const c of '2580') await page.locator(`[data-cyfra="${c}"]`).click();
  await expect(page.locator('[data-stacja="1"] .stan')).toHaveText('⏭️');
  await page.getByRole('button', { name: /Cofnij o jedną/ }).click();
  await expect(page.locator('[data-postep]')).toContainText('0 z 6');
  await page.locator('[data-zmien-tryb="maluch"]').click();
  await expect(page.locator('[data-zmien-tryb="maluch"]')).toHaveAttribute('aria-pressed', 'true');

  // Próba bez drukowania: link z panelu działa jak zeskanowana karta.
  await page.locator('[data-stacja="1"] [data-proba]').click();
  await expect(page.locator('[data-opcja]')).toHaveCount(3);

  await page.getByRole('button', { name: /Rodzic/ }).click();
  for (const c of '2580') await page.locator(`[data-cyfra="${c}"]`).click();
  const reset = page.locator('[data-reset]');
  await reset.click();
  await expect(reset).toContainText('Na pewno');
  await expect(page.locator('[data-postep]')).toBeVisible();
  await reset.click();
  await expect(page.getByRole('heading', { name: 'Przygotuj grę' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Przygotuj grę' })).toBeVisible();
});

test('przyciski są duże, a ekran nie przewija się w bok', async ({ page }) => {
  await ustawGre(page, { tryb: 'mieszany' });
  await skanuj(page, 1);
  await expect(page.locator('[data-opcja]').first()).toBeVisible();
  // Mierzymy po animacjach wjazdu (te nieskończone — kołysanie, poświata — nie zmieniają rozmiaru).
  await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running' || a.effect.getTiming().iterations === Infinity));
  const szer = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  expect(szer[0]).toBeLessThanOrEqual(szer[1]);
  const wysokosci = await page.locator('main .przycisk, main .opcja').evaluateAll((els) =>
    els.filter((e) => e.offsetParent).map((e) => [e.textContent.trim(), e.getBoundingClientRect().height]));
  expect(wysokosci.length).toBeGreaterThan(3);
  for (const [tekst, wys] of wysokosci) expect(wys, tekst).toBeGreaterThanOrEqual(60);
  const opcja = await page.locator('.opcja').first().boundingBox();
  expect(opcja.width).toBeGreaterThanOrEqual(130);
});
