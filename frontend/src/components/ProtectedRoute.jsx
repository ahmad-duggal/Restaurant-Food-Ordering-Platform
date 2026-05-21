/**
 * ProtectedRoute.jsx
 * Guards private pages from unauthenticated access.
 *
 * Usage:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/orders" element={<MyOrders />} />
 *   </Route>
 *
 *   <Route element={<ProtectedRoute adminOnly />}>
 *     <Route path="/admin" element={<AdminPanel />} />
 *   </Route>
 */

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  // Wait until auth state is restored from localStorage
  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <p style={{ color: "#fff", fontSize: "1.2rem" }}>Loading...</p>
      </div>
    );
  }

  // Not logged in → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Admin-only route accessed by non-admin → redirect to menu
  if (adminOnly && !isAdmin) {
    return <Navigate to="/menu" replace />;
  }

  // All checks passed → render the child route
  return <Outlet />;
};

export default ProtectedRoute;
