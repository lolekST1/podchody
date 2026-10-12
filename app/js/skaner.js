// Skaner QR w aplikacji. Ważniejszy, niż wygląda: gdy dzieci skanują w aplikacji,
// zostają na tej samej stronie (ten sam zapis postępu, mowa działa bez dodatkowego dotknięcia).
// BarcodeDetector jest szybki, ale go nie ma w Safari i Firefoksie — wtedy jsQR.
const $skaner = document.getElementById('skaner');
const $wideo = document.getElementById('skaner-wideo');
const $info = document.getElementById('skaner-info');
const $zamknij = document.getElementById('skaner-zamknij');

let strumien = null;
let aktywny = false;

function zamknij() {
  aktywny = false;
  strumien?.getTracks().forEach((t) => t.stop());
  strumien = null;
  $wideo.srcObject = null;
  $skaner.hidden = true;
}
$zamknij.addEventListener('click', zamknij);

async function detektor() {
  if ('BarcodeDetector' in window) {
    try {
      const formaty = await window.BarcodeDetector.getSupportedFormats();
      if (formaty.includes('qr_code')) {
        const d = new window.BarcodeDetector({ formats: ['qr_code'] });
        return async (zrodlo) => (await d.detect(zrodlo))[0]?.rawValue ?? null;
      }
    } catch { /* spadamy do jsQR */ }
  }
  const plotno = document.createElement('canvas');
  const ctx = plotno.getContext('2d', { willReadFrequently: true });
  return async (zrodlo) => {
    const w = zrodlo.videoWidth, hh = zrodlo.videoHeight;
    if (!w || !hh) return null;
    const skala = Math.min(1, 640 / Math.max(w, hh)); // mniejsza klatka = płynniej na starszych telefonach
    plotno.width = Math.round(w * skala);
    plotno.height = Math.round(hh * skala);
    ctx.drawImage(zrodlo, 0, 0, plotno.width, plotno.height);
    const obraz = ctx.getImageData(0, 0, plotno.width, plotno.height);
    return window.jsQR?.(obraz.data, obraz.width, obraz.height, { inversionAttempts: 'dontInvert' })?.data ?? null;
  };
}

export async function otworzSkaner(poOdczycie) {
  $skaner.hidden = false;
  $info.textContent = 'Włączam aparat…';
  try {
    strumien = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
  } catch {
    $info.textContent = 'Nie mogę włączyć aparatu. Zamknij to okno i zeskanuj kartę zwykłym aparatem telefonu.';
    return;
  }
  $wideo.srcObject = strumien;
  await $wideo.play().catch(() => {});
  $info.textContent = 'Wyceluj w kod na karcie';
  const czytaj = await detektor();
  aktywny = true;
  let zly = '';
  const petla = async () => {
    if (!aktywny) return;
    let tekst = null;
    try { tekst = await czytaj($wideo); } catch { /* klatka nieczytelna */ }
    if (tekst && aktywny && tekst !== zly) {
      if (poOdczycie(tekst)) { zamknij(); return; }
      // Cudzy kod: zostajemy w skanerze i ignorujemy go, dopóki nie pojawi się inny.
      zly = tekst;
      $info.textContent = 'To nie jest karta z tej gry. Spróbuj inną!';
    }
    setTimeout(petla, 150);
  };
  petla();
}
