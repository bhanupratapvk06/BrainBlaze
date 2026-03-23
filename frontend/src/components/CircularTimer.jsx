import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const CircularTimer = ({ timer, maxTimer = 30, timerFrozen }) => {
  const { theme: C } = useTheme();
  const timerPct = (timer / maxTimer) * 100;
  const timerClr = timerFrozen ? C.sec : timer <= 5 ? C.danger : timer <= 10 ? C.hi : C.acc;
  
  return (
    <div style={{ position: "relative", width: 52, height: 52 }}>
      <svg width={52} height={52} style={{ transform: "rotate(-90deg)", position: "absolute" }}>
        <circle cx={26} cy={26} r={22} stroke={C.bg3} strokeWidth={5} fill="none" />
        <circle cx={26} cy={26} r={22} stroke={timerClr} strokeWidth={5} fill="none"
          strokeDasharray={`${2 * Math.PI * 22}`} strokeDashoffset={`${2 * Math.PI * 22 * (1 - timerPct / 100)}`}
          strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.9s linear,stroke 0.3s" }} />
      </svg>
      <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, color: timerClr, fontFamily: "monospace" }}>{timer}</span>
    </div>
  );
};
