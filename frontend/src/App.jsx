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
import AdminRoute from "./components/AdminRoute";
import CustomerRoute from "./components/CustomerRoute";

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
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

        {/* CUSTOMER ONLY ROUTES */}
        <Route element={<CustomerRoute />}>
          <Route path="/menu" element={<Menu />} />
          <Route path="/cart" element={<PlaceOrder />} />
          <Route path="/orders" element={<MyOrders />} />
        </Route>

        {/* ADMIN ONLY ROUTES */}
        <Route element={<AdminRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/foods" element={<AdminDashboard />} /> {/* Mapped to same dashboard for now */}
          <Route path="/admin/orders" element={<MyOrders adminView={true} />} /> {/* Using existing MyOrders for now */}
        </Route>

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/menu" replace />} />
      </Routes>
    </>
  );
};

export default App;
