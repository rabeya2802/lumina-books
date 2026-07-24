import { useEffect, useMemo, useRef, useState } from 'react';
import api from '../services/api';
import { Link, NavLink, useNavigate } from 'react-router-dom';

/**
 * Navbar
 * Sticky, production-style navigation bar with:
 * - Brand logo
 * - Desktop nav links with active state
 * - Search box with live suggestions dropdown
 * - Cart badge
 * - User dropdown (orders + admin links)
 * - Mobile slide-in menu
 */
function Navbar({
  searchQuery,
  onSearchChange,
  onSearchClick,
  onClearSearch,
  cartCount = 0,
  wishlistCount = 0,
  isLoggedIn,
  user,
  onLogout,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allBooks, setAllBooks] = useState([]);
  const userMenuRef = useRef(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Fetch all books once for suggestions
  useEffect(() => {
    let active = true;
    api
      .get('/api/books')
      .then((res) => {
        if (active) setAllBooks(res.data.data || []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Live suggestions based on search query
  const suggestions = useMemo(() => {
    const q = (searchQuery || '').toLowerCase().trim();
    if (!q) return [];
    return allBooks
      .filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          (b.genre || '').toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [searchQuery, allBooks]);

  // Detect scroll to add elevation
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close user dropdown + search suggestions on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Books', to: '/categories' },
    { label: 'About', to: '/about' },
    { label: 'Contact', to: '/contact' },
    { label: 'FAQ', to: '/faq' },
  ];

  const linkClass = ({ isActive }) =>
    `nav-link text-sm font-medium transition-colors ${
      isActive ? 'is-active text-teal-700' : 'text-stone-600 hover:text-teal-700'
    }`;

  const handleSearchKey = (e) => {
    if (e.key === 'Enter') {
      onSearchClick();
      navigate('/categories');
    }
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-brand-gradient text-white">
        <div className="container-app flex items-center justify-center gap-2 py-2 text-center text-xs sm:text-sm">
          <span aria-hidden>🚚</span>
          <span>Free shipping on orders over <strong>৳999</strong> — read more, worry less.</span>
        </div>
      </div>

      <header
        className={`sticky top-0 z-50 bg-white/95 backdrop-blur transition-shadow ${
          scrolled ? 'shadow-md' : 'shadow-sm'
        }`}
      >
        <nav className="container-app flex h-16 items-center justify-between gap-4 md:h-20">
          {/* Logo */}
          <Link to="/" onClick={closeMobile} className="flex items-center gap-2 flex-shrink-0">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-700 text-white text-xl shadow-sm">
              📚
            </span>
            <span className="font-display text-2xl font-bold text-stone-900">
              Lumina <span className="text-teal-700">Books</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden items-center gap-8 lg:flex">
            {navLinks.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className={linkClass} end={item.to === '/'}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search (desktop) with live suggestions */}
            <div className="relative hidden md:block" ref={searchRef}>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    onSearchChange(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={handleSearchKey}
                  placeholder="Search books, authors…"
                  className="w-44 rounded-full border border-stone-200 bg-stone-50 py-2 pl-10 pr-9 text-sm outline-none transition focus:w-56 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20 lg:w-64 lg:focus:w-72"
                />
                <span className="pointer-events-none absolute left-3 text-stone-400">🔍</span>
                {searchQuery ? (
                  <button
                    onClick={() => {
                      onClearSearch();
                    }}
                    className="absolute right-3 text-stone-400 hover:text-red-500"
                    title="Clear search"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                ) : null}
              </div>

              {/* Suggestions dropdown */}
              {showSuggestions && searchQuery && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-xl">
                  {suggestions.length > 0 ? (
                    <ul className="max-h-80 overflow-y-auto py-1">
                      {suggestions.map((b) => (
                        <li key={b.id}>
                          <button
                            onClick={() => {
                              onSearchChange(b.title);
                              setShowSuggestions(false);
                              onSearchClick();
                              navigate('/categories');
                            }}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-teal-50"
                          >
                            <img
                              src={b.cover_url}
                              alt=""
                              className="h-10 w-8 flex-shrink-0 rounded object-cover"
                              onError={(e) => {
                                e.currentTarget.src =
                                  'https://images.unsplash.com/photo-1544716278-e513176f20b5?w=100&q=80';
                              }}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-stone-900">
                                {b.title}
                              </p>
                              <p className="truncate text-xs text-stone-500">
                                {b.author}
                                {b.genre && ` · ${b.genre}`}
                              </p>
                            </div>
                          </button>
                        </li>
                      ))}
                      <li className="border-t border-stone-100">
                        <button
                          onClick={() => {
                            onSearchClick();
                            setShowSuggestions(false);
                            navigate('/categories');
                          }}
                          className="flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-teal-700 transition hover:bg-teal-50"
                        >
                          See all results for "{searchQuery}" →
                        </button>
                      </li>
                    </ul>
                  ) : (
                    <div className="px-4 py-6 text-center text-sm text-stone-500">
                      <p className="text-2xl">🔍</p>
                      <p className="mt-1">No books found for "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative grid h-10 w-10 place-items-center rounded-full bg-stone-100 text-lg text-stone-700 transition hover:bg-rose-50 hover:text-rose-500"
              title="Wishlist"
              aria-label={`Wishlist with ${wishlistCount} items`}
            >
              ❤️
              {wishlistCount > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-emerald-600 px-1 text-xs font-bold text-white shadow">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative grid h-10 w-10 place-items-center rounded-full bg-stone-100 text-lg text-stone-700 transition hover:bg-teal-50 hover:text-teal-700"
              title="Cart"
              aria-label={`Cart with ${cartCount} items`}
            >
              🛒
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-teal-600 px-1 text-xs font-bold text-white shadow">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User */}
            {isLoggedIn && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full bg-stone-100 py-1.5 pl-1.5 pr-3 transition hover:bg-teal-50"
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-teal-700 text-sm font-bold text-white">
                    {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden text-sm font-semibold text-stone-700 sm:block max-w-[120px] truncate">
                    {user.name || user.email}
                  </span>
                  <span className="hidden text-xs text-stone-400 sm:block">▾</span>
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-xl"
                  >
                    <div className="border-b border-stone-100 bg-stone-50 px-4 py-3">
                      <p className="text-sm font-semibold text-stone-900 truncate">
                        {user.name || 'Reader'}
                      </p>
                      <p className="truncate text-xs text-stone-500">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/order-history"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-teal-50"
                      >
                        <span>📦</span> My Orders
                      </Link>
                      {user.role === 'admin' && (
                        <>
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-teal-50"
                          >
                            <span>🎛️</span> Dashboard
                          </Link>
                          <Link
                            to="/admin/books"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-teal-50"
                          >
                            <span>📚</span> Manage Books
                          </Link>
                          <Link
                            to="/admin/orders"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-teal-50"
                          >
                            <span>🧾</span> Manage Orders
                          </Link>
                        </>
                      )}
                    </div>
                    <div className="border-t border-stone-100 py-1">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onLogout();
                          navigate('/');
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                      >
                        <span>🚪</span> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden rounded-full bg-teal-700 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 sm:inline-block"
              >
                Sign in
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              className="grid h-10 w-10 place-items-center rounded-full bg-stone-100 text-stone-700 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <span className="flex flex-col gap-1.5">
                <span className="block h-0.5 w-5 bg-current"></span>
                <span className="block h-0.5 w-5 bg-current"></span>
                <span className="block h-0.5 w-5 bg-current"></span>
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile slide-in menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeMobile}
          />
          {/* Drawer */}
          <div className="absolute right-0 top-0 h-full w-[82%] max-w-sm overflow-y-auto bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
              <span className="font-display text-xl font-bold text-stone-900">
                Lumina <span className="text-teal-700">Books</span>
              </span>
              <button
                onClick={closeMobile}
                className="grid h-10 w-10 place-items-center rounded-full bg-stone-100 text-stone-600"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            {/* Mobile search with live suggestions */}
            <div className="p-5">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    onSearchChange(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onSearchClick();
                      closeMobile();
                      navigate('/categories');
                    }
                  }}
                  placeholder="Search books, authors…"
                  className="w-full rounded-full border border-stone-200 bg-stone-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-teal-500 focus:bg-white"
                />
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                  🔍
                </span>

                {/* Mobile suggestions dropdown */}
                {showSuggestions && searchQuery && (
                  <div className="mt-2 overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-lg">
                    {suggestions.length > 0 ? (
                      <ul className="max-h-72 overflow-y-auto py-1">
                        {suggestions.map((b) => (
                          <li key={b.id}>
                            <button
                              onClick={() => {
                                onSearchChange(b.title);
                                setShowSuggestions(false);
                                onSearchClick();
                                closeMobile();
                                navigate('/categories');
                              }}
                              className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-teal-50"
                            >
                              <img
                                src={b.cover_url}
                                alt=""
                                className="h-10 w-8 flex-shrink-0 rounded object-cover"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    'https://images.unsplash.com/photo-1544716278-e513176f20b5?w=100&q=80';
                                }}
                              />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-stone-900">
                                  {b.title}
                                </p>
                                <p className="truncate text-xs text-stone-500">
                                  {b.author}
                                  {b.genre && ` · ${b.genre}`}
                                </p>
                              </div>
                            </button>
                          </li>
                        ))}
                        <li className="border-t border-stone-100">
                          <button
                            onClick={() => {
                              onSearchClick();
                              setShowSuggestions(false);
                              closeMobile();
                              navigate('/categories');
                            }}
                            className="flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-teal-700 transition hover:bg-teal-50"
                          >
                            See all results for "{searchQuery}" →
                          </button>
                        </li>
                      </ul>
                    ) : (
                      <div className="px-4 py-6 text-center text-sm text-stone-500">
                        <p className="text-2xl">🔍</p>
                        <p className="mt-1">No books found for "{searchQuery}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Links */}
            <nav className="px-5 pb-6">
              <ul className="space-y-1">
                {navLinks.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      onClick={closeMobile}
                      end={item.to === '/'}
                      className={({ isActive }) =>
                        `block rounded-xl px-4 py-3 text-base font-medium transition ${
                          isActive
                            ? 'bg-teal-50 text-teal-700'
                            : 'text-stone-700 hover:bg-stone-50'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>

              <div className="mt-6 border-t border-stone-100 pt-6">
                {isLoggedIn ? (
                  <button
                    onClick={() => {
                      closeMobile();
                      onLogout();
                      navigate('/');
                    }}
                    className="w-full rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-100"
                  >
                    🚪 Logout
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={closeMobile}
                    className="block w-full rounded-xl bg-teal-700 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-teal-800"
                  >
                    Sign in / Create account
                  </Link>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;