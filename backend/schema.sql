CREATE DATABASE IF NOT EXISTS online_book_store;

USE online_book_store;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    genre VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    cover_url VARCHAR(500),
    description TEXT,
    is_book_of_the_week BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(30) NOT NULL,
    division VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    upazila_city VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    postal_code VARCHAR(20),
    order_note TEXT,
    payment_method ENUM('cash_on_delivery', 'bkash', 'nagad', 'rocket', 'bank_transfer') NOT NULL DEFAULT 'cash_on_delivery',
    transaction_id VARCHAR(100),
    payment_status ENUM('pending_verification', 'verified', 'rejected') NOT NULL DEFAULT 'pending_verification',
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
    delivery_charge DECIMAL(10, 2) NOT NULL DEFAULT 0,
    discount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM(
        'pending',
        'processing',
        'shipped',
        'delivered',
        'cancelled'
    ) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    book_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books (id)
);

CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    user_id INT NOT NULL,
    rating TINYINT NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_book_user (book_id, user_id),
    FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CHECK (rating BETWEEN 1 AND 5)
);

INSERT INTO
    books (
        title,
        author,
        genre,
        price,
        stock,
        cover_url,
        description,
        is_book_of_the_week
    )
VALUES (
        'Atomic Habits',
        'James Clear',
        'Self-help',
        499.00,
        20,
        'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600',
        'An easy and proven way to build good habits and break bad ones. James Clear presents a practical framework for improving every day.\n\nLearn how tiny changes compound into remarkable results.',
        TRUE
    ),
    (
        'The Alchemist',
        'Paulo Coelho',
        'Fiction',
        299.00,
        18,
        'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600',
        'A magical story about following your dreams. Santiago, an Andalusian shepherd boy, travels in search of a treasure and discovers the meaning of life along the way.',
        FALSE
    ),
    (
        'Deep Work',
        'Cal Newport',
        'Productivity',
        399.00,
        15,
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600',
        'Rules for focused success in a distracted world. Cal Newport shows how to cultivate deep, undistracted focus to produce better results in less time.',
        FALSE
    );
