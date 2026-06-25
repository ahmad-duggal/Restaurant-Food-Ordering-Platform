import { useEffect, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = () => {
  const { isAdmin, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showDenied, setShowDenied] = useState(false);

  useEffect(() => {
    // If not loading, and user is authenticated but NOT an admin
    if (!loading && isAuthenticated && !isAdmin) {
      setShowDenied(true);
      const timer = setTimeout(() => {
        navigate("/menu", { replace: true });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [loading, isAuthenticated, isAdmin, navigate]);

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If customer tries to access admin page: Show "Access Denied"
  if (showDenied) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#0f0f19" }}>
        <h2 style={{ color: "#ef4444" }}>🚫 Access Denied! Redirecting to menu...</h2>
      </div>
    );
  }

  // Wait for the effect to trigger if not admin
  if (!isAdmin) return null;

  return <Outlet />;
};

export default AdminRoute;
