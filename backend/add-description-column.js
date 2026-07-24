const mysql = require("mysql2/promise");

async function addDescriptionColumn() {
  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "online_book_store",
    });

    console.log("🔄 Checking if description column exists...");

    // Add description column if it doesn't exist
    const alterTable = `
      ALTER TABLE books
      ADD COLUMN IF NOT EXISTS description TEXT;
    `;

    await connection.execute(alterTable);
    console.log("✅ Description column added successfully!");

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

addDescriptionColumn();
