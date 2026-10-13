// Maskotki gier — własne rysunki z jednego szablonu „pluszaka”. Każdy gatunek to zestaw
// kolorów i dodatków (uszy, grzywa, róg, koszulka…), a części mają wspólne klasy mk-*,
// więc te same animacje CSS działają dla wszystkich (mruganie, ogon, mówienie, machanie).
// Nastrój ustawia klasa na .maskotka: macha | mowi | cieszy | smutny | tanczy.

const K = '#2b2118'; // kontur

export const GATUNKI = {
  tygrys: {
    imie: 'Tygrysek', futro: '#f08c00', futroJasne: '#ffa94d', brzuch: '#fff8f0', konczyny: '#f08c00',
    uszy: 'okragle', ucho: '#ffc9b9', ogon: 'pregowany', pregi: true, gogle: true, wasy: true,
  },
  lis: {
    imie: 'Lisek Strzelec', futro: '#e8590c', futroJasne: '#ff922b', brzuch: '#fff', konczyny: '#e8590c',
    uszy: 'szpiczaste', ucho: '#fff', ogon: 'lisi', koszulka: { kolor: '#1971c2', pas: '#fff', numer: '10' }, pilka: true, wasy: true,
  },
  kon: {
    imie: 'Kucyk Iskierka', futro: '#b5652e', futroJasne: '#d08a4f', brzuch: '#f6dcc0', konczyny: '#b5652e',
    uszy: 'szpiczaste', ucho: '#f6dcc0', ogon: 'konski', grzywa: ['#4a2511', '#6b3a1c'], pyszczek: 'kon', kopyta: '#4a2511', gwiazdka: true,
  },
  panda: {
    imie: 'Panda Pyzia', futro: '#ffffff', futroJasne: '#ffffff', brzuch: '#ffffff', konczyny: '#2b2118',
    uszy: 'okragle', uszyKolor: '#2b2118', ucho: '#495057', ogon: 'krotki', laty: true, bambus: true, poduszki: '#495057',
  },
  jednorozec: {
    imie: 'Jednorożka Gwiazdka', futro: '#fdf4ff', futroJasne: '#ffffff', brzuch: '#fff0f6', konczyny: '#fdf4ff',
    uszy: 'szpiczaste', ucho: '#fcc2d7', ogon: 'teczowy', grzywa: ['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7', '#9775fa'],
    pyszczek: 'kon', kopyta: '#cc5de8', rog: true, rzesy: true,
  },
};

const kontur = (d, w, kolor) => `<path d="${d}" fill="none" stroke="${K}" stroke-width="${w + 8}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${kolor}" stroke-width="${w}" stroke-linecap="round"/>`;

function ogon(g, id) {
  switch (g.ogon) {
    case 'lisi':
      return `<path d="M140 200 C190 206 196 150 176 120 C168 150 160 170 140 182 Z" fill="url(#${id}-futro)" stroke="${K}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M176 120 C184 132 188 146 186 158 C178 150 172 140 170 128 Z" fill="#fff" stroke="${K}" stroke-width="3" stroke-linejoin="round"/>`;
    case 'konski':
    case 'teczowy': {
      const kolory = g.ogon === 'teczowy' ? g.grzywa : [g.grzywa[0], g.grzywa[1], g.grzywa[0]];
      return kolory.slice(0, 5).map((c, i) => kontur(`M142 ${196 - i * 3} C${176 + i * 3} ${200 - i * 2} ${182 + i * 2} ${166 - i * 4} ${168 + i * 3} ${138 - i * 3}`, 7, c)).join('');
    }
    case 'krotki':
      return `<circle cx="150" cy="206" r="13" fill="#fff" stroke="${K}" stroke-width="4"/>`;
    default: // pręgowany
      return `${kontur('M142 196 C178 196 188 160 172 132', 11, g.futro)}
        <path d="M142 196 C178 196 188 160 172 132" fill="none" stroke="${K}" stroke-width="11" stroke-dasharray="5 9" stroke-dashoffset="2"/>`;
  }
}

