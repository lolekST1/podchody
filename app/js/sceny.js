// Rysunki do scen: skrzynia skarbu i motorek na drodze postępu (własne SVG, bez plików).

export function skrzyniaSVG() {
  return `<svg class="skrzynia-svg" viewBox="0 0 220 190" aria-hidden="true">
  <defs>
    <linearGradient id="sk-drewno" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#c0703a"/><stop offset="1" stop-color="#8a4b22"/>
    </linearGradient>
    <linearGradient id="sk-zloto" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fff3bf"/><stop offset=".45" stop-color="#fcc419"/><stop offset="1" stop-color="#e67700"/>
    </linearGradient>
    <radialGradient id="sk-blask" cx="50%" cy="100%" r="80%">
      <stop offset="0" stop-color="#fff9db"/><stop offset=".5" stop-color="#ffe066" stop-opacity=".8"/><stop offset="1" stop-color="#ffe066" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <ellipse cx="110" cy="182" rx="92" ry="7" fill="#000" opacity=".15"/>
  <g class="sk-wnetrze">
    <rect x="30" y="80" width="160" height="22" fill="#5c2d0e"/>
    <circle cx="70" cy="86" r="11" fill="url(#sk-zloto)" stroke="#a65e00" stroke-width="2"/>
    <circle cx="96" cy="80" r="12" fill="url(#sk-zloto)" stroke="#a65e00" stroke-width="2"/>
    <circle cx="124" cy="84" r="11" fill="url(#sk-zloto)" stroke="#a65e00" stroke-width="2"/>
    <circle cx="150" cy="82" r="10" fill="url(#sk-zloto)" stroke="#a65e00" stroke-width="2"/>
    <path d="M108 66 l6 12 l13 2 l-10 9 l3 13 l-12 -7 l-12 7 l3 -13 l-10 -9 l13 -2 z" fill="#ffd43b" stroke="#e67700" stroke-width="2" stroke-linejoin="round"/>
    <ellipse class="sk-blask" cx="110" cy="80" rx="95" ry="70" fill="url(#sk-blask)"/>
  </g>
  <g class="sk-korpus">
    <rect x="26" y="88" width="168" height="86" rx="10" fill="url(#sk-drewno)" stroke="#3b1d08" stroke-width="5"/>
    <path d="M30 116 h160 M30 146 h160" stroke="#6b3412" stroke-width="3" opacity=".6"/>
    <rect x="44" y="88" width="16" height="86" fill="url(#sk-zloto)" stroke="#3b1d08" stroke-width="3"/>
    <rect x="160" y="88" width="16" height="86" fill="url(#sk-zloto)" stroke="#3b1d08" stroke-width="3"/>
    <rect x="94" y="96" width="32" height="38" rx="6" fill="url(#sk-zloto)" stroke="#3b1d08" stroke-width="4"/>
    <circle cx="110" cy="111" r="5" fill="#3b1d08"/>
    <path d="M110 114 v10" stroke="#3b1d08" stroke-width="4" stroke-linecap="round"/>
  </g>
  <g class="sk-wieko">
    <path d="M26 92 V64 Q26 22 110 22 Q194 22 194 64 V92 Z" fill="url(#sk-drewno)" stroke="#3b1d08" stroke-width="5" stroke-linejoin="round"/>
    <path d="M34 60 Q110 38 186 60" stroke="#6b3412" stroke-width="3" fill="none" opacity=".6"/>
    <path d="M44 92 V40 M176 92 V40" stroke="#3b1d08" stroke-width="19"/>
    <path d="M44 92 V40 M176 92 V40" stroke="url(#sk-zloto)" stroke-width="13"/>
    <rect x="94" y="78" width="32" height="18" rx="5" fill="url(#sk-zloto)" stroke="#3b1d08" stroke-width="4"/>
  </g>
</svg>`;
}

