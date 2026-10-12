import {
  TRYBY, WARIANTY, normalizuj, czyPoprawna, podpowiedzLiter, sprawdzGre,
  nowyStan, ocenSkan, potrzebneCzesci, zaliczCzesc, pominStacje, cofnijStacje,
  biezacaWskazowka, adresKarty, czytajAdres,
} from './logika.js';
import { mow, przerwijMowe, mowaDostepna } from './mowa.js';
import { otworzSkaner } from './skaner.js';

const $ekran = document.getElementById('ekran');
const $rodzic = document.getElementById('przycisk-rodzic');

let gra = null;
let stan = null;

// ---------- Zapis na urządzeniu ----------
// localStorage może rzucić wyjątkiem (tryb prywatny, zablokowane dane) — gra ma wtedy
// działać dalej, tylko bez pamięci postępu po przeładowaniu.
const KLUCZ_GRY = 'podchody:gra';
const kluczStanu = (id) => `podchody:stan:${id}`;
function czytaj(klucz) {
  try { return JSON.parse(localStorage.getItem(klucz)); } catch { return null; }
}
function zapisz(klucz, wartosc) {
  try {
    if (wartosc === null) localStorage.removeItem(klucz);
    else localStorage.setItem(klucz, JSON.stringify(wartosc));
  } catch { /* brak pamięci — trudno, gramy dalej */ }
}
const zapiszStan = () => zapisz(kluczStanu(gra.id), stan);

// ---------- Pomocnicze ----------
function h(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content;
}
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function pokaz(html, { rodzic = true } = {}) {
  przerwijMowe();
  $ekran.replaceChildren(h(html));
  $rodzic.hidden = !(rodzic && stan);
  window.scrollTo(0, 0);
  const tytul = $ekran.querySelector('h1');
  if (tytul) tytul.setAttribute('tabindex', '-1');
}
const na = (sel, fn, zdarzenie = 'click') => $ekran.querySelectorAll(sel).forEach((el) => el.addEventListener(zdarzenie, fn));
const liczbaStacji = () => gra.stacje.length;
const czytaTryb = (czesc) => stan && potrzebneCzesci(stan.tryb).includes(czesc);
const adresBazowy = () => new URL('./', location.href).href;

function naglowek() {
  const ikony = (gra.motyw.ikony ?? [gra.motyw.ikona]).join('');
  const postep = stan ? `<span class="postep">${Math.min(stan.aktualna, liczbaStacji())} / ${liczbaStacji()} ✅</span>` : '';
  return `<div class="naglowek"><span class="ikony" aria-hidden="true">${ikony}</span><span>${esc(gra.tytul)}</span>${postep}</div>`;
}
function przyciskMowy(tekst, etykieta = '🔊 Posłuchaj') {
  if (!mowaDostepna()) return '';
  return `<button class="przycisk przycisk-jasny" type="button" data-mow="${esc(tekst)}">${etykieta}</button>`;
}
function podepnijMowe() {
  na('[data-mow]', (e) => mow(e.currentTarget.dataset.mow));
}
const przyciskSkanu = '<button class="przycisk" type="button" data-skanuj>📷 Skanuj kartę</button>';
function podepnijSkan() {
  na('[data-skanuj]', () => otworzSkaner((adres) => {
    const dane = czytajAdres(adres);
    if (!dane) return false;
    obsluzSkan(dane);
    return true;
  }));
}

// ---------- Start aplikacji ----------
async function wczytajGre(id) {
  const odp = await fetch(`gry/${encodeURIComponent(id)}.json`);
  if (!odp.ok) throw new Error(`Nie znalazłem gry „${id}”`);
  const g = await odp.json();
  const bledy = sprawdzGre(g);
  if (bledy.length) throw new Error(`Plik gry ma błędy:\n• ${bledy.join('\n• ')}`);
  return g;
}
async function listaGier() {
  const odp = await fetch('gry/index.json');
  return (await odp.json()).gry;
}

