import React, { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Shield, Snowflake, Zap, Lightbulb } from 'lucide-react';
import { useTheme, useQuiz, usePowerUp, useAuth } from "../../src/hooks";
import { Tap, ToastNotification, PowerUpCard } from "../../src/components";
import { makeSubjects, QUIZ } from "../../src/assets/data";

export default function ChapterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const subjectName = params.subject || "Maths";
  const chapterName = params.name || "Ch. 1";

  const { theme: C } = useTheme();
  const { user } = useAuth();
  const { startQuiz } = useQuiz();
  const { powerUps } = usePowerUp();

  const [mode, setMode] = useState("precomputed");
  const [difficulty, setDifficulty] = useState("spark");
  const [activePowerUp, setActivePowerUp] = useState(null);
  const [toast, setToast] = useState(null);

  const SUBJECTS = makeSubjects(C);
  const sData = SUBJECTS.find(s => s.name === subjectName) || SUBJECTS[0];

  const handleStartQuiz = () => {
    const qs = QUIZ[subjectName] || QUIZ.Maths;
    startQuiz({
      subject: subjectName,
      chapter: chapterName,
      difficulty,
      mode,
      powerUp: activePowerUp,
    }, qs.map(q => ({ ...q })));

    router.push({ pathname: '/quiz/[chapter]', params: { chapter: chapterName, subject: subjectName } });
  };

  const pUps = [
    { id: "shield", Icon: Shield, n: "Shield", d: "Protects streak", clr: C.sec },
    { id: "timeFreeze", Icon: Snowflake, n: "Time Freeze", d: "Pauses 15s", clr: C.hi },
    { id: "doubleXp", Icon: Zap, n: "Double XP", d: "2× XP session", clr: C.acc },
    { id: "hint", Icon: Lightbulb, n: "Hint", d: "Remove 1 wrong", clr: C.ok }
  ];

  return (
    <div style={{ backgroundColor: C.bg, minHeight: "100vh", paddingBottom: 40 }}>
      {toast && <ToastNotification msg={toast.msg} color={toast.color} onClose={() => setToast(null)} />}
      <div style={{ height: "35vh", backgroundColor: C.bg2, position: "relative", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 24, borderBottom: `1px solid ${C.bdr}` }}>
        <Tap onClick={() => router.back()} style={{ position: "absolute", top: 48, left: 24, zIndex: 2, width: 44, height: 44, borderRadius: "50%", backgroundColor: C.glass, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${C.bdr}` }}>
          <ArrowLeft size={20} color={C.text} strokeWidth={2} />
        </Tap>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 120, opacity: 0.04 }}>{sData.icon}</div>
        <h1 style={{ fontWeight: 900, fontSize: 32, margin: 0, position: "relative", zIndex: 1, color: C.text }}>{subjectName}</h1>
        <span style={{ position: "absolute", bottom: 24, right: 24, backgroundColor: C.hi, color: C.bg, fontSize: 13, fontWeight: 800, padding: "6px 12px", borderRadius: 999, zIndex: 2 }}>⭐ 4.8</span>
      </div>
      <div style={{ padding: 24 }}>
        <h2 style={{ fontWeight: 900, fontSize: 22, marginBottom: 12, color: C.text }}>{chapterName}
          <span style={{ backgroundColor: C.bg3, fontSize: 11, padding: "4px 10px", borderRadius: 999, marginLeft: 12, fontWeight: 700, color: C.muted, border: `1px solid ${C.bdr}` }}>Class 9</span>
        </h2>
        <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
          {["📚 22 Lessons", "⏱️ 1hr 45min", "❓ 40 Questions"].map((t, i) => (
            <span key={i} style={{ backgroundColor: C.bg2, border: `1px solid ${C.bdr}`, borderRadius: 999, padding: "8px 14px", fontSize: 13, fontWeight: 600, color: C.text }}>{t}</span>
          ))}
        </div>
        <Tap onClick={() => { setToast({ msg: "Notes downloading... ✓", color: C.ok }) }}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", border: `1px solid ${C.bdr}`, backgroundColor: C.bg2, borderRadius: 16, padding: "16px", textAlign: "center", fontSize: 15, fontWeight: 700, marginBottom: 24, color: C.text, boxSizing: "border-box" }}>
          📥 Download Notes (PDF)
        </Tap>

        <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
          {[{ id: "precomputed", t: "⚡ Instant Quiz", s: "From question bank" }, { id: "ai", t: "🤖 AI Quiz", s: "Custom topic quiz" }].map(m => (
            <Tap key={m.id} onClick={() => setMode(m.id)}
              style={{ flex: 1, backgroundColor: mode === m.id ? C.acc + "15" : C.bg2, borderRadius: 20, padding: 16, border: `2px solid ${mode === m.id ? C.acc : C.bdr}` }}>
              <p style={{ fontWeight: 800, fontSize: 14, margin: "0 0 6px", color: mode === m.id ? C.acc : C.text }}>{m.t}</p>
              <p style={{ color: C.muted, fontSize: 12, margin: "0 0 16px" }}>{m.s}</p>
              <div style={{ backgroundColor: mode === m.id ? C.acc : C.bg3, color: mode === m.id ? C.bg : C.text, textAlign: "center", padding: "10px", borderRadius: 999, fontSize: 13, fontWeight: 800 }}>{m.id === "precomputed" ? "Start Now →" : "Generate →"}</div>
            </Tap>
          ))}
        </div>

        <p style={{ fontWeight: 800, fontSize: 16, margin: "0 0 12px", color: C.text }}>Difficulty</p>
        <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
          {[{ id: "spark", l: "🟢 Spark", clr: C.ok }, { id: "blaze", l: "🟡 Blaze", clr: C.hi }, { id: "inferno", l: "🔴 Inferno", clr: C.danger }].map(d => (
            <Tap key={d.id} onClick={() => setDifficulty(d.id)}
              style={{
                flex: 1, padding: "12px 0", borderRadius: 999, fontSize: 13, fontWeight: 700, textAlign: "center",
                border: `1px solid ${difficulty === d.id ? d.clr : C.bdr}`,
                backgroundColor: difficulty === d.id ? d.clr : C.bg2,
                color: difficulty === d.id ? C.bg : C.text
              }}>
              {d.l}
            </Tap>
          ))}
        </div>

        <p style={{ fontWeight: 800, fontSize: 16, margin: "0 0 12px", color: C.text }}>Power-Up <span style={{ color: C.muted, fontWeight: 500, fontSize: 13 }}>(optional)</span></p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 32 }}>
          {pUps.map(p => (
            <PowerUpCard
              key={p.id}
              p={p}
              activePowerUp={activePowerUp}
              powerUps={powerUps}
              onClick={() => powerUps[p.id] > 0 ? setActivePowerUp(p.id === activePowerUp ? null : p.id) : null}
            />
          ))}
        </div>
        <Tap onClick={handleStartQuiz}
          style={{ display: "block", width: "100%", backgroundColor: C.acc, color: C.bg, borderRadius: 20, padding: "18px", textAlign: "center", fontSize: 16, fontWeight: 900, boxSizing: "border-box" }}>
          Start Quiz →
        </Tap>
      </div>
    </div>
  );
}
