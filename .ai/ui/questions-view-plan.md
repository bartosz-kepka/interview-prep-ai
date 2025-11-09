# Plan implementacji widoku: Moje Pytania

## 1. Przegląd

Widok "Moje Pytania" jest głównym interfejsem dla zalogowanego użytkownika, służącym do zarządzania jego kolekcją pytań rekrutacyjnych. Umożliwia on wyświetlanie, dodawanie, edytowanie, usuwanie oraz wyszukiwanie pytań. Widok został zaprojektowany z myślą o zapewnieniu płynnego i intuicyjnego doświadczenia, z uwzględnieniem obsługi stanu ładowania, pustego stanu (dla nowych użytkowników) oraz paginacji.

## 2. Routing widoku

- **Ścieżka Astro:** `/questions`
- **Dostępność:** Widok dostępny tylko dla uwierzytelnionych użytkowników.
- **Przekierowanie:** Gówna ścieżka aplikacji (`/`) będzie przekierowywać do `/questions`.

## 3. Struktura komponentów

Hierarchia komponentów React będzie zorganizowana w celu zapewnienia reużywalności i separacji odpowiedzialności.

```
- QuestionsPage.astro         // Plik Astro renderujący komponent React
  - QuestionsView.tsx         // Główny komponent kontenerowy
    - SearchBar.tsx           // Komponent z polem wyszukiwania i przyciskiem "Dodaj pytanie"
    - QuestionsList.tsx       // Komponent renderujący listę pytań lub stany alternatywne
      - QuestionItem.tsx      // Komponent pojedynczego pytania na liście (z obsługą zwijania odpowiedzi)
      - QuestionsListSkeleton.tsx // Komponent szkieletu ładowania
      - EmptyState.tsx        // Komponent dla stanu, gdy użytkownik nie ma pytań
    - Button ("Wczytaj więcej") // Przycisk do paginacji
    - AddEditQuestionModal.tsx  // Modal do dodawania/edycji pytania
    - DeleteConfirmationDialog.tsx // Modal do potwierdzenia usunięcia pytania
```

## 4. Szczegóły komponentów

### `QuestionsView.tsx`

- **Opis komponentu:** Komponent-kontener orkiestrujący stan i logikę całego widoku. Wykorzystuje customowy hook `useQuestions` do zarządzania danymi i interakcjami z API. Renderuje komponenty podrzędne w zależności od aktualnego stanu (ładowanie, błąd, dane).
- **Główne elementy:** `SearchBar`, `QuestionsList`, `AddEditQuestionModal`, `DeleteConfirmationDialog`.
- **Obsługiwane interakcje:** Inicjuje otwarcie modali dodawania, edycji i usuwania pytań.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `QuestionListItemDto`.
- **Propsy:** Brak.

### `SearchBar.tsx`

- **Opis komponentu:** Pasek narzędzi zawierający pole do wyszukiwania pytań oraz przycisk do inicjowania procesu dodawania nowego pytania.
- **Główne elementy:** `Input` (z `shadcn/ui`), `Button` (z `shadcn/ui`).
- **Obsługiwane interakcje:** Wprowadzanie tekstu w polu wyszukiwania, kliknięcie przycisku "Dodaj pytanie".
- **Obsługiwana walidacja:** Brak.
- **Typy:** Brak.
- **Propsy:**
  - `searchTerm: string`
  - `onSearchChange: (term: string) => void`
  - `onAddQuestion: () => void`
  - `isSearchDisabled: boolean`

### `QuestionsList.tsx`

- **Opis komponentu:** Odpowiada za renderowanie listy pytań. Warunkowo wyświetla stan ładowania (`QuestionsListSkeleton`), pusty stan (`EmptyState`), lub listę komponentów `QuestionItem`.
- **Główne elementy:** `QuestionsListSkeleton`, `EmptyState`, `QuestionItem`.
- **Obsługiwane interakcje:** Przekazuje zdarzenia edycji i usunięcia od `QuestionItem` do `QuestionsView`.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `QuestionListItemDto[]`.
- **Propsy:**
  - `questions: QuestionListItemDto[]`
  - `isLoading: boolean`
  - `onEdit: (question: QuestionListItemDto) => void`
  - `onDelete: (question: QuestionListItemDto) => void`

