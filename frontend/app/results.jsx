import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { CheckCircle, XCircle, Clock, Swords, Share2, RefreshCw, Home, Zap } from 'lucide-react';
import { useTheme, useQuiz, useAuth, useMistakeBank, useXP } from "../src/hooks";
import { Tap, ToastNotification } from "../src/components";

// ─── helpers ────────────────────────────────────────────────────────────────

const formatTime = (sec) => {
  if (sec <= 0) return "0s";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

const getLabel = (pct) => {
  if (pct >= 90) return "Outstanding! 🌟";
  if (pct >= 70) return "Great job! 💪";
  if (pct >= 50) return "Good effort! 📚";
  return "Don't give up! 🔄";
};

const CIRCLE_R = 45;
const CIRCUMFERENCE = Math.round(2 * Math.PI * CIRCLE_R); // 283


const ScoreRing = ({ pct, clr, C }) => {
  const arcRef = useRef(null);
  const numRef = useRef(null);

  useEffect(() => {
    const arc = arcRef.current;
    const num = numRef.current;
    if (!arc || !num) return;

    arc.style.strokeDashoffset = CIRCUMFERENCE;
    arc.getBoundingClientRect(); // flush

    let rafId;
    const start = performance.now() + 30;

    setTimeout(() => {
      arc.style.strokeDashoffset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;
    }, 30);

    const tick = (now) => {
      const elapsed = Math.max(0, now - start);
      const t = Math.min(elapsed / 1100, 1);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      num.textContent = Math.round(ease * pct) + '%';
      if (t < 1) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, [pct]);

  return (
    <div style={{
      position: "relative", width: 140, height: 140,
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <svg width={140} height={140}
        style={{ position: "absolute", top: 0, left: 0 }}>
        <circle cx={70} cy={70} r={CIRCLE_R}
          stroke={C.bg3} strokeWidth={10} fill="none" />
        <circle ref={arcRef} cx={70} cy={70} r={CIRCLE_R}
          stroke={clr} strokeWidth={10} fill="none"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE}
          strokeLinecap="round"
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "70px 70px",
            transition: "stroke-dashoffset 1.1s cubic-bezier(0.35,0,0.15,1)",
          }}
        />
      </svg>
      <span ref={numRef} style={{
        fontSize: 32, fontWeight: 900, color: C.text,
        fontVariantNumeric: "tabular-nums", position: "relative", zIndex: 1,
      }}>
        0%
      </span>
    </div>
  );
};

const StatCard = ({ icon, value, label, C }) => (
  <div style={{
    backgroundColor: C.bg2,
    borderRadius: 20,
    padding: "16px 12px",
    textAlign: "center",
    border: `1px solid ${C.bdr}`,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
  }}>
    {icon}
    <p style={{ fontWeight: 900, fontSize: 22, margin: 0, color: C.text }}>{value}</p>
    <p style={{ color: C.muted, fontSize: 11, fontWeight: 700, margin: 0, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</p>
  </div>
);

const XPBadge = ({ xpEarned, activePowerUp, C }) => (
  <div style={{
    backgroundColor: C.acc + "15",
    borderRadius: 20,
    padding: "16px 20px",
    border: `1px solid ${C.acc}33`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  }}>
    {activePowerUp === "doubleXp" && (
      <div style={{
        backgroundColor: C.acc,
        borderRadius: 8,
        padding: "2px 8px",
        display: "flex",
        alignItems: "center",
        gap: 4,
      }}>
        <Zap size={12} color={C.bg} />
        <span style={{ fontSize: 11, fontWeight: 900, color: C.bg }}>2×</span>
      </div>
    )}
    <p style={{ fontWeight: 900, fontSize: 22, color: C.acc, margin: 0 }}>
      💎 +{xpEarned} XP
    </p>
  </div>
);

const MistakeCard = ({ mistake, index, C }) => {
  const correctLabel =
    typeof mistake.correct === "number"
      ? ["A", "B", "C", "D"][mistake.correct]
      : mistake.correct;

  return (
    <div style={{
      backgroundColor: C.bg2,
      borderRadius: 20,
      padding: 20,
      border: `1px solid ${C.bdr}`,
    }}>
      <p style={{ fontWeight: 800, fontSize: 14, color: C.muted, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 0.4 }}>
        Q{index + 1}
      </p>
      <p style={{ fontWeight: 800, fontSize: 15, margin: "0 0 14px", color: C.text, lineHeight: 1.4 }}>
        {mistake.q}
      </p>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: mistake.exp ? 10 : 0 }}>
        <CheckCircle size={16} color={C.ok} style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ color: C.ok, fontWeight: 800, fontSize: 14, margin: 0 }}>
          {correctLabel}
        </p>
      </div>
      {mistake.exp && (
        <p style={{ color: C.muted, fontSize: 13, fontStyle: "italic", margin: 0, lineHeight: 1.5, paddingLeft: 24 }}>
          {mistake.exp}
        </p>
      )}
    </div>
  );
};

// ─── main component ──────────────────────────────────────────────────────────

