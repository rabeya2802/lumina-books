const express = require("express");
const {
  addReview,
  getReviews,
  deleteReview,
} = require("../controllers/reviewController");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router({ mergeParams: true });

/**
 * ============================================
 * REVIEWS ROUTES  (mounted at /api/books/:bookId/reviews)
 * ============================================
 */

/**
 * GET /api/books/:bookId/reviews
 * Public — list all reviews + average rating for a book
 */
router.get("/", getReviews);

/**
 * POST /api/books/:bookId/reviews
 * Auth — create or update the logged-in user's review
 * Body: { rating: 1-5, comment?: string }
 */
router.post("/", verifyToken, addReview);

/**
 * DELETE /api/books/:bookId/reviews/:reviewId
 * Auth — delete a review (author or admin only)
 */
router.delete("/:reviewId", verifyToken, deleteReview);

module.exports = router;