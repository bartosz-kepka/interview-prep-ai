### Specyfikacja Techniczna: Moduł Autentykacji Użytkowników

**Wersja:** 1.0
**Data:** 24.10.2025
**Autor:** GitHub Copilot

---

### 1. Przegląd

Niniejszy dokument opisuje architekturę i implementację modułu autentykacji (rejestracja, logowanie, wylogowanie, odzyskiwanie hasła) dla aplikacji InterviewPrep AI. Specyfikacja jest zgodna z wymaganiami funkcjonalnymi (US-001 do US-005) zdefiniowanymi w PRD oraz opiera się na ustalonym stacku technologicznym (Astro, React, Supabase, Zod).

Celem jest stworzenie bezpiecznego, wydajnego i skalowalnego rozwiązania, które integruje się z istniejącą strukturą aplikacji, wykorzystując renderowanie po stronie serwera (SSR) w Astro oraz interaktywne komponenty React.

### 2. Architektura Interfejsu Użytkownika (Frontend)

#### 2.1. Nowe Strony (Astro)

Wprowadzone zostaną nowe, publicznie dostępne strony w katalogu `src/pages/`:

- **`src/pages/login.astro`**: Strona logowania (ścieżka: `/login`).
- **`src/pages/signup.astro`**: Strona rejestracji (ścieżka: `/signup`).
- **`src/pages/forgot-password.astro`**: Strona do inicjowania procesu resetowania hasła (ścieżka: `/forgot-password`).
- **`src/pages/reset-password.astro`**: Strona, na którą użytkownik jest przekierowywany z linku w mailu, aby ustawić nowe hasło (ścieżka: `/reset-password`).
- **`src/pages/check-email.astro`**: Strona informująca o wysłaniu maila weryfikacyjnego (ścieżka: `/check-email`).
- **`src/pages/error/expired-link.astro`**: Strona błędu dla wygasłego linku (ścieżka: `/error/expired-link`).
- **`src/pages/callback.astro`**: Strona techniczna (server-side) do obsługi przekierowań zwrotnych od Supabase (np. po weryfikacji e-mail). Przetwarza sesję i przekierowuje użytkownika na stronę logowania z odpowiednim komunikatem.

#### 2.2. Nowe Komponenty (React)

Interaktywne formularze zostaną zaimplementowane jako komponenty React, aby zarządzać stanem, walidacją i komunikacją z API po stronie klienta. Zostaną umieszczone w nowym katalogu `src/components/auth/`.

- **`src/components/auth/LoginForm.tsx`**: Formularz logowania z polami na e-mail i hasło. Będzie wykorzystywał schemat walidacji Zod. Komponent będzie renderowany na stronie `login.astro`.
- **`src/components/auth/SignUpForm.tsx`**: Formularz rejestracji z polami na e-mail i hasło. Analogicznie do `LoginForm`, będzie używał walidacji Zod do sprawdzania formatu e-maila i minimalnej długości hasła. Renderowany na stronie `signup.astro`.
- **`src/components/auth/ForgotPasswordForm.tsx`**: Prosty formularz z polem na e-mail, używany na stronie `forgot-password.astro`.
- **`src/components/auth/ResetPasswordForm.tsx`**: Formularz z polem na nowe hasło, renderowany na stronie `reset-password.astro`.

Komponenty te będą korzystać z komponentów UI z `shadcn/ui` (np. `Input`, `Button`, `Card`, `Alert`) w celu zachowania spójności wizualnej.

#### 2.3. Modyfikacja Layoutów i Komponentów

- **`src/layouts/Layout.astro`**: Główny layout zostanie zmodyfikowany, aby warunkowo renderować elementy interfejsu w zależności od statusu zalogowania użytkownika. Informacja o sesji będzie dostępna poprzez `Astro.locals.session`.
  - **Tryb `non-auth`**: Wyświetla linki "Zaloguj się" i "Zarejestruj się".
  - **Tryb `auth`**: Wyświetla nazwę użytkownika (lub e-mail) oraz przycisk "Wyloguj".

- **`src/components/auth/LogoutButton.tsx`**: Prosty komponent React, który po kliknięciu będzie wywoływał endpoint API do wylogowania.

