import { client } from './client';

export const profileApi = {
  getStats: () => client('/profile/stats'),
  getHeatmap: () => client('/profile/heatmap'),
  getAchievements: () => client('/profile/achievements'),
};
