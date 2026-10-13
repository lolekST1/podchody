// Testy logiki: tolerancja odpowiedzi (wymaganie 2), kolejność kart (wymaganie 3),
// spójność pliku gry (wymaganie 1) i lista plików offline (wymaganie 4).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import {
  czyPoprawna, normalizuj, sprawdzGre, nowyStan, ocenSkan, zaliczCzesc,
  pominStacje, cofnijStacje, biezacaWskazowka, adresKarty, czytajAdres, tekstyMowy, plikNagrania,
} from '../../app/js/logika.js';

const gra = JSON.parse(readFileSync('app/gry/tygrysy-i-motory.json', 'utf8'));
const wszystkieGry = JSON.parse(readFileSync('app/gry/index.json', 'utf8')).gry
  .map((id) => JSON.parse(readFileSync(`app/gry/${id}.json`, 'utf8')));

test('odpowiedź: wielkość liter i polskie znaki nie mają znaczenia', () => {
  assert.ok(czyPoprawna('TYGRYS', ['tygrys']));
  assert.ok(czyPoprawna('dziesiec', ['dziesięć']));
  assert.ok(czyPoprawna('ŚCIGACZ', ['ścigacz']));
  assert.ok(czyPoprawna('scigacz', ['ścigacz']));
  assert.equal(normalizuj('Łódź!'), 'lodz');
});

test('odpowiedź: literówki tolerowane proporcjonalnie do długości', () => {
  assert.ok(czyPoprawna('tygris', ['tygrys']), 'jedna zamieniona litera');
  assert.ok(czyPoprawna('tgyrys', ['tygrys']), 'przestawione litery');
  assert.ok(czyPoprawna('motocyk', ['motocykl']), 'brak litery');
  assert.ok(czyPoprawna('benzyne', ['benzyna']));
  assert.ok(!czyPoprawna('kot', ['tygrys']), 'inne słowo nie przechodzi');
  assert.ok(!czyPoprawna('11', ['10']), 'liczby bez tolerancji');
  assert.ok(!czyPoprawna('lew', ['lis']), 'krótkie słowa bez tolerancji');
});

test('odpowiedź: całe zdanie z poprawnym słowem przechodzi, pusta nie', () => {
  assert.ok(czyPoprawna('to jest tygrys!', ['tygrys']));
  assert.ok(czyPoprawna('chyba na czerwonym', ['na czerwonym']));
  assert.ok(!czyPoprawna('   ', ['tygrys']));
  assert.ok(!czyPoprawna('', ['tygrys']));
});

test('każda gra z listy przechodzi walidację, ma 6 stacji i plik nazwany jak jej id', () => {
  assert.ok(wszystkieGry.length >= 5);
  for (const g of wszystkieGry) {
    assert.deepEqual(sprawdzGre(g), [], g.id);
    assert.equal(g.stacje.length, 6, g.id);
  }
  const ids = JSON.parse(readFileSync('app/gry/index.json', 'utf8')).gry;
  assert.deepEqual(wszystkieGry.map((g) => g.id), ids);
});

test('walidacja odrzuca nieznany motyw, maskotkę i znacznik drogi', () => {
  const zla = structuredClone(gra);
  zla.motyw.styl = 'dinozaury';
  zla.motyw.maskotka.gatunek = 'smok';
  zla.motyw.pojazd = 'rakieta';
  const bledy = sprawdzGre(zla).join('\n');
  assert.match(bledy, /motyw.styl/);
  assert.match(bledy, /motyw.maskotka.gatunek/);
  assert.match(bledy, /motyw.pojazd/);
});

test('walidacja wyłapuje typowe błędy w pliku gry', () => {
  const zla = structuredClone(gra);
  zla.stacje[1].token = zla.stacje[0].token;
  zla.stacje[2].maluch.poprawna = 5;
  zla.stacje[3].maluch.opcje = zla.stacje[3].maluch.opcje.slice(0, 2);
  delete zla.stacje[4].wskazowka.ogrod;
  zla.stacje[5].starszak.odpowiedzi = ['Dżungla', 'las'];
  const bledy = sprawdzGre(zla).join('\n');
  assert.match(bledy, /stacja 2: token powtarza się/);
  assert.match(bledy, /stacja 3: "maluch.poprawna"/);
  assert.match(bledy, /stacja 4: maluch musi mieć 3–4 obrazki/);
  assert.match(bledy, /stacja 5: wskazowka.ogrod/);
  assert.match(bledy, /stacja 6: starszak ma tę samą odpowiedź co maluch/, 'powtórka w trybie mieszanym');
});

