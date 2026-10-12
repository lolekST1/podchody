# Podchody — notatki dla Claude

Statyczna aplikacja PWA (bez frameworka, bez budowania) w `app/`, wdrażana na GitHub Pages
przez `.github/workflows/wdrozenie.yml`. Odpowiadaj użytkownikowi po polsku.

- Gry: `app/gry/<id>.json` + wpis w `app/gry/index.json`. Format i walidacja: `sprawdzGre()` w `app/js/logika.js`.
- Obrazki: tylko emoji albo własne proste SVG — żadnych postaci z bajek ani znaków towarowych.
- Każdy nowy plik w `app/` musi trafić na listę `PLIKI` w `app/sw.js` (pilnuje tego test), a zmiana aplikacji = podbicie `WERSJA`.
- Testy: `npm test` (node:test + Playwright w widoku telefonu). Na zielono → push na `main` = wdrożenie.
