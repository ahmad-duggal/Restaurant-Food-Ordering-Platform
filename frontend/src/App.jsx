/**
 * App.jsx
 * Root routing configuration.
 *
 * Route structure:
 *   /              → redirect to /menu
 *   /menu          → Menu (public)
 *   /login         → Login (public, redirects if already logged in)
 *   /register      → Register (public)
 *   /place-order   → PlaceOrder (protected: any logged-in user)
 *   /orders        → MyOrders (protected: any logged-in user)
 */

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Menu from "./pages/Menu";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PlaceOrder from "./pages/PlaceOrder";
import MyOrders from "./pages/MyOrders";
import AdminDashboard from "./pages/AdminDashboard";

// Redirect logged-in users away from auth pages
const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/menu" replace /> : children;
};

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Default → Menu */}
        <Route path="/" element={<Navigate to="/menu" replace />} />

        {/* Public routes */}
        <Route path="/menu" element={<Menu />} />
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

        {/* Protected routes — any logged-in user */}
        <Route element={<ProtectedRoute />}>
          <Route path="/place-order" element={<PlaceOrder />} />
          <Route path="/orders" element={<MyOrders />} />
        </Route>

        {/* Protected routes — Admin only */}
        <Route element={<ProtectedRoute adminOnly />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/menu" replace />} />
      </Routes>
    </>
  );
};

export default App;