async function start() {
  const dane = czytajAdres(location.href);
  const zAdresu = new URL(location.href).searchParams.get('g');
  try {
    const id = dane?.g ?? zAdresu ?? czytaj(KLUCZ_GRY) ?? (await listaGier())[0];
    await ustawGre(id);
  } catch (e) {
    pokaz(`<div class="panel"><h1>😕 Coś nie tak</h1><p style="white-space:pre-line">${esc(e.message)}</p>
      <a class="przycisk" href="./">Spróbuj jeszcze raz</a></div>`, { rodzic: false });
    return;
  }
  if (dane) {
    // Czyścimy adres, żeby odświeżenie strony nie udawało ponownego skanu.
    history.replaceState(null, '', './');
    obsluzSkan(dane);
  } else {
    ekranGlowny();
  }
}

async function ustawGre(id) {
  if (gra?.id !== id) gra = await wczytajGre(id);
  stan = czytaj(kluczStanu(gra.id));
  zapisz(KLUCZ_GRY, gra.id);
  document.documentElement.style.setProperty('--motyw', gra.motyw.kolor ?? '#c2410c');
}

async function obsluzSkan(dane) {
  if (dane.g !== gra.id) {
    try { await ustawGre(dane.g); } catch { return ekranKomunikatu('obca'); }
  }
  const wynik = ocenSkan(gra, stan, dane.s, dane.t);
  if (wynik.typ === 'stacja') {
    stan.otwarta = wynik.nr;
    zapiszStan();
    return ekranStacji(wynik.nr, { poSkanie: true });
  }
  if (wynik.typ === 'koniec') return ekranSkarbu();
  ekranKomunikatu(wynik.typ, wynik.nr);
}

function ekranGlowny() {
  if (!stan) return ekranKonfiguracji();
  if (stan.aktualna >= liczbaStacji()) return ekranSkarbu();
  if (stan.otwarta === stan.aktualna + 1) return ekranStacji(stan.otwarta);
  ekranSzukania();
}

