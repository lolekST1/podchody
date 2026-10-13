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
