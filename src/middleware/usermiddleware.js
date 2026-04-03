const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.protect = async (req, res, next) => {
  let token;

  // Check if the token exists in the "Authorization" Header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, error: "Not authorized to access this route" });
  }

  try {
    // Verify token (Hill Cipher logic: if the key doesn't match the signature, it fails)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user to the "req" object so the next function knows who is acting
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: "Not authorized" });
  }
};

// This is a 'Closure' function - it returns a middleware
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // req.user was set by the 'protect' middleware earlier
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};
