<conversation_summary>

<decisions>

1. **Główny Zakres MVP:** Aplikacja będzie obejmować manualne zarządzanie pytaniami (CRUD), generowanie pytań przez AI na podstawie wklejonego ogłoszenia oraz prosty system kont użytkownika. Obie funkcjonalności (CRUD i AI) będą dostępne w pierwszym wydaniu.
2. **Poza Zakresem MVP:** Kategoryzacja pytań, ocena odpowiedzi przez AI, symulacje rozmów w czasie rzeczywistym oraz zaawansowane analityki i śledzenie postępów.
3. **Uwierzytelnianie:** Rejestracja i logowanie wyłącznie za pomocą adresu e-mail i hasła. Weryfikacja adresu e-mail jest obowiązkowa. Użytkownicy mogą resetować zapomniane hasło.
4. **Generowanie Pytań AI:**
   - Proces odbywa się na dedykowanym, osobnym widoku (nie w modalu).
   - Limit długości wklejanego ogłoszenia wynosi 10 000 znaków.
   - AI generuje jednorazowo 10-15 pytań, z naciskiem na jakość.
   - Użytkownik ma możliwość edycji treści pytań oraz dodania własnych odpowiedzi przed zapisaniem ich na liście.
   - Wygenerowane pytania są domyślnie zaznaczone do zapisu. Odznaczenie pytania blokuje możliwość jego edycji.
5. **Zarządzanie Danymi:** Treść wklejanych ogłoszeń o pracę nie jest przechowywana po wygenerowaniu pytań. Dane użytkownika są ograniczone do minimum (email, hasło).
6. **Wyszukiwanie:** W MVP zaimplementowane zostanie proste, działające w czasie rzeczywistym i niewrażliwe na wielkość liter wyszukiwanie, obejmujące **wyłącznie treść pytań**.
7. **Analityka i Mierzenie Sukcesu:** W aplikacji nie będzie wbudowanych narzędzi analitycznych. Kryteria sukcesu będą mierzone manualnie przez dewelopera za pomocą zapytań do bazy danych.
8. **Feedback dot. AI:** W aplikacji **nie będzie** żadnego mechanizmu do zbierania opinii (aktywnego ani pasywnego) na temat jakości wygenerowanych pytań. Jakość będzie oceniana na podstawie zewnętrznych wywiadów z użytkownikami.
9. **Interfejs Użytkownika (UI/UX):**
   - Aplikacja będzie responsywna (RWD) z podejściem "mobile-first".
   - Dodawanie i edycja pytań odbywa się w prostych polach tekstowych bez opcji formatowania.
   - Onboarding nowych użytkowników opiera się na "pustym stanie" (empty state) z wyraźnym wezwaniem do działania.
   - Nowo dodane pytania pojawiają się na górze listy głównej.

</decisions>

<matched_recommendations>

1.  **Zdefiniowanie persony:** Skupienie się na węższej grupie docelowej (np. branża IT) w celu lepszego dostosowania modelu AI i komunikacji.
2.  **Uproszczenie logowania:** Ograniczenie się do logowania przez e-mail i hasło w MVP w celu przyspieszenia wdrożenia.
3.  **Jakość ponad ilość:** Ustalenie, że AI ma generować 10-15 pytań, kładąc nacisk na ich trafność.
4.  **Jasne stany interfejsu:** Zaprojektowanie prostych komunikatów dla użytkownika (ładowanie, sukces, błąd) podczas generowania pytań.
5.  **Strategia pomiaru sukcesu:** Ustalenie ram czasowych (30 dni) i progu (1000 użytkowników) do pierwszej analizy metryk sukcesu.
6.  **Podejście "mobile-first":** Projektowanie interfejsu w pierwszej kolejności z myślą o urządzeniach mobilnych, co jest kluczowe dla grupy docelowej.
7.  **Brak limitów dla użytkownika:** Nieograniczanie liczby pytań, które użytkownik może przechowywać, aby zachęcić do aktywnego korzystania z aplikacji.
8.  **Zabezpieczenie kont:** Wprowadzenie obowiązkowej weryfikacji e-mail w celu ochrony przed spamem i zapewnienia wiarygodnego kanału komunikacji.
9.  **Onboarding przez "Empty State":** Wykorzystanie pustego widoku po rejestracji do wprowadzenia użytkownika w kluczową funkcjonalność aplikacji.
10. **Walidacja danych:** Zapewnienie, że użytkownik nie może zapisać pustego pytania, co dba o integralność danych.

</matched_recommendations>

<prd_planning_summary>