// ---------- Konfiguracja (rodzic, przed grą) ----------
async function ekranKonfiguracji() {
  let gry = [gra.id];
  try { gry = await listaGier(); } catch { /* offline bez listy — zostaje bieżąca gra */ }
  const tytuly = {};
  for (const id of gry) {
    try { tytuly[id] = id === gra.id ? gra : await wczytajGre(id); } catch { /* pomijamy uszkodzony plik */ }
  }
  const wybor = { gra: gra.id, tryb: null, wariant: null };

  pokaz(`
    ${naglowek()}
    <h1>Przygotuj grę</h1>
    <p class="cichy">Ten ekran jest dla rodzica. Dzieci zobaczą grę po naciśnięciu „Zaczynamy!”.</p>
    ${Object.keys(tytuly).length > 1 ? `<div class="panel"><h2>Gra</h2><div class="wybory">
      ${Object.values(tytuly).map((g) => `<button class="wybor" type="button" data-gra="${esc(g.id)}" aria-pressed="${g.id === gra.id}">
        <span class="emo">${esc(g.motyw.ikona)}</span><span>${esc(g.tytul)}<small>${esc(g.opis ?? '')}</small></span></button>`).join('')}
    </div></div>` : ''}
    <div class="panel"><h2>Kto gra?</h2><div class="wybory">
      <button class="wybor" type="button" data-tryb="maluch" aria-pressed="false"><span class="emo">🧸</span><span>${TRYBY.maluch}<small>Zagadka czytana na głos, odpowiedź obrazkiem</small></span></button>
      <button class="wybor" type="button" data-tryb="starszak" aria-pressed="false"><span class="emo">🧩</span><span>${TRYBY.starszak}<small>Zagadka do przeczytania, odpowiedź wpisywana</small></span></button>
      <button class="wybor" type="button" data-tryb="mieszany" aria-pressed="false"><span class="emo">🤝</span><span>${TRYBY.mieszany}<small>Na każdej stacji obie zagadki — starsi pomagają młodszym</small></span></button>
    </div></div>
    <div class="panel"><h2>Gdzie schowane są karty?</h2><div class="wybory">
      <button class="wybor" type="button" data-wariant="dom" aria-pressed="false"><span class="emo">🏠</span><span>${WARIANTY.dom}</span></button>
      <button class="wybor" type="button" data-wariant="ogrod" aria-pressed="false"><span class="emo">🌳</span><span>${WARIANTY.ogrod}</span></button>
    </div></div>
    <div class="panel"><h2>PIN rodzica</h2>
      <p class="cichy">4 cyfry. Otwiera panel rodzica: postęp, pominięcie zgubionej karty, reset.</p>
      <input id="pin" class="pole" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" placeholder="np. 2580" aria-label="PIN rodzica">
    </div>
    <button id="zaczynamy" class="przycisk przycisk-dobry" type="button" disabled>🚀 Zaczynamy!</button>
    <a class="przycisk przycisk-jasny przycisk-maly" id="link-druk" href="druk.html?g=${encodeURIComponent(gra.id)}">🖨️ Wydrukuj karty</a>
  `, { rodzic: false });

  const $start = document.getElementById('zaczynamy');
  const $pin = document.getElementById('pin');
  const odswiez = () => {
    $start.disabled = !(wybor.tryb && wybor.wariant && /^\d{4}$/.test($pin.value));
  };
  const zaznacz = (atr, wartosc) => {
    $ekran.querySelectorAll(`[data-${atr}]`).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset[atr] === wartosc)));
  };
  na('[data-gra]', async (e) => {
    wybor.gra = e.currentTarget.dataset.gra;
    zaznacz('gra', wybor.gra);
    document.getElementById('link-druk').href = `druk.html?g=${encodeURIComponent(wybor.gra)}`;
  });
  na('[data-tryb]', (e) => { wybor.tryb = e.currentTarget.dataset.tryb; zaznacz('tryb', wybor.tryb); odswiez(); });
  na('[data-wariant]', (e) => { wybor.wariant = e.currentTarget.dataset.wariant; zaznacz('wariant', wybor.wariant); odswiez(); });
  $pin.addEventListener('input', () => { $pin.value = $pin.value.replace(/\D/g, '').slice(0, 4); odswiez(); });
  $start.addEventListener('click', async () => {
    if (wybor.gra !== gra.id) await ustawGre(wybor.gra);
    stan = nowyStan({ tryb: wybor.tryb, wariant: wybor.wariant, pin: $pin.value });
    zapiszStan();
    ekranSzukania({ powitanie: true });
  });
}

// ---------- „Szukajcie karty nr …” ----------
function ekranSzukania({ brawo = false, pominieta = false, powitanie = false } = {}) {
  const nr = stan.aktualna + 1;
  const w = biezacaWskazowka(gra, stan);
  const maluch = czytaTryb('maluch');
  const starszak = czytaTryb('starszak');
  const tekstMowy = [
    powitanie ? gra.motyw.powitanie?.maluch : '',
    brawo ? 'Brawo!' : '',
    w.maluch,
  ].filter(Boolean).join(' ');

  pokaz(`
    ${naglowek()}
    ${brawo ? `<div class="panel zrobione centrum"><h2>🎉 Brawo! Karta nr ${nr - 1} zaliczona!</h2></div>` : ''}
    ${pominieta ? `<div class="panel centrum"><p>Rodzic przesunął grę dalej.</p></div>` : ''}
    ${powitanie ? `<div class="panel centrum"><p class="zagadka">${esc(starszak ? gra.motyw.powitanie?.starszak : gra.motyw.powitanie?.maluch)}</p></div>` : ''}
    <h1 class="centrum">Szukajcie karty</h1>
    <div class="wielki-numer" data-szukana="${nr}">${nr}</div>
    <div class="panel centrum" data-wskazowka>
      ${maluch ? `<div class="duza-ikona" aria-hidden="true">${esc(w.obrazek)}</div>` : ''}
      <p class="zagadka">${esc(starszak ? w.starszak : w.maluch)}</p>
      ${maluch ? przyciskMowy(w.maluch, '🔊 Posłuchaj, gdzie szukać') : ''}
    </div>
    ${przyciskSkanu}
    <p class="cichy centrum">Znaleźliście kartę? Zeskanujcie kod QR tym przyciskiem albo aparatem telefonu.</p>
  `);
  podepnijMowe();
  podepnijSkan();
  if (maluch) mow(tekstMowy);
}

