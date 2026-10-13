// Wszystko, co gra mówi na głos — w jednym miejscu, bez DOM.
// Z tego samego modułu korzysta gra (mowa w trakcie) i scripts/generuj-mowe.mjs
// (nagrania lektora), więc nie ma kwestii, która „ucieknie” nagraniu.
// Kwestie są krótkimi kawałkami (segmentami): dłuższą wypowiedź składa się z kilku,
// żeby np. „Brawo!” nagrać raz, a nie w każdej kombinacji z inną wskazówką.

export const BRAWO = 'Brawo!';
export const SPROBUJ = 'Spróbuj jeszcze raz!';

export function komunikat(typ, szukana) {
  return {
    'za-wczesnie': { tytul: 'To jeszcze nie ta kryjówka!',
      tekst: `Ta karta poczeka na swoją kolej. Najpierw znajdźcie kartę numer ${szukana}. Odłóżcie tę kartę tam, gdzie leżała.` },
    'juz-byla': { tytul: 'Tę kartę już znaleźliście!', tekst: `Teraz szukacie karty numer ${szukana}.` },
    obca: { tytul: 'Ta karta nie pasuje do gry', tekst: 'Ten kod jest z innej gry albo z innego wydruku. Poproście rodzica o pomoc.' },
    'nie-rozpoczeta': { tytul: 'Gra jeszcze się nie zaczęła', tekst: 'Poproście rodzica, żeby uruchomił grę na tym telefonie.' },
  }[typ];
}

export const opcjaDobra = (nazwa) => [`${nazwa}!`, BRAWO];
export const opcjaZla = (nazwa) => [`To jest ${nazwa}.`, SPROBUJ];

// Wszystkie segmenty, jakie gra może wypowiedzieć w danej grze (unikalne).
export function wszystkieKwestie(gra) {
  const k = new Set();
  const dodaj = (...teksty) => teksty.flat().forEach((t) => t && k.add(t));
  dodaj(gra.motyw.powitanie?.maluch, BRAWO, gra.motyw.skarb.tytul);
  for (const w of Object.values(gra.start)) dodaj(w.maluch);
  for (const s of gra.stacje) {
    dodaj(s.maluch.zagadka);
    for (const w of Object.values(s.wskazowka)) dodaj(w.maluch);
    for (const o of s.maluch.opcje) dodaj(opcjaDobra(o.nazwa), opcjaZla(o.nazwa));
  }
  const n = gra.stacje.length;
  for (const typ of ['obca', 'nie-rozpoczeta']) dodaj(Object.values(komunikat(typ, 1)));
  for (let nr = 1; nr <= n; nr++) {
    for (const typ of ['za-wczesnie', 'juz-byla']) dodaj(Object.values(komunikat(typ, nr)));
  }
  return [...k];
}
