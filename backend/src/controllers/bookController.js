const pool = require("../config/db");

/**
 * ============================================
 * BOOKS CRUD CONTROLLER
 * ============================================
 * Handles all database operations for books
 * Each function follows:
 * - Input validation
 * - Database query execution
 * - Error handling
 * - JSON response
 */

/**
 * GET ALL BOOKS
 * Public endpoint - anyone can view books
 * Returns: Array of all books sorted by newest first
 *
 * SQL: SELECT all columns FROM books table
 */
const getAllBooks = async (req, res) => {
  try {
    const query = `
      SELECT
        id,
        title,
        author,
        genre,
        price,
        stock,
        cover_url,
        description,
        is_book_of_the_week,
        created_at
      FROM books
      ORDER BY created_at DESC
    `;

    const [books] = await pool.query(query);

    return res.json({
      message: "Books fetched successfully",
      count: books.length,
      data: books,
    });
  } catch (error) {
    console.error("❌ Error fetching books:", error.message);
    return res.status(500).json({ message: "Failed to fetch books" });
  }
};

/**
 * GET SINGLE BOOK BY ID
 * Public endpoint - anyone can view a specific book
 * Returns: Single book object with all details
 *
 * Request Params:
 *   - id: Book ID (from URL: /api/books/:id)
 *
 * SQL: SELECT book WHERE id matches the request parameter
 */
