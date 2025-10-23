# Specyfikacja Techniczna: Moduł Uwierzytelniania

Data: 23.10.2025
Wersja: 1.0

## 1. Wprowadzenie

Niniejszy dokument opisuje architekturę techniczną modułu uwierzytelniania dla aplikacji InterviewPrep AI. Specyfikacja bazuje na wymaganiach zdefiniowanych w PRD (US-001 do US-005) oraz na przyjętym stosie technologicznym (Astro, React, Supabase). Celem jest zaprojektowanie spójnego i bezpiecznego systemu rejestracji, logowania, wylogowywania i odzyskiwania hasła.

## 2. Architektura Interfejsu Użytkownika (UI)

Interfejs użytkownika zostanie rozbudowany o nowe strony i komponenty dedykowane obsłudze procesów uwierzytelniania. Zostaną one zintegrowane z istniejącą strukturą aplikacji, z wyraźnym podziałem odpowiedzialności między statyczne strony Astro a interaktywne komponenty React.

### 2.1. Nowe Strony (Astro Pages)

W katalogu `src/pages/` powstanie nowy folder `auth/`, w którym znajdą się strony odpowiedzialne za poszczególne widoki procesu uwierzytelniania.

- **`src/pages/auth/login.astro`**: Strona logowania.
    - **Cel**: Wyświetlenie formularza logowania.
    - **Dostęp**: Dla użytkowników niezalogowanych. Użytkownicy zalogowani będą automatycznie przekierowywani na stronę główną (`/`).
    - **Zawartość**: Będzie renderować komponent React `LoginForm.tsx`.

- **`src/pages/auth/register.astro`**: Strona rejestracji.
    - **Cel**: Wyświetlenie formularza rejestracji.
    - **Dostęp**: Dla użytkowników niezalogowanych. Użytkownicy zalogowani będą automatycznie przekierowywani na stronę główną (`/`).
    - **Zawartość**: Będzie renderować komponent React `RegisterForm.tsx`.

- **`src/pages/auth/password-reset.astro`**: Strona do resetowania hasła.
    - **Cel**: Wyświetlenie formularza do zainicjowania procesu resetowania hasła (podanie adresu e-mail) oraz formularza do ustawienia nowego hasła (po przejściu z linku w mailu).
    - **Dostęp**: Dla użytkowników niezalogowanych.
    - **Zawartość**: Będzie renderować komponent React `PasswordResetForm.tsx`.

- **`src/pages/auth/callback.astro`**: Strona do obsługi callbacków z Supabase.
    - **Cel**: Strona techniczna, niewidoczna dla użytkownika. Obsłuży przekierowania zwrotne od Supabase po pomyślnej weryfikacji e-maila lub resecie hasła.
    - **Logika**: Endpoint po stronie serwera (GET), który obsłuży sesję i przekieruje użytkownika na stronę logowania z odpowiednim komunikatem (np. "Konto zweryfikowane, możesz się zalogować").

### 2.2. Nowe Komponenty (React Components)

W katalogu `src/components/` powstanie nowy folder `auth/`, w którym znajdą się interaktywne komponenty formularzy.

- **`src/components/auth/LoginForm.tsx`**:
    - **Odpowiedzialność**: Zarządzanie stanem formularza logowania (dane wejściowe, stan ładowania, komunikaty o błędach).
    - **Walidacja**: Walidacja po stronie klienta przy użyciu `zod` (sprawdzenie formatu e-mail, niepuste hasło).
    - **Interakcja**: Po wysłaniu formularza, komponent będzie komunikował się z endpointem API (`/api/auth/login`) w celu uwierzytelnienia użytkownika. Po pomyślnym logowaniu, nastąpi odświeżenie strony i przekierowanie zarządzane przez Astro.

- **`src/components/auth/RegisterForm.tsx`**:
    - **Odpowiedzialność**: Zarządzanie stanem formularza rejestracji.
    - **Walidacja**: Walidacja `zod` (format e-mail, minimalna długość hasła - 8 znaków).
    - **Interakcja**: Komunikacja z endpointem API (`/api/auth/register`). Po pomyślnej rejestracji, formularz zostanie ukryty, a w jego miejsce pojawi się komunikat informujący o konieczności weryfikacji adresu e-mail.

