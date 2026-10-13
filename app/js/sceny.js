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
  return `<svg viewBox="0 0 120 80" aria-hidden="true">
  <g class="mt-kolo"><circle cx="24" cy="58" r="16" fill="#fff" stroke="#212529" stroke-width="7"/><path d="M24 44 v28 M10 58 h28" stroke="#868e96" stroke-width="2.5"/></g>
  <g class="mt-kolo mt-kolo-p"><circle cx="96" cy="58" r="16" fill="#fff" stroke="#212529" stroke-width="7"/><path d="M96 44 v28 M82 58 h28" stroke="#868e96" stroke-width="2.5"/></g>
  <g class="mt-rama">
    <rect x="44" y="46" width="24" height="16" rx="3" fill="#868e96" stroke="#212529" stroke-width="3"/>
    <path d="M24 58 L42 38 M96 58 L84 26" stroke="#212529" stroke-width="5" stroke-linecap="round"/>
    <path d="M28 38 H48 Q52 26 68 26 H80 L86 40 Q74 46 60 46 H34 Q28 46 28 38 Z" fill="#e8590c" stroke="#212529" stroke-width="3" stroke-linejoin="round"/>
    <path d="M78 20 L84 26 M74 16 H88" stroke="#212529" stroke-width="5" stroke-linecap="round"/>
    <circle cx="92" cy="32" r="5" fill="#ffd43b" stroke="#212529" stroke-width="2.5"/>
    <g class="mt-kierowca">
      <circle cx="48" cy="12" r="12" fill="#f08c00" stroke="#212529" stroke-width="3"/>
      <circle cx="39" cy="3" r="4.5" fill="#f08c00" stroke="#212529" stroke-width="2.5"/>
      <circle cx="57" cy="3" r="4.5" fill="#f08c00" stroke="#212529" stroke-width="2.5"/>
      <path d="M44 1 v5 M48 0 v6 M52 1 v5" stroke="#212529" stroke-width="2" stroke-linecap="round"/>
      <circle cx="44" cy="12" r="2" fill="#212529"/><circle cx="53" cy="12" r="2" fill="#212529"/>
      <ellipse cx="48.5" cy="17" rx="5" ry="3.5" fill="#fff"/>
      <path d="M50 24 Q62 26 76 22" stroke="#f08c00" stroke-width="7" stroke-linecap="round" fill="none"/>
      <path d="M50 24 Q62 26 76 22" stroke="#212529" stroke-width="2" stroke-dasharray="3 5" fill="none"/>
    </g>
  </g>
</svg>`;
}