function uszy(g) {
  const kolor = g.uszyKolor ?? g.futro;
  if (g.uszy === 'szpiczaste') {
    return `<path d="M44 80 L40 18 L84 50 Z" fill="${kolor}" stroke="${K}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M156 80 L160 18 L116 50 Z" fill="${kolor}" stroke="${K}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M50 64 L47 32 L70 50 Z" fill="${g.ucho}"/><path d="M150 64 L153 32 L130 50 Z" fill="${g.ucho}"/>`;
  }
  return `<circle cx="50" cy="54" r="21" fill="${kolor}" stroke="${K}" stroke-width="4"/>
    <circle cx="150" cy="54" r="21" fill="${kolor}" stroke="${K}" stroke-width="4"/>
    <circle cx="50" cy="54" r="10" fill="${g.ucho}"/><circle cx="150" cy="54" r="10" fill="${g.ucho}"/>`;
}

// Grzywa z tyłu głowy (wystaje po bokach) i grzywka na czole.
function grzywaTyl(g) {
  if (!g.grzywa) return '';
  return g.grzywa.slice(0, 4).map((c, i) => `<path d="M${66 - i * 4} ${44 + i * 2} C${30 - i * 6} ${70 + i * 10} ${36 - i * 4} ${120 + i * 8} ${54 - i * 2} ${150 + i * 4}" fill="none" stroke="${K}" stroke-width="20" stroke-linecap="round"/>
    <path d="M${66 - i * 4} ${44 + i * 2} C${30 - i * 6} ${70 + i * 10} ${36 - i * 4} ${120 + i * 8} ${54 - i * 2} ${150 + i * 4}" fill="none" stroke="${c}" stroke-width="13" stroke-linecap="round"/>`).reverse().join('');
}
function grzywka(g) {
  if (!g.grzywa) return '';
  const [a, b, c] = [g.grzywa[0], g.grzywa[1] ?? g.grzywa[0], g.grzywa[2] ?? g.grzywa[0]];
  return `<path d="M70 52 Q84 30 104 40 Q96 50 92 66 Q84 54 70 52 Z" fill="${a}" stroke="${K}" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M96 42 Q116 30 130 50 Q114 50 106 64 Q104 52 96 42 Z" fill="${b}" stroke="${K}" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M84 46 Q96 34 112 44 Q102 50 98 60 Z" fill="${c}" stroke="${K}" stroke-width="3" stroke-linejoin="round"/>`;
}

function oczy(g) {
  if (g.laty) {
    return `<ellipse cx="78" cy="98" rx="17" ry="21" transform="rotate(-24 78 98)" fill="${K}"/>
      <ellipse cx="122" cy="98" rx="17" ry="21" transform="rotate(24 122 98)" fill="${K}"/>
      <g class="mk-oczy">
        <g class="mk-oko"><circle cx="80" cy="97" r="8" fill="#fff"/><circle cx="81" cy="98" r="5" fill="${K}"/><circle cx="83" cy="95.5" r="2" fill="#fff"/></g>
        <g class="mk-oko"><circle cx="120" cy="97" r="8" fill="#fff"/><circle cx="119" cy="98" r="5" fill="${K}"/><circle cx="121" cy="95.5" r="2" fill="#fff"/></g>
      </g>
      <path class="mk-oczy-radosne" d="M71 101 q9 -12 18 0 M111 101 q9 -12 18 0" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none"/>`;
  }
  const rzesy = g.rzesy ? `<path d="M70 92 l-6 -5 M73 88 l-4 -7 M130 92 l6 -5 M127 88 l4 -7" stroke="${K}" stroke-width="2.5" stroke-linecap="round"/>` : '';
  return `<g class="mk-oczy">
      <g class="mk-oko"><ellipse cx="79" cy="98" rx="8.5" ry="10.5" fill="${K}"/><circle cx="82" cy="94" r="3.2" fill="#fff"/></g>
      <g class="mk-oko"><ellipse cx="121" cy="98" rx="8.5" ry="10.5" fill="${K}"/><circle cx="124" cy="94" r="3.2" fill="#fff"/></g>
      ${rzesy}
    </g>
    <path class="mk-oczy-radosne" d="M70 100 q9 -12 18 0 M112 100 q9 -12 18 0" stroke="${K}" stroke-width="5" stroke-linecap="round" fill="none"/>`;
}

