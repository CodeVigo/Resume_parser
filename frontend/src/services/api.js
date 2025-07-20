// src/services/api.js

import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await api.post("/auth/refresh");
        return api(originalRequest);
      } catch (refreshError) {
        // Redirect to login if refresh fails
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ——— PROFILE ENDPOINT HELPERS ———

/**
 * Fetch the current user's profile.
 * GET /api/profile
 * Returns: { user: { _id, name, email, ... } }
 */
export const getProfile = () => api.get("/profile");

/**
 * Update the current user's profile.
 * PUT /api/profile
 * Body: { name, email }
 * Returns: { success: boolean, user: {...updatedUser} }
 */
export const updateProfile = (data) => api.put("/profile", data);

// ——— DEFAULT EXPORT ———

export default api;
