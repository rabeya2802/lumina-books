const express = require("express");
const pool = require("../config/db");
const { verifyToken, optionalAuth } = require("../middleware/authMiddleware");
const { verifyAdmin } = require("../middleware/adminMiddleware");

const router = express.Router();

/**
 * POST /api/orders
 *
 * PUBLIC ROUTE: Both guests and logged-in users can place orders.
 *
 * WHY optionalAuth middleware:
 * - If a valid JWT is present, req.user is populated (not used here,
 *   since customerName/email already come from the request body)
 * - If no token (or an invalid one) is present, the request still
 *   proceeds as a guest checkout
 *
 * REQUEST BODY REQUIRED:
 * {
 *   customerName: string,
 *   email: string,
 *   address: string,
 *   items: [
 *     { bookId: number, quantity: number },
 *     { bookId: number, quantity: number }
 *   ]
 * }
 *
 * RESPONSE:
 * {
 *   message: "Order placed successfully",
 *   orderId: 1,
 *   totalAmount: 798
 * }
 */
router.post("/", optionalAuth, async (req, res) => {
  const {
    customerName,
    email,
    phone,
    division,
    district,
    upazilaCity,
    address,
    postalCode,
    orderNote,
    paymentMethod = "cash_on_delivery",
    transactionId,
    items,
  } = req.body;
  const validPaymentMethods = [
    "cash_on_delivery",
    "bkash",
    "nagad",
    "rocket",
    "bank_transfer",
  ];

  if (
    !customerName ||
    !phone ||
    !division ||
    !district ||
    !upazilaCity ||
    !address ||
    !validPaymentMethods.includes(paymentMethod) ||
    (["bkash", "nagad", "rocket"].includes(paymentMethod) && !transactionId) ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return res.status(400).json({
      message: "Please provide all required delivery, payment, and order details.",
    });
  }

  const connection = await pool.getConnection();

  try {
    // ========================
    // STEP 1: VALIDATE INPUT
    // ========================
    if (
      !customerName ||
      !phone ||
      !division ||
      !district ||
      !upazilaCity ||
      !address ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        message:
          "❌ Please provide the required delivery details and at least one item.",
      });
    }

    console.log(`📦 Creating order for: ${email || customerName}`);
    console.log(`   Items in order: ${items.length}`);

    // ========================
    // STEP 2: VALIDATE BOOKS & CALCULATE TOTAL
    // ========================
    // WHY: Make sure:
    // - Books exist in database
    // - Customer is ordering valid quantities
    // - We can calculate total price accurately

    let totalAmount = 0;

    for (const item of items) {
      // Get book details from database
      const [bookRows] = await connection.query(
        "SELECT id, price, stock FROM books WHERE id = ?",
        [item.bookId],
      );
      const book = bookRows[0];

      // Book doesn't exist
      if (!book) {
        throw new Error(
          `❌ Book not found: ID ${item.bookId}. Are you sure it exists?`,
        );
      }

      // Not enough stock
      if (item.quantity < 1 || item.quantity > book.stock) {
        throw new Error(
          `❌ Invalid quantity for book "${item.bookId}". ` +
            `Requested: ${item.quantity}, Available: ${book.stock}`,
        );
      }

      // Add to total
      totalAmount += Number(book.price) * Number(item.quantity);

      console.log(
        `   ✅ Validated: Book ID ${item.bookId}, Qty: ${item.quantity}`,
      );
    }

    const deliveryCharge = 60;
    const discount = 0;
    const grandTotal = totalAmount + deliveryCharge - discount;
    console.log(`   💰 Total Amount: ৳${grandTotal}`);

    // ========================
    // STEP 3: CREATE TRANSACTION
    // ========================
    // WHY: All-or-nothing approach
    // If anything fails halfway through:
    // - Rollback: undo all changes
    // - Order not created
    // - Stock not reduced
    // - Database stays consistent
    //
    // ANALOGY: Like a bank transfer
    // Either money leaves Account A AND arrives in Account B
    // OR both stay the same (no money disappears!)

    await connection.beginTransaction();
    console.log(`   🔄 Transaction started`);

    // ========================
    // STEP 4: INSERT ORDER INTO ORDERS TABLE
    // ========================
    // WHY: Create a record of this purchase
    // This becomes the "parent" record that order_items will link to

    const [orderResult] = await connection.query(
      `INSERT INTO orders (
        customer_name, email, phone, division, district, upazila_city, address,
        postal_code, order_note, payment_method, transaction_id, payment_status,
        subtotal, delivery_charge, discount, total_amount
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_verification', ?, ?, ?, ?)`,
      [
        customerName,
        email || null,
        phone,
        division,
        district,
        upazilaCity,
        address,
        postalCode || null,
        orderNote || null,
        paymentMethod,
        transactionId || null,
        totalAmount,
        deliveryCharge,
        discount,
        grandTotal,
      ],
    );

    const orderId = orderResult.insertId;
    console.log(`   ✅ Order created: Order ID #${orderId}`);

    // ========================
    // STEP 5: INSERT EACH ITEM INTO ORDER_ITEMS TABLE
    // ========================
    // WHY: Record WHAT was in the order
    // For each book the customer bought:
    // - Save book ID
    // - Save quantity
    // - Save unit price (for records, in case book price changes later)
    // - Link to order using order_id (foreign key)

    for (const item of items) {
      // Get current book price
      const [bookRows] = await connection.query(
        "SELECT price FROM books WHERE id = ?",
        [item.bookId],
      );
      const unitPrice = Number(bookRows[0].price);

      // Create order item
      await connection.query(
        `INSERT INTO order_items (order_id, book_id, quantity, unit_price)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.bookId, item.quantity, unitPrice],
      );

      console.log(
        `   ✅ Added item: Book ID ${item.bookId}, Qty: ${item.quantity}`,
      );
    }

    // ========================
    // STEP 6: UPDATE BOOK STOCK
    // ========================
    // WHY: Reduce available inventory after purchase
    // So other customers don't buy books that are already sold

    for (const item of items) {
      await connection.query(
        `UPDATE books
         SET stock = stock - ?
         WHERE id = ?`,
        [item.quantity, item.bookId],
      );

      console.log(`   📉 Updated stock for Book ID ${item.bookId}`);
    }

    // ========================
    // STEP 7: COMMIT TRANSACTION
    // ========================
    // WHY: Say "I'm done! Save all changes permanently"
    // Now all the INSERTs and UPDATEs become permanent in database

    await connection.commit();
    console.log(`   ✅ Transaction committed successfully`);
    console.log(`✅ ORDER PLACED: Order #${orderId} for ৳${grandTotal}`);

    return res.status(201).json({
      message: "✅ Order placed successfully! Your order is confirmed.",
      orderId,
      totalAmount: grandTotal,
      subtotal: totalAmount,
      deliveryCharge,
      discount,
      paymentStatus: "pending_verification",
    });
  } catch (error) {
    // ========================
    // ERROR HANDLING
    // ========================
    // If ANYTHING goes wrong:
    // - Rollback: undo all changes
    // - Send error message to frontend
    // - Log error for debugging

    await connection.rollback();
    console.error("❌ Order creation failed:", error.message);

    return res.status(400).json({
      message: error.message || "❌ Failed to create order",
    });
  } finally {
    connection.release();
  }
});

