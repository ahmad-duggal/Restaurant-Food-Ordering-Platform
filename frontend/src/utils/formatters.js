/**
 * formatters.js
 * Utility functions for formatting data across the UI.
 */

/**
 * Format a price number to a currency string
 * @param {number} amount
 * @param {string} currency - default PKR
 * @returns {string} e.g. "PKR 1,299.00"
 */
export const formatPrice = (amount, currency = "PKR") => {
  return `${currency} ${Number(amount).toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Format a UTC date string to a readable local date
 * @param {string} dateString - ISO date string
 * @returns {string} e.g. "21 May 2026, 03:12 AM"
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Capitalize the first letter of a string
 * @param {string} str
 * @returns {string}
 */
export const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Map order status to a CSS-friendly label color
 * @param {string} status
 * @returns {string} color name
 */
export const getStatusColor = (status) => {
  const map = {
    pending: "orange",
    confirmed: "blue",
    preparing: "purple",
    delivered: "green",
    cancelled: "red",
  };
  return map[status] || "gray";
};
