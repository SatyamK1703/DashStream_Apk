// src/services/apiService.ts

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, APP_CONFIG } from '../constants/config';

class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    // Create axios instance
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      async (config) => {
        // Get token if not already loaded
        if (!this.token) {
          this.token = await AsyncStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        }

        // Add auth token to headers if available
        if (this.token && config.headers) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        // Handle token expiration
        if (error.response?.status === 401) {
          // Clear token and user data
          await AsyncStorage.multiRemove([
            APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN,
            APP_CONFIG.STORAGE_KEYS.USER_DATA,
          ]);
          this.token = null;
          
          // You might want to redirect to login screen here
          // or use an event emitter to notify the app
        }
        
        return Promise.reject(error);
      }
    );
  }

  /**
   * Set authentication token
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * Clear authentication token
   */
  clearToken(): void {
    this.token = null;
  }

  /**
   * Make a GET request
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.get(url, config);
    return response.data;
  }

  /**
   * Make a POST request
   */
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.post(url, data, config);
    return response.data;
  }

  /**
   * Make a PUT request
   */
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.put(url, data, config);
    return response.data;
  }

  /**
   * Make a PATCH request
   */
  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.patch(url, data, config);
    return response.data;
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.delete(url, config);
    return response.data;
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;