test('w każdej grze odpowiedzi wzorcowe przechodzą, a obrazek malucha nie jest odpowiedzią starszaka', () => {
  for (const g of wszystkieGry) {
    for (const s of g.stacje) {
      for (const o of s.starszak.odpowiedzi) assert.ok(czyPoprawna(o, s.starszak.odpowiedzi), `${g.id}: ${o}`);
      // Pozostałe (błędne) obrazki malucha też nie mogą przypadkiem zaliczyć zagadki starszaka.
      for (const op of s.maluch.opcje) assert.ok(!czyPoprawna(op.nazwa, s.starszak.odpowiedzi), `${g.id} stacja ${s.nr}: ${op.nazwa}`);
    }
  }
});

test('tokeny kart są unikalne we wszystkich grach — karta jednej gry nie otworzy drugiej', () => {
  const tokeny = wszystkieGry.flatMap((g) => g.stacje.map((s) => s.token));
  assert.equal(new Set(tokeny).size, tokeny.length);
});

test('kolejność: tylko następna karta otwiera zagadkę', () => {
  const stan = nowyStan({ tryb: 'starszak', wariant: 'dom', pin: '1234' });
  const t = (nr) => gra.stacje[nr - 1].token;
  assert.equal(ocenSkan(gra, stan, 1, t(1)).typ, 'stacja');
  assert.equal(ocenSkan(gra, stan, 3, t(3)).typ, 'za-wczesnie');
  assert.equal(ocenSkan(gra, stan, 1, 'zlytoken').typ, 'obca');
  assert.equal(ocenSkan(gra, stan, 99, 'x').typ, 'obca');
  assert.equal(ocenSkan(gra, null, 1, t(1)).typ, 'nie-rozpoczeta');
  zaliczCzesc(stan, 1, 'starszak');
  assert.equal(ocenSkan(gra, stan, 1, t(1)).typ, 'juz-byla');
  assert.equal(ocenSkan(gra, stan, 2, t(2)).typ, 'stacja');
});

test('tryb mieszany wymaga obu części, zanim gra pójdzie dalej', () => {
  const stan = nowyStan({ tryb: 'mieszany', wariant: 'ogrod', pin: '1234' });
  assert.equal(zaliczCzesc(stan, 1, 'maluch'), false);
  assert.equal(stan.aktualna, 0);
  assert.equal(zaliczCzesc(stan, 1, 'starszak'), true);
  assert.equal(stan.aktualna, 1);
  assert.equal(zaliczCzesc(stan, 3, 'maluch'), false, 'nie można zaliczyć karty poza kolejnością');
});

test('panel rodzica: pominięcie i cofnięcie stacji', () => {
  const stan = nowyStan({ tryb: 'maluch', wariant: 'dom', pin: '1234' });
  pominStacje(stan, 6);
  assert.equal(stan.aktualna, 1);
  assert.deepEqual(stan.pominiete, [1]);
  assert.equal(biezacaWskazowka(gra, stan), gra.stacje[0].wskazowka.dom);
  cofnijStacje(stan);
  assert.equal(stan.aktualna, 0);
  assert.deepEqual(stan.pominiete, []);
  assert.equal(biezacaWskazowka(gra, stan), gra.start.dom);
  for (let i = 0; i < 6; i++) pominStacje(stan, 6);
  assert.equal(stan.aktualna, 6);
  assert.ok(stan.koniec);
  assert.equal(pominStacje(stan, 6), false, 'po skarbie nie ma dokąd iść');
});

