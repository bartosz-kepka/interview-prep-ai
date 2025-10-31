# Plan testów dla projektu Interview Prep AI

## 1. Wprowadzenie i cele testowania

### 1.1. Wprowadzenie

Niniejszy dokument przedstawia kompleksowy plan testów dla aplikacji "Interview Prep AI". Celem projektu jest stworzenie narzędzia wspomagającego przygotowanie do rozmów kwalifikacyjnych poprzez generowanie pytań rekrutacyjnych z wykorzystaniem sztucznej inteligencji. Plan ten ma na celu zapewnienie wysokiej jakości, niezawodności i bezpieczeństwa aplikacji przed jej wdrożeniem produkcyjnym.

### 1.2. Cele testowania

Główne cele procesu testowego to:

- **Weryfikacja funkcjonalna:** Upewnienie się, że wszystkie funkcjonalności aplikacji działają zgodnie z założeniami i specyfikacją.
- **Zapewnienie jakości:** Identyfikacja i eliminacja błędów w celu dostarczenia użytkownikom stabilnego i niezawodnego produktu.
- **Ocena wydajności:** Sprawdzenie, jak aplikacja zachowuje się pod obciążeniem, zwłaszcza w kontekście generowania treści przez AI.
- **Weryfikacja bezpieczeństwa:** Identyfikacja potencjalnych luk w zabezpieczeniach, szczególnie w modułach uwierzytelniania i autoryzacji.
- **Ocena użyteczności (UX/UI):** Sprawdzenie, czy interfejs użytkownika jest intuicyjny, responsywny i zgodny z projektem.
- **Zapewnienie kompatybilności:** Weryfikacja poprawnego działania aplikacji na różnych przeglądarkach i urządzeniach.

## 2. Zakres testów

### 2.1. Funkcjonalności objęte testami

- **Moduł uwierzytelniania:**
  - Rejestracja nowego użytkownika.
  - Logowanie (poprawne i błędne dane).
  - Wylogowywanie.
  - Mechanizm "Zapomniałem hasła" i resetowanie hasła.
  - Ochrona tras wymagających zalogowania.
  - Obsługa sesji użytkownika.
- **Generator pytań AI:**
  - Formularz generowania pytań (walidacja pól wejściowych).
  - Proces generowania pytań (komunikacja z API, obsługa stanu ładowania).
  - Wyświetlanie wygenerowanych pytań.
  - Obsługa błędów API (np. przekroczenie limitów, błędy modeli AI).
- **Zarządzanie pytaniami:**
  - Zapisywanie wygenerowanych pytań na koncie użytkownika.
  - Wyświetlanie listy zapisanych pytań.
  - Ręczne tworzenie pytań.
  - Edycja pytań.
  - Usuwanie pytań.
- **Interfejs użytkownika:**
  - Nawigacja i układ strony.
  - Responsywność na różnych rozmiarach ekranu.
  - Dostępność (WCAG).

### 2.2. Funkcjonalności wyłączone z testów

- Testowanie wewnętrznej logiki modeli językowych dostarczanych przez OpenRouter.ai (skupiamy się na integracji i obsłudze odpowiedzi).
- Testowanie infrastruktury Supabase (skupiamy się na poprawności integracji i wykorzystania SDK).

## 3. Typy testów do przeprowadzenia

1.  **Testy jednostkowe (Unit Tests):**
    - **Cel:** Weryfikacja poprawności działania pojedynczych funkcji, komponentów i usług w izolacji.
    - **Zakres:** Funkcje pomocnicze (`src/lib/utils.ts`), logika hooków React (`src/components/hooks`), usługi (`src/lib/services`), walidacja Zod.
2.  **Testy integracyjne (Integration Tests):**
    - **Cel:** Sprawdzenie poprawności współpracy między różnymi modułami aplikacji.
    - **Zakres:**
      - Integracja komponentów React z hookami i usługami frontendowymi.
      - Integracja frontendu z endpointami API Astro (np. formularz logowania -> API logowania).
      - Integracja endpointów API z usługami Supabase (np. API rejestracji -> Supabase Auth).
      - Integracja z API OpenRouter.ai.
3.  **Testy End-to-End (E2E):**
    - **Cel:** Symulacja rzeczywistych scenariuszy użytkowania aplikacji z perspektywy użytkownika końcowego.
    - **Zakres:** Pełne ścieżki użytkownika, np. "Rejestracja -> Logowanie -> Wygenerowanie i zapisanie pytań -> Wylogowanie".
