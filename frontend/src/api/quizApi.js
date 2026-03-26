import { client } from './client';

export const quizApi = {
  getSubjects:    (classLevel) => client(`/subjects/${classLevel}`),
  getChapters:    (subjectId)  => client(`/subjects/${subjectId}/chapters`),
  getQuiz:        (chapterId, mode, difficulty) =>
    client(`/quiz/${chapterId}?mode=${mode}&difficulty=${difficulty}`),
  generateAIQuiz: (topic, classLevel, count) =>
    client('/quiz/generate', { body: { topic, class: classLevel, count } }),

  /**
   * submitQuiz — sends completed quiz data to the backend.
   * Backend calculates XP server-side and returns { xpEarned, newStreak, ... }
   *
   * @param {string|null}  sessionId   – server generates one; pass null
   * @param {object[]}     answers     – array of { correct: bool }
   * @param {number}       timeTaken   – seconds
   * @param {string|null}  powerUpsUsed – active powerUp id or null
   * @param {object}       extra       – subject, chapter, difficulty, mode, score, totalQ, wrongAnswers
   */
  submitQuiz: (sessionId, answers, timeTaken, powerUpsUsed, extra = {}) =>
    client('/quiz/submit', {
      body: {
        sessionId,
        answers,
        timeTaken,
        powerUpsUsed,
        ...extra,
      },
    }),
};