export default function ResultsScreen() {
  const router = useRouter();
  const { theme: C } = useTheme();
  const { session, endQuiz } = useQuiz();
  const { awardXp } = useXP();
  const { addMistake } = useMistakeBank();

  const [toast, setToast] = useState(null);
  const savedRef = useRef(false);

  // ── derived values ──
  const score = session.score ?? 0;
  const questions = session.questions ?? [];
  const total = questions.length || 1;
  const wrongAnswers = session.mistakes ?? [];
  const difficulty = session.difficulty ?? "spark";
  const activePowerUp = session.powerUp ?? null;

  const pct = Math.round((score / total) * 100);
  const clr = pct >= 90 ? C.acc : pct >= 70 ? C.sec : pct >= 50 ? C.hi : C.danger;

  const diffMult = difficulty === "blaze" ? 1.5 : difficulty === "inferno" ? 2 : 1;
  const xpMult = activePowerUp === "doubleXp" ? 2 : 1;
  const xpEarned = Math.floor(score * 10 * xpMult * diffMult);

  const timeSpentSec = Math.floor(
    (Date.now() - (session.startTime ?? Date.now())) / 1000
  );

  // ── save results exactly once ──
  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;

    const saveResults = async () => {
      if (xpEarned > 0) await awardXp(xpEarned);
      for (const w of wrongAnswers) {
        await addMistake(session.subject, session.chapter, w);
      }
    };

    saveResults();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── actions ──
  const handleDashboard = () => {
    endQuiz();
    router.replace('/(tabs)');
  };

  const handleShare = () => {
    setToast({ msg: "Link copied! 📋", color: C.acc });
  };

  // ─── render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ backgroundColor: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {toast && (
        <ToastNotification
          msg={toast.msg}
          color={toast.color}
          onClose={() => setToast(null)}
        />
      )}

      {/* ── Hero: ring + headline ── */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "56px 24px 32px",
        gap: 16,
      }}>
        <ScoreRing pct={pct} clr={clr} C={C} />
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontWeight: 900, fontSize: 26, margin: "0 0 6px", color: C.text }}>
            Quiz Complete! 🎉
          </h1>
          <p style={{ fontWeight: 800, fontSize: 16, color: clr, margin: 0 }}>
            {getLabel(pct)}
          </p>
        </div>
      </div>

      {/* ── Stats + XP ── */}
      <div style={{ padding: "0 24px 28px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <StatCard icon={<CheckCircle size={22} color={C.ok} />} value={score} label="Correct" C={C} />
          <StatCard icon={<XCircle size={22} color={C.danger} />} value={total - score} label="Wrong" C={C} />
          <StatCard icon={<Clock size={22} color={C.sec} />} value={formatTime(timeSpentSec)} label="Time" C={C} />
        </div>
        <XPBadge xpEarned={xpEarned} activePowerUp={activePowerUp} C={C} />
      </div>

      {/* ── Mistake Review ── */}
      {wrongAnswers.length > 0 && (
        <div style={{ padding: "0 24px 28px" }}>
          <p style={{ fontWeight: 900, fontSize: 17, margin: "0 0 14px", color: C.text }}>
            Review Mistakes
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {wrongAnswers.map((w, i) => (
              <MistakeCard key={i} mistake={w} index={i} C={C} />
            ))}
          </div>
        </div>
      )}

      {/* ── Challenge a Friend ── */}
      <div style={{ padding: "0 24px 28px" }}>
        <div style={{
          borderRadius: 24,
          padding: 20,
          backgroundColor: C.bg2,
          border: `1px solid ${C.bdr}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <div style={{
              width: 44, height: 44,
              borderRadius: 14,
              backgroundColor: C.acc + "15",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <Swords size={22} color={C.acc} />
            </div>
            <p style={{ fontWeight: 900, fontSize: 17, margin: 0, color: C.text }}>
              Challenge a Friend
            </p>
          </div>
          <p style={{ color: C.muted, fontSize: 14, margin: "0 0 16px", lineHeight: 1.4 }}>
            Share your score — can they beat it?
          </p>
          <Tap
            onClick={handleShare}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              backgroundColor: C.bg3,
              color: C.text,
              borderRadius: 14,
              padding: "14px",
              fontSize: 14,
              fontWeight: 800,
            }}
          >
            <Share2 size={16} />
            Generate Link
          </Tap>
        </div>
      </div>

      {/* ── Actions ── */}
      <div style={{ padding: "0 24px 40px", display: "flex", gap: 12, marginTop: "auto" }}>
        <Tap
          onClick={() => router.back()}
          style={{
            flex: 1,
            border: `2px solid ${C.bdr}`,
            borderRadius: 20,
            padding: "16px",
            textAlign: "center",
            fontSize: 15,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            color: C.text,
          }}
        >
          <RefreshCw size={18} />
          Try Again
        </Tap>
        <Tap
          onClick={handleDashboard}
          style={{
            flex: 2,
            backgroundColor: C.acc,
            color: C.bg,
            borderRadius: 20,
            padding: "16px",
            textAlign: "center",
            fontSize: 15,
            fontWeight: 900,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <Home size={18} />
          Dashboard
        </Tap>
      </div>
    </div>
  );
}