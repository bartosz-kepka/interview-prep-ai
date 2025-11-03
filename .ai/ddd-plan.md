# Plan Refaktoryzacji Aplikacji InterviewPrep AI w Oparciu o Domain-Driven Design (DDD)

Data: 03.11.2025
Autor: GitHub Copilot

## 1. Wprowadzenie i Cele

Ten dokument opisuje strategię refaktoryzacji aplikacji `interview-prep-ai` w celu wdrożenia zasad Domain-Driven Design. Celem jest poprawa struktury projektu, zwiększenie jego utrzymywalności, skalowalności i ułatwienie dalszego rozwoju poprzez organizację kodu wokół logiki biznesowej, a nie warstw technicznych.

**Główne cele:**
- **Izolacja Domen Biznesowych**: Wyraźne oddzielenie od siebie różnych części systemu, aby zmniejszyć złożoność.
- **Poprawa Czytelności**: Struktura kodu powinna odzwierciedlać procesy biznesowe opisane w PRD.
- **Zwiększenie Testowalności**: Ułatwienie pisania testów jednostkowych i integracyjnych dla logiki biznesowej.
- **Przygotowanie na Skalowanie**: Stworzenie fundamentów pod ewentualne wydzielenie domen do osobnych mikroserwisów w przyszłości.

## 2. Identyfikacja Domen (Bounded Contexts)

Na podstawie analizy dokumentu `prd.md`, zidentyfikowano trzy główne domeny (Ograniczone Konteksty):

1.  **`Identity & Access` (Tożsamość i Dostęp)**
    - **Opis**: Kontekst odpowiedzialny za wszystko, co związane z użytkownikiem: rejestracja, logowanie, weryfikacja e-mail, reset hasła, zarządzanie sesją.
    - **Odpowiedzialność**: Uwierzytelnianie i dostarczanie tożsamości użytkownika do innych części systemu.
    - **Artefakty w kodzie**: `LoginForm`, `SignUpForm`, `LogoutButton`, endpointy `/api/auth/*`.

2.  **`Interview` (Rozmowa Kwalifikacyjna) - Core Domain**
    - **Opis**: To jest **domena główna** aplikacji. Obejmuje ręczne zarządzanie pytaniami i odpowiedziami (CRUD), ich przeglądanie i wyszukiwanie.
    - **Odpowiedzialność**: Reprezentuje kluczową wartość biznesową produktu – pomoc w przygotowaniu do rozmowy.
    - **Artefakty w kodzie**: Lista pytań, formularze dodawania/edycji, logika wyszukiwania.

3.  **`AI Generator` (Generator AI) - Supporting Domain**
    - **Opis**: Kontekst wspierający, odpowiedzialny za generowanie pytań na podstawie opisu stanowiska.
    - **Odpowiedzialność**: Komunikacja z zewnętrznymi serwisami AI (OpenRouter) i dostarczanie kandydatów na pytania do domeny `Interview`.
    - **Artefakty w kodzie**: `GeneratorInputForm`, `GeneratedQuestionsList`, `generation.service.ts`.

## 3. Proponowana Struktura Projektu

Aby odzwierciedlić podział na domeny, katalog `src` zostanie zreorganizowany. Pliki w `src/pages` pozostaną na swoich miejscach, aby zapewnić kompatybilność z routingiem Astro, ale będą pełnić rolę "chudych" punktów wejścia do logiki domenowej.

```plaintext
src/
├── domains/
│   ├── ai-generator/
│   │   ├── components/          # Komponenty React (np. GeneratorInputForm.tsx)
│   │   ├── services/            # Logika biznesowa (np. generation.service.ts)
│   │   ├── repositories/        # Dostęp do zewnętrznych API (np. openrouter.repository.ts)
│   │   └── types.ts             # Typy i schematy Zod dla tej domeny
│   │
│   ├── identity/
│   │   ├── components/          # LoginForm.tsx, SignUpForm.tsx
│   │   ├── services/            # auth.service.ts (obsługa logiki Supabase Auth)
│   │   └── types.ts             # Typy i schematy Zod
│   │
│   └── interview/
│       ├── components/          # QuestionList.tsx, QuestionItem.tsx
│       ├── services/            # question.service.ts (logika aplikacji)
│       ├── repositories/        # question.repository.ts (dostęp do bazy danych)
│       └── types.ts             # Model domeny (Question, Answer), schematy Zod
│
├── components/                  # Prawdziwie współdzielone, generyczne komponenty (np. Header.astro)
│   └── ui/                      # Komponenty Shadcn/ui (bez zmian)
│
├── pages/                       # Strony Astro (punkty wejścia, "chude" kontrolery)
│   ├── generator.astro          # Renderuje komponenty z `domains/ai-generator`
│   ├── index.astro              # Renderuje komponenty z `domains/interview`
│   ├── login.astro, signup.astro, etc.
│   └── api/
│       ├── auth/                # Endpointy dla domeny `identity` (delegujące do serwisów)
│       │   ├── login.ts
│       │   └── signup.ts
│       └── interview/           # Endpointy dla domeny `interview`
│           └── questions.ts
│
├── layouts/                     # (bez zmian)
├── middleware/                  # (bez zmian)
├── db/                          # (bez zmian)
└── lib/                         # (bez zmian, dla naprawdę globalnych helperów jak `cn`)
```

