import { useQuizContext } from '../contexts/QuizContext';
import { fuzzyMatch } from '../utils/fuzzyMatch';

export const useQuiz = () => {
  const { session, updateSession, endQuiz, startQuiz } = useQuizContext();
  const { questions, currentQIndex } = session;

  const currentQuestion = questions[currentQIndex];

  const submitAnswer = (userAnswer) => {
    let isCorrect = false;

    if (!currentQuestion || userAnswer === null) {
      // Time up
      isCorrect = false;
    } else {
      if (currentQuestion.type === 'mcq') {
        isCorrect = userAnswer === currentQuestion.correct;
      } else if (currentQuestion.type === 'fill') {
        const target = String(currentQuestion.correct).toLowerCase().trim();
        const input = String(userAnswer).toLowerCase().trim();
        isCorrect = fuzzyMatch(input, target);
      }
    }

    const mistakes = isCorrect ? session.mistakes : [...session.mistakes, currentQuestion];

    updateSession({
      score: isCorrect ? session.score + 1 : session.score,
      mistakes
    });

    return isCorrect;
  };

  const nextQuestion = () => {
    if (currentQIndex < questions.length - 1) {
      updateSession({ currentQIndex: currentQIndex + 1 });
    } else {
      // Finished
      updateSession({ isActive: false });
    }
  };

  return {
    session,
    currentQuestion,
    submitAnswer,
    nextQuestion,
    endQuiz,
    startQuiz,
    isComplete: !session.isActive && currentQIndex === questions.length - 1 && session.questions.length > 0
  };
};
