import { client } from './client';

export const notesApi = {
  getNotes: (chapterId) => client(`/notes/chapter/${chapterId}`),
};
