# Specyfikacja Biznesowa: Responsywna Nawigacja Mobilna

Data: 31.10.2025
Wersja: 1.0

## 1. Cel Zmiany

Obecny komponent nagłówka (`Header.astro`) nie jest w pełni responsywny. Na urządzeniach o małej szerokości ekranu (poniżej progu `md`), kluczowe elementy interfejsu, takie jak linki nawigacyjne i e-mail użytkownika, są ukrywane bez zapewnienia alternatywnego sposobu dostępu.

**Cel:** Wdrożenie w pełni responsywnej nawigacji mobilnej, która zapewni użytkownikom dostęp do wszystkich funkcji aplikacji na każdym urządzeniu. Zmiana jest zgodna z głównym założeniem produktu opisanym w `prd.md` – podejściem "mobile-first".

## 2. Koncepcja Rozwiązania

Zgodnie z wybraną propozycją nr 1 oraz dokumentem `ui-plan.md`, rozwiązaniem będzie implementacja wzorca nawigacji typu "hamburger menu", które będzie uruchamiać wysuwany panel boczny.

- **Na małych ekranach (mobile):** Widoczna będzie ikona "hamburger menu". Jej kliknięcie spowoduje otwarcie panelu (`Sheet`) zawierającego pełną nawigację i akcje użytkownika.
- **Na dużych ekranach (desktop):** Interfejs pozostanie **bez zmian**, zapewniając spójność z dotychczasowym doświadczeniem.

## 3. Odniesienie do Stosu Technologicznego

Implementacja będzie oparta o technologie zdefiniowane w dokumencie `@tech-stack.md`:

- **Astro (`Header.astro`):** Główny komponent nagłówka zostanie zmodyfikowany w celu dodania logiki responsywnej.
- **React (`MobileNav.tsx`):** Nowy, interaktywny komponent React zostanie stworzony do zarządzania stanem i wyświetlaniem nawigacji mobilnej.
- **Shadcn/ui:** Wykorzystane zostaną gotowe, dostępne komponenty:
    - `Sheet`: Do implementacji wysuwanego panelu bocznego.
    - `Button`: Jako przycisk uruchamiający menu ("hamburger").
    - Ikony (np. z `lucide-react`): Do wizualnej reprezentacji przycisku menu.
- **Tailwind CSS:** Użyte zostaną klasy pomocnicze do zarządzania widocznością elementów na różnych szerokościach ekranu (np. `md:hidden`, `hidden md:flex`).

## 4. Wymagania Funkcjonalne

### 4.1. Widok Mobilny (poniżej progu `md`)

1.  Standardowe linki nawigacyjne ("Moje pytania", "Generator") oraz e-mail użytkownika w komponencie `Header.astro` muszą być ukryte.
2.  Po prawej stronie nagłówka musi pojawić się komponent `Button` z ikoną "hamburger menu".
3.  Interakcja (kliknięcie/dotknięcie) z przyciskiem "hamburger menu" musi spowodować otwarcie komponentu `Sheet` z prawej strony ekranu.
4.  Komponent `Sheet` musi zawierać:
    - Linki nawigacyjne ("Moje pytania", "Generator").
    - E-mail zalogowanego użytkownika.
    - Komponent `LogoutButton`.
5.  Interakcja z dowolnym linkiem nawigacyjnym wewnątrz `Sheet` musi powodować przejście do odpowiedniej strony i automatyczne zamknięcie panelu.
6.  Panel `Sheet` musi być możliwy do zamknięcia poprzez dedykowany przycisk "zamknij" (ikona 'X') lub kliknięcie w tło (overlay).

### 4.2. Widok Desktopowy (od progu `md` w górę)

1.  Zachowanie i wygląd komponentu `Header.astro` muszą pozostać **identyczne** z obecnym stanem.
2.  Linki nawigacyjne, e-mail użytkownika i przycisk wylogowania muszą być widoczne w nagłówku, tak jak dotychczas.
3.  Przycisk "hamburger menu" musi być ukryty.

## 5. Kryteria Akceptacji

- [ ] Na ekranach o szerokości mniejszej niż `md`, nagłówek wyświetla logo aplikacji i ikonę hamburgera.
- [ ] Kliknięcie ikony hamburgera płynnie wysuwa panel boczny (`Sheet`).
- [ ] Wszystkie elementy wewnątrz panelu (`linki`, `e-mail`, `przycisk wylogowania`) są w pełni funkcjonalne.
- [ ] Panel można zamknąć w intuicyjny sposób (przycisk 'X', kliknięcie w tło).
- [ ] Na ekranach o szerokości `md` i większych, wygląd i działanie nagłówka nie uległy zmianie.
- [ ] Rozwiązanie jest w pełni dostępne (obsługa z klawiatury, poprawne atrybuty ARIA dla czytników ekranu).

