# 🐯 Podchody — gra terenowa z kodami QR

Gra na urodziny: rodzic chowa w domu albo ogrodzie karty z kodami QR. Dzieci skanują
kartę telefonem, rozwiązują zagadkę i dostają wskazówkę, gdzie szukać następnej.
Na końcu jest ekran skarbu.

**Gra:** https://lolekst1.github.io/podchody/
**Karty do druku:** https://lolekst1.github.io/podchody/druk.html

## Gry w zestawie

Wybór gry jest na ekranie „Przygotuj grę”: ekran od razu przebiera się w jej kolory i maskotkę.
Karty do druku wybiera się tak samo, polem „Gra” na stronie wydruku.

| Gra | Dla kogo | Maskotka i droga postępu |
|---|---|---|
| 🐯 Tygrysy i motory | przykład, 3–12 lat | Tygrysek w goglach, motor na asfalcie |
| ⚽ Piłkarski turniej Ignacego | Ignacy, 11 lat | Lisek Strzelec w koszulce z „10”, piłka toczy się po boisku |
| 🐴 Stadnina Łucji | Łucja, 12 lat | Kucyk Iskierka, galop po leśnej ścieżce |
| 🐼 Bambusowy las Zuzi | Zuzia, 7 lat | Panda Pyzia z bambusem, panda turla się po bambusowej ścieżce |
| 🦄 Tęczowa kraina Róży | Róża, 10 lat | Jednorożka Gwiazdka, lot po tęczy |

Zagadki starszaka są dopasowane do wieku solenizanta: dla Zuzi krótkie i proste, dla Róży szyfry
i słowa czytane od tyłu, dla Ignacego i Łucji wiedza o piłce i koniach. Wersja malucha zostaje
w każdej grze dla młodszych gości. Każda gra ma wersję domową i ogrodową; ściągawka do druku
podaje kryjówki i odpowiedzi.

## Co zobaczą dzieci

Maskotka gry (np. Tygrysek w goglach motocyklowych) prowadzi przez grę: macha na powitanie, rusza pyszczkiem,
kiedy telefon czyta zagadkę, skacze z radości po dobrej odpowiedzi i przechyla głowę po złej.
U góry ekranu znacznik motywu (motor, piłka, kucyk, panda, jednorożec) przesuwa się po drodze
do kolejnej flagi po każdej zaliczonej karcie.
Na końcu dzieci otwierają dotykiem skrzynię skarbu i lecą z niej monety, gwiazdy i konfetti.
Dźwięki (warkot motoru, gwizdek sędziego, stukot kopyt, „boing”, czarodziejskie dzwonki, fanfara) i wibracje są generowane w telefonie, bez pobierania plików.
Przycisk 🔊 w rogu je wycisza. Przy włączonym w systemie „ograniczeniu ruchu” animacje się wyłączają.

## Tryby

| Tryb | Dla kogo | Jak wygląda zagadka |
|---|---|---|
| 🧸 Maluch | 3–6 lat, nie czyta | Telefon czyta zagadkę na głos, dziecko dotyka jednego z 3–4 dużych obrazków |
| 🧩 Starszak | 7–12 lat | Zagadka do przeczytania, odpowiedź wpisywana. Wielkość liter, polskie znaki i drobne literówki nie mają znaczenia |
| 🤝 Mieszany | rodzeństwo, grupa | Na każdej karcie obie zagadki. Dalej idzie się dopiero, gdy obie są rozwiązane |

## Przed imprezą (około 20 minut)

1. **Wydrukuj karty.** Otwórz stronę z kartami do druku, wybierz „W domu” albo „Na zewnątrz” i kliknij
   „Drukuj albo zapisz jako PDF” (A4, skala 100%). Pierwsza kartka to **ściągawka**:
   gdzie schować którą kartę i jakie są odpowiedzi. Nie pokazuj jej dzieciom.
   Karty do ogrodu włóż w foliowe koszulki.
2. **Schowaj karty** według ściągawki. Kryjówki możesz zmienić, ale wtedy zmień też
   wskazówki w pliku gry (patrz niżej). Inaczej dzieci dostaną mylącą podpowiedź.
3. **Na telefonie, którym będą grać dzieci**, otwórz grę **przy dostępie do internetu**.
   Od tej chwili działa też bez sieci. Wybierz tryb i miejsce, ustaw 4-cyfrowy PIN rodzica,
   naciśnij „Zaczynamy!”.
4. Grajcie na **jednym telefonie**, bo postęp zapisuje się tylko na tym urządzeniu.
   Najlepiej skanować przyciskiem **„📷 Skanuj kartę”** w grze. Zwykły aparat telefonu też działa.

## Próba generalna (5 minut, bez drukowania)

1. Otwórz grę i ustaw tryb mieszany.
2. Naciśnij **👤 Rodzic** (na dole ekranu) i wpisz PIN.
3. Przy każdej karcie jest link **„próba: otwórz jak po skanie”**. Działa dokładnie tak,
   jak zeskanowanie karty. Przejdź kilka kart i sprawdź, czy telefon czyta zagadki na głos
   (włącz dźwięk; tryb cichy na iPhonie wycisza mowę).
