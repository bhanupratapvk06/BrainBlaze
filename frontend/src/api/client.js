import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Backend URL ──────────────────────────────────────────────────────────────
// For local development: backend runs on http://localhost:3001
// For production: set this to your Railway/hosted URL, e.g. https://api.brainblaze.app
// NOTE: On a physical device/emulator, replace localhost with your machine's LAN IP
//       e.g. http://192.168.1.100:3001
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

export const client = async (endpoint, { body, method, ...customConfig } = {}) => {
  const token = await AsyncStorage.getItem('jwt_token');
  const headers = { 'Content-Type': 'application/json' };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Determine HTTP method: explicit > body present > GET
  const resolvedMethod = method || (body ? 'POST' : 'GET');

  const config = {
    method: resolvedMethod,
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
    // Preserve server-side error code for better UI handling
    const err = new Error(data.error || response.statusText);
    err.code   = data.code;
    err.status = response.status;
    throw err;
  } catch (err) {
    throw err;
  }
};
