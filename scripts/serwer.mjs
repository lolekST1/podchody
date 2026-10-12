// Minimalny serwer statyczny do prób i testów (bez zależności).
// Uruchom: npm start  →  http://localhost:8080/
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const KORZEN = new URL('../app/', import.meta.url).pathname;
const PORT = Number(process.env.PORT || 8080);
const TYPY = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png',
};

createServer(async (req, res) => {
  let sciezka = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (sciezka.endsWith('/')) sciezka += 'index.html';
  const plik = normalize(join(KORZEN, sciezka));
  if (!plik.startsWith(KORZEN)) { res.writeHead(403).end(); return; }
  try {
    if (!(await stat(plik)).isFile()) throw new Error();
    res.writeHead(200, { 'Content-Type': TYPY[extname(plik)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(await readFile(plik));
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Nie ma takiego pliku');
  }
}).listen(PORT, () => console.log(`Podchody: http://localhost:${PORT}/`));