/**
 * GET /api/orders
 *
 * PROTECTED ROUTE: Only logged-in users can see their orders
 *
 * Returns all orders placed by the logged-in user
 */
router.get("/", verifyToken, async (req, res) => {
  const connection = await pool.getConnection();

  try {
    // Get user email from JWT token
    const userEmail = req.user.email;

    console.log(`📋 Fetching orders for: ${userEmail}`);

    const [orders] = await connection.query(
      `SELECT id, customer_name, email, phone, division, district, upazila_city,
              address, postal_code, order_note, payment_method, transaction_id,
              payment_status, subtotal, delivery_charge, discount, total_amount,
              status, created_at
       FROM orders
       WHERE email = ?
       ORDER BY created_at DESC`,
      [userEmail],
    );

    if (orders.length === 0) {
      connection.release();
      return res.json({
        message: "No orders placed yet",
        orders: [],
      });
    }

    // For each order, get the items in that order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const [items] = await connection.query(
          `SELECT oi.id, oi.book_id, b.title, b.author,
                  oi.quantity, oi.unit_price,
                  (oi.quantity * oi.unit_price) as total_item_price
           FROM order_items oi
           JOIN books b ON oi.book_id = b.id
           WHERE oi.order_id = ?`,
          [order.id],
        );

        return {
          ...order,
          items,
        };
      }),
    );

    connection.release();

    return res.json({
      message: `✅ Found ${orders.length} orders`,
      orders: ordersWithItems,
    });
  } catch (error) {
    connection.release();
    console.error("❌ Failed to fetch orders:", error.message);
    return res.status(500).json({
      message: "❌ Failed to fetch orders",
    });
  }
});

