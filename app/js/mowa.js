// Mowa po polsku. Gra z głosem maskotki (motyw.maskotka.glos) ma gotowe nagrania
// w nagrania/<id gry>/ — wtedy gramy pliki. Bez nagrania zostaje synteza systemowa.
import { plikNagrania } from './logika.js';

const synteza = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
const odtwarzacz = typeof Audio !== 'undefined' ? new Audio() : null;
let nagrania = null; // { glos, katalog, pliki: Set, gotowe: Map adres → blob: }
let numer = 0; // każde nowe czytanie przerywa poprzednie

function syntezaDostepna() {
  return Boolean(synteza && typeof SpeechSynthesisUtterance !== 'undefined');
}
export function mowaDostepna() {
  return syntezaDostepna() || Boolean(nagrania && odtwarzacz);
}

// Wczytuje listę nagrań gry i pobiera je w tle: service worker zachowa je na grę bez sieci,
// a odtwarzamy z pamięci (blob:) — Safari nie zagra dźwięku z cache bez obsługi zakresów (Range).
export async function wczytajNagrania(gra) {
  nagrania = null;
  const glos = gra.motyw.maskotka?.glos;
  if (!glos || !odtwarzacz) return;
  try {
    const odp = await fetch(`nagrania/${gra.id}.json`);
    if (!odp.ok) return;
    const lista = await odp.json();
    if (lista.glos !== glos) return; // nagrania innym głosem — lepiej synteza niż pomieszane głosy
    const moje = { glos, katalog: `nagrania/${gra.id}/`, pliki: new Set(lista.pliki), gotowe: new Map() };
    nagrania = moje;
    setTimeout(async () => {
      for (const p of moje.pliki) {
        if (nagrania !== moje) return; // wybrano inną grę
        const adres = `${moje.katalog}${p}.mp3`;
        try {
          const odp = await fetch(adres);
          if (odp.ok) moje.gotowe.set(adres, URL.createObjectURL(await odp.blob()));
        } catch { return; } // bez sieci — spróbujemy przy następnym otwarciu
      }
    }, 1000);
  } catch { /* brak nagrań — czyta synteza */ }
}

const sygnal = (trwa, tekst) => document.dispatchEvent(new CustomEvent('mowa', { detail: { trwa, tekst } }));

function polskiGlos() {
  const glosy = synteza.getVoices?.() ?? [];
  return glosy.find((g) => g.lang?.toLowerCase().startsWith('pl') && g.localService)
    ?? glosy.find((g) => g.lang?.toLowerCase().startsWith('pl'))
    ?? null;
}

// Głos systemowy bywa ładowany asynchronicznie, więc szukamy go przy każdym czytaniu.
function mowSynteza(tekst) {
  if (!syntezaDostepna()) return;
  try {
    synteza.cancel();
    const w = new SpeechSynthesisUtterance(tekst);
    w.lang = 'pl-PL';
    const glos = polskiGlos();
    if (glos) w.voice = glos;
    w.rate = 0.9; // wolniej — trzylatek nie nadąża za domyślnym tempem
    w.pitch = 1.05;
    // Zdarzenie dla maskotki — rusza pyszczkiem, dopóki trwa czytanie.
    w.onstart = () => sygnal(true, tekst);
    w.onend = () => sygnal(false);
    w.onerror = () => sygnal(false);
    synteza.speak(w);
  } catch { /* przeglądarka bez mowy — tekst i tak jest na ekranie */ }
}

// Kawałki odtwarzamy po kolei; gdy któregoś pliku nie da się zagrać, resztę czyta synteza.
function graj(czesci, adresy, moj) {
  let i = 0;
  const reszta = () => {
    if (moj !== numer) return;
    numer += 1; // błąd zgłaszają i play(), i onerror — synteza ma ruszyć raz
    sygnal(false);
    mowSynteza(czesci.slice(i - 1).join(' '));
  };
  const dalej = () => {
    if (moj !== numer) return;
    if (i >= adresy.length) { sygnal(false); return; }
    odtwarzacz.src = nagrania?.gotowe.get(adresy[i]) ?? adresy[i];
    i += 1;
    odtwarzacz.play().catch((e) => {
      if (moj !== numer) return;
      // Zablokowane bez dotknięcia ekranu — synteza też by nie ruszyła, zostaje przycisk „Posłuchaj”.
      if (e?.name === 'NotAllowedError') sygnal(false); else reszta();
    });
  };
  odtwarzacz.onended = dalej;
  odtwarzacz.onerror = reszta;
  sygnal(true, czesci.join(' '));
  dalej();
}

// tekst: zdanie albo lista zdań czytanych jedno po drugim.
export function mow(tekst) {
  const czesci = (Array.isArray(tekst) ? tekst : [tekst]).filter(Boolean);
  if (!czesci.length) return;
  przerwijMowe();
  const moj = numer;
  const adresy = nagrania && czesci.map((c) => {
    const plik = plikNagrania(nagrania.glos, c);
    return nagrania.pliki.has(plik) ? `${nagrania.katalog}${plik}.mp3` : null;
  });
  if (adresy?.every(Boolean)) graj(czesci, adresy, moj);
  else mowSynteza(czesci.join(' '));
}

export function przerwijMowe() {
  numer += 1;
  try { odtwarzacz?.pause(); } catch { /* nic */ }
  try { synteza?.cancel(); } catch { /* nic */ }
  if (typeof document !== 'undefined') sygnal(false);
}