// ---------- Stacja z zagadką ----------
function ekranStacji(nr, { poSkanie = false } = {}) {
  const s = gra.stacje[nr - 1];
  const czesci = potrzebneCzesci(stan.tryb);
  const zrobione = new Set(stan.czesci[nr] ?? []);
  const panelMalucha = () => {
    const m = s.maluch;
    if (zrobione.has('maluch')) return `<div class="panel panel-maluch zrobione centrum" data-czesc="maluch"><span class="etykieta-czesci">Maluch</span><h2>✅ Brawo, maluchu!</h2></div>`;
    return `<div class="panel panel-maluch" data-czesc="maluch">
      ${czesci.length > 1 ? '<span class="etykieta-czesci">Dla malucha</span>' : ''}
      ${przyciskMowy(m.zagadka, '🔊 Posłuchaj zagadki')}
      <p class="cichy">${esc(m.zagadka)}</p>
      <div class="opcje ${m.opcje.length === 3 ? 'trzy' : ''}">
        ${m.opcje.map((o, i) => `<button class="opcja" type="button" data-opcja="${i}" aria-label="${esc(o.nazwa)}">
          <span class="${[...o.obrazek].length > 2 ? 'wiele' : ''}" aria-hidden="true">${esc(o.obrazek)}</span></button>`).join('')}
      </div>
    </div>`;
  };
  const panelStarszaka = () => {
    const st = s.starszak;
    if (zrobione.has('starszak')) return `<div class="panel panel-starszak zrobione centrum" data-czesc="starszak"><span class="etykieta-czesci">Starszak</span><h2>✅ Dobra odpowiedź!</h2></div>`;
    return `<div class="panel panel-starszak" data-czesc="starszak">
      ${czesci.length > 1 ? '<span class="etykieta-czesci">Dla starszaka</span>' : ''}
      <p class="zagadka">${esc(st.zagadka)}</p>
      <form data-odpowiedz novalidate>
        <input class="pole" name="odp" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done" aria-label="Wasza odpowiedź" placeholder="Wpiszcie odpowiedź">
        <button class="przycisk" type="submit">Sprawdź ✔️</button>
      </form>
      <p class="komunikat" role="status"></p>
    </div>`;
  };

  pokaz(`
    ${naglowek()}
    <h1 class="centrum">Karta nr ${nr} ${gra.motyw.ikona}</h1>
    ${czesci.includes('maluch') ? panelMalucha() : ''}
    ${czesci.includes('starszak') ? panelStarszaka() : ''}
  `);
  podepnijMowe();

  let bledneProby = 0;
  const zalicz = (czesc) => {
    const koniecStacji = zaliczCzesc(stan, nr, czesc);
    if (stan.aktualna >= liczbaStacji()) stan.koniec = Date.now();
    zapiszStan();
    if (koniecStacji) {
      setTimeout(() => (stan.aktualna >= liczbaStacji() ? ekranSkarbu() : ekranSzukania({ brawo: true })), 1100);
    } else {
      zrobione.add(czesc);
      const stary = $ekran.querySelector(`[data-czesc="${czesc}"]`);
      stary.replaceWith(h(czesc === 'maluch' ? panelMalucha() : panelStarszaka()));
    }
  };

  na('[data-opcja]', (e) => {
    const btn = e.currentTarget;
    const i = Number(btn.dataset.opcja);
    const opcja = s.maluch.opcje[i];
    if (i === s.maluch.poprawna) {
      btn.classList.add('dobra');
      mow(`${opcja.nazwa}! Brawo!`);
      zalicz('maluch');
    } else {
      btn.classList.remove('zla');
      void btn.offsetWidth; // restart animacji potrząśnięcia
      btn.classList.add('zla');
      mow(`To jest ${opcja.nazwa}. Spróbuj jeszcze raz!`);
    }
  });

  na('[data-odpowiedz]', (e) => {
    e.preventDefault();
    const pole = e.currentTarget.elements.odp;
    const $kom = $ekran.querySelector('[data-czesc="starszak"] .komunikat');
    if (!normalizuj(pole.value)) { $kom.textContent = 'Najpierw coś wpiszcie 🙂'; $kom.className = 'komunikat'; return; }
    if (czyPoprawna(pole.value, s.starszak.odpowiedzi)) {
      $kom.textContent = '🎉 Tak! Dobra odpowiedź!';
      $kom.className = 'komunikat dobrze';
      pole.blur();
      zalicz('starszak');
    } else {
      bledneProby += 1;
      const { litera, dlugosc } = podpowiedzLiter(s.starszak.odpowiedzi);
      $kom.textContent = bledneProby >= 3
        ? `Podpowiedź: zaczyna się na „${litera}” i ma ${dlugosc} znaków.`
        : 'Jeszcze nie. Pomyślcie i spróbujcie jeszcze raz!';
      $kom.className = 'komunikat zle';
      pole.select();
    }
  }, 'submit');

  // Po skanie aparatem telefonu przeglądarka zwykle blokuje mowę bez dotknięcia ekranu —
  // dlatego zawsze jest też przycisk „Posłuchaj zagadki”.
  if (czesci.includes('maluch') && !zrobione.has('maluch')) mow(s.maluch.zagadka, { poSkanie });
}

