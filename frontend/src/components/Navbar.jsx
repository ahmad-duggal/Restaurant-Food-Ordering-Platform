/**
 * Navbar.jsx
 * Shared top navigation bar shown on all pages.
 * Shows different links based on auth state and role.
 */

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { isAuthenticated, isAdmin, user, logoutUser } = useAuth();
  const navigate = useNavigate();

  return (
    <nav style={styles.nav}>
      <Link to="/menu" style={styles.brand}>
        🍽️ FoodApp
      </Link>

      <div style={styles.links}>
        <Link to="/menu" style={styles.link}>Menu</Link>

        {isAuthenticated ? (
          <>
            <Link to="/orders" style={styles.link}>My Orders</Link>
            {isAdmin && (
              <Link to="/place-order" style={styles.link}>Add Food</Link>
            )}
            {!isAdmin && (
              <Link to="/place-order" style={styles.link}>Place Order</Link>
            )}
            <span style={styles.userLabel}>👤 {user?.name}</span>
            <button onClick={logoutUser} style={styles.logoutBtn}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.registerBtn}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 2rem",
    background: "rgba(15, 15, 25, 0.95)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  brand: {
    fontSize: "1.4rem",
    fontWeight: "700",
    color: "#f97316",
    textDecoration: "none",
    letterSpacing: "-0.5px",
  },
  links: {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
  },
  link: {
    color: "#cbd5e1",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: "500",
    transition: "color 0.2s",
  },
  userLabel: {
    color: "#94a3b8",
    fontSize: "0.85rem",
  },
  logoutBtn: {
    background: "rgba(239,68,68,0.15)",
    border: "1px solid rgba(239,68,68,0.3)",
    color: "#ef4444",
    padding: "0.4rem 1rem",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "600",
    transition: "all 0.2s",
  },
  registerBtn: {
    background: "linear-gradient(135deg, #f97316, #ea580c)",
    color: "#fff",
    textDecoration: "none",
    padding: "0.45rem 1.1rem",
    borderRadius: "6px",
    fontSize: "0.85rem",
    fontWeight: "600",
  },
};

export default Navbar;
