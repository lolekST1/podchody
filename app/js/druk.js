import { sprawdzGre, adresKarty, WARIANTY } from './logika.js';

const $gra = document.getElementById('gra');
const $baza = document.getElementById('baza');
const $sciagawka = document.getElementById('sciagawka');
const $karty = document.getElementById('karty');
const $ostrzezenie = document.getElementById('ostrzezenie');
const parametry = new URL(location.href).searchParams;
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

$baza.value = new URL('./', location.href).href;
if (parametry.get('w') === 'ogrod') document.querySelector('input[value=ogrod]').checked = true;

// Własne SVG zamiast createSvgTag: crispEdges daje ostre moduły w PDF bez szczelin między kwadratami.
function kodQR(tekst, korekcja) {
  const qr = window.qrcode(0, korekcja);
  qr.addData(tekst);
  qr.make();
  const n = qr.getModuleCount();
  const margines = 4; // strefa ciszy wymagana przez standard QR
  let sciezka = '';
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) if (qr.isDark(r, c)) sciezka += `M${c + margines} ${r + margines}h1v1h-1z`;
  }
  const rozmiar = n + 2 * margines;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${rozmiar} ${rozmiar}" shape-rendering="crispEdges" role="img" aria-label="kod QR">
    <rect width="${rozmiar}" height="${rozmiar}" fill="#fff"/><path d="${sciezka}" fill="#000"/></svg>`;
}

async function wczytaj(id) {
  const g = await (await fetch(`gry/${encodeURIComponent(id)}.json`)).json();
  const bledy = sprawdzGre(g);
  if (bledy.length) throw new Error(bledy.join('; '));
  return g;
}

let gra = null;

function rysuj() {
  if (!gra) return;
  const wariant = document.querySelector('input[name=wariant]:checked').value;
  // Na zewnątrz karta moknie i brudzi się: poziom H odtwarza kod nawet z ~30% uszkodzeń.
  const korekcja = wariant === 'ogrod' ? 'H' : 'M';
  const baza = $baza.value.trim();
  $ostrzezenie.hidden = !/^https?:\/\/(localhost|127\.|192\.168\.|10\.)/.test(baza);
  $ostrzezenie.textContent = 'Uwaga: adres gry to adres lokalny — telefony gości mogą go nie otworzyć. Do wydruku na imprezę użyj adresu opublikowanej gry.';
  const ikony = (gra.motyw.ikonyDruk ?? []).map((src) => `<img src="${esc(src)}" alt="">`).join('');
  const n = gra.stacje.length;

  const karty = gra.stacje.map((s) => `
    <section class="kartka" data-karta="${s.nr}">
      <div class="karta ${wariant}">
        <div class="gora">${ikony || `<span style="font-size:24mm">${esc(gra.motyw.ikona)}</span>`}</div>
        <div class="numer-blok"><div class="slowo-karta">Karta</div><div class="numer">${s.nr}</div></div>
        <div class="qr" data-adres="${esc(adresKarty(baza, gra, s))}">${kodQR(adresKarty(baza, gra, s), korekcja)}</div>
        <p class="skanuj">📷 Zeskanuj mnie!</p>
        <div class="stopka">${esc(gra.tytul)} · karta ${s.nr} z ${n}${wariant === 'ogrod' ? ' · ☔ schowaj w foliowej koszulce' : ''}</div>
      </div>
    </section>`).join('');

  const kryjowka = (nr) => (nr === 1 ? gra.start[wariant] : gra.stacje[nr - 2].wskazowka[wariant]).schowek;
  const sciagawka = !$sciagawka.checked ? '' : `
    <section class="kartka" data-sciagawka>
      <div class="karta sciagawka">
        <h2>Ściągawka rodzica — ${esc(gra.tytul)} (${WARIANTY[wariant].toLowerCase()})</h2>
        <p><strong>Nie pokazuj dzieciom.</strong> Kryjówki możesz zmienić — wtedy popraw też wskazówki w pliku gry.</p>
        <table>
          <thead><tr><th>Karta</th><th>Gdzie schować</th><th>Maluch wskazuje</th><th>Starszak wpisuje</th></tr></thead>
          <tbody>
            ${gra.stacje.map((s) => `<tr><td class="duze">${s.nr}</td><td>${esc(kryjowka(s.nr))}</td>
              <td>${esc(s.maluch.opcje[s.maluch.poprawna].obrazek)} ${esc(s.maluch.opcje[s.maluch.poprawna].nazwa)}</td>
              <td>${esc(s.starszak.odpowiedzi.join(', '))}</td></tr>`).join('')}
            <tr><td class="duze">🎁</td><td colspan="3"><strong>Skarb:</strong> ${esc(gra.stacje[n - 1].wskazowka[wariant].schowek.replace(/^SKARB:\s*/, ''))}</td></tr>
          </tbody>
        </table>
        <h2 style="margin-top:6mm">Przed grą</h2>
        <ol>
          <li>Rozłóż karty w kryjówkach. Kartę nr 1 schowaj tam, gdzie wskaże ekran startowy: <strong>${esc(gra.start[wariant].schowek)}</strong>.</li>
          <li>Otwórz grę na telefonie, wybierz tryb i „${esc(WARIANTY[wariant])}”, ustaw PIN.</li>
          <li>Dzieci skanują karty przyciskiem „📷 Skanuj kartę” w grze (albo aparatem telefonu).</li>
          <li>Karta zginęła? „👤 Rodzic” → PIN → „Przejdź do następnej stacji”.</li>
        </ol>
      </div>
    </section>`;
  $karty.innerHTML = sciagawka + karty;
}

async function start() {
  const lista = (await (await fetch('gry/index.json')).json()).gry;
  const wybrana = parametry.get('g') && lista.includes(parametry.get('g')) ? parametry.get('g') : lista[0];
  for (const id of lista) {
    const opt = new Option(id, id, false, id === wybrana);
    $gra.append(opt);
    wczytaj(id).then((g) => { opt.textContent = `${g.motyw.ikona} ${g.tytul}`; }).catch(() => { opt.textContent = `${id} (błąd w pliku)`; });
  }
  const zmienGre = async () => {
    try { gra = await wczytaj($gra.value); rysuj(); }
    catch (e) { $karty.innerHTML = `<p class="ustawienia ostrzezenie">Plik gry ma błędy: ${esc(e.message)}</p>`; }
  };
  $gra.addEventListener('change', zmienGre);
  document.querySelectorAll('input[name=wariant], #sciagawka').forEach((el) => el.addEventListener('change', rysuj));
  $baza.addEventListener('change', rysuj);
  document.getElementById('drukuj').addEventListener('click', () => window.print());
  await zmienGre();
  document.body.dataset.gotowe = '1';
}
start();