function pyszczek(g) {
  if (g.pyszczek === 'kon') {
    // Dłuższy pysk z chrapami zamiast kociego noska
    return `<ellipse cx="100" cy="128" rx="34" ry="24" fill="${g.brzuch}" stroke="${K}" stroke-width="3"/>
      <ellipse cx="88" cy="122" rx="4" ry="5.5" fill="${K}" opacity=".75"/><ellipse cx="112" cy="122" rx="4" ry="5.5" fill="${K}" opacity=".75"/>
      <path class="mk-usta" d="M86 136 q14 11 28 0" stroke="${K}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <g class="mk-usta-otwarte"><path d="M86 134 Q100 156 114 134 Z" fill="#c92a2a" stroke="${K}" stroke-width="3.5" stroke-linejoin="round"/><ellipse cx="100" cy="146" rx="7" ry="4" fill="#ff8787"/></g>`;
  }
  const nos = g.laty || g.koszulka ? K : '#e64980';
  return `<ellipse cx="100" cy="124" rx="31" ry="22" fill="${g.brzuch}"/>
    <path d="M91 112 h18 l-9 9 z" fill="${nos}" stroke="${K}" stroke-width="3" stroke-linejoin="round"/>
    <path class="mk-usta" d="M100 121 v4 M100 125 q-7 7 -13 1 M100 125 q7 7 13 1" stroke="${K}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <g class="mk-usta-otwarte"><path d="M86 126 Q100 150 114 126 Z" fill="#c92a2a" stroke="${K}" stroke-width="3.5" stroke-linejoin="round"/><ellipse cx="100" cy="138" rx="7" ry="4.5" fill="#ff8787"/></g>`;
}

function lapka(g, cx, cy) {
  if (g.kopyta) return `<circle cx="${cx}" cy="${cy}" r="15" fill="${g.konczyny}" stroke="${K}" stroke-width="4"/><path d="M${cx - 14} ${cy - 4} a15 15 0 0 1 28 0 z" fill="${g.kopyta}" stroke="${K}" stroke-width="3"/>`;
  const p = g.poduszki ?? '#ffc9b9';
  return `<circle cx="${cx}" cy="${cy}" r="15" fill="${g.konczyny}" stroke="${K}" stroke-width="4"/>
    <ellipse cx="${cx}" cy="${cy + 3}" rx="7" ry="6" fill="${p}"/>
    <circle cx="${cx - 8}" cy="${cy - 7}" r="3" fill="${p}"/><circle cx="${cx}" cy="${cy - 10}" r="3" fill="${p}"/><circle cx="${cx + 8}" cy="${cy - 7}" r="3" fill="${p}"/>`;
}

