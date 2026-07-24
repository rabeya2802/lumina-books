const express = require("express");
const pool = require("../config/db");
const { verifyToken, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * TEST ROUTE: GET /api/admin/test
 * Purpose: Simple admin-only route to test middleware
 * Protection: verifyToken + adminOnly
 * Who can access: Only users with role = "admin"
 */
router.get("/test", verifyToken, adminOnly, (req, res) => {
  console.log("✓ Admin route handler called");
  console.log(`✓ Admin ${req.user.email} accessed admin test route`);

  return res.json({
    message: "✓ Admin route is working!",
    user: {
      id: req.user.userId,
      email: req.user.email,
      role: req.user.role,
    },
    timestamp: new Date().toISOString(),
  });
});

// Public test endpoint (no authentication)
router.get("/public-test", (req, res) => {
  return res.json({
    message: "✓ Public admin test route is working!",
    note: "This is a public endpoint (no auth required)",
  });
});

module.exports = router;