/**
 * GET /api/orders/:orderId
 *
 * PROTECTED ROUTE: Only logged-in users
 *
 * Gets a specific order with all its items
 * Uses SQL JOIN to combine orders, order_items, and books data
 *
 * WHAT IS SQL JOIN?
 * ──────────────────
 * Think of it like combining information from multiple files:
 *
 * File 1 (orders):
 * ID | Customer | Total
 * 1  | Alice    | 500
 *
 * File 2 (order_items):
 * ID | Order_ID | Book_ID | Qty
 * 1  | 1        | 101     | 2
 *
 * File 3 (books):
 * ID  | Title
 * 101 | Python Book
 *
 * INNER JOIN combines these using a connecting key:
 * Result:
 * Order_ID | Customer | Book_Title | Qty | Price
 * 1        | Alice    | Python     | 2   | 250
 *
 * This lets us show complete information in one query!
 */
router.get("/:orderId", verifyToken, async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { orderId } = req.params;
    const userEmail = req.user.email;

    console.log(`📋 Fetching order: #${orderId} for ${userEmail}`);

    // Get the order (verify it belongs to this user or user is admin)
    const [orders] = await connection.query(
      `SELECT id, customer_name, email, phone, division, district, upazila_city,
              address, postal_code, order_note, payment_method, transaction_id,
              payment_status, subtotal, delivery_charge, discount, total_amount,
              status, created_at, updated_at
       FROM orders
       WHERE id = ? AND email = ?`,
      [orderId, userEmail],
    );

    if (orders.length === 0) {
      connection.release();
      return res.status(404).json({
        message: "Order not found or you don't have access to it",
      });
    }

    const order = orders[0];

    // Get order items with book details using JOIN
    const [items] = await connection.query(
      `SELECT
        oi.id as item_id,
        oi.book_id,
        b.title,
        b.author,
        b.cover_url,
        oi.quantity,
        oi.unit_price,
        (oi.quantity * oi.unit_price) as total_price
       FROM order_items oi
       INNER JOIN books b ON oi.book_id = b.id
       WHERE oi.order_id = ?`,
      [orderId],
    );

    connection.release();

    return res.json({
      message: "✅ Order found",
      order: {
        ...order,
        items,
      },
    });
  } catch (error) {
    connection.release();
    console.error("❌ Failed to fetch order:", error.message);
    return res.status(500).json({
      message: "❌ Failed to fetch order",
    });
  }
});

/**
 * GET /api/admin/orders
 *
 * PROTECTED ROUTE: Only admin users
 *
 * Gets ALL orders from ALL users
 * Perfect for admin dashboard
 *
 * Uses SQL JOIN to show:
 * - Order information
 * - Customer details
 * - Number of items
 * - Current status
 */
