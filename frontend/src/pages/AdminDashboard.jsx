import { useState, useEffect, useCallback } from "react";
import { addFood, getAllFood, deleteFood, updateFood } from "../services/foodService";
import { formatPrice } from "../utils/formatters";

const CATEGORIES = ["appetizer", "Main Course", "Dessert", "Beverages"];

const AdminDashboard = () => {
  // Food List State
  const [foods, setFoods] = useState([]);
  const [fetching, setFetching] = useState(true);

  // Form State
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "Main Course",
    imageUrl: "",
    isavailable: true,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [editingId, setEditingId] = useState(null); // Track if editing

  // Fetch foods
  const fetchFoods = useCallback(async () => {
    try {
      setFetching(true);
      const data = await getAllFood();
      setFoods(data.data);
    } catch (err) {
      console.error("Failed to load foods", err);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchFoods();
  }, [fetchFoods]);

  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleAddOrUpdateFood = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (form.price <= 0) {
      setMessage({ type: "error", text: "Price must be a positive number." });
      return;
    }

    try {
      setLoading(true);
      
      if (editingId) {
        // Update existing food
        await updateFood(editingId, { ...form, price: Number(form.price) });
        setMessage({ type: "success", text: "Food item updated successfully!" });
      } else {
        // Add new food
        await addFood({ ...form, price: Number(form.price) });
        setMessage({ type: "success", text: "Food item added successfully!" });
      }

      setForm({ name: "", description: "", price: "", category: "Main Course", imageUrl: "", isavailable: true });
      setEditingId(null);
      await fetchFoods(); // Refresh table
      
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.error || "Failed to save food item." });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (food) => {
    setEditingId(food._id);
    setForm({
      name: food.name,
      description: food.description || "",
      price: food.price,
      category: food.category,
      imageUrl: food.imageUrl || "",
      isavailable: food.isavailable,
    });
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll up to the form
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Are you sure you want to delete this food item?")) return;
    try {
      await deleteFood(id);
      await fetchFoods(); // Refresh table
    } catch (err) {
      alert("Failed to delete food item.");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: "", description: "", price: "", category: "Main Course", imageUrl: "", isavailable: true });
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>🛠️ Admin Dashboard</h1>
      <p style={styles.subtitle}>Welcome, Admin! Here you will be able to manage food items.</p>

      <div style={styles.container}>
        {/* TOP: FORM */}
        <div style={styles.card}>
          <div style={styles.cardHeaderFlex}>
            <h2 style={styles.cardTitle}>{editingId ? "✏️ Edit Food Item" : "➕ Add New Food Item"}</h2>
            {editingId && <button onClick={cancelEdit} style={styles.cancelBtn}>Cancel Edit</button>}
          </div>
          
          {message.text && (
            <div style={{ ...styles.alert, backgroundColor: message.type === "success" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", color: message.type === "success" ? "#22c55e" : "#ef4444", border: `1px solid ${message.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}` }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleAddOrUpdateFood} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Food Name *</label>
              <input type="text" name="name" required value={form.name} onChange={handleChange} style={styles.input} placeholder="e.g., Zinger Burger" />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <input type="text" name="description" value={form.description} onChange={handleChange} style={styles.input} placeholder="e.g., Crispy chicken with double cheese" />
            </div>

            <div style={styles.row}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Price (PKR) *</label>
                <input type="number" name="price" required min="1" value={form.price} onChange={handleChange} style={styles.input} placeholder="e.g., 450" />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Category *</label>
                <select name="category" value={form.category} onChange={handleChange} style={styles.select}>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Image URL</label>
              <input type="url" name="imageUrl" value={form.imageUrl} onChange={handleChange} style={styles.input} placeholder="https://example.com/image.jpg" />
            </div>

            <div style={styles.checkboxGroup}>
              <input type="checkbox" name="isavailable" id="isavailable" checked={form.isavailable} onChange={handleChange} style={styles.checkbox} />
              <label htmlFor="isavailable" style={styles.checkboxLabel}>Available for Ordering</label>
            </div>

            <button type="submit" disabled={loading} style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}>
              {loading ? "Saving..." : editingId ? "Update Food Item" : "Add Food Item"}
            </button>
          </form>
        </div>

        {/* BOTTOM: TABLE */}
        <div style={{ ...styles.card, marginTop: "2rem" }}>
          <h2 style={styles.cardTitle}>📋 Food Management</h2>
          
          {fetching ? (
            <p style={styles.loadingText}>Loading foods...</p>
          ) : foods.length === 0 ? (
            <p style={styles.loadingText}>No food items found. Add some above!</p>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Price</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Created</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {foods.map(food => (
                    <tr key={food._id} style={styles.tr}>
                      <td style={styles.td}><strong>{food.name}</strong></td>
                      <td style={styles.td}>{food.category}</td>
                      <td style={styles.td}>{formatPrice(food.price)}</td>
                      <td style={styles.td}>
                        <span style={food.isavailable ? styles.badgeAvailable : styles.badgeUnavailable}>
                          {food.isavailable ? "Available" : "Hidden"}
                        </span>
                      </td>
                      <td style={styles.td}>{new Date(food.createdAt).toLocaleDateString()}</td>
                      <td style={styles.td}>
                        <div style={styles.actionBtns}>
                          <button onClick={() => handleEditClick(food)} style={styles.editBtn}>Edit</button>
                          <button onClick={() => handleDeleteClick(food._id)} style={styles.deleteBtn}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: "100vh", background: "linear-gradient(135deg, #0f0f19 0%, #1a1a2e 100%)", padding: "2rem" },
  title: { color: "#f1f5f9", fontSize: "2rem", fontWeight: "800", textAlign: "center", marginBottom: "0.5rem" },
  subtitle: { color: "#94a3b8", textAlign: "center", fontSize: "1rem", marginBottom: "2.5rem" },
  container: { maxWidth: "1000px", margin: "0 auto" },
  card: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "2rem" },
  cardHeaderFlex: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  cardTitle: { color: "#f1f5f9", fontSize: "1.25rem", fontWeight: "700", margin: 0 },
  cancelBtn: { background: "rgba(255,255,255,0.1)", color: "#f1f5f9", border: "none", padding: "0.4rem 0.8rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem" },
  form: { display: "flex", flexDirection: "column", gap: "1.25rem" },
  row: { display: "flex", gap: "1rem" },
  formGroup: { display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 },
  label: { color: "#cbd5e1", fontSize: "0.85rem", fontWeight: "600" },
  input: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "0.75rem 1rem", color: "#f1f5f9", fontSize: "0.95rem", outline: "none" },
  select: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "0.75rem 1rem", color: "#f1f5f9", fontSize: "0.95rem", outline: "none", cursor: "pointer" },
  checkboxGroup: { display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.5rem" },
  checkbox: { width: "18px", height: "18px", cursor: "pointer" },
  checkboxLabel: { color: "#e2e8f0", fontSize: "0.9rem", cursor: "pointer" },
  submitBtn: { background: "linear-gradient(135deg, #f97316, #ea580c)", color: "#fff", border: "none", borderRadius: "8px", padding: "0.85rem", fontSize: "1rem", fontWeight: "700", cursor: "pointer", marginTop: "1rem" },
  alert: { padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem", fontSize: "0.9rem", fontWeight: "500", textAlign: "center" },
  
  // Table Styles
  loadingText: { color: "#94a3b8", textAlign: "center", padding: "2rem" },
  tableWrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "600px" },
  th: { textAlign: "left", padding: "1rem", color: "#94a3b8", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px", borderBottom: "1px solid rgba(255,255,255,0.1)" },
  tr: { borderBottom: "1px solid rgba(255,255,255,0.05)" },
  td: { padding: "1rem", color: "#e2e8f0", fontSize: "0.95rem" },
  badgeAvailable: { background: "rgba(34,197,94,0.15)", color: "#22c55e", padding: "0.25rem 0.6rem", borderRadius: "50px", fontSize: "0.75rem", fontWeight: "700" },
  badgeUnavailable: { background: "rgba(100,116,139,0.2)", color: "#94a3b8", padding: "0.25rem 0.6rem", borderRadius: "50px", fontSize: "0.75rem", fontWeight: "700" },
  actionBtns: { display: "flex", gap: "0.5rem" },
  editBtn: { background: "rgba(59,130,246,0.15)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.3)", padding: "0.4rem 0.8rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600" },
  deleteBtn: { background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", padding: "0.4rem 0.8rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600" },
};

export default AdminDashboard;
