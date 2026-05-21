/**
 * Menu.jsx
 * Public page — displays all food items from the backend.
 * Uses foodService.getAllFood() via the Axios instance.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllFood } from "../services/foodService";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../utils/formatters";

const CATEGORIES = ["All", "appetizer", "Main Course", "Dessert", "Beverages"];

const Menu = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [foods, setFoods] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFood = async () => {
      try {
        const data = await getAllFood();
        setFoods(data.data);
        setFiltered(data.data);
      } catch (err) {
        setError("Failed to load menu. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchFood();
  }, []);

  const filterByCategory = (category) => {
    setActiveCategory(category);
    if (category === "All") {
      setFiltered(foods);
    } else {
      setFiltered(foods.filter((f) => f.category === category));
    }
  };

  const handleOrder = (food) => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      navigate("/place-order", { state: { selectedFood: food } });
    }
  };

  if (loading) return <div style={styles.center}><p style={styles.msg}>Loading menu...</p></div>;
  if (error) return <div style={styles.center}><p style={{ ...styles.msg, color: "#ef4444" }}>{error}</p></div>;

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Our Menu 🍽️</h1>
        <p style={styles.heroSub}>Fresh, delicious food delivered to your door</p>
      </div>

      {/* Category Filter */}
      <div style={styles.filters}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            id={`filter-${cat}`}
            onClick={() => filterByCategory(cat)}
            style={{
              ...styles.filterBtn,
              ...(activeCategory === cat ? styles.filterBtnActive : {}),
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Food Grid */}
      {filtered.length === 0 ? (
        <div style={styles.center}>
          <p style={styles.msg}>No items in this category.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {filtered.map((food) => (
            <div key={food._id} style={styles.card}>
              <div style={styles.cardBadge}>{food.category}</div>
              <div style={styles.cardEmoji}>🍲</div>
              <h3 style={styles.cardName}>{food.name}</h3>
              <p style={styles.cardDesc}>{food.description || "A delicious menu item"}</p>
              <div style={styles.cardFooter}>
                <span style={styles.price}>{formatPrice(food.price)}</span>
                <button
                  id={`order-${food._id}`}
                  onClick={() => handleOrder(food)}
                  style={{
                    ...styles.orderBtn,
                    ...(food.isavailable ? {} : styles.orderBtnDisabled),
                  }}
                  disabled={!food.isavailable}
                >
                  {food.isavailable ? "Order Now" : "Unavailable"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f0f19 0%, #1a1a2e 100%)",
    padding: "2rem",
  },
  hero: { textAlign: "center", padding: "3rem 0 2rem" },
  heroTitle: { color: "#f1f5f9", fontSize: "2.5rem", fontWeight: "800", margin: 0 },
  heroSub: { color: "#94a3b8", fontSize: "1rem", marginTop: "0.5rem" },
  filters: { display: "flex", justifyContent: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "2.5rem" },
  filterBtn: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#94a3b8",
    padding: "0.5rem 1.2rem",
    borderRadius: "50px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "500",
    transition: "all 0.2s",
  },
  filterBtnActive: {
    background: "linear-gradient(135deg, #f97316, #ea580c)",
    border: "1px solid transparent",
    color: "#fff",
    fontWeight: "700",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "1.5rem",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  card: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "1.5rem",
    position: "relative",
    transition: "transform 0.2s, border-color 0.2s",
  },
  cardBadge: {
    position: "absolute",
    top: "1rem",
    right: "1rem",
    background: "rgba(249,115,22,0.15)",
    color: "#f97316",
    fontSize: "0.7rem",
    fontWeight: "700",
    padding: "0.2rem 0.6rem",
    borderRadius: "50px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  cardEmoji: { fontSize: "2.5rem", marginBottom: "0.75rem" },
  cardName: { color: "#f1f5f9", fontSize: "1.1rem", fontWeight: "700", margin: "0 0 0.5rem" },
  cardDesc: { color: "#64748b", fontSize: "0.85rem", margin: "0 0 1.25rem", lineHeight: "1.5" },
  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  price: { color: "#f97316", fontWeight: "800", fontSize: "1.1rem" },
  orderBtn: {
    background: "linear-gradient(135deg, #f97316, #ea580c)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "0.5rem 1rem",
    fontSize: "0.85rem",
    fontWeight: "700",
    cursor: "pointer",
  },
  orderBtnDisabled: {
    background: "rgba(100,116,139,0.2)",
    color: "#64748b",
    cursor: "not-allowed",
  },
  center: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" },
  msg: { color: "#94a3b8", fontSize: "1.1rem" },
};

export default Menu;
