// Service worker: po pierwszym otwarciu cała gra działa bez internetu.
// Przy każdej zmianie plików aplikacji podbij WERSJA — stary cache zostanie usunięty.
const WERSJA = 'podchody-v1';
const PLIKI = [
  './',
  'index.html',
  'druk.html',
  'manifest.webmanifest',
  'css/styl.css',
  'css/druk.css',
  'js/app.js',
  'js/logika.js',
  'js/mowa.js',
  'js/skaner.js',
  'js/druk.js',
  'vendor/jsQR.js',
  'vendor/qrcode.js',
  'ikony/ikona.svg',
  'ikony/ikona-180.png',
  'ikony/ikona-192.png',
  'ikony/ikona-512.png',
  'ikony/tygrys.svg',
  'ikony/motor.svg',
  'gry/index.json',
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(WERSJA);
    await cache.addAll(PLIKI);
    // Pliki gier bierzemy z listy, żeby nowa gra była offline bez edycji tego pliku.
    const lista = await (await cache.match('gry/index.json')).json();
    await cache.addAll(lista.gry.map((id) => `gry/${id}.json`));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const klucz of await caches.keys()) if (klucz !== WERSJA) await caches.delete(klucz);
    await self.clients.claim();
  })());
});

// Najpierw cache (działa w lesie bez zasięgu), w tle odświeżenie z sieci.
// Adresy kart mają parametry (?g=…&s=…&t=…), więc strony szukamy bez nich.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(WERSJA);
    const strona = req.mode === 'navigate';
    const zCache = await cache.match(req, { ignoreSearch: strona });
    const zSieci = fetch(req).then((odp) => {
      if (odp.ok) cache.put(strona ? new URL(req.url).pathname : req, odp.clone());
      return odp;
    }).catch(() => null);
    if (zCache) { e.waitUntil(zSieci); return zCache; }
    const odp = await zSieci;
    if (odp) return odp;
    if (strona) return (await cache.match('index.html')) ?? Response.error();
    return Response.error();
  })());
});