#### 2.4. Walidacja i Obsługa Błędów

- **Walidacja po stronie klienta**: Każdy formularz React będzie używał biblioteki Zod do natychmiastowej walidacji danych wprowadzanych przez użytkownika (np. format e-mail, długość hasła), wyświetlając komunikaty bezpośrednio pod polami formularza.
- **Komunikaty z serwera**: Błędy zwrócone z API (np. "Użytkownik o tym adresie e-mail już istnieje", "Nieprawidłowe hasło") będą przechwytywane w komponentach React i wyświetlane użytkownikowi w dedykowanym komponencie `Alert` z `shadcn/ui`.

### 3. Logika Backendowa

#### 3.1. Endpointy API (Astro)

Zgodnie z praktykami Astro, endpointy API zostaną umieszczone w `src/pages/api/auth/`. Będą one pełniły rolę pośrednika (proxy) między klientem a Supabase Auth, co pozwoli na bezpieczne zarządzanie sesją po stronie serwera.

- **`src/pages/api/auth/login.ts`**:
  - Metoda: `POST`
  - Ciało żądania: `{ email, password }`
  - Logika: Waliduje dane wejściowe za pomocą Zod. Wywołuje `supabase.auth.signInWithPassword()`. **Sprawdza, czy e-mail użytkownika został zweryfikowany (`user.email_confirmed_at`). Jeśli nie, zwraca błąd 401 z informacją o konieczności weryfikacji.** W przypadku sukcesu, ustawia ciasteczka sesji za pomocą `Astro.cookies.set()` i zwraca dane użytkownika. W przypadku błędu, zwraca odpowiedni status HTTP i komunikat błędu.

- **`src/pages/api/auth/signup.ts`**:
  - Metoda: `POST`
  - Ciało żądania: `{ email, password }`
  - Logika: Waliduje dane. Wywołuje `supabase.auth.signUp()`, podając URL do `/api/auth/callback` jako `emailRedirectTo`. Supabase automatycznie wyśle e-mail weryfikacyjny. Zwraca sukces (np. 201 Created).

- **`src/pages/api/auth/logout.ts`**:
  - Metoda: `POST`
  - Logika: Wywołuje `supabase.auth.signOut()`. Czyści ciasteczka sesji za pomocą `Astro.cookies.delete()` i zwraca sukces.

- **`src/pages/api/auth/callback.ts`**:
  - Metoda: `GET`
  - Logika: Endpoint serwerowy, który Supabase wywoła po kliknięciu linku weryfikacyjnego. Wymienia kod autoryzacyjny na sesję za pomocą `supabase.auth.exchangeCodeForSession()`. Jeśli operacja się powiedzie, ustawia ciasteczka sesji i przekierowuje użytkownika do głównego widoku aplikacji (np. `/generator`). W przypadku błędu (np. wygasły link), przekierowuje na stronę `/error/expired-link`.

- **`src/pages/api/auth/reset-password.ts`**:
  - Metoda: `POST`
  - Ciało żądania: `{ email }`
  - Logika: Wywołuje `supabase.auth.resetPasswordForEmail()`, podając URL do strony `reset-password.astro` jako `redirectTo`.

- **`src/pages/api/auth/update-password.ts`**:
  - Metoda: `POST`
  - Ciało żądania: `{ password }`
  - Logika: Wywołuje `supabase.auth.updateUser()` w celu ustawienia nowego hasła. Wymaga aktywnej sesji użytkownika (uzyskanej po kliknięciu linku resetującego).

#### 3.2. Walidacja Danych (Zod)

Dla każdego endpointu API zostaną zdefiniowane schematy Zod w celu walidacji danych przychodzących. Zapewni to spójność i bezpieczeństwo. Schematy te mogą być współdzielone z frontendem.

- `LoginSchema`: `{ email: z.string().email(), password: z.string() }`
- `SignUpSchema`: `{ email: z.string().email(), password: z.string().min(8) }`

#### 3.3. Renderowanie Server-Side

Wszystkie strony wymagające autoryzacji (np. `generator.astro`, `index.astro` po zalogowaniu) muszą być renderowane po stronie serwera. W pliku `astro.config.mjs` należy upewnić się, że `output` jest ustawiony na `server` lub `hybrid`. Dla stron chronionych, które mają być dynamiczne, należy dodać `export const prerender = false;`.

