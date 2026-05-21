/**
 * axios.js
 * Pre-configured Axios instance for all API calls.
 *
 * Features:
 * - baseURL set to backend API
 * - Request interceptor: auto-attaches JWT token from localStorage
 * - Response interceptor: handles 401 (token expired → auto logout)
 */

import axios from "axios";
import { getToken, clearAuth } from "../utils/tokenUtils";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── REQUEST INTERCEPTOR ─────────────────────────────────────────────────────
// Automatically attach the JWT token to every outgoing request
API.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── RESPONSE INTERCEPTOR ────────────────────────────────────────────────────
// If the server returns 401 (token expired / invalid), clear auth and redirect
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;