router.get("/admin/orders", verifyToken, verifyAdmin, async (req, res) => {
  const connection = await pool.getConnection();

  try {
    console.log("📊 Fetching ALL orders for admin");

    // Get all orders with count of items using JOIN
    const [orders] = await connection.query(
      `SELECT
        o.id,
        o.customer_name,
        o.email,
        o.phone,
        o.total_amount,
        o.status,
        o.payment_method,
        o.transaction_id,
        o.payment_status,
        o.created_at,
        o.updated_at,
        COUNT(oi.id) as item_count
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
    );

    connection.release();

    return res.json({
      message: `✅ Found ${orders.length} orders`,
      orders: orders,
    });
  } catch (error) {
    connection.release();
    console.error("❌ Failed to fetch admin orders:", error.message);
    return res.status(500).json({
      message: "❌ Failed to fetch orders",
    });
  }
});

/**
 * GET /api/admin/orders/:orderId
 *
 * PROTECTED ROUTE: Only admin users
 *
 * Gets detailed view of a specific order with all items
 */
router.get(
  "/admin/orders/:orderId",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    const connection = await pool.getConnection();

    try {
      const { orderId } = req.params;

      console.log(`📋 Admin fetching order: #${orderId}`);

      // Get the order
      const [orders] = await connection.query(
        `SELECT id, customer_name, email, phone, division, district, upazila_city,
                address, postal_code, order_note, payment_method, transaction_id,
                payment_status, subtotal, delivery_charge, discount, total_amount,
                status, created_at, updated_at
       FROM orders
       WHERE id = ?`,
        [orderId],
      );

      if (orders.length === 0) {
        connection.release();
        return res.status(404).json({
          message: "Order not found",
        });
      }

      const order = orders[0];

      // Get order items with book details
      const [items] = await connection.query(
        `SELECT
        oi.id as item_id,
        oi.book_id,
        b.title,
        b.author,
        b.cover_url,
        oi.quantity,
        oi.unit_price,
        (oi.quantity * oi.unit_price) as total_price
       FROM order_items oi
       INNER JOIN books b ON oi.book_id = b.id
       WHERE oi.order_id = ?`,
        [orderId],
      );

      connection.release();

      return res.json({
        message: "✅ Order found",
        order: {
          ...order,
          items,
        },
      });
    } catch (error) {
      connection.release();
      console.error("❌ Failed to fetch order:", error.message);
      return res.status(500).json({
        message: "❌ Failed to fetch order",
      });
    }
  },
);

/**
 * PUT /api/orders/:orderId/status
 *
 * PROTECTED ROUTE: Only admin users
 *
 * Updates the status of an order
 * Admin can change: pending → processing → shipped → delivered
 * Or cancel orders: any status → cancelled
 *
 * REQUEST BODY:
 * {
 *   "status": "shipped"  // pending, processing, shipped, delivered, cancelled
 * }
 *
 * RESPONSE:
 * {
 *   "message": "Order status updated",
 *   "order": { ... updated order ... }
 * }
 */
router.put("/:orderId/status", verifyToken, verifyAdmin, async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!status || !validStatuses.includes(status)) {
      connection.release();
      return res.status(400).json({
        message: `Invalid status. Allowed: ${validStatuses.join(", ")}`,
      });
    }

    console.log(`🔄 Admin updating order #${orderId} status to: ${status}`);

    // Update the order status
    const [result] = await connection.query(
      `UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?`,
      [status, orderId],
    );

    if (result.affectedRows === 0) {
      connection.release();
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Fetch and return updated order
    const [orders] = await connection.query(
      `SELECT id, customer_name, email, phone, total_amount, status, payment_method,
              transaction_id, payment_status, created_at, updated_at
       FROM orders
       WHERE id = ?`,
      [orderId],
    );

    connection.release();

    return res.json({
      message: "✅ Order status updated successfully",
      order: orders[0],
    });
  } catch (error) {
    connection.release();
    console.error("❌ Failed to update order status:", error.message);
    return res.status(500).json({
      message: "❌ Failed to update order status",
    });
  }
});

/**
 * PUT /api/orders/:orderId/payment-status
 * Admin-only manual payment verification for academic/demo payments.
 */
router.put("/:orderId/payment-status", verifyToken, verifyAdmin, async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;
    const validStatuses = ["pending_verification", "verified", "rejected"];

    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        message: `Invalid payment status. Allowed: ${validStatuses.join(", ")}`,
      });
    }

    const [result] = await connection.query(
      "UPDATE orders SET payment_status = ?, updated_at = NOW() WHERE id = ?",
      [paymentStatus, orderId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const [orders] = await connection.query(
      `SELECT id, payment_method, transaction_id, payment_status, updated_at
       FROM orders WHERE id = ?`,
      [orderId],
    );

    return res.json({
      message: "Payment status updated successfully",
      order: orders[0],
    });
  } catch (error) {
    console.error("Failed to update payment status:", error.message);
    return res.status(500).json({ message: "Failed to update payment status" });
  } finally {
    connection.release();
  }
});

module.exports = router;
