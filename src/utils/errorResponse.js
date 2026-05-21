/**
 * Send a standardized error response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 */
const errorResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({
    success: false,
    error: message,
  });
};

/**
 * Send a standardized success response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {object} data - Response payload
 * @param {string} [message] - Optional success message
 */
const successResponse = (res, statusCode, data, message = null) => {
  const payload = { success: true, data };
  if (message) payload.message = message;
  return res.status(statusCode).json(payload);
};

module.exports = { errorResponse, successResponse };
