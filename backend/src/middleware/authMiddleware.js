const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

/**
 * Middleware to verify JWT token
 * This middleware checks if the request has a valid JWT token
 * Place this middleware before protected routes
 */
const verifyToken = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access denied. No token provided.",
      });
    }

    // Extract token (remove "Bearer " prefix)
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Add user info to request object
    req.user = decoded;

    // Continue to next middleware or route
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired. Please login again.",
      });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid token.",
      });
    }
    return res.status(500).json({
      message: "Authentication failed.",
    });
  }
};

/**
 * Middleware that populates req.user when a valid token is present,
 * but never rejects the request — lets routes support both logged-in
 * users and guests (e.g. guest checkout).
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  try {
    const token = authHeader.split(" ")[1];
    req.user = jwt.verify(token, JWT_SECRET);
  } catch {
    // Invalid/expired token on an optional route — proceed as a guest.
  }

  next();
};

/**
 * Middleware to check user role
 * Use this to protect routes that require specific roles
 *
 * Example usage:
 * router.post("/admin/users", verifyToken, authorize("admin"), deleteUser);
 * router.get("/dashboard", verifyToken, authorize(["admin", "user"]), getDashboard);
 */
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    // Check if user exists (verifyToken should run first)
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Convert single role to array for consistency
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    // Check if user's role is in allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${roles.join(" or ")}. Your role: ${req.user.role}`,
      });
    }

    next();
  };
};

/**
 * SIMPLE ADMIN MIDDLEWARE
 *
 * Use this for admin-only routes
 * Checks if user.role is 'admin'
 *
 * Example:
 * router.delete("/admin/users/:id", verifyToken, adminOnly, deleteUser);
 */
const adminOnly = (req, res, next) => {
  // Step 1: Check if req.user exists
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  // Step 2: Check if user is admin
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: `Access denied. Only admins can do this. Your role: ${req.user.role}`,
    });
  }

  // Step 3: User is admin, continue to next middleware/route
  next();
};

module.exports = {
  verifyToken,
  optionalAuth,
  authorize,
  adminOnly,
};
