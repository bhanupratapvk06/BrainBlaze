import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Tap } from './Tap';

export const ThemeToggle = () => {
  const { isDark, theme, toggleTheme } = useTheme();
  
  return (
    <Tap 
      onClick={toggleTheme} 
      style={{
        width: 44, 
        height: 44, 
        borderRadius: 14,
        backgroundColor: theme.bg3, 
        border: `1px solid ${theme.bdr2}`,
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        fontSize: 20
      }}
    >
      {isDark ? "🌙" : "☀️"}
    </Tap>
  );
};
