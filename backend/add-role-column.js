const mysql = require("mysql2/promise");

async function addRoleColumn() {
  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "online_book_store",
    });

    console.log("🔄 Checking if role column exists...");

    // Add role column if it doesn't exist
    const alterTable = `
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS role ENUM('user', 'admin') DEFAULT 'user';
    `;

    await connection.execute(alterTable);
    console.log("✅ Role column added successfully!");

    // Verify table structure
    const [columns] = await connection.execute("DESCRIBE users;");
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

addRoleColumn();
