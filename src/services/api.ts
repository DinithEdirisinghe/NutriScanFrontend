import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse, LoginCredentials, User, ProfileUpdatePayload } from '../types';
import { API_BASE_URL } from '../config';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add token to requests automatically if it exists
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration and network errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  // Register a new user
  register: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', credentials);
    return response.data;
  },

  // Login existing user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },
};

// User profile API calls
export const userAPI = {
  // Get current user's profile
  getProfile: async (): Promise<User> => {
    const response = await api.get<User>('/user/profile');
    return response.data;
  },

  // Update user's health profile
  updateProfile: async (data: ProfileUpdatePayload): Promise<User> => {
    const response = await api.put<{ message: string; user: User }>('/user/profile', data);
    return response.data.user;
  },
};

// Scan API call (Phase 3 - placeholder for now)
export const scanAPI = {
  // Upload image and get nutrition score
  scanImage: async (imageBase64: string): Promise<any> => {
    const response = await api.post('/scan', { image: imageBase64 });
    return response.data;
  },
};

export default api;
