<conversation_summary>
<decisions>
1.  Dla wersji MVP nie będzie tworzona osobna tabela `profiles`. Dane użytkownika będą ograniczone do tych przechowywanych w tabeli `auth.users` Supabase.
2.  Kolumny `question` i `answer` w tabeli `questions` będą miały typ `VARCHAR(10000)`.
3.  Do śledzenia pochodzenia pytania zostanie użyty typ `ENUM` (`question_source`) z wartościami: `'user'`, `'ai'` i `'ai-edited'`.
4.  Tabela `questions` będzie zawierać indeksy na kolumnach `user_id` i `created_at` (malejąco) oraz indeks `pg_trgm` (GIN/GiST) na kolumnie `question`.
5.  Zostaną zaimplementowane zasady bezpieczeństwa na poziomie wierszy (RLS) dla tabeli `questions`, aby zapewnić, że użytkownicy mogą wykonywać operacje CRUD tylko na własnych pytaniach.
6.  Klucze główne w tabelach (`questions`, `ai_generation_logs`) będą typu `UUID`.
7.  Do tabeli `questions` zostanie dodana kolumna `updated_at`, która będzie automatycznie aktualizowana przy każdej modyfikacji wiersza za pomocą triggera.
8.  Relacja klucza obcego z `questions.user_id` do `auth.users.id` będzie miała zdefiniowaną politykę `ON DELETE CASCADE`.
9.  Kolumna `answer` w tabeli `questions` będzie dopuszczać wartości `NULL`.
10. Zostanie utworzona nowa tabela `ai_generation_logs` do zapisywania akcji generowania pytań i logowania błędów.
11. Tabela `ai_generation_logs` będzie miała politykę `ON DELETE CASCADE` dla klucza obcego `user_id`.
12. Kolumny `prompt` i `response` w `ai_generation_logs` będą typu `VARCHAR(100000)`. Kolumna `prompt` nie może być `NULL`.
13. Stan zadania generowania będzie zarządzany przez kolumny `status` (ENUM `'success'`, `'error'`) i `finished_at` (TIMESTAMPTZ), obie dopuszczające `NULL`.
14. Zostanie wprowadzone powiązanie między tabelą `questions` a `ai_generation_logs` poprzez dodanie kolumny `generation_log_id` (UUID, nullable) w tabeli `questions`.
15. Klucz obcy `generation_log_id` będzie miał politykę `ON DELETE SET NULL`.
16. Dla tabeli `ai_generation_logs` zostaną włączone zasady RLS, pozwalające użytkownikom tylko na odczyt własnych logów.
17. Na obecnym etapie nie będzie wprowadzana polityka retencji danych dla logów.
18. Nie zostanie dodany indeks na kolumnie `generation_log_id` w tabeli `questions` w wersji MVP.
    </decisions>

<matched_recommendations>
1.  Utworzenie dedykowanej tabeli `ai_generation_logs` do śledzenia prób generowania pytań przez AI i logowania błędów.
2.  Zdefiniowanie kolumn `prompt` i `response` jako `VARCHAR(100000)` oraz `finished_at` jako `TIMESTAMPTZ` w tabeli `ai_generation_logs`.
3.  Zdefiniowanie kolumny `prompt` jako `NOT NULL` w celu zapewnienia kompletności logów.
4.  Zarządzanie stanem zadania generowania poprzez kombinację `status` (ENUM `'success'`, `'error'`) i `finished_at` (TIMESTAMPTZ).
5.  Włączenie i skonfigurowanie polityk RLS dla tabeli `ai_generation_logs`, aby zabezpieczyć dane użytkowników.
6.  Zastosowanie polityki `ON DELETE CASCADE` dla klucza obcego `user_id` w tabeli `ai_generation_logs` w celu utrzymania integralności danych.
7.  Wprowadzenie relacji między `questions` a `ai_generation_logs` poprzez dodanie nullable kolumny `generation_log_id` w tabeli `questions`.
8.  Zastosowanie polityki `ON DELETE SET NULL` dla klucza obcego `generation_log_id` w celu zachowania pytań nawet po usunięciu logów.
9.  Użycie `UUID` jako kluczy głównych oraz odpowiednich indeksów w celu optymalizacji i skalowalności.
10. Zastosowanie polityk RLS dla tabeli `questions` w celu zapewnienia, że użytkownicy mają dostęp tylko do swoich danych.
11. Zezwolenie na wartości `NULL` w kolumnie `answer` zgodnie z wymaganiami funkcjonalnymi.
12. Potwierdzenie rezygnacji z dodawania indeksu na kolumnie `generation_log_id` dla wersji MVP.
    </matched_recommendations>

