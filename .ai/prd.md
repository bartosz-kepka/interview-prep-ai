# Dokument wymagań produktu (PRD) - InterviewPrep AI

Data: 13.10.2025
Wersja: 1.0 (MVP)

## 1. Przegląd produktu

InterviewPrep AI to aplikacja internetowa zaprojektowana, aby pomóc kandydatom w skutecznym przygotowaniu się do rozmów kwalifikacyjnych. Aplikacja rozwiązuje problem marnowania czasu na naukę odpowiedzi na generyczne pytania, umożliwiając generowanie spersonalizowanego zestawu pytań bezpośrednio z treści konkretnego ogłoszenia o pracę.

Główne funkcjonalności w wersji MVP obejmują:
- Ręczne zarządzanie (tworzenie, odczyt, aktualizacja, usuwanie) pytaniami i odpowiedziami.
- Automatyczne generowanie pytań rekrutacyjnych przez AI na podstawie wklejonej treści ogłoszenia.
- Prosty system kont użytkowników do bezpiecznego przechowywania danych.

Aplikacja będzie zaprojektowana w podejściu "mobile-first" i będzie w pełni responsywna (RWD), aby zapewnić optymalne doświadczenie na wszystkich urządzeniach.

## 2. Problem użytkownika

Kandydaci do pracy często przygotowują się do rozmów w oparciu o ogólnodostępne, standardowe listy pytań. Takie podejście jest nieefektywne, ponieważ nie uwzględnia specyfiki stanowiska, firmy i wymagań zawartych w ofercie pracy. W rezultacie kandydaci czują się nieprzygotowani na pytania, które faktycznie padają podczas rozmowy, co obniża ich szanse na sukces. Brakuje im narzędzia, które pomogłoby przewidzieć i przećwiczyć odpowiedzi na pytania skrojone na miarę konkretnej rekrutacji.

## 3. Wymagania funkcjonalne

### 3.1. System Kont Użytkownika
- Użytkownik może zarejestrować się w systemie podając adres e-mail i hasło.
- Po rejestracji wymagana jest weryfikacja adresu e-mail poprzez kliknięcie w link wysłany na podany adres.
- Użytkownik może zalogować się do aplikacji przy użyciu swojego e-maila i hasła.
- Użytkownik może skorzystać z funkcji "resetuj hasło", aby odzyskać dostęp do konta.
- Niezalogowany użytkownik nie ma dostępu do funkcji zarządzania pytaniami ani generatora AI.

### 3.2. Zarządzanie Pytaniami (CRUD)
- Użytkownik może ręcznie dodać nowe pytanie wraz z własną odpowiedzią.
- Użytkownik może przeglądać listę wszystkich swoich zapisanych pytań. Nowo dodane pytania pojawiają się na górze listy.
- Użytkownik może edytować treść istniejących pytań i odpowiedzi.
- Użytkownik może trwale usunąć wybrane pytanie ze swojej bazy.
- Pola do wprowadzania pytań i odpowiedzi to proste pola tekstowe bez opcji formatowania.

### 3.3. Generator Pytań AI
- Dostępny jest dedykowany widok do generowania pytań.
- Użytkownik może wkleić treść ogłoszenia o pracę w pole tekstowe (limit 10 000 znaków).
- Po wklejeniu tekstu i uruchomieniu generatora, AI analizuje treść i zwraca listę 10-15 sugerowanych pytań.
- Użytkownik widzi wygenerowane pytania na liście, gdzie domyślnie wszystkie są zaznaczone do zapisu.
- Użytkownik może odznaczyć pytania, których nie chce zapisywać. Odznaczenie pytania blokuje możliwość jego edycji.
- Użytkownik może edytować treść zaznaczonych pytań oraz dodać do nich swoje odpowiedzi przed zapisaniem.
- Po zapisaniu wybrane pytania są dodawane do głównej listy pytań użytkownika z oznaczeniem źródła jako "AI".

### 3.4. Wyszukiwanie i Interfejs
- Na głównej liście pytań znajduje się pole wyszukiwania.
- Wyszukiwanie filtruje listę pytań w czasie rzeczywistym.
- Wyszukiwanie jest niewrażliwe na wielkość liter i obejmuje wyłącznie treść pytań.
- Po pierwszym zalogowaniu nowy użytkownik widzi "pusty stan" (empty state) z wyraźnym wezwaniem do działania (np. "Dodaj swoje pierwsze pytanie" lub "Wygeneruj pytania z ogłoszenia").

## 4. Granice produktu

Następujące funkcjonalności celowo NIE wchodzą w zakres wersji MVP:
- Kategoryzacja pytań, tworzenie folderów, "sesji rekrutacyjnych" czy zestawów.
- Ocena jakości odpowiedzi użytkownika przez AI.
- Symulacje rozmów kwalifikacyjnych w czasie rzeczywistym.
- Funkcje analityczne i śledzenie postępów (np. oznaczanie trudnych pytań).
- Wbudowany w aplikację mechanizm zbierania opinii na temat jakości pytań generowanych przez AI.
- Przechowywanie treści wklejonych ogłoszeń o pracę po wygenerowaniu pytań.
- Logowanie i rejestracja za pośrednictwem dostawców zewnętrznych (np. Google, LinkedIn).

