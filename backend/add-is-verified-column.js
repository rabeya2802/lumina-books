const mysql = require("mysql2/promise");

/**
 * Migration: add `is_verified` column to the users table.
 *
 * Run with:  node add-is-verified-column.js
 *
 * Safe to run multiple times (uses IF NOT EXISTS).
 */
async function addIsVerifiedColumn() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "online_book_store",
    });

    console.log("🔄 Checking if `is_verified` column exists on users...");

    await connection.execute(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
    `);

    // Make sure pre-existing users can still log in (they registered
    // before verification existed), unless you'd rather force them to verify.
    await connection.execute(`
      UPDATE users SET is_verified = TRUE WHERE is_verified = FALSE;
    `);

    console.log("✅ `is_verified` column is ready.");

    const [columns] = await connection.execute("DESCRIBE users;");
    console.log("\n📊 Current users table structure:");
    columns.forEach((col) => {
      console.log(`  - ${col.Field}: ${col.Type}`);
    });

    await connection.end();
    console.log("\n✅ Migration complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration error:", error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

addIsVerifiedColumn();