const getBookById = async (req, res) => {
  const { id } = req.params;

  // Validation: Check if ID is provided
  if (!id) {
    return res.status(400).json({ message: "Book ID is required" });
  }

  // Validation: ID must be a valid number
  if (isNaN(id)) {
    return res.status(400).json({ message: "Book ID must be a number" });
  }

  try {
    const query = `
      SELECT
        id,
        title,
        author,
        genre,
        price,
        stock,
        cover_url,
        description,
        is_book_of_the_week,
        created_at
      FROM books
      WHERE id = ?
    `;

    const [books] = await pool.query(query, [id]);

    // Check if book was found
    if (books.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    return res.json({
      message: "Book fetched successfully",
      data: books[0],
    });
  } catch (error) {
    console.error("❌ Error fetching book:", error.message);
    return res.status(500).json({ message: "Failed to fetch book" });
  }
};

/**
 * CREATE NEW BOOK
 * Admin-only endpoint - only admins can add books
 * Returns: Created book with ID
 *
 * Request Body:
 *   - title (string, required): Book title
 *   - author (string, required): Author name
 *   - genre (string, optional): Book genre/category
 *   - price (number, required): Book price in decimal format
 *   - stock (number, required): Quantity in stock
 *   - cover_url (string, optional): URL to book cover image
 *   - description (string, optional): Full book description (supports multiple paragraphs)
 *   - is_book_of_the_week (boolean, optional): Mark this book as the homepage "Book of the Week".
 *     Only one book may hold this title at a time — marking a new one automatically unmarks the old one.
 *
 * SQL: INSERT new book record into books table
 */
const createBook = async (req, res) => {
  const { title, author, genre, price, stock, cover_url, description, is_book_of_the_week } =
    req.body;
  const isBookOfTheWeek = Boolean(is_book_of_the_week);

  // Validation: Check required fields
  if (!title || !author || price === undefined || stock === undefined) {
    return res.status(400).json({
      message: "title, author, price, and stock are required fields",
    });
  }

  // Validation: Price must be a positive number
  if (isNaN(price) || price < 0) {
    return res
      .status(400)
      .json({ message: "Price must be a valid positive number" });
  }

  // Validation: Stock must be a non-negative integer
  if (!Number.isInteger(+stock) || stock < 0) {
    return res
      .status(400)
      .json({ message: "Stock must be a non-negative whole number" });
  }

  try {
    // Only one book can be Book of the Week at a time — unmark the current
    // holder (if any) before inserting the new book as the new holder.
    if (isBookOfTheWeek) {
      await pool.query(
        "UPDATE books SET is_book_of_the_week = FALSE WHERE is_book_of_the_week = TRUE",
      );
    }

    const query = `
      INSERT INTO books (title, author, genre, price, stock, cover_url, description, is_book_of_the_week)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(query, [
      title,
      author,
      genre || null, // If genre not provided, set to NULL
      parseFloat(price), // Ensure price is a number
      parseInt(stock), // Ensure stock is a whole number
      cover_url || null, // If cover_url not provided, set to NULL
      description || null, // If description not provided, set to NULL
      isBookOfTheWeek,
    ]);

    console.log(
      `✅ Book created successfully by admin ${req.user.email}: "${title}" (ID: ${result.insertId})`,
    );

    return res.status(201).json({
      message: "Book created successfully",
      bookId: result.insertId,
      data: {
        id: result.insertId,
        title,
        author,
        genre,
        price: parseFloat(price),
        stock: parseInt(stock),
        cover_url,
        description: description || null,
        is_book_of_the_week: isBookOfTheWeek,
      },
    });
  } catch (error) {
    console.error("❌ Error creating book:", error.message);
    return res.status(500).json({ message: "Failed to create book" });
  }
};

/**
 * UPDATE BOOK
 * Admin-only endpoint - only admins can update books
 * Returns: Updated book details
 *
 * Request Params:
 *   - id: Book ID (from URL: /api/books/:id)
 *
 * Request Body (any or all fields can be updated):
 *   - title (string): Book title
 *   - author (string): Author name
 *   - genre (string): Book genre
 *   - price (number): Book price
 *   - stock (number): Quantity in stock
 *   - cover_url (string): URL to book cover image
 *   - description (string): Full book description (supports multiple paragraphs)
 *   - is_book_of_the_week (boolean): Mark/unmark this book as the homepage "Book of the Week".
 *     Only one book may hold this title at a time — marking this one automatically unmarks the old one.
 *
 * SQL: UPDATE book record where ID matches
 * Note: Only provided fields are updated (partial update)
 */
const updateBook = async (req, res) => {
  const { id } = req.params;
  const { title, author, genre, price, stock, cover_url, description, is_book_of_the_week } =
    req.body;

  // Validation: Check if ID is provided
  if (!id) {
    return res.status(400).json({ message: "Book ID is required" });
  }

  // Validation: Check if at least one field to update is provided
  if (
    !title &&
    !author &&
    !genre &&
    price === undefined &&
    stock === undefined &&
    !cover_url &&
    description === undefined &&
    is_book_of_the_week === undefined
  ) {
    return res.status(400).json({
      message:
        "At least one field (title, author, genre, price, stock, cover_url, description, or is_book_of_the_week) must be provided to update",
    });
  }

  // Validation: If price is provided, validate it
  if (price !== undefined && (isNaN(price) || price < 0)) {
    return res
      .status(400)
      .json({ message: "Price must be a valid positive number" });
  }

  // Validation: If stock is provided, validate it
  if (stock !== undefined && (!Number.isInteger(+stock) || stock < 0)) {
    return res
      .status(400)
      .json({ message: "Stock must be a non-negative whole number" });
  }

  try {
    // First, check if book exists
    const checkQuery = `SELECT id FROM books WHERE id = ?`;
    const [existingBook] = await pool.query(checkQuery, [id]);

    if (existingBook.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Build dynamic UPDATE query - only update fields that are provided
    const updateFields = [];
    const updateValues = [];

    if (title) {
      updateFields.push("title = ?");
      updateValues.push(title);
    }
    if (author) {
      updateFields.push("author = ?");
      updateValues.push(author);
    }
    if (genre) {
      updateFields.push("genre = ?");
      updateValues.push(genre);
    }
    if (price !== undefined) {
      updateFields.push("price = ?");
      updateValues.push(parseFloat(price));
    }
    if (stock !== undefined) {
      updateFields.push("stock = ?");
      updateValues.push(parseInt(stock));
    }
    if (cover_url) {
      updateFields.push("cover_url = ?");
      updateValues.push(cover_url);
    }
    // Uses !== undefined (not truthy check) so an empty description can clear existing text
    if (description !== undefined) {
      updateFields.push("description = ?");
      updateValues.push(description || null);
    }
    if (is_book_of_the_week !== undefined) {
      const isBookOfTheWeek = Boolean(is_book_of_the_week);
      // Only one book can be Book of the Week at a time — unmark the current
      // holder (any book other than this one) before this book takes the title.
      if (isBookOfTheWeek) {
        await pool.query(
          "UPDATE books SET is_book_of_the_week = FALSE WHERE is_book_of_the_week = TRUE AND id != ?",
          [id],
        );
      }
      updateFields.push("is_book_of_the_week = ?");
      updateValues.push(isBookOfTheWeek);
    }

    // Add ID as the last parameter for WHERE clause
    updateValues.push(id);

    const query = `UPDATE books SET ${updateFields.join(", ")} WHERE id = ?`;

    await pool.query(query, updateValues);

    console.log(
      `✅ Book updated successfully by admin ${req.user.email} (ID: ${id})`,
    );

    return res.json({
      message: "Book updated successfully",
      bookId: id,
      updatedFields: {
        ...(title && { title }),
        ...(author && { author }),
        ...(genre && { genre }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(cover_url && { cover_url }),
        ...(description !== undefined && { description }),
        ...(is_book_of_the_week !== undefined && {
          is_book_of_the_week: Boolean(is_book_of_the_week),
        }),
      },
    });
  } catch (error) {
    console.error("❌ Error updating book:", error.message);
    return res.status(500).json({ message: "Failed to update book" });
  }
};

/**
 * DELETE BOOK
 * Admin-only endpoint - only admins can delete books
 * Returns: Confirmation message
 *
 * Request Params:
 *   - id: Book ID (from URL: /api/books/:id)
 *
 * SQL: DELETE book record where ID matches
 * Note: This is a permanent delete operation
 */
const deleteBook = async (req, res) => {
  const { id } = req.params;

  // Validation: Check if ID is provided
  if (!id) {
    return res.status(400).json({ message: "Book ID is required" });
  }

  // Validation: ID must be a valid number
  if (isNaN(id)) {
    return res.status(400).json({ message: "Book ID must be a number" });
  }

  try {
    // First, check if book exists
    const checkQuery = `SELECT title FROM books WHERE id = ?`;
    const [existingBook] = await pool.query(checkQuery, [id]);

    if (existingBook.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Delete the book
    const deleteQuery = `DELETE FROM books WHERE id = ?`;
    await pool.query(deleteQuery, [id]);

    console.log(
      `✅ Book deleted successfully by admin ${req.user.email} (ID: ${id}): "${existingBook[0].title}"`,
    );

    return res.json({
      message: "Book deleted successfully",
      bookId: id,
      deletedBook: existingBook[0].title,
    });
  } catch (error) {
    console.error("❌ Error deleting book:", error.message);
    return res.status(500).json({ message: "Failed to delete book" });
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
};