<database_planning_summary>
Na podstawie przeprowadzonej dyskusji zaplanowano schemat bazy danych PostgreSQL dla aplikacji InterviewPrep AI w wersji MVP, wykorzystując Supabase jako backend.

**Główne wymagania dotyczące schematu:**
Schemat będzie wspierał podstawowe funkcjonalności CRUD dla pytań i odpowiedzi, system uwierzytelniania użytkowników oraz logowanie akcji generowania pytań przez AI z możliwością powiązania wygenerowanego pytania z konkretnym logiem. Baza danych musi zapewniać izolację danych pomiędzy użytkownikami oraz być zoptymalizowana pod kątem kluczowych operacji.

**Kluczowe encje i ich relacje:**
-   **`auth.users`**: Tabela dostarczana przez Supabase, przechowująca dane uwierzytelniające użytkowników. Służy jako główna tabela użytkowników.
-   **`questions`**: Główna tabela aplikacji przechowująca pytania i odpowiedzi.
    -   `id` (UUID, Klucz główny)
    -   `user_id` (UUID, Klucz obcy do `auth.users.id` z `ON DELETE CASCADE`)
    -   `generation_log_id` (UUID, Klucz obcy do `ai_generation_logs.id` z `ON DELETE SET NULL`, Nullable)
    -   `question` (VARCHAR(10000), Not Null)
    -   `answer` (VARCHAR(10000), Nullable)
    -   `source` (ENUM `question_source` z wartościami `'user'`, `'ai'`, `'ai-edited'`)
    -   `created_at` (TIMESTAMPTZ, domyślnie `now()`)
    -   `updated_at` (TIMESTAMPTZ)
-   **`ai_generation_logs`**: Tabela do logowania operacji generowania pytań przez AI.
    -   `id` (UUID, Klucz główny)
    -   `user_id` (UUID, Klucz obcy do `auth.users.id` z `ON DELETE CASCADE`)
    -   `created_at` (TIMESTAMPTZ, domyślnie `now()`)
    -   `finished_at` (TIMESTAMPTZ, Nullable)
    -   `status` (ENUM `generation_status` (`'success'`, `'error'`), Nullable)
    -   `prompt` (VARCHAR(100000), Not Null)
    -   `response` (VARCHAR(100000), Nullable)
    -   `error_details` (TEXT, Nullable)

Relacje między tabelami to:
-   `auth.users` -> `questions` (jeden-do-wielu)
-   `auth.users` -> `ai_generation_logs` (jeden-do-wielu)
-   `ai_generation_logs` -> `questions` (jeden-do-wielu, opcjonalna)

**Kwestie bezpieczeństwa i skalowalności:**
-   **Bezpieczeństwo**: Dostęp do danych w tabelach `questions` i `ai_generation_logs` będzie chroniony przez polityki RLS, zapewniając, że użytkownicy mają dostęp wyłącznie do swoich zasobów. Użycie `UUID` jako kluczy głównych zapobiega próbom odgadywania identyfikatorów.
-   **Skalowalność**: Zastosowanie odpowiednich indeksów (na `user_id`, `created_at` oraz trigramowego na `question`) zapewni wysoką wydajność zapytań. Świadomie zrezygnowano z indeksu na `generation_log_id` dla MVP, akceptując potencjalnie niższą wydajność zapytań filtrujących po tym kluczu. Użycie typu `VARCHAR` z limitem dla pól tekstowych (`prompt`, `response`) stanowi zabezpieczenie przed nadmiernym zużyciem miejsca na dysku. Brak polityki retencji danych dla logów jest akceptowalny dla MVP, ale może wymagać wdrożenia w przyszłości.

Wszystkie kluczowe aspekty niezbędne do stworzenia początkowego skryptu migracji bazy danych zostały omówione i uzgodnione.
</database_planning_summary>

<unresolved_issues>
Brak nierozwiązanych kwestii. Wszystkie punkty zostały wyjaśnione i uzgodnione. Następnym krokiem jest wygenerowanie kompletnego skryptu SQL.
</unresolved_issues>
</conversation_summary>