import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const ProgressBar = ({ progress, color, height = 6, bgClass }) => {
  const { theme: C } = useTheme();
  return (
    <div style={{ width: "100%", height, backgroundColor: bgClass || C.bg3, borderRadius: height / 2, overflow: "hidden" }}>
      <div style={{ height: "100%", borderRadius: height / 2, backgroundColor: color || C.acc, width: `${progress}%` }} />
    </div>
  );
};
