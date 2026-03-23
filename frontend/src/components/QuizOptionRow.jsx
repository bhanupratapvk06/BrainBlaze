import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Tap } from './Tap';
import { CheckCircle } from 'lucide-react';

export const QuizOptionRow = ({ option, index, submitted, isSelected, isCorrect, onClick, label }) => {
  const { theme: C } = useTheme();
  
  const oBg = () => { if (!submitted) return isSelected ? C.acc + "15" : C.bg2; if (isCorrect) return C.ok + "15"; if (isSelected) return C.danger + "15"; return C.bg2; };
  const oBdrClr = () => { if (!submitted) return isSelected ? C.acc : C.bdr; if (isCorrect) return C.ok; if (isSelected) return C.danger; return C.bdr; };
  const letterBg = () => { if (!submitted) return isSelected ? C.acc : C.bg3; if (isCorrect) return C.ok; if (isSelected) return C.danger; return C.bg3; };

  return (
    <Tap onClick={onClick} disabled={submitted}
      style={{ 
        display: "flex", alignItems: "center", gap: 16, borderRadius: 20, padding: "18px 20px", 
        overflow: "hidden", position: "relative", backgroundColor: oBg(), 
        border: `2px solid ${oBdrClr()}`, transition: "all 0.2s" 
      }}>
      <div style={{ 
        width: 36, height: 36, borderRadius: 12, backgroundColor: letterBg(), 
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, 
        fontWeight: 900, flexShrink: 0, 
        color: submitted && isCorrect ? C.bg : submitted && isSelected ? C.bg : C.text 
      }}>
        {submitted && isCorrect ? "✓" : submitted && isSelected && !isCorrect ? "✕" : label}
      </div>
      <span style={{ fontSize: 16, color: C.text, fontWeight: 600, flex: 1 }}>{option}</span>
      {submitted && isCorrect && <CheckCircle size={20} color={C.ok} />}
    </Tap>
  );
};