4. Sprawdź wydruk: zeskanuj jedną wydrukowaną kartę zwykłym aparatem telefonu.
5. Na koniec: Rodzic → **„Zacznij grę od nowa”** (dotknij dwa razy).

## W trakcie gry: panel rodzica

**👤 Rodzic** + PIN otwiera:
- **postęp**: które karty zaliczone i gdzie leży każda karta,
- **„Przejdź do następnej stacji”**, gdy karta zginęła albo zamokła; dzieci od razu widzą
  wskazówkę do następnej kryjówki,
- „Cofnij o jedną stację”, zmianę trybu w trakcie gry i reset.

Gdy dzieci zeskanują kartę nie po kolei, gra powie „To jeszcze nie ta kryjówka!” i nie zdradzi zagadki.

## Nowa gra na inny motyw

Każda gra to jeden plik JSON w `app/gry/`. Najprościej poprosić Claude. Skopiuj i uzupełnij:

> W repo `lolekST1/podchody` dodaj nową grę. Wzoruj się dokładnie na formacie
> `app/gry/tygrysy-i-motory.json`. Motyw: **[np. dinozaury i kosmos]**. Wiek dzieci: **[np. 4 i 9 lat]**.
> Liczba kart: **[np. 6]**. Kryjówki w domu: **[np. kanapa, łazienka, …]**. Kryjówki w ogrodzie:
> **[…]**. Skarb: **[gdzie]**. Zagadki dla malucha: bardzo proste, 3–4 obrazki emoji, bez postaci
> z bajek i znaków towarowych. Zagadki dla starszaka: dla podanego wieku, z kilkoma akceptowanymi
> odpowiedziami, i na każdej karcie z **inną odpowiedzią niż u malucha** (w trybie mieszanym obie są na jednym ekranie). Nowe losowe tokeny. Dopisz grę do `app/gry/index.json`, uruchom `npm test`
> i wypchnij zmiany na `main`.

Po wdrożeniu (około 3 minut) nowa gra pojawi się na ekranie „Przygotuj grę” i na stronie z kartami.

Motyw wybiera się w `motyw`: `styl` (tygrysy, pilka, konie, pandy, jednorozce), `maskotka.gatunek`
(tygrys, lis, kon, panda, jednorozec), `pojazd` (motor, pilka, kucyk, panda, jednorozec), `dzwiekRuchu`
(wrrum, gwizdek, patataj, boing, magia) i `okrzyk`. Zupełnie nowy motyw, np. dinozaury, wymaga
nowej maskotki i kolorów w kodzie: poproś o to Claude tym samym poleceniem.

Najważniejsze pola pliku gry:
- `stacje[].maluch`: `zagadka` (czytana na głos), `opcje` (3–4 obrazki: `obrazek` + `nazwa`), `poprawna` (numer obrazka, **liczony od 0**),
- `stacje[].starszak`: `zagadka` i `odpowiedzi` (lista akceptowanych odpowiedzi),
- `stacje[].wskazowka.dom` / `.ogrod`: gdzie leży **następna** karta (w ostatniej stacji: gdzie jest skarb),
- `start.dom` / `.ogrod`: gdzie leży karta nr 1,
- `token`: losowy kod karty. Dzięki niemu kartki nie da się „zgadnąć” wpisując adres.

Gra z błędem w pliku pokaże czytelną listę problemów, a `npm test` jej nie przepuści.

## Dla programisty

```bash
npm install
npm start            # http://localhost:8080/
npm test             # testy logiki + testy w przeglądarce (widok telefonu Pixel 7)
```

- `app/` to cała aplikacja (statyczne pliki, bez budowania). Publikuje ją GitHub Actions
  (`.github/workflows/wdrozenie.yml`) po testach, przy każdym pushu na `main`.
- Po zmianie plików aplikacji podbij `WERSJA` w `app/sw.js`, żeby telefony pobrały nową wersję.
- `raport/` po `npm test` zawiera zrzuty ekranów z przejść gry i PDF-y z kartami.
- `node scripts/film.mjs` (przy działającym `PORT=8123 npm start`) nagrywa film z rozgrywki: `raport/film-rozgrywki.webm`.
- Krój pisma: Baloo 2 (SIL Open Font License), dołączony w `app/fonty/`, żeby działał offline.

## Znane ograniczenia

- Postęp jest na jednym urządzeniu. Drugi telefon zaczyna od początku.
- **iPhone:** jeśli grę dodano do ekranu głównego, skan zwykłym aparatem otwiera Safari,
  które ma osobną pamięć postępu. Na iPhonie skanuj przyciskiem w grze albo graj w Safari
  bez dodawania do ekranu głównego.
- Mowa korzysta z głosu wbudowanego w telefon. Na większości telefonów jest polski głos.
  Bez niego zagadka i tak jest na ekranie, a dorosły może ją przeczytać.
- Po zeskanowaniu karty **zwykłym aparatem** przeglądarka może nie pozwolić na mowę bez
  dotknięcia ekranu. Wtedy dziecko naciska „🔊 Posłuchaj zagadki”. Skaner w grze nie ma tego problemu.
- Pierwsze otwarcie gry musi być przy internecie. Dopiero wtedy telefon zapamiętuje grę offline.
- PIN chroni przed przypadkowym kliknięciem przez dzieci, nie przed hakerem.
