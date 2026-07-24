const mysql = require("mysql2/promise");

async function setupDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "online_book_store",
    });

    // Create users table
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await connection.execute(createUsersTable);
    console.log("✅ Users table created successfully!");

    // Verify table exists
    const [tables] = await connection.execute("SHOW TABLES;");
    console.log("\n📊 Current tables in database:");
    tables.forEach((table) => {
      console.log("  -", Object.values(table)[0]);
    });

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

setupDatabase();
