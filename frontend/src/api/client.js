import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://api.eduquest.app/api';

export const client = async (endpoint, { body, ...customConfig } = {}) => {
  const token = await AsyncStorage.getItem('jwt_token');
  const headers = { 'Content-Type': 'application/json' };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json();
    if (response.ok) {
      return data;
    }
    throw new Error(data.error || response.statusText);
  } catch (err) {
    throw err;
  }
};
