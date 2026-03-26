import React, { createContext, useContext, useState, useCallback } from 'react';
import { quizApi } from '../api/quizApi';

const QuizContext = createContext();

export const QuizProvider = ({ children }) => {
  const [session, setSession] = useState({
    isActive: false,
    subject: null,
    chapter: null,
    mode: 'precomputed',
    difficulty: 'spark',
    powerUp: null,
    questions: [],
    currentQIndex: 0,
    score: 0,
    startTime: null,
    mistakes: [],
    lastResult: null,   // populated by endQuiz after backend submit
    isSubmitting: false,
  });

  const startQuiz = (config, questions) => {
    setSession({
      isActive: true,
      ...config,
      questions,
      currentQIndex: 0,
      score: 0,
      startTime: Date.now(),
      mistakes: [],
      lastResult: null,
      isSubmitting: false,
    });
  };

  /**
   * endQuiz: submits the completed session to the backend.
   * On success sets session.lastResult with server XP/streak data.
   * Falls back gracefully if the backend is unavailable.
   *
   * @param {object} overrides  Optional: { score, mistakes } if called before state settles
   */
  const endQuiz = useCallback(async (overrides = {}) => {
    setSession(prev => ({ ...prev, isActive: false, isSubmitting: true }));

    setSession(prev => {
      const finalScore   = overrides.score    ?? prev.score;
      const finalMistakes = overrides.mistakes ?? prev.mistakes;
      const timeTaken    = Math.round((Date.now() - (prev.startTime || Date.now())) / 1000);

      // Fire-and-forget async submit
      _doSubmit(prev, finalScore, finalMistakes, timeTaken);

      return { ...prev, isActive: false, isSubmitting: true };
    });
  }, []);

  const updateSession = (updates) => {
    setSession(prev => ({ ...prev, ...updates }));
  };

  // ── Internal: call backend submit endpoint ─────────────────────────────────
  const _doSubmit = async (snap, score, mistakes, timeTaken) => {
    try {
      const wrongAnswers = mistakes.map(q => ({
        question:      q.q   || q.question,
        correctAnswer: q.correct || q.ans || q.correctAnswer,
        userAnswer:    q.yours  || q.userAnswer || '',
        explanation:   q.exp   || q.explanation || '',
      }));

      const result = await quizApi.submitQuiz(
        null,  // sessionId — server generates
        wrongAnswers.map((_, i) => ({ correct: i < score, isCorrect: i < score })),  // answers array
        timeTaken,
        snap.powerUp,
        // Extra fields for server XP calculation
        {
          subject:      snap.subject,
          chapter:      snap.chapter,
          class:        snap.cls, // may be undefined — backend uses req.student.class
          difficulty:   snap.difficulty || 'spark',
          mode:         snap.mode       || 'precomputed',
          activePowerUp: snap.powerUp   || null,
          score,
          totalQ:       snap.questions?.length || score,
          wrongAnswers,
        }
      );

      setSession(prev => ({ ...prev, lastResult: result, isSubmitting: false }));
    } catch (err) {
      console.warn('[QuizContext] Submit failed (offline?):', err.message);
      setSession(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  return (
    <QuizContext.Provider value={{ session, startQuiz, endQuiz, updateSession }}>
      {children}
    </QuizContext.Provider>
  );
};

export const useQuizContext = () => useContext(QuizContext);
