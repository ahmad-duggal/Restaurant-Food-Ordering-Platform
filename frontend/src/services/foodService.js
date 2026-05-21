/**
 * foodService.js
 * Handles all API calls related to food items.
 */

import API from "../api/axios";

/**
 * Get all food items (public)
 */
export const getAllFood = async () => {
  const response = await API.get("/food");
  return response.data;
};

/**
 * Get a single food item by ID (public)
 * @param {string} id
 */
export const getFoodById = async (id) => {
  const response = await API.get(`/food/${id}`);
  return response.data;
};

/**
 * Add a new food item (Admin only)
 * @param {object} foodData
 */
export const addFood = async (foodData) => {
  const response = await API.post("/food", foodData);
  return response.data;
};

/**
 * Update a food item (Admin only)
 * @param {string} id
 * @param {object} updates
 */
export const updateFood = async (id, updates) => {
  const response = await API.put(`/food/${id}`, updates);
  return response.data;
};

/**
 * Delete a food item (Admin only)
 * @param {string} id
 */
export const deleteFood = async (id) => {
  const response = await API.delete(`/food/${id}`);
  return response.data;
};
