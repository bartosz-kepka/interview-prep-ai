import React, { useState } from 'react';
import { Button } from '../ui/button';

interface LogoutButtonProps {
  onLogout?: () => Promise<void>;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ onLogout }) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (onLogout) {
      setIsLoggingOut(true);
      try {
        await onLogout();
      } catch (error) {
        console.error('Logout failed:', error);
      } finally {
        setIsLoggingOut(false);
      }
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      disabled={isLoggingOut}
    >
      {isLoggingOut ? 'Logging out...' : 'Log Out'}
    </Button>
  );
};