export function maskotkaSVG({ gatunek = 'tygrys', etykieta } = {}) {
  const g = GATUNKI[gatunek] ?? GATUNKI.tygrys;
  const id = `mk-${gatunek}`;
  const stopa = (x) => g.kopyta
    ? `<ellipse cx="${x}" cy="226" rx="20" ry="10" fill="${g.konczyny}" stroke="${K}" stroke-width="4"/><path d="M${x - 19} 228 a20 9 0 0 0 38 0 z" fill="${g.kopyta}" stroke="${K}" stroke-width="3"/>`
    : `<ellipse cx="${x}" cy="226" rx="20" ry="10" fill="${g.konczyny}" stroke="${K}" stroke-width="4"/><path d="M${x - 6} 222 v6 M${x + 2} 222 v6" stroke="${g.laty ? '#868e96' : K}" stroke-width="2.5" stroke-linecap="round"/>`;
  const koszulka = !g.koszulka ? '' : `
    <path d="M54 168 Q60 148 82 144 Q100 154 118 144 Q140 148 146 168 L148 206 Q100 222 52 206 Z" fill="${g.koszulka.kolor}" stroke="${K}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M90 147 L100 160 L110 147" fill="none" stroke="${g.koszulka.pas}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M60 172 Q100 182 140 172" fill="none" stroke="${g.koszulka.pas}" stroke-width="5"/>
    <text x="100" y="204" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="28" fill="${g.koszulka.pas}" stroke="${K}" stroke-width="1.5">${g.koszulka.numer}</text>`;
  const pilka = !g.pilka ? '' : `
    <g class="mk-pilka"><circle cx="34" cy="212" r="17" fill="#fff" stroke="${K}" stroke-width="4"/>
    <path d="M34 203 l8 6 -3 9 h-10 l-3 -9 z" fill="${K}"/>
    <path d="M34 203 v-8 M42 209 l8 -3 M39 218 l5 7 M29 218 l-5 7 M26 209 l-8 -3" stroke="${K}" stroke-width="2.5"/></g>`;
  const bambus = !g.bambus ? '' : `
    <g class="mk-bambus"><rect x="20" y="150" width="11" height="82" rx="4" transform="rotate(-14 26 190)" fill="#69db7c" stroke="${K}" stroke-width="3.5"/>
    <path d="M18 176 h13 M22 204 h13" transform="rotate(-14 26 190)" stroke="${K}" stroke-width="3"/>
    <path d="M24 156 q-22 -10 -22 -24 q18 4 24 20 z" fill="#40c057" stroke="${K}" stroke-width="3" stroke-linejoin="round"/></g>`;
  const rog = !g.rog ? '' : `
    <path d="M90 50 L100 2 L110 50 Z" fill="url(#${id}-zloto)" stroke="${K}" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M92 40 L108 36 M94 28 L106 25 M97 16 L103 14" stroke="#e67700" stroke-width="2.5" stroke-linecap="round"/>`;
  const pregi = !g.pregi ? '' : `
    <path d="M100 44 v14 M86 47 l4 12 M114 47 l-4 12" stroke="${K}" stroke-width="5" stroke-linecap="round"/>
    <path d="M37 90 h14 M38 104 h12 M163 90 h-14 M162 104 h-12" stroke="${K}" stroke-width="5" stroke-linecap="round"/>`;
  const pregiCiala = !g.pregi ? '' : `<path d="M50 176 q12 3 20 -2 M48 192 q12 3 18 -1 M150 176 q-12 3 -20 -2 M152 192 q-12 3 -18 -1" stroke="${K}" stroke-width="4" stroke-linecap="round" fill="none"/>`;
  const gogle = !g.gogle ? '' : `
    <g class="mk-gogle"><path d="M40 72 Q100 52 160 72" fill="none" stroke="${K}" stroke-width="7"/>
      <circle cx="82" cy="66" r="13" fill="url(#${id}-szklo)" stroke="${K}" stroke-width="4.5"/>
      <circle cx="118" cy="66" r="13" fill="url(#${id}-szklo)" stroke="${K}" stroke-width="4.5"/>
      <path d="M95 66 h10" stroke="${K}" stroke-width="4"/>
      <path d="M76 61 q3 -4 8 -4 M112 61 q3 -4 8 -4" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none"/></g>`;
  const gwiazdka = !g.gwiazdka ? '' : `<path d="M100 62 l5 9 -5 9 -5 -9 z" fill="#fff" stroke="${K}" stroke-width="2"/>`;
  const wasy = !g.wasy ? '' : `<path d="M70 126 l-24 -4 M70 132 l-22 4 M130 126 l24 -4 M130 132 l22 4" stroke="${K}" stroke-width="2" stroke-linecap="round" opacity=".55"/>`;
  const policzki = g.laty ? '' : `<circle cx="62" cy="120" r="9" fill="#ff8787" opacity=".45"/><circle cx="138" cy="120" r="9" fill="#ff8787" opacity=".45"/>`;
  const rekaKolor = g.konczyny;

  return `<svg class="maskotka-svg" viewBox="0 0 200 236" role="img" aria-label="${etykieta ?? g.imie}">
  <defs>
    <radialGradient id="${id}-futro" cx="45%" cy="35%" r="70%"><stop offset="0" stop-color="${g.futroJasne}"/><stop offset="1" stop-color="${g.futro}"/></radialGradient>
    <radialGradient id="${id}-szklo" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#e7f5ff"/><stop offset=".55" stop-color="#74c0fc"/><stop offset="1" stop-color="#1c7ed6"/></radialGradient>
    <linearGradient id="${id}-zloto" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3bf"/><stop offset=".5" stop-color="#fcc419"/><stop offset="1" stop-color="#f08c00"/></linearGradient>
  </defs>
  <ellipse class="mk-cien" cx="100" cy="228" rx="62" ry="7" fill="#000" opacity=".14"/>
  <g class="mk-ogon">${ogon(g, id)}</g>
  <g class="mk-cialo">
    <ellipse cx="100" cy="186" rx="54" ry="44" fill="url(#${id}-futro)" stroke="${K}" stroke-width="4"/>
    <ellipse cx="100" cy="194" rx="31" ry="32" fill="${g.brzuch}"/>
    ${pregiCiala}${koszulka}
    ${stopa(74)}${stopa(126)}
    ${bambus}
    <ellipse cx="62" cy="200" rx="13" ry="20" transform="rotate(14 62 200)" fill="${rekaKolor}" stroke="${K}" stroke-width="4"/>
    ${pilka}
  </g>
  <g class="mk-reka">
    ${kontur('M136 172 Q150 196 140 214', 22, rekaKolor)}
  </g>
  <g class="mk-glowa">
    ${grzywaTyl(g)}
    <g class="mk-uszy">${uszy(g)}</g>
    <ellipse cx="100" cy="98" rx="64" ry="56" fill="url(#${id}-futro)" stroke="${K}" stroke-width="4"/>
    ${pregi}${gwiazdka}${grzywka(g)}${rog}${gogle}
    ${policzki}
    ${oczy(g)}
    ${pyszczek(g)}
    ${wasy}
  </g>
  <g class="mk-reka-gora">
    ${kontur('M140 176 Q184 170 178 128', 20, rekaKolor)}
    ${lapka(g, 178, 122)}
  </g>
</svg>`;
}

// Chwilowy nastrój (np. radość po dobrej odpowiedzi), potem powrót do spoczynku.
export function nastroj(nastroj, ms = 1600) {
  document.querySelectorAll('.maskotka').forEach((el) => {
    clearTimeout(el._nastrojTimer);
    el.classList.remove('cieszy', 'smutny', 'macha', 'tanczy');
    void el.offsetWidth; // restart animacji, gdy ten sam nastrój przychodzi drugi raz
    el.classList.add(nastroj);
    if (ms) el._nastrojTimer = setTimeout(() => el.classList.remove(nastroj), ms);
  });
}

// Pyszczek rusza się, gdy telefon czyta na głos.
// Strażnik na document: moduł ładuje też Node (podgląd rysunków w scripts/).
if (typeof document !== 'undefined') {
  document.addEventListener('mowa', (e) => {
    document.querySelectorAll('.maskotka').forEach((el) => el.classList.toggle('mowi', e.detail.trwa));
  });
}
