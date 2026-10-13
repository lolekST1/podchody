import {
  TRYBY, WARIANTY, normalizuj, czyPoprawna, podpowiedzLiter, sprawdzGre,
  nowyStan, ocenSkan, potrzebneCzesci, zaliczCzesc, pominStacje, cofnijStacje,
  biezacaWskazowka, adresKarty, czytajAdres,
} from './logika.js';
import { mow, przerwijMowe, mowaDostepna } from './mowa.js';
import { otworzSkaner } from './skaner.js';
import { maskotkaSVG, nastroj } from './maskotka.js';
import { skrzyniaSVG, motorekSVG } from './sceny.js';
import { wybuch, deszcz, fontanna, spaliny, dzwiek, wibruj, czyCisza, przelaczCisze } from './efekty.js';

const $ekran = document.getElementById('ekran');
const $rodzic = document.getElementById('przycisk-rodzic');

let gra = null;
let stan = null;
// Postęp pokazany na drodze przy poprzednim ekranie — motorek rusza z tego miejsca.
let postepNaDrodze = null;

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
function pokaz(html, { rodzic = true, klasa = '' } = {}) {
  przerwijMowe();
  $ekran.className = `ekran ${klasa}`;
  $ekran.replaceChildren(h(html));
  $rodzic.hidden = !(rodzic && stan);
  window.scrollTo(0, 0);
  const tytul = $ekran.querySelector('h1');
  if (tytul) tytul.setAttribute('tabindex', '-1');
  podepnijNaglowek();
}
const na = (sel, fn, zdarzenie = 'click') => $ekran.querySelectorAll(sel).forEach((el) => el.addEventListener(zdarzenie, fn));
const liczbaStacji = () => gra.stacje.length;
const czytaTryb = (czesc) => stan && potrzebneCzesci(stan.tryb).includes(czesc);
const adresBazowy = () => new URL('./', location.href).href;
// Kolejne elementy ekranu wjeżdżają po sobie — --d to opóźnienie w krokach.
const wej = (d) => `style="--d:${d}"`;
const maskotka = (klasa = '', etykieta) => `<div class="maskotka ${klasa}" aria-hidden="${etykieta ? 'false' : 'true'}">${maskotkaSVG({ etykieta })}</div>`;

function naglowek() {
  const n = liczbaStacji();
  const zrobione = stan ? Math.min(stan.aktualna, n) : 0;
  const pozycja = stan && stan.aktualna >= n ? n + 1 : zrobione; // po ostatniej karcie motorek staje na mecie
  const droga = !stan ? '' : `
    <div class="droga" style="--n:${n}" data-droga="${pozycja}">
      <div class="droga-asfalt"><div class="droga-pasy"></div></div>
      ${gra.stacje.map((s) => `<span class="flaga ${s.nr <= zrobione ? 'zdobyta' : ''} ${s.nr === zrobione + 1 ? 'nastepna' : ''}" style="--i:${s.nr}">${s.nr}</span>`).join('')}
      <span class="meta" aria-hidden="true">🎁</span>
      <div class="motorek" style="--p:${postepNaDrodze ?? pozycja}">${motorekSVG()}</div>
    </div>`;
  return `<header class="naglowek" ${wej(0)}>
    <div class="naglowek-gora">
      <span class="tytul-gry"><span class="ikony" aria-hidden="true">${(gra.motyw.ikony ?? [gra.motyw.ikona]).join('')}</span>${esc(gra.tytul)}</span>
      ${stan ? `<span class="postep" aria-label="Zaliczone karty">${zrobione} / ${n} ✅</span>` : ''}
      <button class="cisza" type="button" data-cisza aria-label="${czyCisza() ? 'Włącz dźwięki' : 'Wycisz dźwięki'}">${czyCisza() ? '🔇' : '🔊'}</button>
    </div>
    ${droga}
  </header>`;
}

