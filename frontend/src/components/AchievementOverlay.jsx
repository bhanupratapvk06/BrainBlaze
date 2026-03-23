import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Tap } from './Tap';

export const AchievementOverlay = ({ data, onClose }) => {
  const { theme: C } = useTheme();
  
  if (!data) return null;
  
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, backgroundColor: C.overlay,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 300,
      maxWidth: 480, left: "50%", transform: "translateX(-50%)", animation: "fadeIn 0.25s ease"
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        backgroundColor: C.bg2, borderRadius: 28,
        border: `1px solid ${C.bdr2}`, padding: 36, width: "100%", display: "flex", flexDirection: "column",
        alignItems: "center", textAlign: "center", animation: "scaleIn 0.28s ease",
        boxShadow: `0 20px 40px rgba(0,0,0,0.4)`
      }}>
        <div style={{ position: "relative", marginBottom: 16 }}>
          <div style={{
            width: 96, height: 96, backgroundColor: C.bg3, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48,
            border: `2px solid ${C.bdr2}`
          }}>💎</div>
          <div style={{
            position: "absolute", top: -6, right: -6, backgroundColor: C.sec, color: C.onSec,
            fontSize: 12, fontWeight: 800, padding: "4px 10px", borderRadius: 8
          }}>#{data.rank || 10}</div>
        </div>
        <p style={{ color: C.muted, fontSize: 14, fontWeight: 700, margin: "0 0 6px" }}>520 XP</p>
        <h2 style={{ color: C.text, fontSize: 26, fontWeight: 900, margin: "0 0 12px" }}>{data.title || "New High Score! 🎉"}</h2>
        <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.6, margin: "0 0 32px" }}>{data.desc || "Keep rising."}</p>
        <Tap onClick={onClose} style={{
          width: "100%", backgroundColor: C.acc, color: C.onAcc, borderRadius: 16,
          padding: "16px", fontWeight: 800, fontSize: 16, textAlign: "center", marginBottom: 12
        }}>
          Keep Playing
        </Tap>
        <Tap onClick={onClose} style={{
          width: "100%", backgroundColor: C.bg3, borderRadius: 16,
          padding: "16px", fontWeight: 700, fontSize: 15, textAlign: "center", color: C.text
        }}>
          Share Score
        </Tap>
      </div>
    </div>
  );
};
