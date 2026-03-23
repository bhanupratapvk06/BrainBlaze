import React, { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Zap, Lightbulb, Snowflake } from 'lucide-react';
import { useTheme, useQuiz, usePowerUp, useTimer } from "../../src/hooks";
import { Tap, ToastNotification, CircularTimer, SegmentedProgress, QuizOptionRow } from "../../src/components";
import { makeSubjects } from "../../src/assets/data";
import { fuzzyMatch } from "../../src/utils";

export default function ActiveQuizScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const subjectName = params.subject || "Maths";

  const { theme: C } = useTheme();
  const { session, currentQuestion, submitAnswer, nextQuestion, isComplete } = useQuiz();
  const { activatePowerUp } = usePowerUp();
  const { timeLeft, startTimer, pauseTimer, resetTimer } = useTimer(30, () => {
    // Auto-submit when time is up
    if (!submitted) {
      handleAnswerSubmit(currentQuestion.type === 'mcq' ? sel : fillAns);
    }
  });

  const [sel, setSel] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [fillAns, setFillAns] = useState("");
  const [hiddenOpt, setHiddenOpt] = useState(null);
  const [toast, setToast] = useState(null);
  const [isOk, setIsOk] = useState(false);

  // Powerup local states
  const [hintsUsed, setHintsUsed] = useState(0);
  const [timeFrozen, setTimeFrozen] = useState(false);

  const SUBJECTS = makeSubjects(C);
  const sData = SUBJECTS.find(s => s.name === subjectName) || SUBJECTS[0];

  useEffect(() => {
    // Stop returning to this screen if the quiz is over
    if (isComplete) {
      router.replace('/results');
      return;
    }

    // Reset state for new question
    setSel(null);
    setSubmitted(false);
    setFillAns("");
    setHiddenOpt(null);
    setIsOk(false);

    if (timeFrozen) {
      // If frozen, unfreeze on next question
      setTimeFrozen(false);
    }

    resetTimer(30);
    startTimer();
  }, [session.currentQIndex, isComplete]);

  const handleAnswerSubmit = (ans) => {
    if (submitted) return;
    pauseTimer();
    setSubmitted(true);

    if (currentQuestion.type === "mcq" && ans === null) {
      setIsOk(false);
      submitAnswer(null);
      return;
    }

    const correct = currentQuestion.type === "fill" ? fuzzyMatch(ans, currentQuestion.correct) : ans === currentQuestion.correct;
    setIsOk(correct);

    if (correct && timeLeft >= 22) {
      setToast({ msg: "+5 Bonus XP 🚀", color: C.acc });
    }

    submitAnswer(ans);
  };

  const handleNext = () => {
    if (isComplete) {
      router.replace('/results');
    } else {
      nextQuestion();
    }
  };

  if (!currentQuestion) return null; // Safe fallback

  return (
    <div style={{ backgroundColor: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {toast && <ToastNotification msg={toast.msg} color={toast.color} onClose={() => setToast(null)} />}

      <div style={{ padding: "48px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Tap onClick={() => router.back()} style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: C.bg2, border: `1px solid ${C.bdr}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ArrowLeft size={20} color={C.muted} strokeWidth={2} />
        </Tap>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontWeight: 800, fontSize: 16, margin: 0, color: C.text }}>{subjectName}</p>
          <p style={{ color: C.muted, fontSize: 12, margin: 0 }}>{session.difficulty === "spark" ? "🟢 Spark" : session.difficulty === "blaze" ? "🟡 Blaze" : "🔴 Inferno"}</p>
        </div>
        <CircularTimer timer={timeLeft} maxTimer={30} timerFrozen={timeFrozen} />
      </div>

      <div style={{ padding: "20px 24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ color: C.muted, fontSize: 13, fontWeight: 700 }}>Question {session.currentQIndex + 1} of {session.questions.length}</span>
          <span style={{ backgroundColor: C.acc + "15", color: C.acc, borderRadius: 999, padding: "4px 12px", fontSize: 12, fontWeight: 800, border: `1px solid ${C.acc}33` }}>
            {Math.round((session.currentQIndex / session.questions.length) * 100)}% done
          </span>
        </div>
        <SegmentedProgress totalSegments={session.questions.length} activeSegment={session.currentQIndex} />
      </div>

      {session.powerUp === "doubleXp" && (
        <div style={{ margin: "16px 24px 0", backgroundColor: C.acc + "15", border: `1px solid ${C.acc}33`, borderRadius: 16, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <Zap size={18} color={C.acc} /><span style={{ color: C.acc, fontSize: 13, fontWeight: 800 }}>Double XP Active</span>
        </div>
      )}

      <div style={{ flex: 1, padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ backgroundColor: C.bg2, borderRadius: 24, overflow: "hidden", border: `1px solid ${C.bdr}`, position: "relative" }}>
          <div style={{ position: "absolute", right: -10, top: 10, fontSize: 84, opacity: 0.04, userSelect: "none", pointerEvents: "none" }}>{sData.icon}</div>
          <div style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 22 }}>{sData.icon}</span>
                <span style={{ color: C.acc, fontSize: 13, fontWeight: 800 }}>{subjectName}</span>
              </div>
              <span style={{ backgroundColor: C.bg3, borderRadius: 999, padding: "4px 12px", fontSize: 12, fontWeight: 800, color: C.muted }}>
                {session.difficulty === "spark" ? "🟢" : session.difficulty === "blaze" ? "🟡" : "🔴"} {session.difficulty}
              </span>
            </div>
            <p style={{ fontWeight: 800, fontSize: 20, lineHeight: 1.5, color: C.text, margin: 0 }}>{currentQuestion.q}</p>
          </div>
        </div>

        {currentQuestion.type === "mcq"
          ? <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {currentQuestion.options.map((opt, i) => i === hiddenOpt ? null : (
              <QuizOptionRow
                key={i}
                option={opt}
                index={i}
                label={["A", "B", "C", "D"][i]}
                submitted={submitted}
                isSelected={sel === i}
                isCorrect={i === currentQuestion.correct}
                onClick={() => !submitted && setSel(i)}
              />
            ))}
          </div>
          : <div style={{ backgroundColor: C.bg2, borderRadius: 20, border: `2px solid ${C.bdr}`, overflow: "hidden" }}>
            <input value={fillAns} onChange={e => setFillAns(e.target.value)} disabled={submitted}
              placeholder="Type your answer here..."
              style={{ width: "100%", backgroundColor: C.inputBg || C.bg3, border: "none", padding: "20px 24px", color: C.text, fontSize: 16, outline: "none", fontFamily: "inherit", boxSizing: "border-box", caretColor: C.acc }} />
          </div>
        }

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {!submitted && session.powerUp === "hint" && hintsUsed < 3 && (
            <Tap onClick={async () => {
              const w = currentQuestion.options.findIndex((_, i) => i !== currentQuestion.correct && i !== hiddenOpt);
              setHiddenOpt(w);
              setHintsUsed(h => h + 1);
              // Assume one 'hint' powerup lasts for 3 uses total during the quiz, consumed once at start.
            }}
              style={{ backgroundColor: C.bg2, border: `1px solid ${C.bdr}`, borderRadius: 999, padding: "10px 20px", fontSize: 13, fontWeight: 700, color: C.text, display: "flex", alignItems: "center", gap: 8 }}>
              <Lightbulb size={16} color={C.ok} />Hint ({3 - hintsUsed} left)
            </Tap>
          )}
          {!submitted && session.powerUp === "timeFreeze" && !timeFrozen && (
            <Tap onClick={() => {
              pauseTimer();
              setTimeFrozen(true);
            }}
              style={{ backgroundColor: C.hi + "15", border: `1px solid ${C.hi}44`, borderRadius: 999, padding: "10px 20px", fontSize: 13, fontWeight: 800, color: C.hi, display: "flex", alignItems: "center", gap: 8 }}>
              <Snowflake size={16} />Freeze Timer
            </Tap>
          )}
        </div>

        {submitted && (
          <div style={{ borderRadius: 20, padding: "16px 20px", backgroundColor: isOk ? C.ok + "15" : C.danger + "15", border: `1px solid ${isOk ? C.ok + "44" : C.danger + "44"}`, display: "flex", flexDirection: "column", gap: 6 }}>
            <p style={{ fontWeight: 900, fontSize: 16, margin: 0, color: isOk ? C.ok : C.danger }}>
              {isOk ? "✅ Correct! XP earned" : "❌ Incorrect"}
            </p>
            {!isOk && <p style={{ fontSize: 13, margin: 0, color: C.textSub }}>
              Correct: <span style={{ color: C.ok, fontWeight: 800 }}>{currentQuestion.type === "fill" ? currentQuestion.correct : ["A", "B", "C", "D"][currentQuestion.correct] + ". " + currentQuestion.options[currentQuestion.correct]}</span>
            </p>}
            <p style={{ fontSize: 13, margin: 0, color: C.muted, fontStyle: "italic" }}>{currentQuestion.exp}</p>
          </div>
        )}

        <div style={{ marginTop: "auto", paddingTop: 8 }}>
          {!submitted && (currentQuestion.type === "mcq" ? sel !== null : fillAns !== "") && (
            <Tap onClick={() => handleAnswerSubmit(currentQuestion.type === "mcq" ? sel : fillAns)}
              style={{ display: "block", width: "100%", backgroundColor: C.acc, color: C.bg, borderRadius: 20, padding: "18px", textAlign: "center", fontSize: 16, fontWeight: 900, boxSizing: "border-box" }}>
              Submit Answer
            </Tap>
          )}
          {submitted && (
            <Tap onClick={handleNext} style={{ display: "block", width: "100%", backgroundColor: C.sec, color: C.bg, borderRadius: 20, padding: "18px", textAlign: "center", fontSize: 16, fontWeight: 900, boxSizing: "border-box" }}>
              {session.currentQIndex < session.questions.length - 1 ? "Next Question →" : "See Results 🎉"}
            </Tap>
          )}
        </div>
      </div>
    </div>
  );
}
