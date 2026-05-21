/**
 * PlaceOrder.jsx
 * Protected page — lets logged-in users place an order.
 * Pre-fills with selected food if navigated from Menu page.
 */

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAllFood } from "../services/foodService";
import { placeOrder } from "../services/orderService";
import { formatPrice } from "../utils/formatters";

const PlaceOrder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const preSelected = location.state?.selectedFood;

  const [foods, setFoods] = useState([]);
  const [cart, setCart] = useState(preSelected ? [{ food: preSelected, quantity: 1 }] : []);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const data = await getAllFood();
        setFoods(data.data.filter((f) => f.isavailable));
      } catch {
        setError("Could not load food items.");
      } finally {
        setFetchLoading(false);
      }
    };
    fetchFoods();
  }, []);

  const addToCart = (food) => {
    const existing = cart.find((c) => c.food._id === food._id);
    if (existing) {
      setCart(cart.map((c) =>
        c.food._id === food._id ? { ...c, quantity: c.quantity + 1 } : c
      ));
    } else {
      setCart([...cart, { food, quantity: 1 }]);
    }
  };

  const removeFromCart = (foodId) => {
    setCart(cart.filter((c) => c.food._id !== foodId));
  };

  const updateQty = (foodId, qty) => {
    if (qty < 1) return removeFromCart(foodId);
    setCart(cart.map((c) => c.food._id === foodId ? { ...c, quantity: qty } : c));
  };

  const totalPrice = cart.reduce((sum, c) => sum + c.food.price * c.quantity, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return setError("Add at least one item to your order.");
    if (!deliveryAddress.trim()) return setError("Delivery address is required.");

    setLoading(true);
    setError("");
    try {
      const orderData = {
        items: cart.map((c) => ({ food: c.food._id, quantity: c.quantity })),
        deliveryAddress,
        paymentMethod,
      };
      await placeOrder(orderData);
      setSuccess("🎉 Order placed successfully!");
      setTimeout(() => navigate("/orders"), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to place order.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <div style={styles.center}><p style={styles.msg}>Loading...</p></div>;

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>🛒 Place Your Order</h1>

      <div style={styles.layout}>
        {/* Food Selector */}
        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>Add Items</h2>
          <div style={styles.foodList}>
            {foods.map((food) => (
              <div key={food._id} style={styles.foodRow}>
                <div>
                  <p style={styles.foodName}>{food.name}</p>
                  <p style={styles.foodPrice}>{formatPrice(food.price)}</p>
                </div>
                <button
                  id={`add-${food._id}`}
                  onClick={() => addToCart(food)}
                  style={styles.addBtn}
                >
                  + Add
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>Order Summary</h2>

          {cart.length === 0 ? (
            <p style={styles.emptyMsg}>No items added yet.</p>
          ) : (
            <div style={styles.cartList}>
              {cart.map(({ food, quantity }) => (
                <div key={food._id} style={styles.cartRow}>
                  <span style={styles.cartName}>{food.name}</span>
                  <div style={styles.qtyControls}>
                    <button onClick={() => updateQty(food._id, quantity - 1)} style={styles.qtyBtn}>−</button>
                    <span style={styles.qtyNum}>{quantity}</span>
                    <button onClick={() => updateQty(food._id, quantity + 1)} style={styles.qtyBtn}>+</button>
                  </div>
                  <span style={styles.cartPrice}>{formatPrice(food.price * quantity)}</span>
                  <button onClick={() => removeFromCart(food._id)} style={styles.removeBtn}>✕</button>
                </div>
              ))}
              <div style={styles.totalRow}>
                <span style={styles.totalLabel}>Total</span>
                <span style={styles.totalPrice}>{formatPrice(totalPrice)}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Delivery Address</label>
              <input
                id="delivery-address"
                type="text"
                placeholder="123 Main Street, Lahore"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Payment Method</label>
              <select
                id="payment-method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={styles.select}
              >
                <option value="cash">Cash on Delivery</option>
                <option value="card">Card</option>
                <option value="online">Online</option>
              </select>
            </div>

            {error && <p style={styles.error}>{error}</p>}
            {success && <p style={styles.successMsg}>{success}</p>}

            <button
              id="place-order-submit"
              type="submit"
              disabled={loading}
              style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Placing Order..." : `Place Order — ${formatPrice(totalPrice)}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: "100vh", background: "linear-gradient(135deg, #0f0f19 0%, #1a1a2e 100%)", padding: "2rem" },
  title: { color: "#f1f5f9", fontSize: "2rem", fontWeight: "800", textAlign: "center", marginBottom: "2rem" },
  layout: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", maxWidth: "1100px", margin: "0 auto" },
  panel: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "1.5rem" },
  panelTitle: { color: "#f1f5f9", fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem", marginTop: 0 },
  foodList: { display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "400px", overflowY: "auto" },
  foodRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", background: "rgba(255,255,255,0.03)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)" },
  foodName: { color: "#e2e8f0", fontWeight: "600", margin: 0, fontSize: "0.9rem" },
  foodPrice: { color: "#f97316", fontWeight: "700", margin: "0.2rem 0 0", fontSize: "0.85rem" },
  addBtn: { background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.3)", color: "#f97316", padding: "0.4rem 0.8rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "700" },
  cartList: { display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.5rem" },
  cartRow: { display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  cartName: { color: "#e2e8f0", fontSize: "0.85rem", flex: 1 },
  qtyControls: { display: "flex", alignItems: "center", gap: "0.4rem" },
  qtyBtn: { background: "rgba(255,255,255,0.08)", border: "none", color: "#fff", width: "24px", height: "24px", borderRadius: "4px", cursor: "pointer", fontWeight: "700", fontSize: "0.9rem" },
  qtyNum: { color: "#f1f5f9", fontWeight: "700", minWidth: "20px", textAlign: "center" },
  cartPrice: { color: "#f97316", fontWeight: "700", fontSize: "0.85rem", minWidth: "80px", textAlign: "right" },
  removeBtn: { background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "0.8rem" },
  totalRow: { display: "flex", justifyContent: "space-between", padding: "0.75rem 0", marginTop: "0.5rem" },
  totalLabel: { color: "#f1f5f9", fontWeight: "700", fontSize: "1rem" },
  totalPrice: { color: "#f97316", fontWeight: "800", fontSize: "1.1rem" },
  form: { display: "flex", flexDirection: "column", gap: "1rem" },
  field: { display: "flex", flexDirection: "column", gap: "0.4rem" },
  label: { color: "#cbd5e1", fontSize: "0.8rem", fontWeight: "600" },
  input: { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", padding: "0.65rem 0.9rem", color: "#f1f5f9", fontSize: "0.9rem", outline: "none" },
  select: { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", padding: "0.65rem 0.9rem", color: "#f1f5f9", fontSize: "0.9rem", outline: "none" },
  error: { color: "#ef4444", fontSize: "0.8rem", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "6px", padding: "0.5rem 0.75rem", margin: 0 },
  successMsg: { color: "#22c55e", fontSize: "0.9rem", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "6px", padding: "0.5rem 0.75rem", margin: 0 },
  submitBtn: { background: "linear-gradient(135deg, #f97316, #ea580c)", color: "#fff", border: "none", borderRadius: "8px", padding: "0.85rem", fontSize: "0.95rem", fontWeight: "700", cursor: "pointer" },
  emptyMsg: { color: "#64748b", fontSize: "0.9rem", textAlign: "center", padding: "2rem 0" },
  center: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" },
  msg: { color: "#94a3b8", fontSize: "1.1rem" },
};

export default PlaceOrder;