test('adres karty i jego odczyt to para odwrotna', () => {
  const a = adresKarty('https://lolekst1.github.io/podchody', gra, gra.stacje[2]);
  assert.equal(a, 'https://lolekst1.github.io/podchody/?g=tygrysy-i-motory&s=3&t=kl8w3d');
  assert.deepEqual(czytajAdres(a), { g: 'tygrysy-i-motory', s: 3, t: 'kl8w3d' });
  assert.equal(czytajAdres('https://example.com/'), null);
  assert.equal(czytajAdres('nie adres'), null);
});

test('service worker zapisuje offline każdy plik aplikacji', () => {
  const sw = readFileSync('app/sw.js', 'utf8');
  const pliki = [];
  const przejdz = (k) => readdirSync(k).forEach((p) => {
    const s = join(k, p);
    if (statSync(s).isDirectory()) przejdz(s); else pliki.push(relative('app', s));
  });
  przejdz('app');
  // Gry i nagrania głosu trafiają do pamięci telefonu osobno (gry/index.json, wybór gry).
  const pomijane = (p) => p === 'sw.js' || p.startsWith('nagrania/') || p.startsWith('gry/') && p !== 'gry/index.json';
  for (const p of pliki.filter((x) => !pomijane(x))) assert.ok(sw.includes(`'${p}'`), `brak w sw.js: ${p}`);
  const lista = JSON.parse(readFileSync('app/gry/index.json', 'utf8')).gry;
  for (const p of pliki.filter((x) => x.startsWith('gry/') && x !== 'gry/index.json')) {
    assert.ok(lista.includes(p.slice(4, -5)), `gra ${p} nie jest w gry/index.json`);
  }
});

test('każda maskotka ma inny głos, a lista nagrań obejmuje wszystkie czytane zdania', () => {
  const glosy = wszystkieGry.map((g) => g.motyw.maskotka?.glos);
  assert.ok(glosy.every(Boolean), 'każda gra ma "motyw.maskotka.glos"');
  assert.equal(new Set(glosy).size, glosy.length, 'głosy maskotek się nie powtarzają');
  // Gra bez listy nagrań (jeszcze nienagrana) mówi syntezą; lista jest tylko dla kompletu.
  for (const g of wszystkieGry.filter((x) => existsSync(`app/nagrania/${x.id}.json`))) {
    const glos = g.motyw.maskotka.glos;
    const lista = JSON.parse(readFileSync(`app/nagrania/${g.id}.json`, 'utf8'));
    assert.equal(lista.glos, glos, `${g.id}: nagrania innym głosem — uruchom npm run nagrania`);
    const potrzebne = tekstyMowy(g).map((t) => plikNagrania(glos, t)).sort();
    assert.deepEqual(lista.pliki, potrzebne, `${g.id}: lista nagrań nieaktualna — uruchom npm run nagrania`);
    for (const p of potrzebne) assert.ok(existsSync(`app/nagrania/${g.id}/${p}.mp3`), `${g.id}: brak pliku ${p}.mp3`);
    assert.equal(readdirSync(`app/nagrania/${g.id}`).length, potrzebne.length, `${g.id}: nieużywane nagrania`);
  }
  assert.ok(existsSync('app/nagrania/tygrysy-i-motory.json'), 'przykładowa gra (testy w przeglądarce) ma nagrania');
});

test('nazwa nagrania zależy od tekstu i głosu', () => {
  assert.match(plikNagrania('Puck', 'Brawo!'), /^[0-9a-f]{8}$/);
  assert.equal(plikNagrania('Puck', 'Brawo!'), plikNagrania('Puck', 'Brawo!'));
  assert.notEqual(plikNagrania('Puck', 'Brawo!'), plikNagrania('Kore', 'Brawo!'));
  assert.notEqual(plikNagrania('Puck', 'Brawo!'), plikNagrania('Puck', 'Brawo'));
  const t = tekstyMowy(gra);
  assert.ok(t.includes(gra.stacje[0].maluch.zagadka));
  assert.ok(t.includes('tygrys! Brawo!'));
  assert.ok(t.includes('To jest krowa. Spróbuj jeszcze raz!'));
  assert.ok(t.some((x) => x.includes('znajdźcie kartę nr 3')), 'komunikaty po skanie dla każdego numeru karty');
});