// Motorek jedzie od poprzedniej pozycji do bieżącej — z warkotem i spalinami.
function podepnijNaglowek() {
  na('[data-cisza]', (e) => {
    const c = przelaczCisze();
    e.currentTarget.textContent = c ? '🔇' : '🔊';
    e.currentTarget.setAttribute('aria-label', c ? 'Włącz dźwięki' : 'Wycisz dźwięki');
  });
  const $droga = $ekran.querySelector('[data-droga]');
  if (!$droga) { postepNaDrodze = null; return; }
  const cel = Number($droga.dataset.droga);
  const $motor = $droga.querySelector('.motorek');
  if (postepNaDrodze !== null && postepNaDrodze !== cel) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      $motor.classList.add('jedzie');
      $motor.style.setProperty('--p', cel);
      dzwiek('wrrum');
      const kurz = setInterval(() => { const q = $motor.getBoundingClientRect(); spaliny(q.left + 4, q.bottom - 10); }, 160);
      setTimeout(() => { clearInterval(kurz); $motor.classList.remove('jedzie'); }, 1500);
    }));
  }
  postepNaDrodze = cel;
}

function przyciskMowy(tekst, etykieta = '🔊 Posłuchaj') {
  if (!mowaDostepna()) return '';
  return `<button class="przycisk przycisk-jasny przycisk-mowy" type="button" data-mow="${esc(tekst)}">${etykieta}</button>`;
}
function podepnijMowe() {
  na('[data-mow]', (e) => mow(e.currentTarget.dataset.mow));
}
const przyciskSkanu = (d) => `<button class="przycisk przycisk-skanuj" type="button" data-skanuj ${wej(d)}><span class="ikona-aparatu" aria-hidden="true">📷</span> Skanuj kartę</button>`;
function podepnijSkan() {
  na('[data-skanuj]', () => {
    dzwiek('klik');
    otworzSkaner((adres) => {
      const dane = czytajAdres(adres);
      if (!dane) return false;
      wibruj(30);
      obsluzSkan(dane);
      return true;
    });
  });
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
  document.documentElement.style.setProperty('--motyw', gra.motyw.kolor ?? '#e8590c');
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
  const kafel = (atr, wart, emo, tytul, opis) => `<button class="wybor" type="button" data-${atr}="${wart}" aria-pressed="false">
      <span class="emo" aria-hidden="true">${emo}</span><span>${tytul}${opis ? `<small>${opis}</small>` : ''}</span><span class="ptaszek" aria-hidden="true">✓</span></button>`;

  pokaz(`
    <section class="powitanie-gry" ${wej(0)}>
      ${maskotka('macha', 'Tygrysek macha na powitanie')}
      <div>
        <p class="nadtytul">Gra terenowa</p>
        <p class="logo">Podchody</p>
        <p class="cichy">${esc(gra.tytul)} · ${gra.stacje.length} kart</p>
      </div>
    </section>
    <h1 ${wej(1)}>Przygotuj grę</h1>
    <p class="cichy" ${wej(1)}>Ten ekran jest dla rodzica. Dzieci zobaczą grę po naciśnięciu „Zaczynamy!”.</p>
    ${Object.keys(tytuly).length > 1 ? `<div class="panel" ${wej(2)}><h2>Gra</h2><div class="wybory">
      ${Object.values(tytuly).map((g) => `<button class="wybor" type="button" data-gra="${esc(g.id)}" aria-pressed="${g.id === gra.id}">
        <span class="emo">${esc(g.motyw.ikona)}</span><span>${esc(g.tytul)}<small>${esc(g.opis ?? '')}</small></span><span class="ptaszek" aria-hidden="true">✓</span></button>`).join('')}
    </div></div>` : ''}
    <div class="panel" ${wej(2)}><h2>Kto gra?</h2><div class="wybory">
      ${kafel('tryb', 'maluch', '🧸', TRYBY.maluch, 'Zagadka czytana na głos, odpowiedź obrazkiem')}
      ${kafel('tryb', 'starszak', '🧩', TRYBY.starszak, 'Zagadka do przeczytania, odpowiedź wpisywana')}
      ${kafel('tryb', 'mieszany', '🤝', TRYBY.mieszany, 'Na każdej karcie obie zagadki — starsi pomagają młodszym')}
    </div></div>
    <div class="panel" ${wej(3)}><h2>Gdzie schowane są karty?</h2><div class="wybory dwa">
      ${kafel('wariant', 'dom', '🏠', WARIANTY.dom)}
      ${kafel('wariant', 'ogrod', '🌳', WARIANTY.ogrod)}
    </div></div>
    <div class="panel" ${wej(4)}><h2>PIN rodzica</h2>
      <p class="cichy">4 cyfry. Otwiera panel rodzica: postęp, pominięcie zgubionej karty, reset.</p>
      <input id="pin" class="pole" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" placeholder="np. 2580" aria-label="PIN rodzica">
    </div>
    <button id="zaczynamy" class="przycisk przycisk-dobry przycisk-start" type="button" disabled ${wej(5)}>🚀 Zaczynamy!</button>
    <a class="przycisk przycisk-jasny przycisk-maly" id="link-druk" href="druk.html?g=${encodeURIComponent(gra.id)}" ${wej(5)}>🖨️ Wydrukuj karty</a>
  `, { rodzic: false, klasa: 'ekran-konfiguracji' });

  const $start = document.getElementById('zaczynamy');
  const $pin = document.getElementById('pin');
  const odswiez = () => {
    const gotowe = Boolean(wybor.tryb && wybor.wariant && /^\d{4}$/.test($pin.value));
    if (gotowe && $start.disabled) wybuch($start, { ile: 18, vMax: 380 });
    $start.disabled = !gotowe;
  };
  const zaznacz = (atr, wartosc) => {
    $ekran.querySelectorAll(`[data-${atr}]`).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset[atr] === wartosc)));
    dzwiek('klik');
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
    postepNaDrodze = 0;
    dzwiek('wrrum');
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
  const dymek = powitanie
    ? (starszak ? gra.motyw.powitanie?.starszak : gra.motyw.powitanie?.maluch)
    : brawo ? 'Hurra! Jedziemy dalej! Wrrrum!' : `Gdzie się schowała karta nr ${nr}?`;

  pokaz(`
    ${naglowek()}
    ${brawo ? `<div class="wstega" data-brawo ${wej(1)}><span>🎉 Brawo! Karta nr ${nr - 1} zaliczona!</span></div>` : ''}
    ${pominieta ? `<div class="panel centrum" ${wej(1)}><p>Rodzic przesunął grę dalej.</p></div>` : ''}
    <section class="scena-maskotki" ${wej(1)}>
      ${maskotka(brawo ? 'cieszy' : 'macha')}
      <p class="dymek">${esc(dymek)}</p>
    </section>
    <h1 class="centrum tytul-szukania" ${wej(2)}>Szukajcie karty</h1>
    <div class="medal" data-szukana="${nr}" ${wej(3)}><span class="medal-cyfra">${nr}</span></div>
    <div class="panel wskazowka" data-wskazowka ${wej(4)}>
      ${maluch ? `<div class="radar" aria-hidden="true"><span class="radar-fala"></span><span class="radar-fala"></span><span class="radar-obrazek">${esc(w.obrazek)}</span></div>` : ''}
      <p class="zagadka">${esc(starszak ? w.starszak : w.maluch)}</p>
      ${maluch ? przyciskMowy(w.maluch, '🔊 Posłuchaj, gdzie szukać') : ''}
    </div>
    ${przyciskSkanu(5)}
    <p class="cichy centrum" ${wej(6)}>Znaleźliście kartę? Zeskanujcie kod QR tym przyciskiem albo aparatem telefonu.</p>
  `, { klasa: 'ekran-szukania' });
  podepnijMowe();
  podepnijSkan();
  if (brawo) {
    dzwiek('dobrze');
    deszcz({ ile: 90 });
    wibruj([40, 60, 40]);
  }
  if (maluch) mow(tekstMowy);
}