export function motorekSVG() {
  return `<svg viewBox="0 -10 120 90" aria-hidden="true">
  <g class="mt-kolo"><circle cx="24" cy="58" r="16" fill="#fff" stroke="#212529" stroke-width="7"/><path d="M24 44 v28 M10 58 h28" stroke="#868e96" stroke-width="2.5"/></g>
  <g class="mt-kolo mt-kolo-p"><circle cx="96" cy="58" r="16" fill="#fff" stroke="#212529" stroke-width="7"/><path d="M96 44 v28 M82 58 h28" stroke="#868e96" stroke-width="2.5"/></g>
  <g class="mt-rama">
    <rect x="44" y="46" width="24" height="16" rx="3" fill="#868e96" stroke="#212529" stroke-width="3"/>
    <path d="M24 58 L42 38 M96 58 L84 26" stroke="#212529" stroke-width="5" stroke-linecap="round"/>
    <path d="M28 38 H48 Q52 26 68 26 H80 L86 40 Q74 46 60 46 H34 Q28 46 28 38 Z" fill="#e8590c" stroke="#212529" stroke-width="3" stroke-linejoin="round"/>
    <path d="M78 20 L84 26 M74 16 H88" stroke="#212529" stroke-width="5" stroke-linecap="round"/>
    <circle cx="92" cy="32" r="5" fill="#ffd43b" stroke="#212529" stroke-width="2.5"/>
    <g class="mt-kierowca">
      <path d="M36 34 Q20 34 14 20" fill="none" stroke="#212529" stroke-width="7" stroke-linecap="round"/>
      <path d="M36 34 Q20 34 14 20" fill="none" stroke="#f08c00" stroke-width="4" stroke-linecap="round"/>
      <path d="M36 34 Q20 34 14 20" fill="none" stroke="#212529" stroke-width="4" stroke-dasharray="2 4"/>
      <path d="M42 34 L56 38 L54 49" fill="none" stroke="#212529" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M42 34 L56 38 L54 49" fill="none" stroke="#f08c00" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <ellipse cx="44" cy="22" rx="10" ry="14" transform="rotate(28 44 22)" fill="#f08c00" stroke="#212529" stroke-width="3"/>
      <ellipse cx="47" cy="24" rx="5" ry="9" transform="rotate(28 47 24)" fill="#fff8f0"/>
      <path d="M36 18 l5 2 M34 25 l5 2" stroke="#212529" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M50 14 Q62 18 75 15" fill="none" stroke="#212529" stroke-width="9" stroke-linecap="round"/>
      <path d="M50 14 Q62 18 75 15" fill="none" stroke="#f08c00" stroke-width="5" stroke-linecap="round"/>
      <circle cx="76" cy="15" r="4.5" fill="#f08c00" stroke="#212529" stroke-width="2.5"/>
      <g class="mt-glowa">
        <circle cx="53" cy="-1" r="5" fill="#f08c00" stroke="#212529" stroke-width="2.5"/>
        <circle cx="71" cy="-1" r="5" fill="#f08c00" stroke="#212529" stroke-width="2.5"/>
        <circle cx="62" cy="7" r="12" fill="#f08c00" stroke="#212529" stroke-width="3"/>
        <path d="M58 -3 v4 M62 -4 v5 M66 -3 v4" stroke="#212529" stroke-width="2" stroke-linecap="round"/>
        <path d="M50 2 Q62 -4 74 2" fill="none" stroke="#212529" stroke-width="2.5"/>
        <circle cx="58" cy="2" r="3.6" fill="#74c0fc" stroke="#212529" stroke-width="1.8"/>
        <circle cx="66" cy="2" r="3.6" fill="#74c0fc" stroke="#212529" stroke-width="1.8"/>
        <ellipse cx="63" cy="12" rx="6" ry="4.2" fill="#fff"/>
        <circle cx="59" cy="8" r="1.6" fill="#212529"/><circle cx="67" cy="8" r="1.6" fill="#212529"/>
        <path d="M61.5 10.5 h3 l-1.5 1.8 z" fill="#e64980"/>
    </g>
  </g>
</svg>`;
}

// ---------- Znaczniki postępu na drodze (po jednym na motyw) ----------
// Wspólny układ: viewBox 0 -10 120 90, „ziemia” na y≈78; koła (mt-kolo) i toczące się kule (mt-toczy) kręcą się w czasie jazdy.

function pilkaSVG() {
  return `<svg viewBox="0 -10 120 90" aria-hidden="true">
  <ellipse cx="60" cy="79" rx="22" ry="4" fill="#000" opacity=".18"/>
  <g class="mt-toczy">
    <circle cx="60" cy="52" r="26" fill="#fff" stroke="#212529" stroke-width="4"/>
    <path d="M60 41 l10 7 -4 12 h-12 l-4 -12 z" fill="#212529"/>
    <path d="M60 41 v-15 M70 48 l14 -5 M66 60 l9 12 M54 60 l-9 12 M50 48 l-14 -5" stroke="#212529" stroke-width="3"/>
    <path d="M45 30 l-8 6 2 8 M75 30 l8 6 -2 8 M86 58 l-6 8 M34 58 l6 8 M52 77 l8 -3 8 3" fill="none" stroke="#212529" stroke-width="3"/>
  </g>
</svg>`;
}

function pandaKulkaSVG() {
  return `<svg viewBox="0 -10 120 90" aria-hidden="true">
  <ellipse cx="60" cy="79" rx="22" ry="4" fill="#000" opacity=".18"/>
  <g class="mt-toczy">
    <circle cx="42" cy="32" r="8" fill="#212529"/><circle cx="78" cy="32" r="8" fill="#212529"/>
    <circle cx="60" cy="52" r="26" fill="#fff" stroke="#212529" stroke-width="4"/>
    <ellipse cx="50" cy="48" rx="7" ry="9" transform="rotate(-25 50 48)" fill="#212529"/>
    <ellipse cx="70" cy="48" rx="7" ry="9" transform="rotate(25 70 48)" fill="#212529"/>
    <circle cx="51" cy="47" r="2.8" fill="#fff"/><circle cx="69" cy="47" r="2.8" fill="#fff"/>
    <ellipse cx="60" cy="57" rx="4" ry="3" fill="#212529"/>
    <path d="M55 62 q5 4 10 0" stroke="#212529" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <ellipse cx="36" cy="64" rx="7" ry="10" transform="rotate(30 36 64)" fill="#212529"/>
    <ellipse cx="84" cy="64" rx="7" ry="10" transform="rotate(-30 84 64)" fill="#212529"/>
    <circle cx="44" cy="58" r="4" fill="#ff8787" opacity=".5"/><circle cx="76" cy="58" r="4" fill="#ff8787" opacity=".5"/>
  </g>
</svg>`;
}

