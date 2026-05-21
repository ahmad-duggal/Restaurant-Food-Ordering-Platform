/**
 * Register.jsx
 * Registration page — calls authService.register(), auto-logs in on success.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { register } from "../services/authService";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const { loginUser } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      return setError("Password must be at least 8 characters");
    }
    setLoading(true);
    setError("");
    try {
      const data = await register(form);
      // Auto-login after successful registration
      loginUser(data.token, data.user);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.emoji}>🍽️</span>
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>Join us and start ordering</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Full Name</label>
            <input
              id="register-name"
              type="text"
              name="name"
              placeholder="Ahmad Duggal"
              value={form.name}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email Address</label>
            <input
              id="register-email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              id="register-password"
              type="password"
              name="password"
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button
            id="register-submit"
            type="submit"
            disabled={loading}
            style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{" "}
          <Link to="/login" style={styles.footerLink}>Login</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #0f0f19 0%, #1a1a2e 50%, #16213e 100%)",
    padding: "2rem",
  },
  card: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "16px",
    padding: "2.5rem",
    width: "100%",
    maxWidth: "420px",
    backdropFilter: "blur(20px)",
    boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
  },
  header: { textAlign: "center", marginBottom: "2rem" },
  emoji: { fontSize: "2.5rem" },
  title: { color: "#f1f5f9", fontSize: "1.8rem", fontWeight: "700", margin: "0.5rem 0 0.25rem" },
  subtitle: { color: "#94a3b8", fontSize: "0.9rem", margin: 0 },
  form: { display: "flex", flexDirection: "column", gap: "1.25rem" },
  field: { display: "flex", flexDirection: "column", gap: "0.4rem" },
  label: { color: "#cbd5e1", fontSize: "0.85rem", fontWeight: "600" },
  input: {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "8px",
    padding: "0.75rem 1rem",
    color: "#f1f5f9",
    fontSize: "0.95rem",
    outline: "none",
  },
  error: {
    color: "#ef4444",
    fontSize: "0.85rem",
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.2)",
    borderRadius: "6px",
    padding: "0.6rem 0.8rem",
    margin: 0,
  },
  btn: {
    background: "linear-gradient(135deg, #f97316, #ea580c)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "0.85rem",
    fontSize: "1rem",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "0.5rem",
  },
  footer: { textAlign: "center", color: "#94a3b8", fontSize: "0.85rem", marginTop: "1.5rem" },
  footerLink: { color: "#f97316", fontWeight: "600", textDecoration: "none" },
};

export default Register;