### 4. System Autentykacji (Integracja z Supabase)

#### 4.1. Middleware

Kluczowym elementem systemu będzie middleware Astro, który będzie chronił trasy i zarządzał sesją.

- **`src/middleware/index.ts`**:
  - Na początku każdego żądania, middleware będzie próbował odczytać token dostępowy i odświeżający z ciasteczek (`Astro.cookies`).
  - Wywoła `supabase.auth.setSession()` z odczytanymi tokenami.
  - Następnie pobierze aktualną sesję za pomocą `supabase.auth.getSession()`.
  - Jeśli sesja jest ważna, dane użytkownika i sesji zostaną zapisane w `Astro.locals`, aby były dostępne w komponentach Astro i endpointach API (`context.locals.user`, `context.locals.session`).
  - Jeśli sesja wygasła, ale istnieje token odświeżający, middleware spróbuje ją odświeżyć. Zaktualizowane tokeny zostaną zapisane w ciasteczkach.
  - **Ochrona tras**: Middleware sprawdzi, czy żądany URL pasuje do chronionych ścieżek (np. `/generator`, `/api/ai/*`). Jeśli użytkownik nie jest zalogowany (`Astro.locals.session` jest `null`), zostanie przekierowany na stronę logowania za pomocą `return Astro.redirect('/login')`.
  - Strony publiczne (np. `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/check-email`, `/error/*`, strona główna dla niezalogowanych) będą wykluczone z tej logiki przekierowania.

#### 4.2. Konfiguracja Supabase

- **Klient Supabase**: Istniejący klient w `src/db/supabase.client.ts` będzie używany zarówno na serwerze (w middleware i API), jak i po stronie klienta (w komponentach React). Należy upewnić się, że jest on skonfigurowany jako singleton.
- **Szablony e-mail**: W panelu Supabase zostaną skonfigurowane szablony e-mail dla weryfikacji konta i resetowania hasła, aby zawierały poprawne linki zwrotne do aplikacji (np. `https://twoja-domena.com/api/auth/callback` i `https://twoja-domena.com/reset-password`).
- **URL-e przekierowań**: W ustawieniach Supabase Auth należy dodać adres URL aplikacji do listy dozwolonych przekierowań.

#### 4.3. Przepływ Danych (Podsumowanie)

1.  Użytkownik wchodzi na stronę chronioną.
2.  Middleware Astro przechwytuje żądanie, stwierdza brak sesji i przekierowuje na `/login` za pomocą `Astro.redirect('/login')`.
3.  Strona `login.astro` renderuje komponent `LoginForm.tsx`.
4.  Użytkownik wypełnia formularz. Dane są wysyłane do endpointu `/api/auth/login`.
5.  Endpoint komunikuje się z Supabase, a w razie sukcesu ustawia ciasteczka sesji i odsyła odpowiedź.
6.  Komponent React po otrzymaniu pozytywnej odpowiedzi przekierowuje użytkownika (np. za pomocą `window.location.href = '/generator'`) na docelową stronę.
7.  Middleware ponownie przechwytuje żądanie, tym razem odczytuje sesję z ciasteczek, zapisuje ją w `Astro.locals` i zezwala na dostęp do strony.

##### Przepływ Rejestracji

1.  Użytkownik wypełnia formularz na stronie `/signup`.
2.  Dane są wysyłane do `/api/auth/signup`.
3.  API wywołuje `supabase.auth.signUp()`. Supabase wysyła e-mail weryfikacyjny.
4.  Frontend po otrzymaniu odpowiedzi 201 przekierowuje użytkownika na stronę `/check-email`.
5.  Użytkownik klika link w e-mailu, który prowadzi do endpointu `/api/auth/callback`.
6.  Endpoint `/api/auth/callback` po stronie serwera wymienia kod na sesję, ustawia ciasteczka i przekierowuje uwierzytelnionego użytkownika do głównego widoku aplikacji (np. `/generator`). W przypadku błędu (wygasły link), użytkownik jest przekierowywany na stronę błędu.
