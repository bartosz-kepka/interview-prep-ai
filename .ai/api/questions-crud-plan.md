# API Endpoint Implementation Plan: Questions CRUD

## 1. Przegląd punktu końcowego

Ten dokument opisuje plan wdrożenia punktów końcowych interfejsu API REST do zarządzania zasobem `questions`. Punkty końcowe te umożliwiają uwierzytelnionym użytkownikom wykonywanie operacji tworzenia, odczytu, aktualizacji i usuwania (CRUD) na swoich pytaniach. Interfejs API obejmuje również funkcje paginacji, sortowania i wyszukiwania tekstowego.

## 2. Szczegóły żądania i odpowiedzi

Zostaną zaimplementowane dwa główne pliki tras Astro:

- `src/pages/api/questions/index.ts` dla operacji na kolekcji (`GET`, `POST`).
- `src/pages/api/questions/[id].ts` dla operacji na pojedynczym zasobie (`GET`, `PATCH`, `DELETE`).

### A. List Questions

- **Metoda HTTP**: `GET`
- **Struktura URL**: `/api/questions`
- **Parametry (Query)**:
  - `page` (opcjonalny, number, domyślnie: 1)
  - `page_size` (opcjonalny, number, domyślnie: 10)
  - `sort_by` (opcjonalny, string, domyślnie: 'created_at')
  - `sort_order` (opcjonalny, string, 'asc' | 'desc', domyślnie: 'desc')
  - `search` (opcjonalny, string)
