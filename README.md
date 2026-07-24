# 📚 Lumina Books - Online Book Store

_"Illuminate Your Mind, One Book at a Time."_

Lumina Books is a full-stack online bookstore developed as a 3-1 Semester Software Engineering Project.

## Technologies Used

### Frontend
- React.js
- Vite
- CSS

### Backend
- Node.js
- Express.js

### Database
- MySQL (XAMPP)

### Authentication
- JWT
- bcrypt

---

# Features

## Customer

- User Registration
- User Login
- Browse Books
- Search Books
- View Book Details
- Add to Cart
- Checkout
- Order History
- Password Reset using OTP
- Email Verification at Registration (via Gmail SMTP)

## Admin

- Admin Login
- Dashboard
- Add Books
- Edit Books
- Delete Books
- Manage Orders
- Update Order Status

---

# Project Structure

```
Website/
│
├── frontend/
├── backend/
├── README.md
```

---

# Installation

## Install Dependencies

```bash
npm install
npm --prefix frontend install
npm --prefix backend install
```

---

# Database Setup

Import

```
backend/schema.sql
```

using phpMyAdmin (XAMPP).

Create

```
backend/.env
```

Example

```env
PORT=5001

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=online_book_store

JWT_SECRET=your_secret_key

# Gmail SMTP (for email verification & password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@email.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your@email.com

NODE_ENV=development
```

---

# Email Setup (Gmail SMTP)

The app sends two kinds of emails using Gmail SMTP:

1. **Email verification code** — sent at registration (required before login)
2. **Password reset OTP** — sent from "Forgot Password"

If SMTP is **not** configured, the backend runs in "dev mode" and returns
the code directly in the API response (handy for testing without email).

## How to get a Gmail App Password (`EMAIL_PASSWORD`)

Gmail does **not** allow your normal password for SMTP — you need an
**App Password** (16 characters).

### Step 1: Turn on 2-Step Verification
1. Go to your Google Account → **Security**
2. Find **2-Step Verification** and turn it **ON**
3. (Without this, the App Password option won't appear)

### Step 2: Create an App Password
1. Go to Google Account → **Security**
2. Search **"App passwords"** in the search bar (or visit
   <https://myaccount.google.com/apppasswords>)
3. App name: type something like `Lumina Books`
4. Click **Create**
5. Google shows a **16-character password** like `abcd efgh ijkl mnop`
   → copy it (without spaces)

### Step 3: Put it in `backend/.env`
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
EMAIL_FROM=yourgmail@gmail.com
```

### Troubleshooting
- **"Username and Password not accepted"** → use the App Password, not your
  real Gmail password
- **Can't find App Passwords** → make sure 2-Step Verification is ON
- **Emails go to spam** → that's normal for new senders; ask users to check spam
- Port `587` = STARTTLS (TLS), Port `465` = SSL. The code auto-detects from the port.

---

# Run the Project

Backend

```bash
npm run dev:backend
```

Frontend

```bash
npm run dev:frontend
```

or run both

```bash
npm run dev
```

---

# Default URLs

Frontend

```
http://localhost:5173
```

Backend

```
http://localhost:5001
```

---

# API Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/books | Get all books |
| POST | /api/auth/register | User Registration (sends verification code) |
| POST | /api/auth/verify-email | Verify email verification code |
| POST | /api/auth/resend-verification | Resend verification code |
| POST | /api/auth/login | User Login (requires verified email) |
| POST | /api/auth/forgot-password/request-otp | Request password reset OTP |
| POST | /api/auth/forgot-password/verify-otp | Verify OTP & reset password |
| POST | /api/orders | Place Order |
| GET | /api/orders | User Order History |

---

# Screenshots
## Home Page

![Home](screenshots/home.png)
## Login

![Login](screenshots/login.png)

## Shopping Cart

![Cart](screenshots/cart.png)

## Checkout

![Checkout](screenshots/checkout.png)

## Admin Dashboard

![Admin Dashboard](screenshots/admin-dashboard.png)

## Manage Books

![Manage Books](screenshots/manage-books.png)

## Manage Orders

![Manage Orders](screenshots/manage-orders.png)


- Home Page
  
- Browse Books
- Login
- Cart
- Checkout
- Admin Dashboard
- Manage Books
- Manage Orders

---

# Future Improvements

- Wishlist
- Book Reviews
- Online Payment
- Email OTP
- Book Recommendation System

---

# Author

Rabeya Khatun

Department of Electrical & Computer Engineering

Rajshahi University of Engineering & Technology (RUET)