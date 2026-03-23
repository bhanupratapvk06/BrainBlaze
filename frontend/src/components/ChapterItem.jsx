import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Tap } from './Tap';

export const ChapterItem = ({ chapterTitle, chapterIndex, progress, difficulty, subjectData, onClick }) => {
  const { theme: C } = useTheme();
  
  const diffClr = difficulty.includes("Spark") ? C.ok : difficulty.includes("Blaze") ? C.hi : C.danger;
  
  return (
    <Tap onClick={onClick}
      style={{ backgroundColor: C.bg2, borderRadius: 20, overflow: "hidden", border: `1px solid ${C.bdr}`, position: "relative" }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 6, backgroundColor: progress > 0 ? subjectData.color : C.bg3 }} />
      <div style={{ padding: "16px 20px 16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0, backgroundColor: subjectData.color + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{subjectData.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
              <p style={{ fontWeight: 800, fontSize: 15, margin: 0, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{chapterTitle}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: 11, color: diffClr, fontWeight: 700 }}>{difficulty}</span>
                <span style={{ color: C.muted }}>·</span>
                <span style={{ fontSize: 11, color: C.muted }}>Ch. {chapterIndex + 1}</span>
              </div>
            </div>
            <span style={{ fontWeight: 900, fontSize: 14, color: progress > 0 ? subjectData.color : C.muted, flexShrink: 0 }}>
              {progress === 100 ? "✓ Done" : progress > 0 ? `${progress}%` : "New"}
            </span>
          </div>
          <div style={{ width: "100%", height: 4, backgroundColor: C.bg3, borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 2, backgroundColor: subjectData.color, width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </Tap>
  );
};
