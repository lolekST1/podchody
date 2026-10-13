// Mowa gry: najpierw nagrania lektora (mp3 z scripts/generuj-mowe.mjs, głos dobrany do
// solenizanta), a gdy nagrania brak albo nie chce się odtworzyć — synteza przeglądarki.
// Wypowiedź to lista segmentów (patrz kwestie.js); każdy segment szukany osobno.

const synteza = typeof window !== 'undefined' ? window.speechSynthesis : undefined;

let nagrania = {}; // tekst segmentu → ścieżka mp3 (manifest bieżącej gry)
let odtwarzacz = null;
let kolejka = 0; // numer bieżącej wypowiedzi — nowa wypowiedź unieważnia poprzednią

export function mowaDostepna() {
  return Object.keys(nagrania).length > 0 || Boolean(synteza && typeof SpeechSynthesisUtterance !== 'undefined');
}

export function ustawNagrania(manifest) {
  nagrania = manifest ?? {};
}

// Jeden wspólny <audio>: na iPhonie raz odblokowany dotknięciem może potem grać
// bez kolejnych dotknięć — nowy element za każdym razem byłby znowu zablokowany.
function audio() {
  if (!odtwarzacz) {
    odtwarzacz = new Audio();
    odtwarzacz.preload = 'auto';
  }
  return odtwarzacz;
}
const CISZA = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=';
if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', () => {
    const a = audio();
    if (a.src) return;
    a.src = CISZA;
    a.play().catch(() => {});
  }, { once: true, capture: true });
}

function polskiGlos() {
  const glosy = synteza.getVoices?.() ?? [];
  return glosy.find((g) => g.lang?.toLowerCase().startsWith('pl') && g.localService)
    ?? glosy.find((g) => g.lang?.toLowerCase().startsWith('pl'))
    ?? null;
}

function zSyntezy(tekst) {
  return new Promise((gotowe) => {
    if (!synteza || typeof SpeechSynthesisUtterance === 'undefined') { gotowe(); return; }
    try {
      const w = new SpeechSynthesisUtterance(tekst);
      w.lang = 'pl-PL';
      const glos = polskiGlos();
      if (glos) w.voice = glos;
      w.rate = 0.9; // wolniej — trzylatek nie nadąża za domyślnym tempem
      w.pitch = 1.05;
      w.onend = () => gotowe();
      w.onerror = () => gotowe();
      synteza.speak(w);
      // Niektóre przeglądarki nie wołają onend — nie blokujmy kolejki na zawsze.
      setTimeout(gotowe, 400 + tekst.length * 110);
    } catch { gotowe(); }
  });
}

function zNagrania(sciezka) {
  return new Promise((gotowe, blad) => {
    const a = audio();
    a.onended = () => gotowe();
    a.onerror = () => blad(new Error('nagranie'));
    a.src = sciezka;
    a.currentTime = 0;
    a.play().catch(blad);
  });
}

const sygnal = (trwa) => document.dispatchEvent(new CustomEvent('mowa', { detail: { trwa } }));

export async function mow(segmenty) {
  const lista = (Array.isArray(segmenty) ? segmenty : [segmenty]).filter(Boolean);
  if (!lista.length) return;
  przerwijMowe();
  const moja = ++kolejka;
  // Ślad dla testów: co gra próbowała powiedzieć (niezależnie od tego, czym).
  if (window.__mowaLog) window.__mowaLog.push(...lista);
  sygnal(true);
  for (const tekst of lista) {
    if (moja !== kolejka) return;
    const sciezka = nagrania[tekst];
    try {
      if (!sciezka) throw new Error('brak nagrania');
      await zNagrania(sciezka);
    } catch {
      if (moja !== kolejka) return;
      // Nagranie zablokowane (np. brak dotknięcia po skanie aparatem) albo go nie ma.
      await zSyntezy(tekst);
    }
  }
  if (moja === kolejka) sygnal(false);
}

export function przerwijMowe() {
  kolejka++;
  try { synteza?.cancel(); } catch { /* nic */ }
  if (odtwarzacz && !odtwarzacz.paused) odtwarzacz.pause();
  sygnal(false);
}
