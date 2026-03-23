import { client } from './client';

export const mistakeBankApi = {
  getItems: (subjectId) => client(`/mistakes/subject/${subjectId}`),
  removeItem: (itemId) => client(`/mistakes/${itemId}`, { method: 'DELETE' }),
};