### `QuestionItem.tsx`

- **Opis komponentu:** Wyświetla pojedyncze pytanie i odpowiedź. Używa komponentu `Collapsible` z `shadcn/ui` do ukrywania/pokazywania odpowiedzi. Zawiera przyciski akcji "Edytuj" i "Usuń".
- **Główne elementy:** `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent`, `Button` (z `shadcn/ui`).
- **Obsługiwane interakcje:** Rozwijanie/zwijanie odpowiedzi, kliknięcie przycisków "Edytuj" i "Usuń".
- **Obsługiwana walidacja:** Brak.
- **Typy:** `QuestionListItemDto`.
- **Propsy:**
  - `question: QuestionListItemDto`
  - `onEdit: (question: QuestionListItemDto) => void`
  - `onDelete: (question: QuestionListItemDto) => void`

### `AddEditQuestionModal.tsx`

- **Opis komponentu:** Modal oparty na `Dialog` z `shadcn/ui`, zawierający formularz do dodawania lub edycji pytania. Do zarządzania stanem formularza i walidacji wykorzystuje biblioteki `react-hook-form` oraz `zod`.
- **Główne elementy:** `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`, `Input`, `Textarea`, `Button`.
- **Obsługiwane interakcje:** Wprowadzanie danych w polach formularza, zatwierdzenie formularza.
- **Obsługiwana walidacja:**
  - `question`: Wymagane, nie może być puste, maksymalnie 10 000 znaków.
  - `answer`: Opcjonalne, maksymalnie 10 000 znaków.
- **Typy:** `CreateQuestionCommand`, `UpdateQuestionCommand`, `QuestionListItemDto`.
- **Propsy:**
  - `isOpen: boolean`
  - `onOpenChange: (isOpen: boolean) => void`
  - `onSubmit: (data: CreateQuestionCommand | UpdateQuestionCommand) => void`
  - `initialData?: QuestionListItemDto` (do wypełnienia formularza w trybie edycji)
  - `isSubmitting: boolean`

### `DeleteConfirmationDialog.tsx`

