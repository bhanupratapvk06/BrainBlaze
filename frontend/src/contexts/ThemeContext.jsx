import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DARK_THEME, LIGHT_THEME } from '../theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);
  const [theme, setTheme] = useState(DARK_THEME);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('appTheme');
        if (storedTheme === 'light') {
          setIsDark(false);
          setTheme(LIGHT_THEME);
        }
      } catch (e) {
        // stick with default
      } finally {
        setIsLoading(false);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    setTheme(nextDark ? DARK_THEME : LIGHT_THEME);
    try {
      await AsyncStorage.setItem('appTheme', nextDark ? 'dark' : 'light');
    } catch (e) {
      console.warn("Could not save theme to storage.");
    }
  };

  return (
    <ThemeContext.Provider value={{ isDark, theme, toggleTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
