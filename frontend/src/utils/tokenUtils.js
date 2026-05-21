/**
 * tokenUtils.js
 * Utility functions for managing JWT tokens in localStorage.
 * Centralizing token logic here keeps all other files clean.
 */

const TOKEN_KEY = "restaurant_token";
const USER_KEY = "restaurant_user";

/** Save token to localStorage */
export const saveToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

/** Get token from localStorage */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/** Remove token from localStorage (logout) */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

/** Save user object to localStorage */
export const saveUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/** Get user object from localStorage */
export const getUser = () => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

/** Remove user from localStorage */
export const removeUser = () => {
  localStorage.removeItem(USER_KEY);
};

/** Clear all auth data (token + user) */
export const clearAuth = () => {
  removeToken();
  removeUser();
};

/** Check if a user is currently logged in */
export const isAuthenticated = () => {
  return !!getToken();
};
