// Efekty: cząsteczki na <canvas>, dźwięki syntezowane w Web Audio (zero plików — działa offline),
// wibracje. Wszystko gaśnie przy „ogranicz ruch” w systemie i przy wyciszeniu w grze.

const ograniczRuch = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Cząsteczki ----------
const KOLORY = ['#ff922b', '#ffd43b', '#51cf66', '#339af0', '#f06595', '#cc5de8', '#ffffff'];
let plotno = null;
let ctx = null;
let czastki = [];
let petlaTrwa = false;
const emojiCache = new Map();

function przygotujPlotno() {
  if (plotno) return;
  plotno = document.createElement('canvas');
  plotno.className = 'warstwa-efektow';
  plotno.setAttribute('aria-hidden', 'true');
  document.body.append(plotno);
  ctx = plotno.getContext('2d');
  const rozmiar = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    plotno.width = innerWidth * dpr;
    plotno.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  rozmiar();
  addEventListener('resize', rozmiar);
}

// Emoji rysowane raz do małego płótna — fillText co klatkę jest na telefonach za wolny.
function obrazEmoji(znak, px) {
  const klucz = znak + px;
  if (!emojiCache.has(klucz)) {
    const c = document.createElement('canvas');
    c.width = c.height = px * 1.4;
    const g = c.getContext('2d');
    g.font = `${px}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(znak, c.width / 2, c.height / 2 + px * 0.06);
    emojiCache.set(klucz, c);
  }
  return emojiCache.get(klucz);
}

function rysujKsztalt(c) {
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.rotate(c.kat);
  ctx.globalAlpha = Math.max(0, Math.min(1, c.zycie / 0.35));
  ctx.fillStyle = c.kolor;
  const r = c.r;
  switch (c.ksztalt) {
    case 'gwiazda': {
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const rr = i % 2 ? r * 0.45 : r;
        const a = (Math.PI / 5) * i - Math.PI / 2;
        ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'pasek': // pasek tygrysa — lekko wygięty
      ctx.scale(1, Math.cos(c.obrot)); // „przewracanie się” w locie
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 1.5, r * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'konfetti':
      ctx.scale(1, Math.cos(c.obrot));
      ctx.fillRect(-r, -r * 0.55, r * 2, r * 1.1);
      break;
    case 'moneta': {
      ctx.scale(Math.cos(c.obrot), 1);
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = '#fcc419';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#e67700';
      ctx.stroke();
      ctx.fillStyle = '#fff3bf';
      ctx.fillRect(-r * 0.15, -r * 0.55, r * 0.3, r * 1.1);
      break;
    }
    case 'emoji': {
      const img = obrazEmoji(c.znak, 48);
      const s = (r * 2.4) / img.width;
      ctx.scale(s, s);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      break;
    }
    default:
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
  }
  ctx.restore();
}

function petla(poprzedni) {
  const teraz = performance.now();
  const dt = Math.min(0.05, (teraz - poprzedni) / 1000);
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  czastki = czastki.filter((c) => (c.zycie -= dt) > 0 && c.y < innerHeight + 60);
  for (const c of czastki) {
    c.vy += c.grawitacja * dt;
    c.vx *= 1 - c.opor * dt;
    c.vy *= 1 - c.opor * dt;
    c.x += c.vx * dt + Math.sin(c.faza + c.zycie * 4) * c.kolysanie * dt;
    c.y += c.vy * dt;
    c.kat += c.wiruj * dt;
    c.obrot += c.wirujObrot * dt;
    rysujKsztalt(c);
  }
  if (czastki.length) requestAnimationFrame(() => petla(teraz));
  else { petlaTrwa = false; ctx.clearRect(0, 0, innerWidth, innerHeight); }
}

function dodaj(lista) {
  if (ograniczRuch()) return;
  przygotujPlotno();
  czastki.push(...lista);
  if (!petlaTrwa) { petlaTrwa = true; requestAnimationFrame(() => petla(performance.now())); }
}

const los = (a, b) => a + Math.random() * (b - a);
const wybierz = (t) => t[Math.floor(Math.random() * t.length)];

function czastka(x, y, o = {}) {
  const ksztalt = o.ksztalt ?? wybierz(o.ksztalty ?? ['gwiazda', 'konfetti', 'kolo']);
  const kat = o.kierunek ?? los(0, Math.PI * 2);
  const v = los(o.vMin ?? 260, o.vMax ?? 620);
  return {
    x, y, ksztalt,
    znak: ksztalt === 'emoji' ? wybierz(o.emoji ?? ['⭐']) : null,
    vx: Math.cos(kat) * v, vy: Math.sin(kat) * v,
    r: los(o.rMin ?? 5, o.rMax ?? 11),
    kolor: wybierz(o.kolory ?? KOLORY),
    grawitacja: o.grawitacja ?? 900, opor: o.opor ?? 1.6,
    zycie: los(o.zycieMin ?? 1.1, o.zycieMax ?? 1.9),
    kat: los(0, 6.28), wiruj: los(-8, 8), obrot: los(0, 6.28), wirujObrot: los(4, 12),
    faza: los(0, 6.28), kolysanie: o.kolysanie ?? 0,
  };
}

function srodek(el) {
  if (!el) return { x: innerWidth / 2, y: innerHeight / 2 };
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

// Wybuch gwiazdek z elementu — „dobrze!” przy obrazku albo polu odpowiedzi.
export function wybuch(el, o = {}) {
  const { x, y } = srodek(el);
  dodaj(Array.from({ length: o.ile ?? 46 }, () => czastka(x, y, o)));
}

// Deszcz konfetti z góry ekranu — na skarb i zaliczoną kartę.
export function deszcz(o = {}) {
  dodaj(Array.from({ length: o.ile ?? 120 }, () => czastka(los(0, innerWidth), los(-120, -10), {
    kierunek: Math.PI / 2 + los(-0.3, 0.3), vMin: 60, vMax: 220, grawitacja: 240, opor: 0.4,
    zycieMin: 3, zycieMax: 5, kolysanie: 90, ksztalty: ['konfetti', 'konfetti', 'pasek', 'gwiazda'], ...o,
  })));
}

// Fontanna monet i gwiazd ze skrzyni skarbu.
export function fontanna(el, o = {}) {
  const { x, y } = srodek(el);
  dodaj(Array.from({ length: o.ile ?? 70 }, () => czastka(x, y - 10, {
    kierunek: -Math.PI / 2 + los(-0.55, 0.55), vMin: 480, vMax: 950, grawitacja: 1300, opor: 0.5,
    zycieMin: 1.6, zycieMax: 2.6, ksztalty: ['moneta', 'moneta', 'gwiazda', 'emoji'], rMin: 8, rMax: 14,
    kolory: ['#ffd43b', '#fff3bf', '#ff922b'], ...o,
  })));
}

// Kłęby spalin za motorem na drodze postępu.
export function spaliny(x, y) {
  dodaj(Array.from({ length: 10 }, () => czastka(x, y, {
    kierunek: Math.PI + los(-0.4, 0.4), vMin: 40, vMax: 140, grawitacja: -60, opor: 1.2,
    zycieMin: 0.5, zycieMax: 0.9, ksztalt: 'kolo', kolory: ['#adb5bd', '#ced4da', '#e9ecef'], rMin: 4, rMax: 9,
  })));
}

// ---------- Dźwięki ----------
const KLUCZ_CISZY = 'podchody:cisza';
let audio = null;
let cisza = (() => { try { return localStorage.getItem(KLUCZ_CISZY) === '1'; } catch { return false; } })();

export const czyCisza = () => cisza;
export function przelaczCisze() {
  cisza = !cisza;
  try { localStorage.setItem(KLUCZ_CISZY, cisza ? '1' : '0'); } catch { /* bez zapisu */ }
  if (!cisza) dzwiek('klik');
  return cisza;
}

// AudioContext wolno utworzyć dopiero po dotknięciu ekranu (zasada przeglądarek).
function kontekst() {
  if (cisza) return null;
  if (!audio) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audio = new AC();
  }
  if (audio.state === 'suspended') audio.resume().catch(() => {});
  return audio;
}
addEventListener('pointerdown', () => { if (!cisza) kontekst(); }, { once: true, capture: true });

function ton(ac, { f, f2, start = 0, czas = 0.18, typ = 'triangle', glosnosc = 0.22, filtr }) {
  const t = ac.currentTime + start;
  const osc = ac.createOscillator();
  const wzm = ac.createGain();
  osc.type = typ;
  osc.frequency.setValueAtTime(f, t);
  if (f2) osc.frequency.exponentialRampToValueAtTime(f2, t + czas);
  wzm.gain.setValueAtTime(0.0001, t);
  wzm.gain.exponentialRampToValueAtTime(glosnosc, t + 0.015);
  wzm.gain.exponentialRampToValueAtTime(0.0001, t + czas);
  let wyj = osc;
  if (filtr) {
    const lp = ac.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(filtr, t);
    osc.connect(lp);
    wyj = lp;
  }
  wyj.connect(wzm).connect(ac.destination);
  osc.start(t);
  osc.stop(t + czas + 0.05);
}

const DZWIEKI = {
  klik: (ac) => ton(ac, { f: 660, f2: 990, czas: 0.08, typ: 'sine', glosnosc: 0.12 }),
  dobrze: (ac) => [523, 659, 784, 1047].forEach((f, i) => ton(ac, { f, start: i * 0.085, czas: 0.22, glosnosc: 0.2 })),
  zle: (ac) => { ton(ac, { f: 330, f2: 300, czas: 0.16, typ: 'sine', glosnosc: 0.16 }); ton(ac, { f: 262, f2: 220, start: 0.15, czas: 0.26, typ: 'sine', glosnosc: 0.16 }); },
  // Warkot motoru: piła z filtrem, obroty w górę i w dół
  wrrum: (ac) => {
    ton(ac, { f: 55, f2: 150, czas: 0.45, typ: 'sawtooth', glosnosc: 0.16, filtr: 700 });
    ton(ac, { f: 150, f2: 70, start: 0.42, czas: 0.5, typ: 'sawtooth', glosnosc: 0.13, filtr: 600 });
  },
  fanfara: (ac) => {
    const nuty = [[523, 0, 0.16], [523, 0.17, 0.16], [523, 0.34, 0.16], [659, 0.5, 0.5], [587, 1.0, 0.18], [659, 1.18, 0.18], [784, 1.36, 0.8]];
    nuty.forEach(([f, start, czas]) => { ton(ac, { f, start, czas, typ: 'square', glosnosc: 0.08, filtr: 2400 }); ton(ac, { f: f / 2, start, czas, glosnosc: 0.12 }); });
  },
  skrzynia: (ac) => { ton(ac, { f: 180, f2: 90, czas: 0.25, typ: 'sawtooth', glosnosc: 0.1, filtr: 500 }); [784, 988, 1175, 1568].forEach((f, i) => ton(ac, { f, start: 0.2 + i * 0.07, czas: 0.3, typ: 'sine', glosnosc: 0.14 })); },
};

export function dzwiek(nazwa) {
  const ac = kontekst();
  if (!ac) return;
  try { DZWIEKI[nazwa]?.(ac); } catch { /* bez dźwięku */ }
}

export function wibruj(wzor) {
  if (cisza || ograniczRuch()) return;
  try { navigator.vibrate?.(wzor); } catch { /* brak wibracji */ }
}
