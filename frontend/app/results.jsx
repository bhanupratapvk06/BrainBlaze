import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { CheckCircle, XCircle, Clock, Swords, Share2, RefreshCw, Home } from 'lucide-react';
import { useTheme, useQuiz, useAuth, useMistakeBank } from "../src/hooks";
import { Tap, ToastNotification } from "../src/components";

export default function ResultsScreen() {
  const router = useRouter();
  const { theme: C } = useTheme();
  
  const { session, endQuiz } = useQuiz();
  const { addXp } = useAuth();
  const { addMistake } = useMistakeBank();

  const score = session.score || 0;
  const total = session.questions?.length || 1;
  const wrongAnswers = session.mistakes || [];
  const difficulty = session.difficulty || 'spark';
  const activePowerUp = session.powerUp;
  
  const pct = Math.round((score / total) * 100);
  const [off, setOff] = useState(283);
  const [toast, setToast] = useState(null);

  useEffect(() => { 
    setTimeout(() => setOff(283 - (pct / 100) * 283), 200); 
  }, [pct]);

  const clr = pct >= 90 ? C.acc : pct >= 70 ? C.sec : pct >= 50 ? C.hi : C.danger;
  
  const mult = difficulty === "blaze" ? 1.5 : difficulty === "inferno" ? 2 : 1;
  const xpEarned = Math.floor(score * 10 * (activePowerUp === "doubleXp" ? 2 : 1) * mult);

  // Apply rewards on mount
  useEffect(() => {
    let active = true;
    const saveResults = async () => {
      if (xpEarned > 0) {
        await addXp(xpEarned);
      }
      if (wrongAnswers.length > 0) {
        for (const w of wrongAnswers) {
          await addMistake(w);
        }
      }
    };
    saveResults();
    return () => { active = false; };
  }, []);

  const timeSpentSec = Math.floor((Date.now() - (session.startTime || Date.now())) / 1000);

  const doneAndDashboard = async () => {
    endQuiz();
    router.replace('/(tabs)');
  };

  return (
    <div style={{ backgroundColor: C.bg, minHeight: "100vh", paddingBottom: 40 }}>
      {toast && <ToastNotification msg={toast.msg} color={toast.color} onClose={() => setToast(null)} />}
      
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "64px 0 32px" }}>
        <div style={{ position: "relative", width: 140, height: 140, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
          <svg width={140} height={140} style={{ transform: "rotate(-90deg)", position: "absolute" }}>
            <circle cx={70} cy={70} r={45} stroke={C.bg3} strokeWidth={12} fill="none" />
            <circle cx={70} cy={70} r={45} stroke={clr} strokeWidth={12} fill="none"
              strokeDasharray="283" strokeDashoffset={off} strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1.2s ease-out" }} />
          </svg>
          <span style={{ fontSize: 38, fontWeight: 900, zIndex: 1, color: C.text }}>{pct}%</span>
        </div>
        <h1 style={{ fontWeight: 900, fontSize: 28, margin: "0 0 8px", color: C.text }}>Quiz Complete! 🎉</h1>
        <p style={{ fontWeight: 800, fontSize: 16, color: clr, margin: 0 }}>
          {pct >= 90 ? "Outstanding! 🌟" : pct >= 70 ? "Great job! 💪" : pct >= 50 ? "Good effort! 📚" : "Don't give up! 🔄"}
        </p>
      </div>

      <div style={{ padding: "0 24px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
          {[{ e: <CheckCircle size={24} color={C.ok} />, v: score, l: "Correct" }, { e: <XCircle size={24} color={C.danger} />, v: total - score, l: "Wrong" }, { e: <Clock size={24} color={C.sec} />, v: timeSpentSec > 0 ? `${Math.floor(timeSpentSec/60)}m ${timeSpentSec%60}s` : "1m 12s", l: "Time" }].map((s, i) => (
            <div key={i} style={{ backgroundColor: C.bg2, borderRadius: 20, padding: "16px 12px", textAlign: "center", border: `1px solid ${C.bdr}` }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>{s.e}</div>
              <p style={{ fontWeight: 900, fontSize: 22, margin: "0 0 4px", color: C.text }}>{s.v}</p>
              <p style={{ color: C.muted, fontSize: 11, fontWeight: 700, margin: 0 }}>{s.l}</p>
            </div>
          ))}
        </div>
        <div style={{ backgroundColor: C.acc + "15", borderRadius: 20, padding: 16, textAlign: "center", border: `1px solid ${C.acc}33` }}>
          <p style={{ fontWeight: 900, fontSize: 22, color: C.acc, margin: 0 }}>💎 {xpEarned} XP earned</p>
        </div>
      </div>

      {wrongAnswers.length > 0 && (
        <div style={{ padding: "0 24px 32px" }}>
          <p style={{ fontWeight: 900, fontSize: 18, marginBottom: 16, color: C.text }}>Review Mistakes</p>
          {wrongAnswers.map((w, i) => (
            <div key={i} style={{ backgroundColor: C.bg2, borderRadius: 20, padding: 20, border: `1px solid ${C.bdr}`, marginBottom: 12 }}>
              <p style={{ fontWeight: 800, fontSize: 15, marginBottom: 12, color: C.text }}>{w.q}</p>
              <p style={{ color: C.ok, fontWeight: 800, fontSize: 14, marginBottom: 8 }}>✅ {typeof w.correct === "number" ? ["A", "B", "C", "D"][w.correct] : w.correct}</p>
              <p style={{ color: C.muted, fontSize: 13, fontStyle: "italic", margin: 0 }}>{w.exp}</p>
            </div>
          ))}
        </div>
      )}

      <div style={{ padding: "0 24px 32px" }}>
        <div style={{ borderRadius: 24, padding: 24, backgroundColor: C.bg2, border: `1px solid ${C.bdr}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: C.acc + "15", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Swords size={22} color={C.acc} />
            </div>
            <p style={{ fontWeight: 900, fontSize: 18, margin: 0, color: C.text }}>Challenge a Friend</p>
          </div>
          <p style={{ color: C.muted, fontSize: 14, margin: "0 0 20px" }}>Share your score — can they beat it?</p>
          <Tap onClick={() => setToast({ msg: "Link copied! 📋", color: C.acc })}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: C.bg3, color: C.text, borderRadius: 16, padding: "16px", fontSize: 14, fontWeight: 800 }}>
            <Share2 size={16} />Generate Link
          </Tap>
        </div>
      </div>

      <div style={{ padding: "0 24px", display: "flex", gap: 16 }}>
        <Tap onClick={() => router.back()} style={{ flex: 1, border: `2px solid ${C.bdr}`, borderRadius: 20, padding: "18px", textAlign: "center", fontSize: 15, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: C.text }}>
          <RefreshCw size={18} />Try Again
        </Tap>
        <Tap onClick={doneAndDashboard} style={{ flex: 2, backgroundColor: C.acc, color: C.bg, borderRadius: 20, padding: "18px", textAlign: "center", fontSize: 15, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Home size={18} />Dashboard
        </Tap>
      </div>
    </div>
  );
}