// ---------- Komunikaty po skanie ----------
function ekranKomunikatu(typ, nr) {
  const szukana = stan ? stan.aktualna + 1 : 1;
  const tresci = {
    'za-wczesnie': { ikona: '🙈', tytul: 'To jeszcze nie ta kryjówka!',
      tekst: `Ta karta poczeka na swoją kolej. Najpierw znajdźcie kartę nr ${szukana}. Odłóżcie tę kartę tam, gdzie leżała.` },
    'juz-byla': { ikona: '👍', tytul: 'Tę kartę już znaleźliście!', tekst: `Teraz szukacie karty nr ${szukana}.` },
    obca: { ikona: '🤔', tytul: 'Ta karta nie pasuje do gry', tekst: 'Ten kod jest z innej gry albo z innego wydruku. Poproście rodzica o pomoc.' },
    'nie-rozpoczeta': { ikona: '⏳', tytul: 'Gra jeszcze się nie zaczęła', tekst: 'Poproście rodzica, żeby uruchomił grę na tym telefonie.' },
  }[typ];
  pokaz(`
    ${naglowek()}
    <div class="panel centrum" data-komunikat="${typ}">
      <div class="duza-ikona" aria-hidden="true">${tresci.ikona}</div>
      <h1>${tresci.tytul}</h1>
      <p class="zagadka">${esc(tresci.tekst)}</p>
      ${przyciskMowy(`${tresci.tytul} ${tresci.tekst}`)}
    </div>
    ${stan ? `<button class="przycisk" type="button" data-dalej>🔎 Gdzie szukać karty nr ${szukana}?</button>`
    : `<button class="przycisk" type="button" data-konfiguruj>👤 Jestem rodzicem — ustaw grę</button>`}
  `);
  podepnijMowe();
  na('[data-dalej]', () => ekranGlowny());
  na('[data-konfiguruj]', () => ekranKonfiguracji());
  mow(tresci.tytul, { poSkanie: true });
}

