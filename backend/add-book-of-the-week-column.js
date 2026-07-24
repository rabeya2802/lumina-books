const mysql = require("mysql2/promise");

async function addBookOfTheWeekColumn() {
  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "online_book_store",
    });

    console.log("🔄 Checking if is_book_of_the_week column exists...");

    // Add is_book_of_the_week column if it doesn't exist
    const alterTable = `
      ALTER TABLE books
      ADD COLUMN IF NOT EXISTS is_book_of_the_week BOOLEAN NOT NULL DEFAULT FALSE;
    `;

    await connection.execute(alterTable);
    console.log("✅ is_book_of_the_week column added successfully!");

    // Verify table structure
    const [columns] = await connection.execute("DESCRIBE books;");
    console.log("\n📊 Updated table structure:");
    columns.forEach((col) => {
      console.log(`  - ${col.Field}: ${col.Type}`);
    });

    await connection.end();
    console.log("\n✅ Database updated!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

addBookOfTheWeekColumn();
