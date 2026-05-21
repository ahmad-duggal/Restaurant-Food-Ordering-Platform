/**
 * MyOrders.jsx
 * Protected page — shows logged-in user's orders (or all orders for admins).
 * Admins can also update order status inline.
 */

import { useState, useEffect, useCallback } from "react";
import { getOrders, updateOrderStatus } from "../services/orderService";
import { useAuth } from "../context/AuthContext";
import { formatPrice, formatDate, capitalize } from "../utils/formatters";
import { getSocket } from "../api/socket";

const STATUSES = ["pending", "confirmed", "preparing", "delivered", "cancelled"];

const MyOrders = () => {
  const { isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(null);
  const [notification, setNotification] = useState(""); // live toast message

  const fetchOrders = useCallback(async () => {
    try {
      const data = await getOrders();
      setOrders(data.data);
    } catch (err) {
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // 🔴 REAL-TIME: Listen for socket events
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const showToast = (msg) => {
      setNotification(msg);
      setTimeout(() => setNotification(""), 4000);
    };

    if (isAdmin) {
      // Admin: new order placed by any customer
      socket.on("orderPlaced", (data) => {
        showToast(`🔔 ${data.message}`);
        fetchOrders(); // auto-refresh the list
      });
    } else {
      // Customer: their own order status was updated
      socket.on("orderStatusUpdated", (data) => {
        showToast(`📦 ${data.message}`);
        // Update just the affected order in state (no full refetch needed)
        setOrders((prev) =>
          prev.map((o) =>
            o._id === data.orderId
              ? { ...o, status: data.status, isPaid: data.isPaid }
              : o
          )
        );
      });
    }

    // Cleanup listeners on unmount
    return () => {
      socket.off("orderPlaced");
      socket.off("orderStatusUpdated");
    };
  }, [isAdmin, fetchOrders]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      const data = await getOrders();
      setOrders(data.data);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update status.");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <div style={styles.center}><p style={styles.msg}>Loading orders...</p></div>;
  if (error) return <div style={styles.center}><p style={{ ...styles.msg, color: "#ef4444" }}>{error}</p></div>;

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>
        {isAdmin ? "📋 All Orders" : "📦 My Orders"}
      </h1>

      {/* 🔴 Live notification toast */}
      {notification && (
        <div style={styles.toast}>{notification}</div>
      )}

      {orders.length === 0 ? (
        <div style={styles.center}>
          <p style={styles.msg}>No orders found.</p>
        </div>
      ) : (
        <div style={styles.list}>
          {orders.map((order) => (
            <div key={order._id} style={styles.card}>
              {/* Card Header */}
              <div style={styles.cardHeader}>
                <div>
                  <p style={styles.orderId}>Order #{order._id.slice(-8).toUpperCase()}</p>
                  <p style={styles.orderDate}>{formatDate(order.createdAt)}</p>
                </div>
                <div style={styles.headerRight}>
                  <span style={{
                    ...styles.statusBadge,
                    background: `rgba(${statusToRgb(order.status)},0.15)`,
                    color: `rgb(${statusToRgb(order.status)})`,
                    border: `1px solid rgba(${statusToRgb(order.status)},0.3)`,
                  }}>
                    {capitalize(order.status)}
                  </span>
                  {order.isPaid && <span style={styles.paidBadge}>✓ Paid</span>}
                </div>
              </div>

              {/* Customer info (Admin only) */}
              {isAdmin && order.user && (
                <div style={styles.customerRow}>
                  <span style={styles.customerLabel}>Customer:</span>
                  <span style={styles.customerVal}>{order.user.name} — {order.user.email}</span>
                </div>
              )}

              {/* Items */}
              <div style={styles.items}>
                {order.items.map((item, idx) => (
                  <div key={idx} style={styles.itemRow}>
                    <span style={styles.itemName}>{item.food?.name || "Unknown Item"}</span>
                    <span style={styles.itemQty}>× {item.quantity}</span>
                    <span style={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div style={styles.cardFooter}>
                <div>
                  <p style={styles.addressLabel}>📍 {order.deliveryAddress}</p>
                  <p style={styles.paymentLabel}>💳 {capitalize(order.paymentMethod)}</p>
                </div>
                <div style={styles.footerRight}>
                  <p style={styles.total}>{formatPrice(order.totalPrice)}</p>

                  {/* Admin status updater */}
                  {isAdmin && order.status !== "cancelled" && order.status !== "delivered" && (
                    <select
                      id={`status-${order._id}`}
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                      disabled={updating === order._id}
                      style={styles.statusSelect}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{capitalize(s)}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Convert status to RGB color values
const statusToRgb = (status) => {
  const map = {
    pending: "249,115,22",
    confirmed: "59,130,246",
    preparing: "168,85,247",
    delivered: "34,197,94",
    cancelled: "239,68,68",
  };
  return map[status] || "148,163,184";
};

const styles = {
  page: { minHeight: "100vh", background: "linear-gradient(135deg, #0f0f19 0%, #1a1a2e 100%)", padding: "2rem" },
  title: { color: "#f1f5f9", fontSize: "2rem", fontWeight: "800", textAlign: "center", marginBottom: "2rem" },
  toast: {
    position: "fixed", top: "80px", right: "20px", zIndex: 999,
    background: "linear-gradient(135deg, #1e293b, #0f172a)",
    border: "1px solid rgba(249,115,22,0.4)",
    color: "#f97316", fontWeight: "700", fontSize: "0.9rem",
    padding: "0.85rem 1.25rem", borderRadius: "12px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
    animation: "fadeIn 0.3s ease",
  },
  list: { display: "flex", flexDirection: "column", gap: "1.25rem", maxWidth: "860px", margin: "0 auto" },
  card: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "1.5rem" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" },
  orderId: { color: "#f1f5f9", fontWeight: "700", fontSize: "0.95rem", margin: 0 },
  orderDate: { color: "#64748b", fontSize: "0.8rem", margin: "0.2rem 0 0" },
  headerRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.4rem" },
  statusBadge: { fontSize: "0.75rem", fontWeight: "700", padding: "0.25rem 0.7rem", borderRadius: "50px" },
  paidBadge: { background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)", fontSize: "0.7rem", fontWeight: "700", padding: "0.2rem 0.6rem", borderRadius: "50px" },
  customerRow: { display: "flex", gap: "0.5rem", marginBottom: "0.75rem", padding: "0.5rem", background: "rgba(255,255,255,0.03)", borderRadius: "8px" },
  customerLabel: { color: "#64748b", fontSize: "0.8rem" },
  customerVal: { color: "#94a3b8", fontSize: "0.8rem", fontWeight: "600" },
  items: { display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "1rem", padding: "0.75rem", background: "rgba(255,255,255,0.02)", borderRadius: "8px" },
  itemRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  itemName: { color: "#e2e8f0", fontSize: "0.85rem", flex: 1 },
  itemQty: { color: "#94a3b8", fontSize: "0.8rem", minWidth: "40px", textAlign: "center" },
  itemPrice: { color: "#f97316", fontWeight: "700", fontSize: "0.85rem" },
  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1rem", marginTop: "0.5rem" },
  addressLabel: { color: "#64748b", fontSize: "0.8rem", margin: "0 0 0.25rem" },
  paymentLabel: { color: "#64748b", fontSize: "0.8rem", margin: 0 },
  footerRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" },
  total: { color: "#f97316", fontWeight: "800", fontSize: "1.1rem", margin: 0 },
  statusSelect: { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", color: "#f1f5f9", borderRadius: "6px", padding: "0.4rem 0.6rem", fontSize: "0.8rem", cursor: "pointer", outline: "none" },
  center: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" },
  msg: { color: "#94a3b8", fontSize: "1.1rem" },
};

export default MyOrders;