## 5. Historyjki użytkowników

### 5.1. Zarządzanie Kontem

- ID: US-001
- Tytuł: Rejestracja nowego użytkownika
- Opis: Jako nowy użytkownik, chcę móc założyć konto w aplikacji używając mojego adresu e-mail i hasła, aby bezpiecznie przechowywać moje pytania.
- Kryteria akceptacji:
  - Formularz rejestracji zawiera pola na adres e-mail i hasło.
  - System waliduje poprawność formatu adresu e-mail.
  - System wymaga hasła o minimalnej długości (np. 8 znaków).
  - Po pomyślnej rejestracji użytkownik jest informowany o konieczności weryfikacji adresu e-mail.
  - Użytkownik nie może się zalogować przed weryfikacją e-maila.

- ID: US-002
- Tytuł: Weryfikacja adresu e-mail
- Opis: Jako nowo zarejestrowany użytkownik, chcę otrzymać e-mail z linkiem weryfikacyjnym i po jego kliknięciu aktywować moje konto.
- Kryteria akceptacji:
  - Po rejestracji na podany adres e-mail automatycznie wysyłana jest wiadomość z unikalnym linkiem weryfikacyjnym.
  - Kliknięcie w link aktywuje konto użytkownika.
  - Po pomyślnej weryfikacji użytkownik jest przekierowywany na stronę logowania z komunikatem o sukcesie.
  - Link weryfikacyjny ma określony czas ważności (np. 24 godziny).

- ID: US-003
- Tytuł: Logowanie użytkownika
- Opis: Jako zarejestrowany użytkownik, chcę móc zalogować się na moje konto podając e-mail i hasło.
- Kryteria akceptacji:
  - Formularz logowania zawiera pola na e-mail i hasło.
  - Po poprawnym uwierzytelnieniu użytkownik jest przekierowany do głównego widoku aplikacji (listy pytań).
  - W przypadku podania błędnych danych, wyświetlany jest stosowny komunikat.
  - Logowanie jest możliwe tylko dla zweryfikowanych kont.

- ID: US-004
- Tytuł: Resetowanie hasła
- Opis: Jako użytkownik, który zapomniał hasła, chcę mieć możliwość jego zresetowania, aby odzyskać dostęp do konta.
- Kryteria akceptacji:
  - Na stronie logowania znajduje się link "Zapomniałem hasła".
  - Po podaniu adresu e-mail, na który zarejestrowane jest konto, wysyłana jest wiadomość z linkiem do resetu hasła.
  - Link prowadzi do formularza, gdzie użytkownik może ustawić nowe hasło.
  - Po pomyślnej zmianie hasła użytkownik jest o tym informowany.

- ID: US-005
- Tytuł: Wylogowanie użytkownika
- Opis: Jako zalogowany użytkownik, chcę móc się wylogować z aplikacji, aby zakończyć sesję.
- Kryteria akceptacji:
  - W interfejsie aplikacji znajduje się przycisk "Wyloguj".
  - Po kliknięciu przycisku sesja użytkownika jest kończona i jest on przekierowywany na stronę główną lub logowania.

### 5.2. Zarządzanie Pytaniami

- ID: US-006
- Tytuł: Ręczne dodawanie pytania
- Opis: Jako użytkownik, chcę ręcznie dodać pytanie i moją odpowiedź, aby zapisać je na moim koncie.
- Kryteria akceptacji:
  - W głównym widoku listy pytań znajduje się przycisk "Dodaj pytanie".
  - Po kliknięciu pojawia się formularz z polami na treść pytania i odpowiedzi.
  - Zapisanie pytania jest niemożliwe, jeśli pole z treścią pytania jest puste. Pole odpowiedzi może być puste.
  - Po zapisaniu nowe pytanie pojawia się na górze listy pytań.

- ID: US-007
- Tytuł: Przeglądanie listy pytań
- Opis: Jako użytkownik, chcę widzieć listę wszystkich moich zapisanych pytań, aby móc je przeglądać.
- Kryteria akceptacji:
  - Główny widok po zalogowaniu przedstawia listę pytań użytkownika.
  - Każdy element listy wyświetla treść pytania.
  - Lista jest posortowana od najnowszego do najstarszego pytania.
  - Możliwe jest rozwinięcie elementu listy, aby zobaczyć zapisaną odpowiedź.

- ID: US-008
- Tytuł: Edycja pytania i odpowiedzi
- Opis: Jako użytkownik, chcę edytować istniejące pytanie lub odpowiedź, aby poprawić lub zaktualizować ich treść.
- Kryteria akceptacji:
  - Przy każdym pytaniu na liście znajduje się opcja "Edytuj".
  - Po jej wybraniu użytkownik może modyfikować treść pytania i odpowiedzi w polach tekstowych.
  - Zapisanie zmian jest niemożliwe, jeśli pole z treścią pytania jest puste.
  - Po zapisaniu zaktualizowana treść jest widoczna na liście.

