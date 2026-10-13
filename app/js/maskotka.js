// Tygrysek w goglach motocyklowych — własny rysunek, części nazwane klasami,
// żeby CSS mógł nimi ruszać (mruganie, ogon, pyszczek przy mowie, machanie łapką).
// Nastrój ustawia klasa na .maskotka: macha | mowi | cieszy | smutny | tanczy.

const KONTUR = '#2b2118';
const RUDY = '#f08c00';
const RUDY_JASNY = '#ffa94d';

export function maskotkaSVG({ etykieta = 'Tygrysek' } = {}) {
  return `<svg class="maskotka-svg" viewBox="0 0 200 236" role="img" aria-label="${etykieta}">
  <defs>
    <radialGradient id="mk-futro" cx="45%" cy="35%" r="70%">
      <stop offset="0" stop-color="${RUDY_JASNY}"/><stop offset="1" stop-color="${RUDY}"/>
    </radialGradient>
    <radialGradient id="mk-szklo" cx="35%" cy="30%" r="75%">
      <stop offset="0" stop-color="#e7f5ff"/><stop offset=".55" stop-color="#74c0fc"/><stop offset="1" stop-color="#1c7ed6"/>
    </radialGradient>
  </defs>
  <ellipse class="mk-cien" cx="100" cy="228" rx="62" ry="7" fill="#000" opacity=".14"/>
  <g class="mk-ogon">
    <path d="M142 196 C178 196 188 160 172 132" fill="none" stroke="${KONTUR}" stroke-width="17" stroke-linecap="round"/>
    <path d="M142 196 C178 196 188 160 172 132" fill="none" stroke="${RUDY}" stroke-width="11" stroke-linecap="round"/>
    <path d="M142 196 C178 196 188 160 172 132" fill="none" stroke="${KONTUR}" stroke-width="11" stroke-dasharray="5 9" stroke-dashoffset="2"/>
  </g>
  <g class="mk-cialo">
    <ellipse cx="100" cy="186" rx="54" ry="44" fill="url(#mk-futro)" stroke="${KONTUR}" stroke-width="4"/>
    <ellipse cx="100" cy="194" rx="31" ry="32" fill="#fff8f0"/>
    <path d="M50 176 q12 3 20 -2 M48 192 q12 3 18 -1 M150 176 q-12 3 -20 -2 M152 192 q-12 3 -18 -1" stroke="${KONTUR}" stroke-width="4" stroke-linecap="round" fill="none"/>
    <ellipse cx="74" cy="226" rx="20" ry="10" fill="${RUDY}" stroke="${KONTUR}" stroke-width="4"/>
    <ellipse cx="126" cy="226" rx="20" ry="10" fill="${RUDY}" stroke="${KONTUR}" stroke-width="4"/>
    <path d="M68 222 v6 M76 222 v6 M120 222 v6 M128 222 v6" stroke="${KONTUR}" stroke-width="2.5" stroke-linecap="round"/>
    <ellipse cx="62" cy="200" rx="13" ry="20" transform="rotate(14 62 200)" fill="${RUDY}" stroke="${KONTUR}" stroke-width="4"/>
  </g>
  <g class="mk-reka">
    <path d="M136 172 Q150 196 140 214" fill="none" stroke="${KONTUR}" stroke-width="30" stroke-linecap="round"/>
    <path d="M136 172 Q150 196 140 214" fill="none" stroke="${RUDY}" stroke-width="22" stroke-linecap="round"/>
    <path d="M134 210 l2 6 M142 210 l0 6" stroke="${KONTUR}" stroke-width="2.5" stroke-linecap="round"/>
  </g>
  <g class="mk-glowa">
    <g class="mk-uszy">
      <circle cx="50" cy="54" r="21" fill="${RUDY}" stroke="${KONTUR}" stroke-width="4"/>
      <circle cx="150" cy="54" r="21" fill="${RUDY}" stroke="${KONTUR}" stroke-width="4"/>
      <circle cx="50" cy="54" r="10" fill="#ffc9b9"/>
      <circle cx="150" cy="54" r="10" fill="#ffc9b9"/>
    </g>
    <ellipse cx="100" cy="98" rx="64" ry="56" fill="url(#mk-futro)" stroke="${KONTUR}" stroke-width="4"/>
    <path d="M100 44 v14 M86 47 l4 12 M114 47 l-4 12" stroke="${KONTUR}" stroke-width="5" stroke-linecap="round"/>
    <path d="M37 90 h14 M38 104 h12 M163 90 h-14 M162 104 h-12" stroke="${KONTUR}" stroke-width="5" stroke-linecap="round"/>
    <g class="mk-gogle">
      <path d="M40 72 Q100 52 160 72" fill="none" stroke="${KONTUR}" stroke-width="7"/>
      <circle cx="82" cy="66" r="13" fill="url(#mk-szklo)" stroke="${KONTUR}" stroke-width="4.5"/>
      <circle cx="118" cy="66" r="13" fill="url(#mk-szklo)" stroke="${KONTUR}" stroke-width="4.5"/>
      <path d="M95 66 h10" stroke="${KONTUR}" stroke-width="4"/>
      <path d="M76 61 q3 -4 8 -4 M112 61 q3 -4 8 -4" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none"/>
    </g>
    <circle cx="64" cy="118" r="9" fill="#ff8787" opacity=".45"/>
    <circle cx="136" cy="118" r="9" fill="#ff8787" opacity=".45"/>
    <ellipse cx="100" cy="124" rx="31" ry="22" fill="#fff8f0"/>
    <g class="mk-oczy">
      <g class="mk-oko"><ellipse cx="79" cy="98" rx="8.5" ry="10.5" fill="${KONTUR}"/><circle cx="82" cy="94" r="3.2" fill="#fff"/></g>
      <g class="mk-oko"><ellipse cx="121" cy="98" rx="8.5" ry="10.5" fill="${KONTUR}"/><circle cx="124" cy="94" r="3.2" fill="#fff"/></g>
    </g>
    <path class="mk-oczy-radosne" d="M70 100 q9 -12 18 0 M112 100 q9 -12 18 0" stroke="${KONTUR}" stroke-width="5" stroke-linecap="round" fill="none"/>
    <path d="M91 112 h18 l-9 9 z" fill="#e64980" stroke="${KONTUR}" stroke-width="3" stroke-linejoin="round"/>
    <path class="mk-usta" d="M100 121 v4 M100 125 q-7 7 -13 1 M100 125 q7 7 13 1" stroke="${KONTUR}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <g class="mk-usta-otwarte">
      <path d="M86 126 Q100 150 114 126 Z" fill="#c92a2a" stroke="${KONTUR}" stroke-width="3.5" stroke-linejoin="round"/>
      <ellipse cx="100" cy="138" rx="7" ry="4.5" fill="#ff8787"/>
    </g>
    <path d="M70 126 l-24 -4 M70 132 l-22 4 M130 126 l24 -4 M130 132 l22 4" stroke="${KONTUR}" stroke-width="2" stroke-linecap="round" opacity=".55"/>
  </g>
  <g class="mk-reka-gora">
    <path d="M140 176 Q184 170 178 128" fill="none" stroke="${KONTUR}" stroke-width="28" stroke-linecap="round"/>
    <path d="M140 176 Q184 170 178 128" fill="none" stroke="${RUDY}" stroke-width="20" stroke-linecap="round"/>
    <path d="M150 168 q8 -2 12 -8 M166 150 q6 -3 8 -9" stroke="${KONTUR}" stroke-width="3.5" stroke-linecap="round" fill="none"/>
    <circle cx="178" cy="122" r="15" fill="${RUDY}" stroke="${KONTUR}" stroke-width="4"/>
    <ellipse cx="178" cy="125" rx="7" ry="6" fill="#ffc9b9"/>
    <circle cx="170" cy="115" r="3" fill="#ffc9b9"/><circle cx="178" cy="112" r="3" fill="#ffc9b9"/><circle cx="186" cy="115" r="3" fill="#ffc9b9"/>
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