// ---------- Skarb ----------
function ekranSkarbu() {
  const ostatnia = gra.stacje[liczbaStacji() - 1].wskazowka[stan.wariant];
  const starszak = czytaTryb('starszak');
  pokaz(`
    ${naglowek()}
    <div class="skarb" data-skarb>
      <div class="duza-ikona" aria-hidden="true">${esc(gra.motyw.skarb.ikona ?? '🎁')}</div>
      <h1>${esc(gra.motyw.skarb.tytul)}</h1>
      <p class="zagadka">${esc(gra.motyw.skarb.tekst)}</p>
      <div class="panel">
        <h2>Gdzie jest skarb?</h2>
        <div class="duza-ikona" aria-hidden="true">${esc(ostatnia.obrazek)}</div>
        <p class="zagadka">${esc(starszak ? ostatnia.starszak : ostatnia.maluch)}</p>
        ${przyciskMowy(ostatnia.maluch)}
      </div>
    </div>
    <div class="konfetti" aria-hidden="true"></div>
  `);
  podepnijMowe();
  const $k = $ekran.querySelector('.konfetti');
  const znaki = ['🎉', '⭐', '🎊', gra.motyw.ikona, '🎈'];
  for (let i = 0; i < 28; i++) {
    const s = document.createElement('span');
    s.textContent = znaki[i % znaki.length];
    s.style.left = `${Math.random() * 100}%`;
    s.style.animationDuration = `${2.5 + Math.random() * 2.5}s`;
    s.style.animationDelay = `${Math.random() * 1.5}s`;
    $k.append(s);
  }
  mow(`${gra.motyw.skarb.tytul} ${ostatnia.maluch}`);
}

// ---------- Panel rodzica ----------
function ekranPinu() {
  let wpisany = '';
  pokaz(`
    ${naglowek()}
    <h1 class="centrum">👤 Panel rodzica</h1>
    <p class="centrum">Wpisz PIN</p>
    <div class="pin-kropki" aria-live="polite" data-kropki>○○○○</div>
    <p class="komunikat zle centrum" role="status"></p>
    <div class="klawiatura">
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((c) => `<button class="przycisk przycisk-jasny" type="button" data-cyfra="${c}">${c}</button>`).join('')}
      <button class="przycisk przycisk-jasny" type="button" data-wroc aria-label="Wróć do gry">✖</button>
      <button class="przycisk przycisk-jasny" type="button" data-cyfra="0">0</button>
      <button class="przycisk przycisk-jasny" type="button" data-kasuj aria-label="Skasuj cyfrę">⌫</button>
    </div>
  `, { rodzic: false });
  const $kropki = $ekran.querySelector('[data-kropki]');
  const $kom = $ekran.querySelector('.komunikat');
  const rysuj = () => { $kropki.textContent = '●'.repeat(wpisany.length) + '○'.repeat(4 - wpisany.length); };
  na('[data-cyfra]', (e) => {
    if (wpisany.length >= 4) return;
    wpisany += e.currentTarget.dataset.cyfra;
    rysuj();
    if (wpisany.length === 4) {
      if (wpisany === stan.pin) { ekranRodzica(); return; }
      $kom.textContent = 'Zły PIN, spróbuj jeszcze raz';
      wpisany = '';
      setTimeout(rysuj, 300);
    }
  });
  na('[data-kasuj]', () => { wpisany = wpisany.slice(0, -1); rysuj(); });
  na('[data-wroc]', () => ekranGlowny());
}

function gdzieSchowana(nr) {
  return nr === 1 ? gra.start[stan.wariant].schowek : gra.stacje[nr - 2].wskazowka[stan.wariant].schowek;
}