- ID: US-009
- Tytuł: Usuwanie pytania
- Opis: Jako użytkownik, chcę usunąć pytanie, które nie jest mi już potrzebne, aby utrzymać porządek na liście.
- Kryteria akceptacji:
  - Przy każdym pytaniu na liście znajduje się opcja "Usuń".
  - Przed usunięciem wyświetlany jest modal z prośbą o potwierdzenie operacji.
  - Po potwierdzeniu pytanie jest trwale usuwane z bazy danych i znika z listy.

- ID: US-010
- Tytuł: Wyszukiwanie pytań
- Opis: Jako użytkownik, chcę szybko znaleźć konkretne pytanie na mojej liście, wpisując fragment jego treści w polu wyszukiwania.
- Kryteria akceptacji:
  - Na liście pytań widoczne jest pole wyszukiwania.
  - Wpisywanie tekstu w pole dynamicznie filtruje listę, pokazując tylko pytania zawierające wpisaną frazę.
  - Wyszukiwanie jest niewrażliwe na wielkość liter.
  - Wyszukiwanie obejmuje tylko treść pytań, a nie odpowiedzi.

### 5.3. Generator AI

- ID: US-011
- Tytuł: Generowanie pytań z ogłoszenia
- Opis: Jako użytkownik, chcę wkleić treść ogłoszenia o pracę, aby AI wygenerowało dla mnie listę trafnych pytań rekrutacyjnych.
- Kryteria akceptacji:
  - W aplikacji istnieje dedykowana strona/widok "Generator AI".
  - Na stronie znajduje się duże pole tekstowe na treść ogłoszenia i przycisk "Generuj pytania".
  - Pole tekstowe ma limit 10 000 znaków.
  - Po kliknięciu przycisku "Generuj" wyświetlany jest wskaźnik ładowania.
  - Po zakończeniu procesu AI, na ekranie pojawia się lista 10-15 wygenerowanych pytań.
  - W przypadku błędu generowania, użytkownik widzi odpowiedni komunikat.

- ID: US-012
- Tytuł: Przegląd i selekcja wygenerowanych pytań
- Opis: Jako użytkownik, po wygenerowaniu pytań przez AI, chcę je przejrzeć, edytować i wybrać te, które chcę zapisać na moim koncie.
- Kryteria akceptacji:
  - Wygenerowane pytania są wyświetlane jako lista z checkboxami.
  - Domyślnie wszystkie checkboxy są zaznaczone.
  - Użytkownik może odznaczyć pytania, których nie chce zapisywać.
  - Użytkownik może edytować treść pytania i dodać odpowiedź tylko dla zaznaczonych pytań.
  - Odznaczenie pytania blokuje możliwość jego edycji.

- ID: US-013
- Tytuł: Zapisywanie wybranych pytań
- Opis: Jako użytkownik, chcę zapisać wybrane i ewentualnie zmodyfikowane pytania na mojej głównej liście.
- Kryteria akceptacji:
  - Na stronie z wygenerowanymi pytaniami znajduje się przycisk "Zapisz wybrane".
  - Kliknięcie przycisku powoduje zapisanie tylko zaznaczonych pytań w bazie danych użytkownika.
  - Każde zapisane pytanie ma w bazie danych atrybut `source: 'ai'`.
  - Po zapisaniu użytkownik jest przekierowywany do głównej listy pytań, gdzie widzi nowo dodane pozycje.

### 5.4. Interfejs i Doświadczenie Użytkownika

- ID: US-014
- Tytuł: Onboarding nowego użytkownika
- Opis: Jako nowy użytkownik, po pierwszym zalogowaniu chcę zobaczyć ekran, który jasno pokaże mi, co mogę zrobić dalej.
- Kryteria akceptacji:
  - Jeśli użytkownik nie ma żadnych zapisanych pytań, główny widok wyświetla komunikat "pustego stanu".
  - Komunikat zawiera czytelne wezwanie do działania (CTA), np. przyciski "Dodaj pytanie ręcznie" i "Wygeneruj pytania z ogłoszenia".

## 6. Metryki sukcesu

Sukces wersji MVP będzie mierzony na podstawie poniższych kryteriów. Pomiar zostanie dokonany manualnie przez dewelopera po 30 dniach od osiągnięcia progu 1000 zarejestrowanych użytkowników.

- Kryterium 1: Zaangażowanie użytkowników
  - Cel: 80% zarejestrowanych użytkowników dodaje do swojej bazy co najmniej 5 pytań (ręcznie lub przy pomocy AI).
  - Pomiar: Zapytanie do bazy danych zliczające użytkowników, którzy mają 5 lub więcej pytań.

- Kryterium 2: Wartość funkcji AI
  - Cel: Co najmniej 50% wszystkich pytań w bazach użytkowników pochodzi z generatora AI.
  - Pomiar: Zapytanie do bazy danych porównujące liczbę pytań z atrybutem `source: 'ai'` do całkowitej liczby pytań w systemie.
