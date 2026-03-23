import { client } from './client';

export const leaderboardApi = {
  getGlobal: () => client('/leaderboard/global'),
  getSubject: (subjectId) => client(`/leaderboard/subject/${subjectId}`),
  getChapter: (chapterId) => client(`/leaderboard/chapter/${chapterId}`),
};
