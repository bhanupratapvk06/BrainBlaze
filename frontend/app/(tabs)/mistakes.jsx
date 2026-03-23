import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { ArrowLeft, XCircle, CheckCircle, Flame } from 'lucide-react';
import { useTheme, useMistakeBank, useXP } from "../../src/hooks";
import { Tap, ToastNotification } from "../../src/components";
import { makeSubjects } from "../../src/assets/data";

export default function MistakesScreen() {
  const router = useRouter();
  const { theme: C } = useTheme();
  const { mistakeBank, setMistakeBank } = useMistakeBank();
  const { addXp } = useXP();

  const [activeId, setActiveId] = useState(null);
  const [vals, setVals] = useState({});
  const [cleared, setCleared] = useState(false);
  const [toast, setToast] = useState(null);

  const SUBJECTS = makeSubjects(C);
  const total = 2; // Arbitrary target for demo
  const displayMistakes = mistakeBank || [];

  const attempt = async (id, correct) => {
    if ((vals[id] || "").trim().toLowerCase() === correct.toLowerCase()) {
      const next = displayMistakes.filter(q => q.id !== id);
      setMistakeBank(next);
      await addXp(10);
      setToast({ msg: "+10 XP ✅", color: C.ok });
      if (next.length === 0) {
        setCleared(true);
        await addXp(50);
      }
    } else {
      setToast({ msg: "Not quite — try again! ❌", color: C.danger });
    }
    setActiveId(null);
  };

  if (cleared || displayMistakes.length === 0) return (
    <div style={{ backgroundColor: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
      <div style={{ width: 120, height: 120, borderRadius: 36, backgroundColor: C.ok + "15", border: `2px solid ${C.ok}33`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
        <CheckCircle size={64} color={C.ok} strokeWidth={1.5} />
      </div>
      <h1 style={{ fontWeight: 900, fontSize: 32, marginBottom: 12, lineHeight: 1.2, color: C.text }}>Mistake Bank<br />Cleared! 🎉</h1>
      {cleared && (
        <div style={{ backgroundColor: C.acc + "15", border: `1px solid ${C.acc}33`, borderRadius: 20, padding: "20px 32px", marginBottom: 32 }}>
          <p style={{ fontWeight: 900, fontSize: 28, color: C.acc, margin: "0 0 4px" }}>+50 XP</p>
          <p style={{ color: C.muted, fontSize: 14, margin: 0, fontWeight: 600 }}>Comeback Bonus earned</p>
        </div>
      )}
      <Tap onClick={() => router.push('/(tabs)')} style={{ backgroundColor: C.acc, color: C.bg, borderRadius: 20, padding: "18px 40px", fontWeight: 900, fontSize: 16 }}>Back to Dashboard</Tap>
      {toast && <ToastNotification msg={toast.msg} color={toast.color} onClose={() => setToast(null)} />}
    </div>
  );

  const cleared_count = Math.max(0, total - displayMistakes.length);

  return (
    <div style={{ backgroundColor: C.bg, minHeight: "100vh", paddingBottom: 160 }}>
      {toast && <ToastNotification msg={toast.msg} color={toast.color} onClose={() => setToast(null)} />}
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "48px 24px 16px", borderBottom: `1px solid ${C.bdr}`, position: "sticky", top: 0, backgroundColor: C.bg, zIndex: 10 }}>
        <Tap onClick={() => router.push('/(tabs)')} style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: C.bg2, border: `1px solid ${C.bdr}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ArrowLeft size={20} color={C.text} strokeWidth={2} />
        </Tap>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontWeight: 900, fontSize: 22, margin: 0, color: C.text }}>Mistake Bank 📖</h1>
          <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>Review, retry, conquer</p>
        </div>
        <div style={{ backgroundColor: C.danger + "15", border: `1px solid ${C.danger}44`, borderRadius: 999, padding: "6px 14px", display: "flex", alignItems: "center", gap: 6 }}>
          <XCircle size={16} color={C.danger} />
          <span style={{ color: C.danger, fontSize: 13, fontWeight: 800 }}>{displayMistakes.length} left</span>
        </div>
      </div>

      <div style={{ padding: "24px 24px" }}>
        <div style={{ backgroundColor: C.bg2, borderRadius: 24, overflow: "hidden", border: `1px solid ${C.bdr}`, marginBottom: 24, position: "relative" }}>
          <div style={{ position: "absolute", right: -10, top: -10, opacity: 0.04, pointerEvents: "none" }}>
            <Flame size={80} color={C.acc} />
          </div>
          <div style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <p style={{ color: C.acc, fontSize: 12, fontWeight: 800, margin: "0 0 6px", letterSpacing: 1 }}>COMEBACK BONUS</p>
                <p style={{ fontWeight: 900, fontSize: 20, color: C.text, margin: 0 }}>Clear all mistakes</p>
                <p style={{ color: C.muted, fontSize: 13, margin: "4px 0 0" }}>Earn <span style={{ color: C.acc, fontWeight: 800 }}>+50 XP</span></p>
              </div>
              <div style={{ backgroundColor: C.acc + "15", border: `1px solid ${C.acc}33`, borderRadius: 14, padding: "10px 14px", textAlign: "center" }}>
                <p style={{ color: C.acc, fontWeight: 900, fontSize: 20, margin: 0 }}>{cleared_count}/{total}</p>
                <p style={{ color: C.muted, fontSize: 11, fontWeight: 700, margin: 0 }}>cleared</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
              {Array.from({ length: total }).map((_, i) => (<div key={i} style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: i < cleared_count ? C.acc : C.bg3, transition: "background-color 0.4s" }} />))}
            </div>
          </div>
        </div>

        {displayMistakes.map(q => {
          const sData = SUBJECTS.find(s => s.name === q.subject) || SUBJECTS[0];
          const wrongStr = typeof q.yours === "number" ? ["A", "B", "C", "D"][q.yours] : q.yours;
          const correctStr = typeof q.correct === "number" ? ["A", "B", "C", "D"][q.correct] : q.correct;

          return (
            <div key={q.id} style={{ borderRadius: 24, overflow: "hidden", border: `1px solid ${C.bdr}`, marginBottom: 16, backgroundColor: C.bg2, position: "relative" }}>
              <div style={{ position: "absolute", right: -10, top: 16, fontSize: 70, opacity: 0.04, userSelect: "none" }}>{sData.icon}</div>
              <div style={{ padding: "20px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: sData.color + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{sData.icon}</div>
                  <span style={{ color: sData.color, fontSize: 12, fontWeight: 800 }}>{sData.name}</span>
                </div>
                <p style={{ fontWeight: 800, fontSize: 16, color: C.text, margin: "0 0 16px", lineHeight: 1.5 }}>{q.q}</p>

                {activeId !== q.id ? (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                      <div style={{ backgroundColor: C.danger + "15", border: `1px solid ${C.danger}33`, borderRadius: 14, padding: "12px 14px" }}>
                        <p style={{ color: C.muted, fontSize: 11, fontWeight: 800, margin: "0 0 6px", letterSpacing: 1 }}>YOUR ANSWER</p>
                        <p style={{ color: C.danger, fontSize: 14, fontWeight: 800, margin: 0, textDecoration: "line-through" }}>{wrongStr}</p>
                      </div>
                      <div style={{ backgroundColor: C.ok + "15", border: `1px solid ${C.ok}33`, borderRadius: 14, padding: "12px 14px" }}>
                        <p style={{ color: C.muted, fontSize: 11, fontWeight: 800, margin: "0 0 6px", letterSpacing: 1 }}>CORRECT</p>
                        <p style={{ color: C.ok, fontSize: 14, fontWeight: 800, margin: 0 }}>{correctStr}</p>
                      </div>
                    </div>
                    <div style={{ backgroundColor: C.bg3, borderRadius: 12, padding: "12px 16px", marginBottom: 16, borderLeft: `4px solid ${sData.color}` }}>
                      <p style={{ color: C.textSub, fontSize: 13, margin: 0, fontStyle: "italic", lineHeight: 1.5 }}>{q.exp}</p>
                    </div>
                    <Tap onClick={() => setActiveId(q.id)} style={{ display: "block", backgroundColor: C.acc, color: C.bg, borderRadius: 16, padding: "16px", textAlign: "center", fontWeight: 900, fontSize: 14 }}>
                      Re-attempt →
                    </Tap>
                  </>
                ) : (
                  <div style={{ backgroundColor: C.bg3, borderRadius: 16, padding: 16, border: `1px solid ${C.bdr}` }}>
                    <p style={{ color: C.acc, fontSize: 12, fontWeight: 800, margin: "0 0 10px" }}>TYPE YOUR ANSWER</p>
                    <input type="text" placeholder="Your answer..." value={vals[q.id] || ""}
                      onChange={e => setVals(p => ({ ...p, [q.id]: e.target.value }))}
                      onKeyDown={e => e.key === "Enter" && attempt(q.id, correctStr)}
                      style={{ width: "100%", backgroundColor: C.bg2, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: "14px 16px", color: C.text, fontSize: 15, marginBottom: 16, fontFamily: "inherit", outline: "none", boxSizing: "border-box", caretColor: C.acc }} />
                    <div style={{ display: "flex", gap: 10 }}>
                      <Tap onClick={() => setActiveId(null)} style={{ flex: 1, border: `1px solid ${C.bdr}`, borderRadius: 14, padding: "14px", textAlign: "center", fontSize: 13, fontWeight: 700, color: C.text }}>Cancel</Tap>
                      <Tap onClick={() => attempt(q.id, correctStr)} style={{ flex: 2, backgroundColor: C.acc, color: C.bg, borderRadius: 14, padding: "14px", textAlign: "center", fontSize: 14, fontWeight: 900 }}>Submit Answer</Tap>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
