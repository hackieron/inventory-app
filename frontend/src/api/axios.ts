import axios from 'axios';
import { getToken } from '@/utils/auth';

const API_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000/api';

console.log('API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    const token = await getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(
      'API REQUEST:',
      config.method?.toUpperCase(),
      `${config.baseURL}${config.url}`
    );

    return config;
  },
  (error) => {
    console.error('REQUEST INTERCEPTOR ERROR:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(
      'API RESPONSE:',
      response.status,
      response.config.url
    );

    return response;
  },
  (error) => {
    console.error('API ERROR:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    });

    return Promise.reject(error);
  }
);

export default api;