// ---------- Stacja z zagadką ----------
function ekranStacji(nr, { poSkanie = false } = {}) {
  const s = gra.stacje[nr - 1];
  const czesci = potrzebneCzesci(stan.tryb);
  const zrobione = new Set(stan.czesci[nr] ?? []);
  const panelMalucha = (d = 3) => {
    const m = s.maluch;
    if (zrobione.has('maluch')) return `<div class="panel panel-maluch zrobione centrum" data-czesc="maluch"><span class="etykieta-czesci">Maluch</span><h2>✅ Brawo, maluchu!</h2></div>`;
    return `<div class="panel panel-maluch" data-czesc="maluch" ${wej(d)}>
      ${czesci.length > 1 ? '<span class="etykieta-czesci">Dla malucha</span>' : ''}
      <div class="pytanie">
        ${maskotka('maly')}
        <div class="dymek dymek-pytanie">
          ${przyciskMowy(m.zagadka, '🔊 Posłuchaj zagadki')}
          <p class="cichy">${esc(m.zagadka)}</p>
        </div>
      </div>
      <div class="opcje ${m.opcje.length === 3 ? 'trzy' : ''}">
        ${m.opcje.map((o, i) => `<button class="opcja" type="button" data-opcja="${i}" aria-label="${esc(o.nazwa)}" style="--k:${i}">
          <span class="${[...o.obrazek].length > 2 ? 'wiele' : ''}" aria-hidden="true">${esc(o.obrazek)}</span></button>`).join('')}
      </div>
    </div>`;
  };
  const panelStarszaka = (d = 4) => {
    const st = s.starszak;
    if (zrobione.has('starszak')) return `<div class="panel panel-starszak zrobione centrum" data-czesc="starszak"><span class="etykieta-czesci">Starszak</span><h2>✅ Dobra odpowiedź!</h2></div>`;
    return `<div class="panel panel-starszak" data-czesc="starszak" ${wej(d)}>
      ${czesci.length > 1 ? '<span class="etykieta-czesci">Dla starszaka</span>' : ''}
      ${czesci.length === 1 ? `<div class="pytanie">${maskotka('maly')}<p class="dymek">Zagadka dla was!</p></div>` : ''}
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
    <h1 class="tytul-karty" ${wej(1)}><span class="odznaka" aria-hidden="true">${nr}</span><span>Karta nr ${nr}</span></h1>
    ${czesci.includes('maluch') ? panelMalucha() : ''}
    ${czesci.includes('starszak') ? panelStarszaka() : ''}
  `, { klasa: 'ekran-stacji' });
  podepnijMowe();
  if (poSkanie) { dzwiek('klik'); wibruj(25); }

  let bledneProby = 0;
  const zalicz = (czesc, $zrodlo) => {
    const koniecStacji = zaliczCzesc(stan, nr, czesc);
    if (stan.aktualna >= liczbaStacji()) stan.koniec = Date.now();
    zapiszStan();
    wybuch($zrodlo, { ile: 50 });
    dzwiek('dobrze');
    wibruj([30, 40, 60]);
    nastroj('cieszy', 1200);
    if (koniecStacji) {
      setTimeout(() => (stan.aktualna >= liczbaStacji() ? ekranSkarbu() : ekranSzukania({ brawo: true })), 1100);
    } else {
      zrobione.add(czesc);
      const stary = $ekran.querySelector(`[data-czesc="${czesc}"]`);
      setTimeout(() => {
        stary.replaceWith(h(czesc === 'maluch' ? panelMalucha() : panelStarszaka()));
        // Druga część czeka — przewiń do niej, żeby starszak od razu wiedział, że teraz jego kolej.
        $ekran.querySelector('[data-czesc]:not(.zrobione)')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 650);
    }
  };
  const zle = () => {
    dzwiek('zle');
    wibruj(120);
    nastroj('smutny', 1100);
  };

  na('[data-opcja]', (e) => {
    const btn = e.currentTarget;
    const i = Number(btn.dataset.opcja);
    const opcja = s.maluch.opcje[i];
    if (i === s.maluch.poprawna) {
      btn.classList.add('dobra');
      $ekran.querySelectorAll('[data-opcja]').forEach((b) => { if (b !== btn) b.classList.add('zgaszona'); });
      mow(`${opcja.nazwa}! Brawo!`);
      zalicz('maluch', btn);
    } else {
      btn.classList.remove('zla');
      void btn.offsetWidth; // restart animacji potrząśnięcia
      btn.classList.add('zla');
      mow(`To jest ${opcja.nazwa}. Spróbuj jeszcze raz!`);
      zle();
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
      pole.classList.add('pole-dobrze');
      pole.blur();
      zalicz('starszak', pole);
    } else {
      bledneProby += 1;
      const { litera, dlugosc } = podpowiedzLiter(s.starszak.odpowiedzi);
      $kom.textContent = bledneProby >= 3
        ? `Podpowiedź: zaczyna się na „${litera}” i ma ${dlugosc} znaków.`
        : 'Jeszcze nie. Pomyślcie i spróbujcie jeszcze raz!';
      $kom.className = 'komunikat zle';
      pole.classList.remove('pole-zle');
      void pole.offsetWidth;
      pole.classList.add('pole-zle');
      pole.select();
      zle();
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
    'za-wczesnie': { ikona: '🙈', nastroj: 'smutny', tytul: 'To jeszcze nie ta kryjówka!',
      tekst: `Ta karta poczeka na swoją kolej. Najpierw znajdźcie kartę nr ${szukana}. Odłóżcie tę kartę tam, gdzie leżała.` },
    'juz-byla': { ikona: '👍', nastroj: 'macha', tytul: 'Tę kartę już znaleźliście!', tekst: `Teraz szukacie karty nr ${szukana}.` },
    obca: { ikona: '🤔', nastroj: 'smutny', tytul: 'Ta karta nie pasuje do gry', tekst: 'Ten kod jest z innej gry albo z innego wydruku. Poproście rodzica o pomoc.' },
    'nie-rozpoczeta': { ikona: '⏳', nastroj: 'macha', tytul: 'Gra jeszcze się nie zaczęła', tekst: 'Poproście rodzica, żeby uruchomił grę na tym telefonie.' },
  }[typ];
  pokaz(`
    ${naglowek()}
    <div class="panel centrum komunikat-panel" data-komunikat="${typ}" ${wej(1)}>
      <div class="komunikat-scena">${maskotka(tresci.nastroj)}<span class="komunikat-ikona" aria-hidden="true">${tresci.ikona}</span></div>
      <h1>${tresci.tytul}</h1>
      <p class="zagadka">${esc(tresci.tekst)}</p>
      ${przyciskMowy(`${tresci.tytul} ${tresci.tekst}`)}
    </div>
    ${stan ? `<button class="przycisk" type="button" data-dalej ${wej(2)}>🔎 Gdzie szukać karty nr ${szukana}?</button>`
    : `<button class="przycisk" type="button" data-konfiguruj ${wej(2)}>👤 Jestem rodzicem — ustaw grę</button>`}
  `, { klasa: 'ekran-komunikatu' });
  podepnijMowe();
  na('[data-dalej]', () => ekranGlowny());
  na('[data-konfiguruj]', () => ekranKonfiguracji());
  dzwiek(typ === 'juz-byla' || typ === 'nie-rozpoczeta' ? 'klik' : 'zle');
  mow(tresci.tytul, { poSkanie: true });
}

// ---------- Skarb ----------
function ekranSkarbu() {
  const ostatnia = gra.stacje[liczbaStacji() - 1].wskazowka[stan.wariant];
  const starszak = czytaTryb('starszak');
  pokaz(`
    ${naglowek()}
    <div class="skarb" data-skarb>
      <h1 class="tytul-skarbu" ${wej(1)}>${esc(gra.motyw.skarb.tytul)}</h1>
      <div class="scena-skarbu" ${wej(2)}>
        <div class="promienie" aria-hidden="true"></div>
        <button class="skrzynia" type="button" data-skrzynia aria-label="Otwórz skrzynię skarbu">${skrzyniaSVG()}</button>
        ${maskotka('tanczy')}
      </div>
      <p class="podpowiedz-skrzyni" ${wej(3)}>👆 Dotknijcie skrzyni!</p>
      <p class="zagadka" ${wej(3)}>${esc(gra.motyw.skarb.tekst)}</p>
      <div class="panel" ${wej(4)}>
        <h2>Gdzie jest prawdziwy skarb?</h2>
        <div class="radar" aria-hidden="true"><span class="radar-fala"></span><span class="radar-fala"></span><span class="radar-obrazek">${esc(ostatnia.obrazek)}</span></div>
        <p class="zagadka">${esc(starszak ? ostatnia.starszak : ostatnia.maluch)}</p>
        ${przyciskMowy(ostatnia.maluch)}
      </div>
    </div>
  `, { klasa: 'ekran-skarbu' });
  podepnijMowe();
  const $scena = $ekran.querySelector('.scena-skarbu');
  const $skrzynia = $ekran.querySelector('[data-skrzynia]');
  let otwarta = false;
  const otworz = () => {
    if (otwarta) { fontanna($skrzynia, { ile: 30 }); dzwiek('klik'); return; }
    otwarta = true;
    $scena.classList.add('otwarta');
    $ekran.querySelector('.podpowiedz-skrzyni').textContent = '✨ Hurra! ✨';
    dzwiek('skrzynia');
    setTimeout(() => dzwiek('fanfara'), 350);
    wibruj([60, 50, 60, 50, 200]);
    setTimeout(() => fontanna($skrzynia), 250);
    setTimeout(() => deszcz({ ile: 160, ksztalty: ['konfetti', 'pasek', 'gwiazda', 'emoji'], emoji: [gra.motyw.ikona, '⭐', '🎈'] }), 500);
  };
  $skrzynia.addEventListener('click', otworz);
  // Gdy nikt nie dotknie, skrzynia otwiera się sama — finał nie może przepaść.
  setTimeout(() => { if ($skrzynia.isConnected) otworz(); }, 4500);
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
  `, { rodzic: false, klasa: 'ekran-rodzica' });
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
      $kropki.classList.remove('pin-zly');
      void $kropki.offsetWidth;
      $kropki.classList.add('pin-zly');
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
        ${Object.entries(TRYBY).map(([k, v]) => `<button class="wybor" type="button" data-zmien-tryb="${k}" aria-pressed="${stan.tryb === k}">${v}<span class="ptaszek" aria-hidden="true">✓</span></button>`).join('')}
      </div>
    </div>
    <a class="przycisk przycisk-jasny przycisk-maly" href="druk.html?g=${encodeURIComponent(gra.id)}&w=${stan.wariant}">🖨️ Karty do druku i ściągawka</a>
    <button class="przycisk przycisk-zly przycisk-maly" type="button" data-reset>🔄 Zacznij grę od nowa</button>
    <button class="przycisk przycisk-dobry" type="button" data-wroc>⬅️ Wróć do gry</button>
  `, { rodzic: false, klasa: 'ekran-rodzica' });

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
    postepNaDrodze = null;
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
