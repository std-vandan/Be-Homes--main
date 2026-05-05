import React, { createContext, useEffect, useState } from 'react';

// Create the context
export const ThemeContext = createContext();

// Provide the context
export const ThemeProvider = ({ children }) => {
  const [isLightMode, setIsLightMode] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isLightMode ? 'light' : 'dark');
  }, [isLightMode]);

  const toggleMode = () => {
    setIsLightMode(!isLightMode);
  };

  return (
    <ThemeContext.Provider value={{ isLightMode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