## 4. Plan Refaktoryzacji Krok po Kroku

### Krok 1: Stworzenie nowej struktury folderów

1.  Utwórz katalog `src/domains`.
2.  Wewnątrz `src/domains` utwórz foldery dla każdej domeny: `ai-generator`, `identity`, `interview`.
3.  Wewnątrz każdego folderu domeny utwórz podfoldery: `components`, `services`, `repositories` (jeśli dotyczy) i plik `types.ts`.

### Krok 2: Refaktoryzacja Domeny `Identity & Access`

1.  **Przenieś komponenty**: Przenieś wszystkie komponenty z `src/components/auth` do `src/domains/identity/components/`.
2.  **Przenieś typy**: Przenieś powiązane typy i schematy Zod do `src/domains/identity/types.ts`.
3.  **Stwórz serwis aplikacyjny**: Utwórz `src/domains/identity/services/auth.service.ts`. Przenieś do niego logikę obsługi Supabase Auth (rejestracja, logowanie, reset hasła), która obecnie może być rozproszona w komponentach lub endpointach API.
4.  **Odchudź endpointy API**: Zrefaktoryzuj pliki w `src/pages/api/auth/` tak, aby jedynie walidowały dane wejściowe i wywoływały odpowiednie funkcje z `auth.service.ts`.
5.  **Zaktualizuj importy**: Popraw wszystkie ścieżki importu w przeniesionych plikach i plikach, które z nich korzystają.

### Krok 3: Refaktoryzacja Domeny `Interview` (Core Domain)

1.  **Przenieś komponenty**: Przenieś komponenty związane z listą pytań (np. `QuestionList.tsx`, `QuestionItem.tsx` - jeśli istnieją) do `src/domains/interview/components/`.
2.  **Zdefiniuj model domeny**: W `src/domains/interview/types.ts` zdefiniuj model (`Question` jako Agregat, `Answer` jako Obiekt Wartości) oraz DTOs i schematy Zod.
3.  **Stwórz Repozytorium**: Utwórz plik `src/domains/interview/repositories/question.repository.ts`. Zaimplementuj w nim interfejs `IQuestionRepository` z metodami `findById`, `findByUserId`, `add`, `update`, `delete`, hermetyzując w nich bezpośrednie wywołania klienta Supabase.
4.  **Stwórz serwis aplikacyjny**: Utwórz `src/domains/interview/services/question.service.ts`. Przenieś do niego logikę biznesową (np. tworzenie pytania, walidacja), która będzie korzystać z `question.repository.ts`.
5.  **Odchudź endpointy API**: Zrefaktoryzuj `src/pages/api/interview/questions.ts` (i inne), aby delegowały logikę do `question.service.ts`.
6.  **Zaktualizuj importy**: Popraw wszystkie ścieżki importu.

### Krok 4: Refaktoryzacja Domeny `AI Generator`

1.  **Przenieś komponenty**: Przenieś `GeneratorInputForm.tsx`, `GeneratedQuestionsList.tsx` z `src/components/ai` do `src/domains/ai-generator/components/`.
2.  **Przenieś serwisy**: Przenieś `generation.service.ts` i `openrouter.service.ts` do `src/domains/ai-generator/services/`.
3.  **Stwórz Repozytorium (opcjonalnie)**: Rozważ opakowanie `openrouter.service.ts` w repozytorium (`src/domains/ai-generator/repositories/ai.repository.ts`), aby oddzielić logikę orkiestracji od samego klienta HTTP.
4.  **Odchudź endpoint API**: Zrefaktoryzuj endpoint `/api/ai/generate` (jeśli istnieje), aby delegował zadanie do serwisu `generation.service.ts`.
5.  **Zaktualizuj importy**: Popraw wszystkie ścieżki importu.

### Krok 5: Oczyszczenie i Weryfikacja

1.  **Przejrzyj `src/lib` i `src/components`**: Upewnij się, że pozostały tam tylko prawdziwie globalne, reużywalne moduły (np. `utils.ts` z funkcją `cn`) i komponenty (np. `Header.astro`, `Footer.astro`).
2.  **Uruchom testy**: Uruchom istniejące testy (jednostkowe i E2E), aby zweryfikować, czy refaktoryzacja nie wprowadziła regresji.
3.  **Zaktualizuj testy**: Dostosuj testy do nowej struktury, zwłaszcza mockowanie zależności (repozytoriów zamiast klienta Supabase).
4.  **Dokumentacja**: Zaktualizuj `copilot-instructions.md`, aby odzwierciedlał nową strukturę projektu.

Postępując zgodnie z tym planem, aplikacja zyska solidną, skalowalną architekturę, która będzie łatwiejsza w utrzymaniu i dalszym rozwoju.