function ekranRodzica(komunikat = '') {
  const n = liczbaStacji();
  const minuty = Math.round(((stan.koniec ?? Date.now()) - stan.start) / 60000);
  const baza = adresBazowy();
  const status = (nr) => {
    if (nr <= stan.aktualna) return (stan.pominiete ?? []).includes(nr) ? '⏭️' : '✅';
    if (nr === stan.aktualna + 1) return '👉';
    return '⏳';
  };
  pokaz(`
    ${naglowek()}
    <h1>👤 Panel rodzica</h1>
    ${komunikat ? `<div class="panel zrobione" role="status">${esc(komunikat)}</div>` : ''}
    <div class="panel">
      <h2>Postęp</h2>
      <p><strong data-postep>${Math.min(stan.aktualna, n)} z ${n}</strong> stacji zaliczonych · ${minuty} min gry</p>
      <p class="cichy">Tryb: <strong>${TRYBY[stan.tryb]}</strong> · ${WARIANTY[stan.wariant]}</p>
      <ul class="lista-stacji">
        ${gra.stacje.map((s) => `<li data-stacja="${s.nr}"><span class="stan">${status(s.nr)}</span>
          <span><strong>Karta ${s.nr}</strong> — ${esc(gdzieSchowana(s.nr))}<br>
          <a href="${esc(adresKarty(baza, gra, s))}" data-proba>próba: otwórz jak po skanie</a></span></li>`).join('')}
        <li><span class="stan">${stan.aktualna >= n ? '🎁' : '⏳'}</span><span><strong>Skarb</strong> — ${esc(gra.stacje[n - 1].wskazowka[stan.wariant].schowek.replace(/^SKARB:\s*/, ''))}</span></li>
      </ul>
    </div>
    <div class="panel">
      <h2>Karta zginęła?</h2>
      <p class="cichy">Przesuwa grę o jedną stację i pokazuje dzieciom wskazówkę do następnej kryjówki.</p>
      <button class="przycisk" type="button" data-pomin ${stan.aktualna >= n ? 'disabled' : ''}>⏭️ Przejdź do następnej stacji</button>
      <button class="przycisk przycisk-jasny przycisk-maly" type="button" data-cofnij ${stan.aktualna <= 0 ? 'disabled' : ''}>⏮️ Cofnij o jedną stację</button>
    </div>
    <div class="panel">
      <h2>Zmień tryb</h2>
      <div class="wybory">
        ${Object.entries(TRYBY).map(([k, v]) => `<button class="wybor" type="button" data-zmien-tryb="${k}" aria-pressed="${stan.tryb === k}">${v}</button>`).join('')}
      </div>
    </div>
    <a class="przycisk przycisk-jasny przycisk-maly" href="druk.html?g=${encodeURIComponent(gra.id)}&w=${stan.wariant}">🖨️ Karty do druku i ściągawka</a>
    <button class="przycisk przycisk-zly przycisk-maly" type="button" data-reset>🔄 Zacznij grę od nowa</button>
    <button class="przycisk przycisk-dobry" type="button" data-wroc>⬅️ Wróć do gry</button>
  `, { rodzic: false });

  na('[data-pomin]', () => {
    pominStacje(stan, n);
    zapiszStan();
    if (stan.aktualna >= n) ekranSkarbu(); else ekranSzukania({ pominieta: true });
  });
  na('[data-cofnij]', () => { cofnijStacje(stan); zapiszStan(); ekranRodzica(`Cofnięto. Dzieci szukają karty nr ${stan.aktualna + 1}.`); });
  na('[data-zmien-tryb]', (e) => { stan.tryb = e.currentTarget.dataset.zmienTryb; zapiszStan(); ekranRodzica(`Tryb: ${TRYBY[stan.tryb]}`); });
  na('[data-wroc]', () => ekranGlowny());
  na('[data-proba]', (e) => {
    // Próba bez drukowania: ten sam przebieg co po zeskanowaniu karty.
    e.preventDefault();
    const dane = czytajAdres(e.currentTarget.href);
    if (dane) obsluzSkan(dane);
  });
  // Reset na dwa dotknięcia zamiast okna confirm() — natywne okna łatwo kliknąć odruchowo.
  na('[data-reset]', (e) => {
    const b = e.currentTarget;
    if (b.dataset.potwierdz !== '1') {
      b.dataset.potwierdz = '1';
      b.textContent = '⚠️ Na pewno? Dotknij jeszcze raz';
      return;
    }
    zapisz(kluczStanu(gra.id), null);
    stan = null;
    ekranKonfiguracji();
  });
}

$rodzic.addEventListener('click', () => ekranPinu());

// ---------- Offline ----------
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => { /* bez SW gra działa, tylko nie offline */ });
}
navigator.storage?.persist?.().catch(() => {});

start();