- **`src/components/auth/PasswordResetForm.tsx`**:
    - **Odpowiedzialność**: Zarządzanie stanem formularza resetowania hasła.
    - **Interakcja**: Komunikacja z endpointem API (`/api/auth/password-reset`).

### 2.3. Modyfikacje Istniejących Elementów

- **`src/layouts/Layout.astro`**:
    - **Cel**: Wprowadzenie logiki warunkowego renderowania elementów nawigacji w zależności od stanu zalogowania użytkownika.
    - **Logika**: Layout będzie sprawdzał obecność sesji użytkownika w `Astro.locals.session`.
        - **Jeśli użytkownik jest zalogowany**: Wyświetli linki "Moje pytania" (`/questions`) i "Wyloguj" (przycisk uruchamiający endpoint `/api/auth/logout`).
        - **Jeśli użytkownik jest niezalogowany**: Wyświetli linki "Zaloguj" (`/auth/login`) i "Zarejestruj" (`/auth/register`).

- **`src/middleware/index.ts`**:
    - **Cel**: Rozbudowa middleware o logikę zarządzania sesją Supabase.
    - **Logika**: Middleware będzie przechwytywać każde żądanie, weryfikować token JWT z ciasteczek, a następnie odświeżać sesję i umieszczać dane użytkownika oraz klienta Supabase w `Astro.locals`. To centralny punkt integracji z Supabase Auth po stronie serwera. Zapewni to dostęp do sesji na każdej stronie renderowanej po stronie serwera.

### 2.4. Scenariusze i Obsługa Błędów

- **Walidacja**: Wszystkie formularze będą wykorzystywać bibliotekę `zod` do walidacji po stronie klienta (natychmiastowy feedback dla użytkownika) oraz po stronie serwera (zabezpieczenie endpointów API).
- **Komunikaty o błędach**:
    - Błędy walidacji będą wyświetlane pod odpowiednimi polami formularza.
    - Błędy serwera (np. "Użytkownik o tym adresie e-mail już istnieje", "Nieprawidłowe hasło") będą wyświetlane jako ogólny komunikat w komponencie formularza.
- **Stany ładowania**: Przyciski "Zaloguj", "Zarejestruj" będą blokowane na czas komunikacji z API, a użytkownik zobaczy wskaźnik ładowania (spinner).

## 3. Logika Backendu

Backend zostanie zrealizowany w formie endpointów API w Astro, które będą hermetyzować logikę komunikacji z Supabase Auth.

### 3.1. Struktura Endpointów API

W katalogu `src/pages/api/` powstanie nowy folder `auth/`. Wszystkie endpointy będą miały ustawioną flagę `export const prerender = false;`.

- **`POST /api/auth/login`**:
    - **Przeznaczenie**: Logowanie użytkownika.
    - **Dane wejściowe**: `{ email: string, password: string }`.
    - **Logika**:
        1. Walidacja danych wejściowych przy użyciu `zod`.
        2. Wywołanie metody `supabase.auth.signInWithPassword()`.
        3. W przypadku sukcesu, Supabase automatycznie ustawi ciasteczka sesji w odpowiedzi. Endpoint zwróci status 200 OK.
        4. W przypadku błędu (np. nieprawidłowe dane, konto niezweryfikowane), zwróci odpowiedni status HTTP (np. 400, 401) wraz z komunikatem błędu.

- **`POST /api/auth/register`**:
    - **Przeznaczenie**: Rejestracja nowego użytkownika.
    - **Dane wejściowe**: `{ email: string, password: string }`.
    - **Logika**:
        1. Walidacja danych wejściowych (`zod`).
        2. Wywołanie metody `supabase.auth.signUp()`, przekazując URL do callbacka weryfikacyjnego (`/auth/callback`).
        3. W przypadku błędu (np. użytkownik już istnieje), zwróci status 409 Conflict.
        4. W przypadku sukcesu, zwróci status 201 Created.

