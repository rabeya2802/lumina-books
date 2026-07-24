const mysql = require('mysql2/promise');

const columns = [
  ['phone', 'VARCHAR(30) NOT NULL DEFAULT \'\''],
  ['division', 'VARCHAR(100) NOT NULL DEFAULT \'\''],
  ['district', 'VARCHAR(100) NOT NULL DEFAULT \'\''],
  ['upazila_city', 'VARCHAR(100) NOT NULL DEFAULT \'\''],
  ['postal_code', 'VARCHAR(20) NULL'],
  ['order_note', 'TEXT NULL'],
  [
    'payment_method',
    "ENUM('cash_on_delivery', 'bkash', 'nagad', 'rocket', 'bank_transfer') NOT NULL DEFAULT 'cash_on_delivery'",
  ],
  ['transaction_id', 'VARCHAR(100) NULL'],
  [
    'payment_status',
    "ENUM('pending_verification', 'verified', 'rejected') NOT NULL DEFAULT 'pending_verification'",
  ],
  ['subtotal', 'DECIMAL(10, 2) NOT NULL DEFAULT 0'],
  ['delivery_charge', 'DECIMAL(10, 2) NOT NULL DEFAULT 0'],
  ['discount', 'DECIMAL(10, 2) NOT NULL DEFAULT 0'],
];

async function addPaymentFields() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'online_book_store',
  });

  try {
    for (const [name, definition] of columns) {
      const [existing] = await connection.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = ?`,
        [name],
      );
      if (existing.length === 0) {
        await connection.query(`ALTER TABLE orders ADD COLUMN ${name} ${definition}`);
        console.log(`Added orders.${name}`);
      }
    }

    const [emailColumn] = await connection.query(
      `SELECT IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'email'`,
    );
    if (emailColumn[0]?.IS_NULLABLE === 'NO') {
      await connection.query('ALTER TABLE orders MODIFY COLUMN email VARCHAR(255) NULL');
      console.log('Made orders.email optional');
    }

    // Older project databases may already have this column with values such as
    // "pending" or "paid". Expand first, map legacy values, then keep only the
    // statuses used by the manual-verification checkout.
    const [paymentStatusColumn] = await connection.query(
      `SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'payment_status'`,
    );
    const targetStatuses = ['pending_verification', 'verified', 'rejected'];
    const currentStatuses = [...(paymentStatusColumn[0]?.COLUMN_TYPE || '').matchAll(/'([^']*)'/g)]
      .map((match) => match[1]);
    const expandedStatuses = [...new Set([...currentStatuses, ...targetStatuses])];

    await connection.query(
      `ALTER TABLE orders MODIFY COLUMN payment_status ENUM(${expandedStatuses
        .map((status) => `'${status}'`)
        .join(', ')}) NOT NULL DEFAULT 'pending_verification'`,
    );
    await connection.query(
      `UPDATE orders SET payment_status = 'pending_verification'
       WHERE payment_status NOT IN (${targetStatuses.map((status) => `'${status}'`).join(', ')})`,
    );
    await connection.query(
      "ALTER TABLE orders MODIFY COLUMN payment_status ENUM('pending_verification', 'verified', 'rejected') NOT NULL DEFAULT 'pending_verification'",
    );
    console.log('Aligned orders.payment_status with manual verification statuses');
  } finally {
    await connection.end();
  }
}

addPaymentFields()
  .then(() => console.log('Order payment fields are ready.'))
  .catch((error) => {
    console.error('Could not update orders table:', error.message || error.code || error);
    process.exitCode = 1;
  });
