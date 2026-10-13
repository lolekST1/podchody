// Czysta logika gry — bez DOM, żeby dało się ją testować w Node (tests/unit).

export const TRYBY = {
  maluch: 'Maluch (3–6 lat)',
  starszak: 'Starszak (7–12 lat)',
  mieszany: 'Mieszany',
};
export const WARIANTY = { dom: 'W domu', ogrod: 'W ogrodzie' };

// Motywy wbudowane w aplikację — nowa gra wybiera z tych list (nowy motyw = nowy kod i CSS).
export const MOTYWY = {
  styl: ['tygrysy', 'pilka', 'konie', 'pandy', 'jednorozce'],
  gatunek: ['tygrys', 'lis', 'kon', 'panda', 'jednorozec'],
  pojazd: ['motor', 'pilka', 'kucyk', 'panda', 'jednorozec'],
  dzwiekRuchu: ['wrrum', 'gwizdek', 'patataj', 'boing', 'magia'],
};

// ł nie rozkłada się w NFD na „l + znak diakrytyczny”, więc trzeba go zamienić ręcznie.
export function normalizuj(tekst) {
  return String(tekst ?? '')
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Odległość Damerau–Levenshteina (wariant OSA): przestawienie sąsiednich liter
// („tgyrys”) liczy się jako jedna literówka, nie dwie.
export function odleglosc(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const koszt = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + koszt);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
}

// Krótkie słowa bez tolerancji: przy „10” albo „kot” jedna literówka to już inna odpowiedź.
export function tolerancja(dlugosc) {
  if (dlugosc <= 3) return 0;
  if (dlugosc <= 6) return 1;
  return 2;
}

// Dziecko często pisze całe zdanie („to jest tygrys”), więc oprócz całości
// porównujemy każdy fragment o tej samej liczbie słów co odpowiedź wzorcowa.
export function czyPoprawna(wpisana, odpowiedzi) {
  const w = normalizuj(wpisana);
  if (!w) return false;
  const slowa = w.split(' ');
  return odpowiedzi.some((odp) => {
    const wzor = normalizuj(odp);
    if (!wzor) return false;
    const tol = tolerancja(wzor.length);
    if (odleglosc(w, wzor) <= tol) return true;
    const ile = wzor.split(' ').length;
    for (let i = 0; i + ile <= slowa.length; i++) {
      if (odleglosc(slowa.slice(i, i + ile).join(' '), wzor) <= tol) return true;
    }
    return false;
  });
}

export function podpowiedzLiter(odpowiedzi) {
  const pierwsza = String(odpowiedzi[0] ?? '');
  return { litera: pierwsza.charAt(0).toUpperCase(), dlugosc: pierwsza.replace(/\s/g, '').length };
}

// Sprawdza plik gry i zwraca listę problemów po polsku (pusta lista = gra poprawna).
export function sprawdzGre(gra) {
  const bledy = [];
  const wymagane = (war, opis) => { if (!war) bledy.push(opis); };
  wymagane(gra && typeof gra === 'object', 'Plik gry nie jest obiektem JSON');
  if (!gra || typeof gra !== 'object') return bledy;
  wymagane(/^[a-z0-9-]+$/.test(gra.id ?? ''), 'Pole "id" musi mieć tylko małe litery, cyfry i myślniki');
  wymagane(gra.tytul, 'Brak pola "tytul"');
  wymagane(gra.motyw?.ikona, 'Brak "motyw.ikona"');
  wymagane(gra.motyw?.skarb?.tytul, 'Brak "motyw.skarb.tytul"');
  const znane = (wartosc, lista, pole) => wymagane(wartosc === undefined || lista.includes(wartosc),
    `"${pole}" = "${wartosc}" — dozwolone: ${lista.join(', ')}`);
  znane(gra.motyw?.styl, MOTYWY.styl, 'motyw.styl');
  znane(gra.motyw?.maskotka?.gatunek, MOTYWY.gatunek, 'motyw.maskotka.gatunek');
  znane(gra.motyw?.pojazd, MOTYWY.pojazd, 'motyw.pojazd');
  znane(gra.motyw?.dzwiekRuchu, MOTYWY.dzwiekRuchu, 'motyw.dzwiekRuchu');
  for (const w of Object.keys(WARIANTY)) {
    sprawdzWskazowke(gra.start?.[w], `start.${w}`, bledy);
  }
  wymagane(Array.isArray(gra.stacje) && gra.stacje.length >= 1, 'Brak listy "stacje"');
  const tokeny = new Set();
  (gra.stacje ?? []).forEach((s, i) => {
    const gdzie = `stacja ${i + 1}`;
    wymagane(s.nr === i + 1, `${gdzie}: "nr" musi wynosić ${i + 1}`);
    wymagane(/^[a-z0-9]{4,}$/.test(s.token ?? ''), `${gdzie}: "token" musi mieć min. 4 znaki (a-z, 0-9)`);
    wymagane(!tokeny.has(s.token), `${gdzie}: token powtarza się`);
    tokeny.add(s.token);
    wymagane(s.maluch?.zagadka, `${gdzie}: brak "maluch.zagadka"`);
    const opcje = s.maluch?.opcje ?? [];
    wymagane(opcje.length >= 3 && opcje.length <= 4, `${gdzie}: maluch musi mieć 3–4 obrazki`);
    wymagane(opcje.every((o) => o.obrazek && o.nazwa), `${gdzie}: każdy obrazek potrzebuje "obrazek" i "nazwa"`);
    wymagane(Number.isInteger(s.maluch?.poprawna) && s.maluch.poprawna >= 0 && s.maluch.poprawna < opcje.length,
      `${gdzie}: "maluch.poprawna" musi wskazywać numer obrazka (od 0)`);
    wymagane(s.starszak?.zagadka, `${gdzie}: brak "starszak.zagadka"`);
    wymagane(Array.isArray(s.starszak?.odpowiedzi) && s.starszak.odpowiedzi.length > 0, `${gdzie}: brak "starszak.odpowiedzi"`);
    // W trybie mieszanym obie zagadki są na jednym ekranie: gdy odpowiedź jest ta sama,
    // starszak tylko przepisuje to, co maluch już wskazał obrazkiem.
    const nazwaMalucha = opcje[s.maluch?.poprawna]?.nazwa;
    wymagane(!(nazwaMalucha && Array.isArray(s.starszak?.odpowiedzi) && czyPoprawna(nazwaMalucha, s.starszak.odpowiedzi)),
      `${gdzie}: starszak ma tę samą odpowiedź co maluch („${nazwaMalucha}”) — w trybie mieszanym to powtórka, wymyśl inną zagadkę`);
    for (const w of Object.keys(WARIANTY)) sprawdzWskazowke(s.wskazowka?.[w], `${gdzie}: wskazowka.${w}`, bledy);
  });
  return bledy;
}
function sprawdzWskazowke(w, gdzie, bledy) {
  if (!w) { bledy.push(`${gdzie}: brak wskazówki`); return; }
  for (const pole of ['schowek', 'obrazek', 'maluch', 'starszak']) {
    if (!w[pole]) bledy.push(`${gdzie}: brak pola "${pole}"`);
  }
}

