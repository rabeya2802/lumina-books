import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Header({ searchQuery, onSearchChange, onSearchClick, onClearSearch, cartCount = 0, user, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Browse Books', href: '/' },
    { label: 'Categories', href: '/' },
    { label: 'Orders', href: '/' },
    { label: 'Contact', href: '/' }
  ];

  const handleCartClick = () => {
    navigate('/cart');
  };

  return (
    <header className="w-full bg-white shadow-md">
      {/* Top Navigation Bar */}
      <nav className="mx-auto flex max-w-full items-center justify-between gap-4 bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-4 md:gap-6 md:px-8">
        {/* Logo Section */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-2xl md:text-3xl">📚</span>
          <h1 className="text-xl font-bold text-white md:text-2xl">Lumina Books</h1>
        </div>

        {/* Desktop Navigation Menu */}
        <ul className="hidden gap-4 md:flex lg:gap-8">
          {navItems.map((item) => (
            <li key={item.label}>
              <a 
                href={item.href} 
                className="font-medium text-white transition hover:text-amber-100"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        {user?.role === 'admin' && (
          <div className="hidden flex-1 max-w-xs items-center rounded-full bg-white px-3 py-2 sm:flex gap-2">
            <input 
              type="text" 
              placeholder="Search books..." 
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSearchClick()}
              className="flex-1 border-none bg-transparent text-sm outline-none cursor-text"
            />
            {/* Clear Button - Shows when there's text */}
            {searchQuery && (
              <button 
                onClick={onClearSearch}
                className="text-lg hover:text-red-500 transition duration-200 cursor-pointer hover:scale-110"
                title="Clear search"
              >
                ✕
              </button>
            )}
            {/* Search Button - Click to apply search */}
            <button 
              onClick={onSearchClick}
              className="text-lg hover:text-orange-600 transition duration-200 font-bold cursor-pointer hover:scale-110"
              title="Search"
            >
              🔍
            </button>
          </div>
        )}

        {/* Right Section - Cart and User */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* CART BUTTON - Shows cart count as badge */}
          <button 
            onClick={handleCartClick}
            className="relative rounded-lg bg-white/20 p-2 text-white transition hover:bg-white/30 md:px-3"
            title="View cart"
          >
            <span className="text-xl md:text-2xl">🛒</span>
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>
          {user ? (
            <>
              <div className="relative group">
                <div className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2 text-white hover:bg-white/30 transition cursor-pointer">
                  <span className="text-xl">👤</span>
                  <div className="hidden md:block text-left">
                    <p className="text-xs opacity-75">Welcome</p>
                    <p className="text-sm font-semibold truncate max-w-[100px]">{user?.name || user?.email}</p>
                  </div>
                </div>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-0 hidden group-hover:block bg-white rounded-lg shadow-lg border border-gray-200 z-50 min-w-[180px]">
                  <button
                    onClick={() => navigate('/order-history')}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-amber-50 transition border-b border-gray-100"
                  >
                    📦 My Orders
                  </button>
                  
                  {/* Admin Link - Show only for admins */}
                  {user?.role === 'admin' ? (
                    <>
                      <button
                        onClick={() => navigate('/admin/dashboard')}
                        className="w-full text-left px-4 py-3 text-blue-700 hover:bg-blue-50 transition font-semibold border-b border-gray-100"
                      >
                        🎛️ Admin Dashboard
                      </button>
                      <button
                        onClick={() => navigate('/admin/books')}
                        className="w-full text-left px-4 py-3 text-indigo-700 hover:bg-indigo-50 transition font-semibold border-b border-gray-100"
                      >
                        📚 Manage Books
                      </button>
                      <button
                        onClick={() => navigate('/admin/orders')}
                        className="w-full text-left px-4 py-3 text-orange-700 hover:bg-orange-50 transition font-semibold border-b border-gray-100"
                      >
                        📦 Manage Orders
                      </button>
                    </>
                  ) : null}

                  <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-3 text-red-700 hover:bg-red-50 transition"
                  >
                    🚪 Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <button 
              onClick={() => navigate('/login')}
              className="rounded-lg bg-white/20 px-3 py-2 text-white transition hover:bg-white/30"
              title="Login"
            >
              <span className="text-xl">👤</span>
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden flex flex-col gap-1.5"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="h-0.5 w-6 bg-white transition"></span>
          <span className="h-0.5 w-6 bg-white transition"></span>
          <span className="h-0.5 w-6 bg-white transition"></span>
        </button>
      </nav>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-amber-200 bg-orange-50">
          <ul className="space-y-2 px-4 py-4">
            {navItems.map((item) => (
              <li key={item.label}>
                <a 
                  href={item.href} 
                  className="block rounded-lg px-3 py-2 font-medium text-gray-800 transition hover:bg-amber-100"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="space-y-2 border-t border-amber-200 px-4 py-4">
            <button className="w-full rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white transition hover:bg-orange-600">
              🛒 Cart
            </button>
            <button className="w-full rounded-lg bg-amber-500 px-4 py-2 font-semibold text-white transition hover:bg-amber-600">
              👤 Account
            </button>
          </div>
        </div>
      )}

      {/* Hero Banner Section */}
      <div className="bg-gradient-to-r from-amber-400 to-orange-400 py-12 text-center text-white md:py-20">
        <h2 className="text-3xl font-bold md:text-5xl">Welcome to Lumina Books</h2>
        <p className="mt-2 text-base font-medium md:text-lg">Illuminate Your Mind, One Book at a Time.</p>
        <button className="mt-6 rounded-lg bg-white px-6 py-3 font-semibold text-orange-500 transition hover:bg-gray-100 md:px-8 md:py-4">
          Start Shopping
        </button>
      </div>
    </header>
  );
}

export default Header;