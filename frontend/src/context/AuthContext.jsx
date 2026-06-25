/**
 * AuthContext.jsx
 * Global authentication state provider.
 *
 * Provides:
 * - user       → current logged-in user object (or null)
 * - token      → JWT token (or null)
 * - isAdmin    → boolean shortcut for role check
 * - loading    → true while checking initial auth state
 * - loginUser  → call after successful login API response
 * - logoutUser → clears token + user, redirects to /login
 */

import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getToken,
  getUser,
  saveToken,
  saveUser,
  clearAuth,
} from "../utils/tokenUtils";
import { connectSocket, disconnectSocket } from "../api/socket";

// Create the context
const AuthContext = createContext(null);

// Provider component — wrap your entire app with this
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // On app load: restore session from localStorage
  useEffect(() => {
    const savedToken = getToken();
    const savedUser = getUser();
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);
      // Re-connect socket on page refresh (session restore)
      connectSocket(savedUser._id || savedUser.id, savedUser.role);
    }
    setLoading(false);
  }, []);

  /**
   * Call this after a successful login/register API response
   * @param {string} token - JWT from backend
   * @param {object} userData - user object from backend
   */
  const loginUser = (token, userData) => {
    saveToken(token);
    saveUser(userData);
    setToken(token);
    setUser(userData);
    
    // Connect socket and join user/admin room
    connectSocket(userData._id || userData.id, userData.role);
    
    // Role-based redirection logic
    if (userData.role === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/menu");
    }
  };

  /**
   * Clears all auth state and redirects to login
   */
  const logoutUser = () => {
    clearAuth();
    setToken(null);
    setUser(null);
    // Disconnect socket on logout
    disconnectSocket();
    navigate("/login");
  };

  const value = {
    user,
    token,
    loading,
    isAdmin: user?.role === "admin",
    isAuthenticated: !!token,
    loginUser,
    logoutUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook for consuming auth context
 * Usage: const { user, loginUser, logoutUser, isAdmin } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
};

export default AuthContext;