### Podsumowanie Planowania PRD dla InterviewPrep AI (MVP)

#### a. Główne wymagania funkcjonalne produktu

1.  **System Kont Użytkownika**
    - Rejestracja za pomocą adresu e-mail i hasła.
    - Obowiązkowa weryfikacja adresu e-mail po rejestracji.
    - Logowanie do systemu.
    - Możliwość zresetowania hasła.
2.  **Zarządzanie Pytaniami (CRUD)**
    - Ręczne tworzenie nowego pytania i odpowiedzi.
    - Przeglądanie listy wszystkich zapisanych pytań.
    - Edycja treści istniejących pytań i odpowiedzi.
    - Usuwanie pytań z listy.
3.  **Generator Pytań AI**
    - Osobny widok z polem do wklejenia treści ogłoszenia o pracę (limit 10 000 znaków).
    - Generowanie 10-15 pytań na podstawie wklejonego tekstu.
    - Interfejs do przeglądania, selekcji (domyślnie wszystkie zaznaczone), edycji i dodawania odpowiedzi do wygenerowanych pytań przed ich finalnym zapisaniem.
4.  **Wyszukiwanie**
    - Pole tekstowe na głównej liście pytań.
    - Filtrowanie listy pytań w czasie rzeczywistym na podstawie wpisywanej frazy.
    - Wyszukiwanie obejmuje tylko treść pytań, jest niewrażliwe na wielkość liter.
    - Wyniki sortowane według daty dodania (najnowsze na górze).

#### b. Kluczowe historie użytkownika i ścieżki korzystania

- **Nowy Użytkownik:** Jako nowy użytkownik, chcę założyć konto i zweryfikować swój e-mail, aby móc bezpiecznie przechowywać swoje pytania. Po pierwszym logowaniu chcę zobaczyć jasną instrukcję, jak zacząć korzystać z generatora AI.
- **Aktywny Użytkownik (Manualne Dodawanie):** Jako kandydat przygotowujący się do rozmowy, chcę ręcznie dodać pytanie rekrutacyjne i moją odpowiedź, aby mieć je zapisane i móc do nich wrócić później.
- **Aktywny Użytkownik (Automatyczne Dodawanie):** Jako kandydat przygotowujący się do rozmowy, chcę wkleić treść ogłoszenia o pracę, aby automatycznie otrzymać listę trafnych pytań. Następnie chcę je przejrzeć, odrzucić niepasujące, dopracować treść pozostałych i zapisać je na moim koncie.
- **Aktywny Użytkownik (Wyszukiwanie):** Jako kandydat, chcę otworzyć aplikację, szybko znaleźć konkretne pytanie za pomocą wyszukiwarki i przejrzeć moją zapisaną odpowiedź, aby odświeżyć sobie wiedzę przed rozmową.
- **Aktywny Użytkownik (Edycja):** Jako użytkownik, chcę mieć możliwość edytowania treści pytań i odpowiedzi, aby móc je dostosować do moich potrzeb.
- **Aktywny Użytkownik (Usuwanie):** Jako użytkownik, chcę mieć możliwość usunięcia pytań, które są już nieaktualne lub niepotrzebne, aby moja baza była uporządkowana.

#### c. Ważne kryteria sukcesu i sposoby ich mierzenia

- **Kryterium 1 (Zaangażowanie):** 80% zarejestrowanych użytkowników dodaje do swojej bazy co najmniej 5 pytań (ręcznie lub przy pomocy AI).
- **Kryterium 2 (Wartość Funkcji AI):** Co najmniej 50% wszystkich pytań w bazach użytkowników pochodzi z generatora AI.
- **Metoda Pomiaru:** Po osiągnięciu 1000 zarejestrowanych użytkowników, deweloper przeprowadzi po 30 dniach manualną analizę danych w bazie, wykorzystując do tego celu flagę `source` (`manual`/`ai`) przy każdym pytaniu oraz datę jego utworzenia.

</prd_planning_summary>

<unresolved_issues>

1.  **Brak Pętli Feedbacku dla AI:** Podjęto decyzję o braku jakiegokolwiek mechanizmu zbierania danych (nawet pasywnych) na temat jakości generowanych pytań. Oparcie się wyłącznie na zewnętrznych wywiadach z użytkownikami może być procesem powolnym i niereprezentatywnym. Stanowi to **główne ryzyko** dla rozwoju kluczowej funkcjonalności produktu, ponieważ nie będzie twardych danych do iterowania i ulepszania modelu AI.

</unresolved_issues>

</conversation_summary>