- **`POST /api/auth/logout`**:
    - **Przeznaczenie**: Wylogowanie użytkownika.
    - **Logika**:
        1. Wywołanie metody `supabase.auth.signOut()`.
        2. Usunięcie ciasteczek sesji.
        3. Przekierowanie użytkownika na stronę główną (`/`).

- **`POST /api/auth/password-reset`**:
    - **Przeznaczenie**: Inicjowanie procesu resetowania hasła.
    - **Dane wejściowe**: `{ email: string }`.
    - **Logika**:
        1. Walidacja danych wejściowych.
        2. Wywołanie metody `supabase.auth.resetPasswordForEmail()`, przekazując URL do strony ustawiania nowego hasła.
        3. Zawsze zwraca status 200 OK, aby nie ujawniać, czy dany e-mail istnieje w bazie.

- **`POST /api/auth/password-update`**:
    - **Przeznaczenie**: Aktualizacja hasła użytkownika.
    - **Dane wejściowe**: `{ password: string }`.
    - **Logika**:
        1. Endpoint wywoływany z sesją użytkownika (po przejściu z linku resetującego).
        2. Walidacja nowego hasła.
        3. Wywołanie metody `supabase.auth.updateUser()`.
        4. Zwrócenie statusu 200 OK lub błędu.

### 3.2. Walidacja i Obsługa Wyjątków

- **Walidacja**: Każdy endpoint API będzie rozpoczynał się od bloku walidacji danych wejściowych przy użyciu schematów `zod`. W przypadku niepowodzenia walidacji, endpoint natychmiast zwróci odpowiedź 400 Bad Request.
- **Obsługa wyjątków**: Logika endpointów będzie opakowana w bloki `try...catch`, aby przechwytywać błędy z Supabase API (np. `AuthApiError`). Błędy te będą mapowane na odpowiednie statusy HTTP i komunikaty JSON, które frontend będzie mógł zinterpretować i wyświetlić użytkownikowi.

## 4. System Uwierzytelniania (Supabase Auth)

Integracja z Supabase Auth będzie kluczowym elementem systemu.

- **Konfiguracja**: Istniejące klucze Supabase (URL i `anon key`) przechowywane w zmiennych środowiskowych (`.env`) będą wykorzystywane przez aplikację poprzez `import.meta.env`.
- **Inicjalizacja klienta**: Istniejący klient Supabase, inicjalizowany w `src/db/supabase.client.ts`, będzie reużywany w całej aplikacji.
- **Zarządzanie sesją**: Główna odpowiedzialność za zarządzanie sesją spocznie na middleware (`src/middleware/index.ts`). Będzie on odczytywał, weryfikował i odświeżał sesję przy każdym żądaniu serwerowym, udostępniając ją w `Astro.locals`. Dzięki temu każda strona renderowana na serwerze będzie miała natychmiastowy dostęp do informacji o zalogowanym użytkowniku.
- **Szablony e-mail**: W panelu Supabase zostaną skonfigurowane szablony wiadomości e-mail (potwierdzenie rejestracji, reset hasła), aby zawierały poprawne linki zwrotne do aplikacji (`/auth/callback`, `/auth/password-reset`).

## 5. Podsumowanie Zmian w Strukturze Projektu

- **Nowe pliki**:
    - `src/pages/auth/login.astro`
    - `src/pages/auth/register.astro`
    - `src/pages/auth/password-reset.astro`
    - `src/pages/auth/callback.astro`
    - `src/pages/api/auth/login.ts`
    - `src/pages/api/auth/register.ts`
    - `src/pages/api/auth/logout.ts`
    - `src/pages/api/auth/password-reset.ts`
    - `src/pages/api/auth/password-update.ts`
    - `src/components/auth/LoginForm.tsx`
    - `src/components/auth/RegisterForm.tsx`
    - `src/components/auth/PasswordResetForm.tsx`
- **Zmodyfikowane pliki**:
    - `src/middleware/index.ts`
    - `src/layouts/Layout.astro`

