import { useState } from "react";
import { Button } from "../ui/button";

export const LogoutButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Redirect to login page after successful logout
        window.location.href = "/login";
      } else {
        alert("Nie udało się wylogować. Spróbuj ponownie.");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      alert("Wystąpił błąd podczas wylogowywania.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleLogout} disabled={isLoading} variant="outline" size="sm">
      {isLoading ? "Wylogowywanie..." : "Wyloguj"}
    </Button>
  );
};