- **Opis komponentu:** Modal oparty na `AlertDialog` z `shadcn/ui`, proszący użytkownika o potwierdzenie operacji usunięcia pytania.
- **Główne elementy:** `AlertDialog`, `AlertDialogAction`, `AlertDialogCancel`, `AlertDialogContent`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogHeader`, `AlertDialogTitle`.
- **Obsługiwane interakcje:** Potwierdzenie lub anulowanie usunięcia.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `QuestionListItemDto`.
- **Propsy:**
  - `isOpen: boolean`
  - `onOpenChange: (isOpen: boolean) => void`
  - `onConfirm: () => void`
  - `question: QuestionListItemDto | null`
  - `isSubmitting: boolean`

## 5. Typy

Większość wymaganych typów (DTO) jest już zdefiniowana w `src/types.ts`. Nie ma potrzeby tworzenia nowych, złożonych typów ViewModel.

- **`QuestionListItemDto`**: Używany do wyświetlania pytań na liście.
- **`PaginatedQuestionsResponseDto`**: Oczekiwany typ odpowiedzi z API dla listy pytań.
- **`CreateQuestionCommand`**: Typ danych przesyłanych do API podczas tworzenia pytania.
- **`UpdateQuestionCommand`**: Typ danych przesyłanych do API podczas aktualizacji pytania.
- **`ModalState`**: Typ pomocniczy do zarządzania stanem modali w `QuestionsView`.
  ```typescript
  type ModalState =
    | { type: "none" }
    | { type: "add" }
    | { type: "edit"; question: QuestionListItemDto }
    | { type: "delete"; question: QuestionListItemDto };
  ```

## 6. Zarządzanie stanem

Logika i stan widoku zostaną wyekstrahowane do customowego hooka `useQuestions`. Takie podejście oddziela logikę biznesową od prezentacji, co czyni komponent `QuestionsView` znacznie czystszym.

### Hook `useQuestions`

- **Odpowiedzialność:**
  - Przechowywanie stanu: lista pytań, informacje o paginacji, stan ładowania, błędy, termin wyszukiwania.
  - Enkapsulacja logiki pobierania, dodawania, aktualizowania i usuwania pytań.
  - Implementacja debouncingu dla funkcji wyszukiwania.
- **Zarządzany stan:**
  - `questions: QuestionListItemDto[]`
  - `pagination: PaginationDto | null`
  - `isLoading: boolean`
  - `error: Error | null`
  - `searchTerm: string`
- **Zwracane wartości i funkcje:**
  - `questions`, `isLoading`, `error`, `hasMore` (wyprowadzone z `pagination`).
  - `setSearchTerm(term: string)`: Debounced funkcja do aktualizacji wyszukiwanej frazy.
  - `loadMore()`: Funkcja do pobierania kolejnej strony wyników.
  - `addQuestion(data: CreateQuestionCommand)`
  - `updateQuestion(id: string, data: UpdateQuestionCommand)`
  - `deleteQuestion(id: string)`

## 7. Integracja API

Integracja będzie opierać się na wywołaniach do endpointów API zdefiniowanych w `src/pages/api/questions`. Wszystkie wywołania będą wykonywane z poziomu hooka `useQuestions`.

- **Pobieranie listy pytań:**
  - **Endpoint:** `GET /api/questions`
  - **Parametry:** `page`, `page_size`, `sort_by`, `sort_order`, `search`.
  - **Typ odpowiedzi:** `PaginatedQuestionsResponseDto`
- **Tworzenie pytania:**
  - **Endpoint:** `POST /api/questions`
  - **Typ żądania:** `CreateQuestionCommand`
  - **Typ odpowiedzi:** `CreateQuestionResponseDto`
- **Aktualizacja pytania:**
  - **Endpoint:** `PATCH /api/questions/{id}`
  - **Typ żądania:** `UpdateQuestionCommand`
  - **Typ odpowiedzi:** `UpdateQuestionResponseDto`
- **Usuwanie pytania:**
  - **Endpoint:** `DELETE /api/questions/{id}`
  - **Odpowiedź:** `204 No Content`

## 8. Interakcje użytkownika

- **Wpisywanie w polu wyszukiwania:** Po zakończeniu wpisywania (debouncing), wywoływane jest API w celu odfiltrowania listy pytań.
- **Kliknięcie "Dodaj pytanie":** Otwiera `AddEditQuestionModal` w trybie dodawania.
- **Zatwierdzenie formularza Dodaj/Edytuj:** Wywołuje odpowiedni endpoint API. Po sukcesie modal jest zamykany, wyświetlany jest `Toast` z potwierdzeniem, a lista pytań jest odświeżana.
- **Kliknięcie "Edytuj" przy pytaniu:** Otwiera `AddEditQuestionModal` w trybie edycji z wczytanymi danymi pytania.
- **Kliknięcie "Usuń" przy pytaniu:** Otwiera `DeleteConfirmationDialog`.
- **Potwierdzenie usunięcia:** Wywołuje endpoint `DELETE`. Po sukcesie pytanie jest usuwane z listy (optymistycznie), a użytkownik otrzymuje powiadomienie `Toast`.
- **Kliknięcie "Wczytaj więcej":** Pobiera kolejną stronę wyników i dołącza ją do istniejącej listy.

## 9. Warunki i walidacja

- **Formularz Dodaj/Edytuj (`AddEditQuestionModal`):**
  - Walidacja po stronie klienta będzie realizowana przy użyciu `zod` i `react-hook-form`.
  - Pole `question` jest wymagane i nie może być puste.
  - Pola `question` i `answer` mają ograniczenie do 10 000 znaków.
  - Przycisk "Zapisz" jest nieaktywny, dopóki formularz nie przejdzie walidacji.
  - Komunikaty o błędach walidacji są wyświetlane bezpośrednio pod odpowiednimi polami formularza.

## 10. Obsługa błędów

- **Błąd pobierania danych:** Jeśli początkowe pobieranie pytań się nie powiedzie, w miejscu listy zostanie wyświetlony komunikat o błędzie z przyciskiem "Spróbuj ponownie".
- **Błędy CUD (Create, Update, Delete):** W przypadku niepowodzenia operacji zapisu, aktualizacji lub usunięcia, odpowiedni modal pozostanie otwarty (lub w przypadku optymistycznego UI stan zostanie przywrócony), a użytkownik zobaczy `Toast` z informacją o błędzie.
- **Brak autoryzacji (401):** Globalny mechanizm obsługi zapytań API powinien przechwycić błąd 401 i przekierować użytkownika na stronę logowania (`/login`) z komunikatem o wygaśnięciu sesji.
- **Zasób nie znaleziony (404):** W przypadku próby edycji/usunięcia pytania, które już nie istnieje, użytkownik zobaczy `Toast` z informacją, a pytanie zostanie usunięte z lokalnej listy.

## 11. Kroki implementacji

1.  **Struktura plików:** Utworzenie nowych plików i folderów dla komponentów widoku w `src/components/questions/` (np. `QuestionsView.tsx`, `SearchBar.tsx` etc.).
2.  **Strona Astro i routing:** Stworzenie pliku `src/pages/questions.astro` renderującego `QuestionsView` oraz pliku `src/pages/index.astro` w celu przekierowania na `/questions`.
3.  **Custom Hook `useQuestions`:** Zaimplementowanie hooka z podstawową logiką pobierania danych i zarządzania stanem (`questions`, `isLoading`).
4.  **Komponenty szkieletowe:** Stworzenie statycznych wersji komponentów `QuestionsView`, `QuestionsList`, `QuestionItem` oraz `SearchBar`, aby zbudować strukturę wizualną.
5.  **Podłączenie danych:** Połączenie `QuestionsView` z hookiem `useQuestions` i przekazanie danych do `QuestionsList` w celu renderowania dynamicznej listy.
6.  **Implementacja stanu ładowania i pustego:** Dodanie do `QuestionsList` logiki warunkowego renderowania `QuestionsListSkeleton` i `EmptyState`.
7.  **Paginacja:** Zaimplementowanie logiki "Wczytaj więcej" w hooku `useQuestions` i dodanie przycisku w `QuestionsView`.
8.  **Wyszukiwanie:** Dodanie stanu `searchTerm` i funkcji `setSearchTerm` (z debouncingiem) do hooka oraz podłączenie jej do komponentu `SearchBar`.
9.  **Modal dodawania/edycji:** Stworzenie komponentu `AddEditQuestionModal` z formularzem opartym na `react-hook-form` i walidacją `zod`.
10. **Logika CUD:** Zaimplementowanie funkcji `addQuestion`, `updateQuestion` i `deleteQuestion` w hooku `useQuestions` oraz podłączenie ich do odpowiednich komponentów (`AddEditQuestionModal`, `DeleteConfirmationDialog`).
11. **Obsługa błędów i Toastów:** Zintegrowanie powiadomień `Toast` dla wszystkich operacji CUD oraz obsługa stanów błędów.
12. **Stylowanie i testowanie:** Dopracowanie stylów (Tailwind), zapewnienie responsywności i napisanie testów (np. e2e z Playwright) dla kluczowych interakcji użytkownika.
