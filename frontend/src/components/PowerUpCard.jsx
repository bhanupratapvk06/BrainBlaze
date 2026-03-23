import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Tap } from './Tap';

export const PowerUpCard = ({ p, activePowerUp, powerUps, onClick }) => {
  const { theme: C } = useTheme();
  const count = powerUps[p.id] || 0;
  
  return (
    <Tap onClick={onClick}
      style={{
        backgroundColor: activePowerUp === p.id ? p.clr + "15" : C.bg2, borderRadius: 16, padding: 16,
        border: `2px solid ${activePowerUp === p.id ? p.clr : C.bdr}`,
        position: "relative", opacity: count === 0 ? 0.5 : 1, cursor: count > 0 ? "pointer" : "not-allowed"
      }}>
      <span style={{ position: "absolute", top: 12, right: 12, backgroundColor: C.bg3, color: C.textSub, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6 }}>×{count}</span>
      <div style={{ marginBottom: 10, color: p.clr }}><p.Icon size={28} /></div>
      <p style={{ fontWeight: 800, fontSize: 14, margin: "0 0 4px", color: C.text }}>{p.n}</p>
      <p style={{ color: C.muted, fontSize: 12, margin: 0, lineHeight: 1.4 }}>{p.d}</p>
    </Tap>
  );
};