4.  **Testy API:**
    - **Cel:** Bezpośrednia weryfikacja endpointów API pod kątem logiki biznesowej, obsługi błędów i bezpieczeństwa.
    - **Zakres:** Testowanie każdego endpointu w `src/pages/api/` z użyciem różnych danych wejściowych (poprawnych i niepoprawnych).
5.  **Testy wydajnościowe:**
    - **Cel:** Ocena czasu odpowiedzi serwera i renderowania strony, zwłaszcza dla operacji generowania pytań.
    - **Zakres:** Pomiar czasu generowania pytań w zależności od parametrów wejściowych.
6.  **Testy bezpieczeństwa:**
    - **Cel:** Identyfikacja i eliminacja podstawowych luk bezpieczeństwa.
    - **Zakres:** Ochrona endpointów API, walidacja danych wejściowych (zapobieganie XSS/CSRF), bezpieczeństwo sesji i tokenów JWT.
7.  **Testy manualne (UAT - User Acceptance Testing):**
    - **Cel:** Weryfikacja użyteczności, wyglądu i ogólnego działania aplikacji.
    - **Zakres:** Testy eksploracyjne, weryfikacja responsywności (cross-browser, cross-device).

## 4. Scenariusze testowe dla kluczowych funkcjonalności

### 4.1. Uwierzytelnianie

| ID      | Scenariusz                                  | Oczekiwany rezultat                                                                                                              | Priorytet |
| :------ | :------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------- | :-------- |
| AUTH-01 | Rejestracja z poprawnymi, unikalnymi danymi | Użytkownik zostaje zarejestrowany, otrzymuje e-mail weryfikacyjny i zostaje przekierowany na stronę logowania lub `check-email`. | Krytyczny |
| AUTH-02 | Rejestracja z zajętym adresem e-mail        | Wyświetlany jest komunikat o błędzie informujący, że e-mail jest już w użyciu.                                                   | Krytyczny |
| AUTH-03 | Logowanie z poprawnymi danymi               | Użytkownik zostaje zalogowany i przekierowany do panelu głównego (`/generator`).                                                 | Krytyczny |
| AUTH-04 | Logowanie z błędnym hasłem/e-mailem         | Wyświetlany jest komunikat o błędzie "Nieprawidłowe dane logowania".                                                             | Krytyczny |
| AUTH-05 | Dostęp do strony `/generator` bez logowania | Użytkownik zostaje przekierowany na stronę logowania (`/login`).                                                                 | Wysoki    |
| AUTH-06 | Reset hasła dla istniejącego użytkownika    | Użytkownik otrzymuje e-mail z linkiem do resetu hasła. Po kliknięciu może ustawić nowe hasło.                                    | Wysoki    |

### 4.2. Generator pytań AI

| ID    | Scenariusz                                            | Oczekiwany rezultat                                                                                  | Priorytet |
| :---- | :---------------------------------------------------- | :--------------------------------------------------------------------------------------------------- | :-------- |
| AI-01 | Generowanie pytań z poprawnie wypełnionym formularzem | Po kliknięciu "Generuj" wyświetla się stan ładowania, a następnie lista wygenerowanych pytań.        | Krytyczny |
| AI-02 | Próba generowania pytań z pustym formularzem          | Pola formularza są walidowane, a pod pustymi polami pojawiają się komunikaty o błędach.              | Wysoki    |
| AI-03 | Zapisywanie wygenerowanych pytań                      | Po kliknięciu "Zapisz" pytania są zapisywane na koncie użytkownika, a interfejs potwierdza operację. | Wysoki    |
| AI-04 | Obsługa błędu po stronie API (np. błąd 500)           | Na ekranie pojawia się czytelny komunikat o błędzie, informujący użytkownika o problemie.            | Wysoki    |

### 4.3. Zarządzanie pytaniami

| ID      | Scenariusz                          | Oczekiwany rezultat                                                                                    | Priorytet |
| :------ | :---------------------------------- | :----------------------------------------------------------------------------------------------------- | :-------- |
| MGMT-01 | Ręczne tworzenie nowego pytania     | Po wypełnieniu formularza i kliknięciu "Zapisz", nowe pytanie pojawia się na liście pytań użytkownika. | Wysoki    |
| MGMT-02 | Próba utworzenia pustego pytania    | Wyświetlany jest komunikat o błędzie walidacji, a pytanie nie zostaje zapisane.                        | Średni    |
| MGMT-03 | Edycja istniejącego pytania         | Po zmianie treści pytania i zapisaniu, zaktualizowana wersja jest widoczna na liście.                  | Wysoki    |
| MGMT-04 | Usunięcie pytania z listy           | Po potwierdzeniu chęci usunięcia, pytanie znika z listy pytań użytkownika.                             | Wysoki    |
| MGMT-05 | Wyświetlanie listy zapisanych pytań | Po przejściu do odpowiedniej sekcji, użytkownik widzi listę wszystkich swoich zapisanych pytań.        | Krytyczny |

