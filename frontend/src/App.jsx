import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ScrollToTopButton from './components/ScrollToTopButton';
import ChatBot from './components/ChatBot';

import Login from './Login';
import Home from './Home';
import Categories from './Categories';
import About from './About';
import Contact from './Contact';
import FAQ from './FAQ';
import BookDetails from './BookDetails';
import Wishlist from './Wishlist';
import Cart from './Cart';
import Checkout from './Checkout';
import OrderHistory from './OrderHistory';
import AdminOrders from './AdminOrders';
import AdminBooks from './AdminBooks';
import AdminDashboard from './AdminDashboard';
import LoadingSpinner from './LoadingSpinner';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  // Cart state lifted up (shared by Header, Home, Cart, Checkout)
  const [cartItems, setCartItems] = useState([]);

  // Wishlist state lifted up (persisted to localStorage)
  const [wishlist, setWishlist] = useState([]);

  // ---------------- Auth ----------------
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      let isAuth = false;
      let parsedUser = null;

      if (token && userData) {
        try {
          parsedUser = JSON.parse(userData);
          isAuth = true;
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }

      setIsLoggedIn(isAuth);
      setUser(parsedUser);
      setLoading(false);
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  // ---------------- Cart (load) ----------------
  useEffect(() => {
    const savedCart = localStorage.getItem('bookstoreCart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch {
        localStorage.removeItem('bookstoreCart');
      }
    }
  }, []);

  // ---------------- Cart (persist) ----------------
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('bookstoreCart', JSON.stringify(cartItems));
    } else if (cartItems.length === 0 && localStorage.getItem('bookstoreCart')) {
      localStorage.removeItem('bookstoreCart');
    }
  }, [cartItems]);

  // ---------------- Cart actions ----------------
  const addToCart = (book) => {
    const existingItem = cartItems.find((item) => item.id === book.id);
    if (existingItem) {
      setCartItems((items) =>
        items.map((item) =>
          item.id === book.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCartItems((items) => [...items, { ...book, quantity: 1 }]);
    }
  };

  const removeFromCart = (bookId) => {
    setCartItems((items) => items.filter((item) => item.id !== bookId));
  };

  const updateQuantity = (bookId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(bookId);
      return;
    }
    setCartItems((items) =>
      items.map((item) =>
        item.id === bookId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => setCartItems([]);

  // ---------------- Wishlist (load) ----------------
  useEffect(() => {
    const saved = localStorage.getItem('bookstoreWishlist');
    if (saved) {
      try {
        setWishlist(JSON.parse(saved));
      } catch {
        localStorage.removeItem('bookstoreWishlist');
      }
    }
  }, []);

  // ---------------- Wishlist (persist) ----------------
  useEffect(() => {
    if (wishlist.length > 0) {
      localStorage.setItem('bookstoreWishlist', JSON.stringify(wishlist));
    } else if (wishlist.length === 0 && localStorage.getItem('bookstoreWishlist')) {
      localStorage.removeItem('bookstoreWishlist');
    }
  }, [wishlist]);

  // ---------------- Wishlist actions ----------------
  const toggleWishlist = (book) => {
    setWishlist((items) => {
      const exists = items.some((item) => item.id === book.id);
      if (exists) {
        return items.filter((item) => item.id !== book.id);
      }
      return [
        ...items,
        {
          id: book.id,
          title: book.title,
          author: book.author,
          price: book.price,
          cover_url: book.cover_url,
          genre: book.genre,
          stock: book.stock,
        },
      ];
    });
  };

  const isWishlisted = (bookId) => wishlist.some((item) => item.id === bookId);

  const clearWishlist = () => setWishlist([]);

  // ---------------- Search ----------------
  const handleSearchClick = () => setActiveSearch(searchQuery);
  const handleClearSearch = () => {
    setSearchQuery('');
    setActiveSearch('');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('bookstoreCart');
    setIsLoggedIn(false);
    setUser(null);
    setCartItems([]);
    // Note: wishlist is intentionally kept across logout
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <ScrollToTop />

      {/* Shared site chrome (Navbar + Footer) */}
      <div className="flex min-h-screen flex-col bg-paper">
        <Navbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchClick={handleSearchClick}
          onClearSearch={handleClearSearch}
          cartCount={cartItems.length}
          wishlistCount={wishlist.length}
          isLoggedIn={isLoggedIn}
          user={user}
          onLogout={logout}
        />

        <main className="flex-1">
          <Routes>
            {/* Public */}
            <Route
              path="/"
              element={
                <Home
                  isLoggedIn={isLoggedIn}
                  onAddToCart={addToCart}
                  cartItems={cartItems}
                  onToggleWishlist={toggleWishlist}
                  isWishlisted={isWishlisted}
                />
              }
            />
            <Route
              path="/categories"
              element={
                <Categories
                  onAddToCart={addToCart}
                  activeSearch={activeSearch}
                  cartItems={cartItems}
                  onToggleWishlist={toggleWishlist}
                  isWishlisted={isWishlisted}
                />
              }
            />
            <Route
              path="/books/:id"
              element={
                <BookDetails
                  isLoggedIn={isLoggedIn}
                  onAddToCart={addToCart}
                  cartItems={cartItems}
                  onToggleWishlist={toggleWishlist}
                  isWishlisted={isWishlisted}
                  user={user}
                />
              }
            />
            <Route path="/wishlist" element={<Wishlist wishlist={wishlist} onToggleWishlist={toggleWishlist} onAddToCart={addToCart} cartItems={cartItems} onClearWishlist={clearWishlist} />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />

            {/* Auth */}
            <Route
              path="/login"
              element={
                isLoggedIn ? (
                  <Navigate to="/" />
                ) : (
                  <Login
                    onLoginStatusChange={() => {
                      setIsLoggedIn(true);
                      const userData = localStorage.getItem('user');
                      if (userData) setUser(JSON.parse(userData));
                    }}
                  />
                )
              }
            />

            {/* Cart & checkout */}
            <Route
              path="/cart"
              element={
                <Cart
                  cartItems={cartItems}
                  onRemoveFromCart={removeFromCart}
                  onUpdateQuantity={updateQuantity}
                />
              }
            />
            <Route
              path="/checkout"
              element={
                <Checkout
                  cartItems={cartItems}
                  onClearCart={clearCart}
                  isLoggedIn={isLoggedIn}
                  user={user}
                />
              }
            />

            {/* Account */}
            <Route
              path="/order-history"
              element={isLoggedIn ? <OrderHistory /> : <Navigate to="/login" />}
            />

            {/* Admin */}
            <Route path="/admin/orders" element={isLoggedIn ? <AdminOrders /> : <Navigate to="/login" />} />
            <Route path="/admin/dashboard" element={isLoggedIn ? <AdminDashboard /> : <Navigate to="/login" />} />
            <Route path="/admin/books" element={isLoggedIn ? <AdminBooks /> : <Navigate to="/login" />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <Footer />
      </div>

      {/* Floating chat assistant */}
      <ChatBot />

      {/* Floating scroll-to-top button */}
      <ScrollToTopButton />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName="toast-custom"
        bodyClassName="toast-body-custom"
        progressClassName="toast-progress-custom"
      />
    </Router>
  );
}

export default App;
