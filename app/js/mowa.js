// Synteza mowy po polsku. Głos systemowy bywa ładowany asynchronicznie,
// więc szukamy polskiego głosu przy każdym czytaniu, a nie raz na starcie.
const synteza = typeof window !== 'undefined' ? window.speechSynthesis : undefined;

export function mowaDostepna() {
  return Boolean(synteza && typeof SpeechSynthesisUtterance !== 'undefined');
}

function polskiGlos() {
  const glosy = synteza.getVoices?.() ?? [];
  return glosy.find((g) => g.lang?.toLowerCase().startsWith('pl') && g.localService)
    ?? glosy.find((g) => g.lang?.toLowerCase().startsWith('pl'))
    ?? null;
}

export function mow(tekst) {
  if (!mowaDostepna() || !tekst) return;
  try {
    synteza.cancel();
    const w = new SpeechSynthesisUtterance(tekst);
    w.lang = 'pl-PL';
    const glos = polskiGlos();
    if (glos) w.voice = glos;
    w.rate = 0.9; // wolniej — trzylatek nie nadąża za domyślnym tempem
    w.pitch = 1.05;
    // Zdarzenie dla maskotki — rusza pyszczkiem, dopóki trwa czytanie.
    const sygnal = (trwa) => document.dispatchEvent(new CustomEvent('mowa', { detail: { trwa } }));
    w.onstart = () => sygnal(true);
    w.onend = () => sygnal(false);
    w.onerror = () => sygnal(false);
    synteza.speak(w);
  } catch { /* przeglądarka bez mowy — tekst i tak jest na ekranie */ }
}

export function przerwijMowe() {
  try { synteza?.cancel(); } catch { /* nic */ }
  document.dispatchEvent(new CustomEvent('mowa', { detail: { trwa: false } }));
}
