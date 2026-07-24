import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from './services/api';
import { toast } from 'react-toastify';
import BookCard from './components/BookCard';
import BookCardSkeleton from './components/BookCardSkeleton';
import RecentlyViewed from './components/RecentlyViewed';
import Recommendations from './components/Recommendations';

const CURRENCY = new Intl.NumberFormat('en-BD', {
  style: 'currency',
  currency: 'BDT',
  maximumFractionDigits: 0,
});

/**
 * Home (Landing Page)
 * Minimal, realistic layout:
 * - Featured book hero (spotlight)
 * - Trending books row (horizontal scroll)
 * - Soft pastel category cards
 * - Featured books grid
 */
function Home({ isLoggedIn, onAddToCart, cartItems, onToggleWishlist, isWishlisted })  {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function fetchBooks() {
      try {
        const response = await api.get('/api/books');
        const booksArray = response.data.data || response.data;
        if (active) setBooks(booksArray);
      } catch {
        if (active) setError('Could not load books right now. Please try again later.');
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchBooks();
    return () => {
      active = false;
    };
  }, []);

  // Derive categories from the genre field
  const categories = useMemo(() => {
    const map = new Map();
    books.forEach((b) => {
      const g = (b.genre || 'Other').trim();
      if (!map.has(g)) map.set(g, { name: g, count: 0, cover: b.cover_url });
      map.get(g).count += 1;
    });
    return Array.from(map.values());
  }, [books]);

  // Featured book = the one manually marked by the admin as Book of the Week (hero spotlight)
  const featuredBook = books.find((b) => b.is_book_of_the_week) || null;

  // Trending = books with stock (popular-ish, fallback to first 6)
  const trending = useMemo(
    () => books.filter((b) => Number(b.stock) > 0).slice(0, 8),
    [books]
  );

  // Featured grid = next 8 books
  const featured = useMemo(() => books.slice(0, 8), [books]);

  // Trending row horizontal scroll (needed on tablet/desktop, where there's
  // no touch swipe and the scrollbar is hidden for a cleaner look)
  const trendingScrollRef = useRef(null);
  const scrollTrending = (direction) => {
    const el = trendingScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  // Category visuals (soft pastels + icon)
  const categoryVisuals = {
    Fiction: { icon: '✨', cls: 'cat-pastel-rose', text: 'text-rose-700' },
    'Self-help': { icon: '🌱', cls: 'cat-pastel-teal', text: 'text-teal-700' },
    'Self development': { icon: '🌿', cls: 'cat-pastel-teal', text: 'text-teal-700' },
    Productivity: { icon: '⚡', cls: 'cat-pastel-amber', text: 'text-amber-700' },
    Business: { icon: '📈', cls: 'cat-pastel-blue', text: 'text-blue-700' },
    Biography: { icon: '👤', cls: 'cat-pastel-violet', text: 'text-violet-700' },
    Other: { icon: '📚', cls: 'cat-pastel-stone', text: 'text-stone-700' },
  };

  return (
    <div className="animate-fade-up">
      {/* ============== FEATURED BOOK HERO (loading) ============== */}
      {loading && !featuredBook && (
        <section className="overflow-hidden bg-hero-warm">
          <div className="container-app grid items-center gap-10 py-12 md:py-16 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="h-6 w-36 animate-pulse rounded-full bg-white/60" />
              <div className="mt-4 h-11 w-full max-w-md animate-pulse rounded bg-white/60" />
              <div className="mt-3 h-11 w-3/4 max-w-sm animate-pulse rounded bg-white/60" />
              <div className="mt-4 h-4 w-40 animate-pulse rounded bg-white/60" />
              <div className="mt-5 h-4 w-full max-w-lg animate-pulse rounded bg-white/60" />
              <div className="mt-2 h-4 w-2/3 max-w-lg animate-pulse rounded bg-white/60" />
              <div className="mt-7 flex items-center gap-4">
                <div className="h-9 w-24 animate-pulse rounded bg-white/60" />
                <div className="h-12 w-32 animate-pulse rounded-full bg-white/60" />
                <div className="h-12 w-28 animate-pulse rounded-full bg-white/60" />
              </div>
            </div>
            <div className="mx-auto w-full max-w-xs sm:max-w-sm">
              <div className="aspect-[3/4] w-full animate-pulse rounded-xl bg-white/60" />
            </div>
          </div>
        </section>
      )}

      {/* ============== FEATURED BOOK HERO ============== */}
      {featuredBook && (
        <section className="overflow-hidden bg-hero-warm">
          <div className="container-app grid items-center gap-10 py-12 md:py-16 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Copy */}
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-800">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-600"></span>
                Book of the week
              </span>
              <p className="mt-3 text-sm font-medium italic text-teal-700">
                Illuminate Your Mind, One Book at a Time.
              </p>
              <h1 className="mt-3 font-display text-4xl font-bold leading-[1.1] text-stone-900 sm:text-5xl">
                {featuredBook.title}
              </h1>
              <p className="mt-3 text-base text-stone-500">
                by <span className="font-semibold text-stone-700">{featuredBook.author}</span>
                {featuredBook.genre && (
                  <span className="text-stone-400"> · {featuredBook.genre}</span>
                )}
              </p>
              <p className="mt-5 line-clamp-4 max-w-lg leading-relaxed text-stone-600">
                {featuredBook.description || 'No description available.'}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-4">
                <span className="font-display text-3xl font-bold text-teal-700">
                  {CURRENCY.format(featuredBook.price)}
                </span>
                <button
                  onClick={() => {
                    onAddToCart({
                      id: featuredBook.id,
                      title: featuredBook.title,
                      author: featuredBook.author,
                      price: featuredBook.price,
                      cover_url: featuredBook.cover_url,
                    });
                    toast.success(`"${featuredBook.title}" added to cart! 🛒`);
                  }}
                  className="rounded-full bg-teal-700 px-7 py-3 font-semibold text-white shadow-sm transition hover:bg-teal-800 active:scale-95"
                >
                  Add to cart
                </button>
                <Link
                  to="/categories"
                  className="rounded-full border border-stone-300 px-7 py-3 font-semibold text-stone-700 transition hover:border-teal-500 hover:text-teal-700"
                >
                  Browse all
                </Link>
              </div>
            </div>

            {/* Book cover (links to details) */}
            <Link to={`/books/${featuredBook.id}`} className="relative mx-auto block w-full max-w-xs sm:max-w-sm">
              <div className="absolute inset-0 -z-10 translate-x-3 translate-y-3 rounded-2xl bg-teal-200/40 blur-2xl"></div>
              <div className="overflow-hidden rounded-xl bg-white p-3 shadow-[0_25px_55px_-25px_rgba(41,37,36,0.35)] ring-1 ring-stone-100 transition-transform duration-300 hover:-translate-y-1">
                <img
                  src={featuredBook.cover_url}
                  alt={featuredBook.title}
                  className="aspect-[3/4] w-full rounded-lg object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1544716278-e513176f20b5?w=600&q=80';
                  }}
                />
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* ============== FEATURED BOOK HERO (none selected) ============== */}
      {!loading && !featuredBook && (
        <section className="overflow-hidden bg-hero-warm">
          <div className="container-app py-16 text-center md:py-20">
            <p className="text-sm font-medium italic text-teal-700">
              Illuminate Your Mind, One Book at a Time.
            </p>
            <p className="mt-2 text-lg font-semibold text-stone-600">No Book of the Week selected.</p>
          </div>
        </section>
      )}

      {/* ============== TRENDING ROW ============== */}
      <section className="border-y border-stone-200 bg-white">
        <div className="container-app py-10 md:py-14">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <span className="fancy-divider">Hot right now</span>
              <h2 className="mt-3 font-display text-2xl font-bold text-stone-900 sm:text-3xl">
                Trending Books
              </h2>
            </div>
            <Link
              to="/categories"
              className="hidden text-sm font-semibold text-teal-700 hover:text-teal-900 sm:block"
            >
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="flex gap-4 overflow-hidden pl-6 pr-6 sm:pl-12 sm:pr-12">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-32 flex-shrink-0 sm:w-40 md:w-44">
                  <div className="aspect-[3/4] w-full animate-pulse rounded-xl bg-stone-200" />
                  <div className="mt-2 h-3.5 w-4/5 animate-pulse rounded bg-stone-200" />
                  <div className="mt-1.5 h-3 w-2/5 animate-pulse rounded bg-stone-200" />
                  <div className="mt-1.5 h-3.5 w-1/3 animate-pulse rounded bg-stone-200" />
                </div>
              ))}
            </div>
          ) : (
            <div className="relative">
              {/* Edge fades hint that the row scrolls (visible whenever content overflows) */}
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-white to-transparent sm:w-10" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-white to-transparent sm:w-10" />

              {/* Scroll arrows: mobile relies on touch swipe, so only show
                  these where there's typically no touch input (tablet/desktop) */}
              <button
                type="button"
                onClick={() => scrollTrending(-1)}
                aria-label="Scroll trending books left"
                className="absolute left-1 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-white p-2 text-stone-600 shadow-md ring-1 ring-stone-200 transition hover:text-teal-700 sm:flex"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => scrollTrending(1)}
                aria-label="Scroll trending books right"
                className="absolute right-1 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-white p-2 text-stone-600 shadow-md ring-1 ring-stone-200 transition hover:text-teal-700 sm:flex"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              </button>

              <div
                ref={trendingScrollRef}
                className="scroll-snap-x flex gap-4 overflow-x-auto pb-3 pl-6 pr-6 scroll-pl-6 scroll-pr-6 sm:pl-12 sm:pr-12 sm:scroll-pl-12 sm:scroll-pr-12"
              >
                {trending.map((book) => (
                  <Link
                    key={book.id}
                    to={`/books/${book.id}`}
                    className="group w-32 flex-shrink-0 sm:w-40 md:w-44"
                  >
                    <div className="overflow-hidden rounded-xl bg-stone-100 shadow-sm transition-transform duration-300 group-hover:-translate-y-1">
                      <img
                        src={book.cover_url}
                        alt={book.title}
                        loading="lazy"
                        className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src =
                            'https://images.unsplash.com/photo-1544716278-e513176f20b5?w=400&q=80';
                        }}
                      />
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm font-semibold text-stone-800">
                      {book.title}
                    </p>
                    <p className="text-xs text-stone-500">{book.author}</p>
                    <p className="mt-1 text-sm font-bold text-teal-700">
                      {CURRENCY.format(book.price)}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ============== RECENTLY VIEWED ============== */}
      <RecentlyViewed
        onAddToCart={onAddToCart}
        cartItems={cartItems}
        onToggleWishlist={onToggleWishlist}
        isWishlisted={isWishlisted}
      />

      {/* ============== RECOMMENDATIONS ============== */}
      <Recommendations
        onAddToCart={onAddToCart}
        cartItems={cartItems}
        onToggleWishlist={onToggleWishlist}
        isWishlisted={isWishlisted}
      />

      {/* ============== CATEGORIES ============== */}
      <section className="container-app py-12 md:py-16">
        <div className="mb-8 text-center">
          <span className="fancy-divider">Explore by genre</span>
          <h2 className="mt-3 font-display text-2xl font-bold text-stone-900 sm:text-3xl">
            Browse Categories
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-stone-600">
            Find your next read by mood and topic.
          </p>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-stone-100" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(categories.length ? categories : fallbackCategories).map((cat) => {
              const v = categoryVisuals[cat.name] || categoryVisuals.Other;
              return (
                <Link
                  key={cat.name}
                  to={`/categories?genre=${encodeURIComponent(cat.name)}`}
                  className={`group flex items-center gap-4 rounded-2xl border border-stone-100 ${v.cls} p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md`}
                >
                  <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl bg-white/70 text-2xl shadow-sm">
                    {v.icon}
                  </span>
                  <div className="flex-1">
                    <h3 className={`font-display text-lg font-bold ${v.text}`}>
                      {cat.name}
                    </h3>
                    <p className="text-xs text-stone-500">
                      {cat.count} {cat.count === 1 ? 'book' : 'books'}
                    </p>
                  </div>
                  <span className="text-stone-400 transition-transform group-hover:translate-x-1 group-hover:text-stone-600">
                    →
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ============== FEATURED BOOKS ============== */}
      <section className="border-t border-stone-200 bg-stone-50">
        <div className="container-app py-12 md:py-16">
          <div className="mb-8 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <span className="fancy-divider">Handpicked for you</span>
              <h2 className="mt-3 font-display text-2xl font-bold text-stone-900 sm:text-3xl">
                Featured Books
              </h2>
              <p className="mt-1 text-sm text-stone-600">
                Our newest arrivals, ready to ship.
              </p>
            </div>
            <Link
              to="/categories"
              className="rounded-full border border-teal-700 px-5 py-2 text-sm font-semibold text-teal-700 transition hover:bg-teal-50"
            >
              View all →
            </Link>
          </div>

          {error && (
            <div className="rounded-2xl bg-red-50 p-6 text-center text-red-700">
              {error}
            </div>
          )}

          {!error && loading && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <BookCardSkeleton key={i} />
              ))}
            </div>
          )}

          {!error && !loading && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featured.length > 0 ? (
                featured.map((book) => (
                
                  <BookCard
                    key={book.id}
                    book={book}
                    onAddToCart={onAddToCart}
                    isInCart={cartItems.some((item) => item.id === book.id)}
                    onToggleWishlist={onToggleWishlist}
                    isWishlisted={isWishlisted(book.id)}
                  />
                ))
              ) : (
                <div className="col-span-full rounded-2xl border-2 border-dashed border-stone-200 bg-white p-12 text-center">
                  <p className="text-4xl">🔍</p>
                  <p className="mt-3 text-lg font-semibold text-stone-700">No books found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ============== CTA BANNER ============== */}
      <section className="container-app py-12 md:py-16">
        <div className="relative overflow-hidden rounded-3xl bg-brand-gradient px-8 py-12 text-center text-white shadow-lg md:py-16">
          <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/10"></div>
          <div className="absolute -bottom-12 -right-8 h-56 w-56 rounded-full bg-white/10"></div>
          <div className="relative z-10 mx-auto max-w-2xl">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              Ready to start reading?
            </h2>
            <p className="mt-3 text-teal-50">
              Join thousands of readers who trust Lumina Books. Sign up in seconds and build your library.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {!isLoggedIn ? (
                <Link
                  to="/login"
                  className="w-full rounded-full bg-white px-7 py-3 font-semibold text-teal-700 shadow-sm transition hover:bg-teal-50 active:scale-95 sm:w-auto"
                >
                  Get Started — Free
                </Link>
              ) : (
                <Link
                  to="/categories"
                  className="w-full rounded-full bg-white px-7 py-3 font-semibold text-teal-700 shadow-sm transition hover:bg-teal-50 active:scale-95 sm:w-auto"
                >
                  Continue Shopping
                </Link>
              )}
              <button
                onClick={() => navigate('/about')}
                className="w-full rounded-full border border-white/40 px-7 py-3 font-semibold text-white transition hover:bg-white/10 active:scale-95 sm:w-auto"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const fallbackCategories = [
  { name: 'Fiction', count: 0 },
  { name: 'Self-help', count: 0 },
  { name: 'Productivity', count: 0 },
  { name: 'Business', count: 0 },
  { name: 'Biography', count: 0 },
  { name: 'Other', count: 0 },
];

export default Home;