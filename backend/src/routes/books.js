const express = require("express");
const {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} = require("../controllers/bookController");
const { verifyToken, adminOnly } = require("../middleware/authMiddleware");
const reviewsRouter = require("./reviews");

const router = express.Router();

/**
 * ============================================
 * BOOKS API ROUTES
 * ============================================
 * REST endpoints for book management
 */

/**
 * GET /api/books
 * Fetch all books
 * Access: PUBLIC (no auth required)
 * Response: Array of books with details
 */
router.get("/", getAllBooks);

/**
 * GET /api/books/:id
 * Fetch single book by ID
 * Access: PUBLIC (no auth required)
 * Params: id - book ID
 * Response: Single book object
 */
router.get("/:id", getBookById);

/**
 * POST /api/books
 * Create new book (ADD BOOK)
 * Access: ADMIN ONLY (requires valid JWT + admin role)
 * Body: { title, author, genre?, price, stock, cover_url?, description?, is_book_of_the_week? }
 * Response: Created book with ID
 */
router.post("/", verifyToken, adminOnly, createBook);

/**
 * PUT /api/books/:id
 * Update existing book
 * Access: ADMIN ONLY (requires valid JWT + admin role)
 * Params: id - book ID
 * Body: { title?, author?, genre?, price?, stock?, cover_url?, description?, is_book_of_the_week? }
 * Response: Updated book info
 */
router.put("/:id", verifyToken, adminOnly, updateBook);

/**
 * DELETE /api/books/:id
 * Delete book
 * Access: ADMIN ONLY (requires valid JWT + admin role)
 * Params: id - book ID
 * Response: Confirmation message
 */
router.delete("/:id", verifyToken, adminOnly, deleteBook);

/**
 * Reviews nested routes: /api/books/:bookId/reviews
 * Must be registered AFTER /:id so the params merge correctly.
 */
router.use("/:bookId/reviews", reviewsRouter);

module.exports = router;
