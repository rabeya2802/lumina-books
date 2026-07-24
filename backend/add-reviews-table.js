/**
 * Migration: Create the `reviews` table for the Reviews & Ratings system.
 * Run once:  node add-reviews-table.js
 *
 * A user can leave one review per book. Reviews store a 1–5 star rating
 * plus an optional comment. The average rating is computed at read time
 * from the reviews themselves (no denormalised column to keep in sync).
 */
require("dotenv").config();
const pool = require("./src/config/db");

(async () => {
  try {
    const sql = `
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        book_id INT NOT NULL,
        user_id INT NOT NULL,
        rating TINYINT NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_book_user (book_id, user_id),
        CONSTRAINT fk_reviews_book FOREIGN KEY (book_id)
          REFERENCES books (id) ON DELETE CASCADE,
        CONSTRAINT fk_reviews_user FOREIGN KEY (user_id)
          REFERENCES users (id) ON DELETE CASCADE,
        CHECK (rating BETWEEN 1 AND 5)
      )
    `;

    await pool.query(sql);
    console.log("✅ reviews table is ready (or already existed).");
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to create reviews table:", err.message);
    process.exit(1);
  }
})();