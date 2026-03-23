/**
 * v1Api — 直接调用后端 /api/v1 端点的 axios 实例
 * 用于新功能（物流/评价/售后/AI/衣物捐献），这些端点不在 /api/admin 命名空间下
 */
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const v1Api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 15000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

v1Api.interceptors.request.use((config) => {
  // Admin token is managed via httpOnly cookies; withCredentials: true handles it.
  // Add Authorization header from sessionStorage if present (for cases where cookie is not used).
  const tokenKey = 'tonghua-admin-token';
  const token = sessionStorage.getItem(tokenKey) || localStorage.getItem(tokenKey);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

v1Api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(err);
  }
);

export default v1Api;
