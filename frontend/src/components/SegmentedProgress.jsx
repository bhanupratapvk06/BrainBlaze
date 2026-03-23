import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const SegmentedProgress = ({ totalSegments, activeSegment }) => {
  const { theme: C } = useTheme();
  
  if (totalSegments <= 0) return null;
  
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {Array(totalSegments).fill(0).map((_, i) => (
        <div key={i} style={{ 
          flex: 1, 
          height: 6, 
          borderRadius: 3, 
          backgroundColor: i < activeSegment ? C.acc : i === activeSegment ? C.acc + "66" : C.bg3, 
          transition: "background-color 0.3s" 
        }} />
      ))}
    </div>
  );
};
