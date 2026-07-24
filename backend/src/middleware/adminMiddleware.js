/**
 * ============================================
 * ADMIN MIDDLEWARE (Refactored for RBAC)
 * ============================================
 *
 * This middleware now uses Role-Based Access Control (RBAC)
 * instead of hardcoded email addresses.
 *
 * Admin status is determined by: user.role === "admin" (from JWT)
 *
 * NEW APPROACH:
 * Use: verifyToken, adminOnly from authMiddleware.js
 *
 * Example:
 * router.delete('/api/books/:id', verifyToken, adminOnly, deleteBook);
 *
 * ============================================
 */

const { adminOnly } = require("./authMiddleware");

/**
 * BACKWARD COMPATIBLE: verifyAdmin
 *
 * This is now just a wrapper around adminOnly.
 * It's kept for backward compatibility with existing routes.
 *
 * NEW ROUTES should use: verifyToken, adminOnly
 * EXISTING ROUTES can still use: verifyToken, verifyAdmin (it will work)
 *
 * Both achieve the same result:
 * - Verify JWT token is valid (verifyToken)
 * - Check that user.role === "admin" (adminOnly/verifyAdmin)
 * - Allow access only if both pass
 */
const verifyAdmin = adminOnly;

module.exports = { verifyAdmin };
