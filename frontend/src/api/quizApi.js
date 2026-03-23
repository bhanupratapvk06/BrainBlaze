import { client } from './client';

export const quizApi = {
  getSubjects: (classLevel) => client(`/subjects/${classLevel}`),
  getChapters: (subjectId) => client(`/subjects/${subjectId}/chapters`),
  getQuiz: (chapterId, mode, difficulty) => client(`/quiz/${chapterId}?mode=${mode}&difficulty=${difficulty}`),
  generateAIQuiz: (topic, classLevel, count) => client('/quiz/generate', { body: { topic, class: classLevel, count } }),
  submitQuiz: (sessionId, answers, timeTaken, powerUpsUsed) => client('/quiz/submit', { body: { sessionId, answers, timeTaken, powerUpsUsed } }),
};