// Kucyk z boku; jednorożec to ten sam rysunek z rogiem, tęczową grzywą i skrzydełkiem.
function kucykSVG({ jednorozec = false } = {}) {
  const futro = jednorozec ? '#fdf4ff' : '#b5652e';
  const kopyto = jednorozec ? '#cc5de8' : '#4a2511';
  const grzywa = jednorozec ? ['#ff6b6b', '#ffd43b', '#69db7c', '#4dabf7', '#9775fa'] : ['#4a2511', '#6b3a1c', '#4a2511'];
  const pasmo = (d, i) => `<path d="${d}" fill="none" stroke="#212529" stroke-width="7" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${grzywa[i % grzywa.length]}" stroke-width="4" stroke-linecap="round"/>`;
  const noga = (x, kl) => `<g class="kn-noga ${kl}"><path d="M${x} 48 V72" stroke="#212529" stroke-width="9" stroke-linecap="round"/><path d="M${x} 48 V72" stroke="${futro}" stroke-width="5" stroke-linecap="round"/><rect x="${x - 4.5}" y="70" width="9" height="6" rx="2" fill="${kopyto}" stroke="#212529" stroke-width="2"/></g>`;
  return `<svg viewBox="0 -10 120 90" aria-hidden="true">
  <ellipse cx="58" cy="79" rx="30" ry="4" fill="#000" opacity=".15"/>
  <g class="kn-cialo">
    ${[0, 1, 2].map((i) => pasmo(`M32 ${36 + i * 3} C${20 - i * 3} ${40 + i * 4} ${18 - i * 2} ${56 + i * 3} ${12 + i * 3} ${62 + i * 2}`, i)).join('')}
    ${noga(38, 'kn-b')}${noga(76, 'kn-b')}
    <ellipse cx="56" cy="40" rx="27" ry="15" fill="${futro}" stroke="#212529" stroke-width="3"/>
    ${noga(46, 'kn-a')}${noga(70, 'kn-a')}
    ${jednorozec ? '<path d="M46 34 q8 -20 24 -16 q-6 8 -8 18 q-8 -6 -16 -2z" fill="#fff" stroke="#212529" stroke-width="2.5" stroke-linejoin="round"/><path d="M52 30 q6 -6 12 -6" stroke="#cc5de8" stroke-width="2" fill="none"/>' : ''}
    <path d="M72 32 L84 10" stroke="#212529" stroke-width="17" stroke-linecap="round"/>
    <path d="M72 32 L84 10" stroke="${futro}" stroke-width="12" stroke-linecap="round"/>
    <g class="kn-glowa">
      ${jednorozec ? '<path d="M88 -2 L98 -20 L94 0 Z" fill="#fcc419" stroke="#212529" stroke-width="2.5" stroke-linejoin="round"/>' : ''}
      <path d="M80 2 L80 -10 L88 -1 Z" fill="${futro}" stroke="#212529" stroke-width="2.5" stroke-linejoin="round"/>
      <ellipse cx="92" cy="8" rx="15" ry="9" transform="rotate(22 92 8)" fill="${futro}" stroke="#212529" stroke-width="3"/>
      <ellipse cx="102" cy="14" rx="6" ry="5" transform="rotate(22 102 14)" fill="${jednorozec ? '#fcc2d7' : '#f6dcc0'}"/>
      <circle cx="104" cy="13" r="1.4" fill="#212529"/>
      <circle cx="89" cy="4" r="2.6" fill="#212529"/><circle cx="90" cy="3" r="1" fill="#fff"/>
      ${pasmo('M80 -2 Q72 8 74 20', 0)}${pasmo('M82 2 Q74 14 74 26', 1)}${grzywa.length > 3 ? pasmo('M84 6 Q78 18 78 30', 2) : ''}
    </g>
  </g>
</svg>`;
}

export const POJAZDY = ['motor', 'pilka', 'kucyk', 'panda', 'jednorozec'];

export function pojazdSVG(rodzaj = 'motor') {
  switch (rodzaj) {
    case 'pilka': return pilkaSVG();
    case 'kucyk': return kucykSVG();
    case 'jednorozec': return kucykSVG({ jednorozec: true });
    case 'panda': return pandaKulkaSVG();
    default: return motorekSVG();
  }
}