// ---- Stan gry (postęp) ----
// aktualna = ile stacji już zaliczono; dzieci szukają karty nr aktualna + 1.

export function nowyStan({ tryb, wariant, pin }) {
  return { tryb, wariant, pin: String(pin), aktualna: 0, otwarta: null, czesci: {}, start: Date.now(), koniec: null, pominiete: [] };
}

export function ocenSkan(gra, stan, nr, token) {
  const stacja = gra.stacje.find((s) => s.nr === nr);
  if (!stacja || stacja.token !== token) return { typ: 'obca' };
  if (!stan) return { typ: 'nie-rozpoczeta' };
  if (stan.aktualna >= gra.stacje.length) return { typ: 'koniec' };
  if (nr <= stan.aktualna) return { typ: 'juz-byla', nr };
  if (nr > stan.aktualna + 1) return { typ: 'za-wczesnie', nr };
  return { typ: 'stacja', nr };
}

export function potrzebneCzesci(tryb) {
  if (tryb === 'maluch') return ['maluch'];
  if (tryb === 'starszak') return ['starszak'];
  return ['maluch', 'starszak'];
}

// Zalicza część zagadki; zwraca true, gdy cała stacja jest rozwiązana i postęp przesunął się dalej.
export function zaliczCzesc(stan, nr, czesc) {
  if (nr !== stan.aktualna + 1) return false;
  const zrobione = new Set(stan.czesci[nr] ?? []);
  zrobione.add(czesc);
  stan.czesci[nr] = [...zrobione];
  if (potrzebneCzesci(stan.tryb).every((c) => zrobione.has(c))) {
    przesun(stan, nr);
    return true;
  }
  return false;
}

function przesun(stan, nr) {
  stan.aktualna = nr;
  stan.otwarta = null;
  stan.ostatnioRozwiazana = nr;
}

export function pominStacje(stan, liczbaStacji) {
  if (stan.aktualna >= liczbaStacji) return false;
  const nr = stan.aktualna + 1;
  stan.pominiete = [...new Set([...(stan.pominiete ?? []), nr])];
  przesun(stan, nr);
  if (stan.aktualna >= liczbaStacji) stan.koniec = Date.now();
  return true;
}

export function cofnijStacje(stan) {
  if (stan.aktualna <= 0) return false;
  delete stan.czesci[stan.aktualna];
  stan.pominiete = (stan.pominiete ?? []).filter((n) => n !== stan.aktualna);
  stan.aktualna -= 1;
  stan.otwarta = null;
  stan.ostatnioRozwiazana = stan.aktualna || null;
  stan.koniec = null;
  return true;
}

// Wskazówka, gdzie leży karta, której dzieci teraz szukają (albo skarb po ostatniej stacji).
export function biezacaWskazowka(gra, stan) {
  if (stan.aktualna === 0) return gra.start[stan.wariant];
  return gra.stacje[stan.aktualna - 1].wskazowka[stan.wariant];
}

export function adresKarty(baza, gra, stacja) {
  const b = baza.endsWith('/') ? baza : baza + '/';
  return `${b}?g=${encodeURIComponent(gra.id)}&s=${stacja.nr}&t=${encodeURIComponent(stacja.token)}`;
}

export function czytajAdres(adres) {
  try {
    const u = new URL(adres);
    const g = u.searchParams.get('g'), s = Number(u.searchParams.get('s')), t = u.searchParams.get('t');
    if (!g || !Number.isInteger(s) || s < 1 || !t) return null;
    return { g, s, t };
  } catch {
    return null;
  }
}
