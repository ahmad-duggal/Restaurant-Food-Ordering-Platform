/**
 * orderService.js
 * Handles all API calls related to orders.
 */

import API from "../api/axios";

/**
 * Place a new order (logged-in users)
 * @param {{ items, deliveryAddress, paymentMethod }} orderData
 */
export const placeOrder = async (orderData) => {
  const response = await API.post("/orders", orderData);
  return response.data;
};

/**
 * Get orders:
 * - Customer: returns only their own orders
 * - Admin: returns all orders
 */
export const getOrders = async () => {
  const response = await API.get("/orders");
  return response.data;
};

/**
 * Update order status (Admin only)
 * @param {string} id - order ID
 * @param {string} status - new status
 */
export const updateOrderStatus = async (id, status) => {
  const response = await API.put(`/orders/${id}`, { status });
  return response.data;
};
