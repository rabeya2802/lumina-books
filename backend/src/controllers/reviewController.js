const pool = require("../config/db");

/**
 * ============================================
 * REVIEWS & RATINGS CONTROLLER
 * ============================================
 * - addReview      (auth)   POST /api/books/:bookId/reviews
 * - getReviews     (public) GET  /api/books/:bookId/reviews
 * - deleteReview   (auth)   DELETE /api/books/:bookId/reviews/:reviewId
 * ============================================
 */

/**
 * POST /api/books/:bookId/reviews
 * Create or update the logged-in user's review for a book.
 * A user can only leave one review per book (UNIQUE constraint).
 * Body: { rating: 1-5, comment?: string }
 */
const addReview = async (req, res) => {
  const { bookId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user.userId;

  // Validation
  if (!bookId || isNaN(bookId)) {
    return res.status(400).json({ message: "Valid book ID is required" });
  }

  const numRating = Number(rating);
  if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
    return res
      .status(400)
      .json({ message: "Rating must be a whole number between 1 and 5" });
  }

  try {
    // Check book exists
    const [books] = await pool.query("SELECT id FROM books WHERE id = ?", [bookId]);
    if (books.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Upsert review (INSERT ... ON DUPLICATE KEY UPDATE)
    await pool.query(
      `INSERT INTO reviews (book_id, user_id, rating, comment)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment)`,
      [bookId, userId, numRating, comment ? comment.trim() : null]
    );

    console.log(`✅ Review saved by user ${userId} for book ${bookId} (${numRating}★)`);

    // Return the fresh average so the frontend can update instantly
    const [stats] = await pool.query(
      `SELECT
         COUNT(*) AS count,
         COALESCE(ROUND(AVG(rating), 1), 0) AS average
       FROM reviews WHERE book_id = ?`,
      [bookId]
    );

    return res.status(201).json({
      message: "Review saved successfully",
      average: Number(stats[0].average),
      count: Number(stats[0].count),
    });
  } catch (error) {
    console.error("❌ Error saving review:", error.message);
    return res.status(500).json({ message: "Failed to save review" });
  }
};

/**
 * GET /api/books/:bookId/reviews
 * Public endpoint — returns all reviews for a book + the aggregate rating.
 */
const getReviews = async (req, res) => {
  const { bookId } = req.params;

  if (!bookId || isNaN(bookId)) {
    return res.status(400).json({ message: "Valid book ID is required" });
  }

  try {
    // Aggregate rating
    const [stats] = await pool.query(
      `SELECT
         COUNT(*) AS count,
         COALESCE(ROUND(AVG(rating), 1), 0) AS average
       FROM reviews WHERE book_id = ?`,
      [bookId]
    );

    // Reviews with reviewer name
    const [reviews] = await pool.query(
      `SELECT
         r.id,
         r.rating,
         r.comment,
         r.created_at,
         r.updated_at,
         u.id AS user_id,
         u.name AS user_name
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       WHERE r.book_id = ?
       ORDER BY r.created_at DESC`,
      [bookId]
    );

    return res.json({
      average: Number(stats[0].average),
      count: Number(stats[0].count),
      data: reviews,
    });
  } catch (error) {
    console.error("❌ Error fetching reviews:", error.message);
    return res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

/**
 * DELETE /api/books/:bookId/reviews/:reviewId
 * A user can delete their own review.
 */
const deleteReview = async (req, res) => {
  const { bookId, reviewId } = req.params;
  const userId = req.user.userId;

  if (!reviewId || isNaN(reviewId)) {
    return res.status(400).json({ message: "Valid review ID is required" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT user_id FROM reviews WHERE id = ? AND book_id = ?",
      [reviewId, bookId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Only the review author (or an admin) can delete it
    if (rows[0].user_id !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "You can only delete your own review" });
    }

    await pool.query("DELETE FROM reviews WHERE id = ?", [reviewId]);

    // Return the updated aggregate
    const [stats] = await pool.query(
      `SELECT
         COUNT(*) AS count,
         COALESCE(ROUND(AVG(rating), 1), 0) AS average
       FROM reviews WHERE book_id = ?`,
      [bookId]
    );

    return res.json({
      message: "Review deleted",
      average: Number(stats[0].average),
      count: Number(stats[0].count),
    });
  } catch (error) {
    console.error("❌ Error deleting review:", error.message);
    return res.status(500).json({ message: "Failed to delete review" });
  }
};

module.exports = {
  addReview,
  getReviews,
  deleteReview,
};