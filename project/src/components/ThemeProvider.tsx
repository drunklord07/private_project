import React, { ReactNode } from 'react';

interface ThemeProviderProps {
  children: ReactNode;
  isDarkMode: boolean;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, isDarkMode }) => {
  return (
    <div className={isDarkMode ? 'dark' : 'light'}>
      {children}
    </div>
  );
};