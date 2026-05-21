/**
 * authService.js
 * Handles all API calls related to authentication.
 * UI components never call Axios directly — they go through services.
 */

import API from "../api/axios";

/**
 * Register a new user
 * @param {{ name, email, password }} userData
 */
export const register = async (userData) => {
  const response = await API.post("/auth/register", userData);
  return response.data;
};

/**
 * Login an existing user
 * @param {{ email, password }} credentials
 */
export const login = async (credentials) => {
  const response = await API.post("/auth/login", credentials);
  return response.data;
};

/**
 * Get the currently logged-in user's profile
 */
export const getProfile = async () => {
  const response = await API.get("/auth/me");
  return response.data;
};