## 5. Środowisko testowe

- **Środowisko lokalne:** Komputery deweloperów z uruchomioną lokalnie aplikacją i połączniem z deweloperską instancją Supabase.
- **Środowisko stagingowe:** Dedykowany serwer (np. na DigitalOcean) z konfiguracją zbliżoną do produkcyjnej, połączony z osobną bazą danych Supabase (staging).
- **Przeglądarki:** Google Chrome (najnowsza wersja), Mozilla Firefox (najnowsza wersja), Safari (najnowsza wersja).
- **Urządzenia:** Testy responsywności na emulatorach przeglądarki dla popularnych rozdzielczości (smartfon, tablet, desktop).

## 6. Narzędzia do testowania

- **Testy jednostkowe i integracyjne:** Vitest (framework do testowania), React Testing Library (do testowania komponentów React).
- **Testy E2E:** Playwright.
- **Testy API:** Postman lub wbudowane narzędzia w Playwright.
- **Testy wydajnościowe:** Lighthouse w narzędziach deweloperskich Chrome.
- **Zarządzanie testami i raportowanie błędów:** Jira, Asana lub GitHub Issues.

## 7. Harmonogram testów

Proces testowania będzie prowadzony równolegle z procesem deweloperskim (continuous testing).

| Faza           | Opis                                                                              | Planowany czas           |
| :------------- | :-------------------------------------------------------------------------------- | :----------------------- |
| **Sprint 1-2** | Implementacja i testowanie jednostkowe/integracyjne modułu uwierzytelniania.      | Tydzień 1-2              |
| **Sprint 3-4** | Implementacja i testowanie jednostkowe/integracyjne generatora AI.                | Tydzień 3-4              |
| **Sprint 5**   | Testy E2E dla głównych ścieżek użytkownika. Konfiguracja środowiska stagingowego. | Tydzień 5                |
| **Sprint 6**   | Testy API, wydajnościowe i bezpieczeństwa. Testy UAT.                             | Tydzień 6                |
| **Regresja**   | Pełne testy regresji przed wdrożeniem produkcyjnym.                               | 1-2 dni przed wdrożeniem |

## 8. Kryteria akceptacji testów

### 8.1. Kryteria wejścia

- Ukończona implementacja funkcjonalności przeznaczonej do testów.
- Pomyślnie zakończone testy jednostkowe i integracyjne na środowisku deweloperskim.
- Dostępne i skonfigurowane środowisko testowe.

### 8.2. Kryteria wyjścia (zakończenia testów)

- Wykonanie co najmniej 95% zaplanowanych scenariuszy testowych.
- Brak otwartych błędów o priorytecie "Krytyczny".
- Liczba błędów o priorytecie "Wysoki" nie przekracza 3.
- Wszystkie zidentyfikowane luki bezpieczeństwa zostały naprawione.
- Osiągnięcie zakładanych wskaźników wydajności (np. czas odpowiedzi API poniżej 2s dla P95).

## 9. Role i odpowiedzialności

| Rola              | Odpowiedzialność                                                                                                  |
| :---------------- | :---------------------------------------------------------------------------------------------------------------- |
| **Deweloper**     | Pisanie testów jednostkowych i integracyjnych. Naprawa błędów zgłoszonych przez QA.                               |
| **Inżynier QA**   | Tworzenie i utrzymanie planu testów. Pisanie i wykonywanie testów E2E, API, wydajnościowych. Raportowanie błędów. |
| **Product Owner** | Udział w testach UAT. Akceptacja funkcjonalności. Priorytetyzacja naprawy błędów.                                 |

## 10. Procedury raportowania błędów

Wszystkie zidentyfikowane błędy będą raportowane w systemie do zarządzania projektami (np. GitHub Issues) i powinny zawierać następujące informacje:

- **Tytuł:** Krótki, zwięzły opis problemu.
- **Środowisko:** Gdzie wystąpił błąd (np. Lokalnie, Staging, Chrome 128).
- **Kroki do odtworzenia:** Szczegółowa lista kroków potrzebnych do wywołania błędu.
- **Obserwowany rezultat:** Co się stało po wykonaniu kroków.
- **Oczekiwany rezultat:** Co powinno się stać.
- **Priorytet:** Krytyczny, Wysoki, Średni, Niski.
- **Załączniki:** Zrzuty ekranu, nagrania wideo, logi z konsoli.
