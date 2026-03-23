import React, { createContext, useContext, useState } from 'react';

const QuizContext = createContext();

export const QuizProvider = ({ children }) => {
  const [session, setSession] = useState({
    isActive: false,
    subject: null,
    chapter: null,
    mode: 'Standard',
    difficulty: 'Normal',
    powerUp: null,
    questions: [],
    currentQIndex: 0,
    score: 0,
    startTime: null,
    mistakes: []
  });

  const startQuiz = (config, questions) => {
    setSession({
      isActive: true,
      ...config,
      questions,
      currentQIndex: 0,
      score: 0,
      startTime: Date.now(),
      mistakes: []
    });
  };

  const endQuiz = () => {
    setSession(prev => ({ ...prev, isActive: false }));
  };

  const updateSession = (updates) => {
    setSession(prev => ({ ...prev, ...updates }));
  };

  return (
    <QuizContext.Provider value={{ session, startQuiz, endQuiz, updateSession }}>
      {children}
    </QuizContext.Provider>
  );
};

export const useQuizContext = () => useContext(QuizContext);
