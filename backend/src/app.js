const express = require("express");
const cors = require("cors");

const authRouter = require("./routes/auth");
const booksRouter = require("./routes/books");
const ordersRouter = require("./routes/orders");
const adminRouter = require("./routes/admin");
const contactRouter = require("./routes/contact");

const app = express();

// In production, set CORS_ORIGIN to your frontend URL (e.g. https://lumina-books.vercel.app)
// Comma-separated values are supported for multiple origins.
const rawOrigin = process.env.CORS_ORIGIN || "";
const allowedOrigins = rawOrigin
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors(
    allowedOrigins.length
      ? {
          origin: (origin, cb) => {
            if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
            return cb(new Error(`CORS blocked for origin: ${origin}`));
          },
          credentials: true,
        }
      : undefined
  )
);
app.use(express.json());

app.use("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Bookstore API is running" });
});

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/books", booksRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/contact", contactRouter);

module.exports = app;
