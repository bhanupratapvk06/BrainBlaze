import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Tap } from './Tap';

export const SubjectCard = ({ subject, onClick, hideProgress = false }) => {
  const { theme: C } = useTheme();
  
  return (
    <Tap onClick={onClick}
      style={{ minWidth: 160, borderRadius: 24, padding: 20, flexShrink: 0, backgroundColor: C.bg2, border: `1px solid ${C.bdr}`, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", right: -10, bottom: -10, fontSize: 64, opacity: 0.04 }}>{subject.icon}</div>
      <div style={{ width: 36, height: 6, borderRadius: 3, backgroundColor: subject.color, marginBottom: 12 }} />
      <p style={{ fontWeight: 800, fontSize: 18, margin: "0 0 4px", color: C.text }}>{subject.name}</p>
      <p style={{ color: C.muted, fontSize: 12, margin: "0 0 16px" }}>{subject.ch}</p>
      
      {!hideProgress && (
        <>
          <div style={{ width: "100%", height: 4, backgroundColor: C.bg3, borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 2, backgroundColor: subject.color, width: `${subject.pct}%` }} />
          </div>
          <p style={{ color: subject.color, fontSize: 12, fontWeight: 800, margin: "8px 0 0" }}>{subject.pct}%</p>
        </>
      )}
    </Tap>
  );
};
