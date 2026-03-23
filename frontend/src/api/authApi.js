import { client } from './client';

export const authApi = {
  login: (name, studentClass) => client('/auth/login', { body: { name, class: studentClass } }),
};