- **Odpowiedź sukcesu (200 OK)**:
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "question": "What is your greatest strength?",
        "answer": "My ability to learn quickly.",
        "source": "user",
        "created_at": "iso-8601-timestamp"
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 10,
      "total_items": 100,
      "total_pages": 10
    }
  }
  ```

### B. Create a Question

- **Metoda HTTP**: `POST`
- **Struktura URL**: `/api/questions`
- **Request Body**:
  ```json
  {
    "question": "What is your greatest weakness?",
    "answer": "Public speaking."
  }
  ```
- **Odpowiedź sukcesu (201 Created)**:
  ```json
  {
    "id": "uuid",
    "question": "What is your greatest weakness?",
    "answer": "Public speaking.",
    "source": "user",
    "created_at": "iso-8601-timestamp"
  }
  ```

### C. Get a Single Question

- **Metoda HTTP**: `GET`
- **Struktura URL**: `/api/questions/{question_id}`
- **Odpowiedź sukcesu (200 OK)**:
  ```json
  {
    "id": "uuid",
    "question": "What is your greatest strength?",
    "answer": "My ability to learn quickly.",
    "source": "user",
    "created_at": "iso-8601-timestamp",
    "updated_at": "iso-8601-timestamp"
  }
  ```

### D. Update a Question

- **Metoda HTTP**: `PATCH`
- **Struktura URL**: `/api/questions/{question_id}`
- **Request Body**:
  ```json
  {
    "question": "What is your most significant achievement?",
    "answer": "Leading a successful project under a tight deadline."
  }
  ```
- **Odpowiedź sukcesu (200 OK)**:
  ```json
  {
    "id": "uuid",
    "question": "What is your most significant achievement?",
    "answer": "Leading a successful project under a tight deadline.",
    "source": "user",
    "created_at": "iso-8601-timestamp",
    "updated_at": "iso-8601-timestamp"
  }
  ```

### E. Delete a Question

- **Metoda HTTP**: `DELETE`
- **Struktura URL**: `/api/questions/{question_id}`
- **Odpowiedź sukcesu**: `204 No Content`

## 3. Wykorzystywane typy

- **`QuestionEntity`**: Istniejący typ w `src/types.ts` będzie używany jako główny model danych.
- **`CreateQuestionCommand`**: Nowy typ/interfejs dla danych wejściowych do tworzenia pytania.
  ```typescript
  export interface CreateQuestionCommand {
    question: string;
    answer?: string;
  }
  ```
- **`UpdateQuestionCommand`**: Nowy typ/interfejs dla danych wejściowych do aktualizacji pytania.
  ```typescript
  export interface UpdateQuestionCommand {
    question?: string;
    answer?: string;
  }
  ```
- **`ListQuestionsQuery`**: Nowy typ/interfejs dla parametrów zapytania listy pytań.
  ```typescript
  export interface ListQuestionsQuery {
    page: number;
    pageSize: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
    search?: string;
  }
  ```

## 4. Przepływ danych

1.  Żądanie HTTP trafia do odpowiedniej trasy API Astro (`/api/questions` lub `/api/questions/[id].ts`).
2.  Middleware Astro (`src/middleware/index.ts`) weryfikuje sesję użytkownika. Jeśli sesja jest nieprawidłowa, zwraca `401 Unauthorized`.
3.  Handler API (`GET`, `POST`, itp.) odczytuje dane z żądania (ciało, parametry query, parametry ścieżki).
4.  Dane wejściowe są walidowane przy użyciu odpowiedniej schemy Zod. W przypadku błędu walidacji, zwracany jest błąd `400 Bad Request` z listą błędów.
5.  Handler wywołuje odpowiednią funkcję z `QuestionsService` (`src/lib/services/questions.service.ts`), przekazując ID użytkownika z `context.locals.user.id` oraz zwalidowane dane.
6.  Funkcja serwisowa buduje i wykonuje zapytanie do bazy danych Supabase, zawsze filtrując wyniki po `user_id`.
7.  `QuestionsService` zwraca dane (lub `null`/`undefined` w przypadku braku zasobu) do handlera API.
8.  Handler API formatuje odpowiedź i zwraca ją do klienta z odpowiednim kodem statusu HTTP.

## 5. Względy bezpieczeństwa

- **Uwierzytelnianie**: Dostęp do wszystkich punktów końcowych musi być chroniony. Middleware Astro zweryfikuje, czy użytkownik jest zalogowany, sprawdzając sesję w `Astro.cookies`.
- **Autoryzacja**: Każde zapytanie do bazy danych (SELECT, INSERT, UPDATE, DELETE) musi zawierać warunek `WHERE user_id = :userId`, gdzie `userId` pochodzi z zaufanego źródła (sesji serwera). Zapobiega to dostępowi do danych innych użytkowników.
- **Walidacja danych wejściowych**: Wszystkie dane przychodzące od klienta (ciało żądania, parametry URL) muszą być rygorystycznie walidowane przy użyciu Zod, aby zapobiec nieprawidłowym danym i potencjalnym atakom.

## 6. Obsługa błędów

- **`400 Bad Request`**: Zwracany, gdy walidacja danych wejściowych (query params, body) przy użyciu Zod nie powiodła się. Odpowiedź powinna zawierać szczegóły błędu.
- **`401 Unauthorized`**: Zwracany przez middleware, gdy użytkownik nie jest uwierzytelniony.
- **`404 Not Found`**: Zwracany, gdy żądany zasób (`question`) nie istnieje lub nie należy do danego użytkownika. Jest to kluczowe, aby nie ujawniać istnienia zasobów należących do innych.
- **`500 Internal Server Error`**: Zwracany w przypadku nieoczekiwanych błędów po stronie serwera, np. problemów z połączeniem z bazą danych. Błędy te powinny być logowane na serwerze za pomocą `console.error`.

## 7. Rozważania dotyczące wydajności

- **Paginacja**: Implementacja paginacji po stronie serwera jest kluczowa dla wydajności przy dużej liczbie pytań. Należy użyć `range()` z klienta Supabase.
- **Indeksy bazy danych**: Należy upewnić się, że kolumna `user_id` w tabeli `questions` jest zindeksowana, aby przyspieszyć filtrowanie.
- **Wyszukiwanie pełnotekstowe**: Zgodnie ze specyfikacją, wyszukiwanie powinno wykorzystywać indeks `pg_trgm` na kolumnie `question` w celu zapewnienia wydajnego wyszukiwania podobieństwa tekstu.

## 8. Etapy wdrożenia

1.  **Definicja schematów Zod**:
    - Utworzyć plik `src/lib/questions/validation.ts`.
    - Zdefiniować schemy Zod dla:
      - parametrów zapytania listy pytań (`ListQuestionsQuerySchema`).
      - tworzenia pytania (`CreateQuestionCommandSchema`).
      - aktualizacji pytania (`UpdateQuestionCommandSchema`).
      - parametru `id` (jako `z.string().uuid()`).

2.  **Aktualizacja typów**:
    - W pliku `src/types.ts`, dodać (jeśli nie istnieją) typy `CreateQuestionCommand`, `UpdateQuestionCommand` i `ListQuestionsQuery` w oparciu o schemy Zod.

3.  **Implementacja `QuestionsService`**:
    - W pliku `src/lib/services/questions.service.ts` zaimplementować lub zaktualizować następujące funkcje:
      - `listQuestions(supabase, userId, query)`: Implementuje logikę pobierania, sortowania, wyszukiwania (`ilike` lub z użyciem `pg_trgm`) i paginacji.
      - `createQuestion(supabase, userId, command)`: Tworzy nowy rekord.
      - `getQuestionById(supabase, userId, id)`: Pobiera pojedynczy rekord.
      - `updateQuestion(supabase, userId, id, command)`: Aktualizuje rekord.
      - `deleteQuestion(supabase, userId, id)`: Usuwa rekord.
    - Każda funkcja musi przyjmować klienta `supabase` jako argument i filtrować zapytania po `userId`.

4.  **Implementacja tras API**:
    - Utworzyć plik `src/pages/api/questions/index.ts`.
      - Zaimplementować handler `GET` do listowania pytań, używając `ListQuestionsQuerySchema` i `questionsService.listQuestions`.
      - Zaimplementować handler `POST` do tworzenia pytań, używając `CreateQuestionCommandSchema` i `questionsService.createQuestion`.
    - Utworzyć plik `src/pages/api/questions/[id].ts`.
      - Zaimplementować handler `GET` do pobierania pojedynczego pytania.
      - Zaimplementować handler `PATCH` do aktualizacji pytania.
      - Zaimplementować handler `DELETE` do usuwania pytania.
    - We wszystkich handlerach używać `context.locals.supabase` i `context.locals.user`.
