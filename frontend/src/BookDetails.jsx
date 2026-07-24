import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from './services/api';
import { toast } from 'react-toastify';
import { Share2 } from 'lucide-react';
import BookCard from './components/BookCard';
import Reviews from './components/Reviews';
import ShareModal from './components/ShareModal';
import { addRecentlyViewed } from './services/recentlyViewed';

const CURRENCY = new Intl.NumberFormat('en-BD', {
  style: 'currency',
  currency: 'BDT',
  maximumFractionDigits: 0,
});

/**
 * BookDetails
 * Full details for a single book at /books/:id
 * - Large cover, price, stock, add-to-cart
 * - Description + key details
 * - Related books (same genre)
 */
function BookDetails({ isLoggedIn, onAddToCart, cartItems = [], onToggleWishlist, isWishlisted, user }) {
  const { id } = useParams();

  const [book, setBook] = useState(null);
  const [allBooks, setAllBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);
  const [shareOpen, setShareOpen] = useState(false);
  const [coverZoomed, setCoverZoomed] = useState(false);

  useEffect(() => {
    let active = true;
    async function fetchBook() {
      setLoading(true);
      setError('');
      try {
        const [bookRes, booksRes] = await Promise.all([
          api.get(`/api/books/${id}`),
          api.get('/api/books'),
        ]);
        if (active) {
          const fetchedBook = bookRes.data.data || null;
          setBook(fetchedBook);
          setAllBooks(booksRes.data.data || []);
          if (fetchedBook) addRecentlyViewed(fetchedBook);
        }
      } catch {
        if (active) setError('Could not load this book. It may have been removed.');
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchBook();
    return () => {
      active = false;
    };
  }, [id]);

  const isInCart = useMemo(
    () => (book ? cartItems.some((item) => item.id === book.id) : false),
    [cartItems, book]
  );

  // Related books: same genre, excluding current, up to 4
  const related = useMemo(() => {
    if (!book) return [];
    return allBooks
      .filter((b) => b.id !== book.id && (b.genre || '') === (book.genre || ''))
      .slice(0, 4);
  }, [allBooks, book]);

  const handleAddToCart = () => {
    if (!book) return;
    onAddToCart({
      id: book.id,
      title: book.title,
      author: book.author,
      price: book.price,
      cover_url: book.cover_url,
    });
    toast.success(`"${book.title}" added to cart! 🛒`);
  };

  const handleShare = () => {
    if (!book) return;
    setShareOpen(true);
  };

  const lowStock = book && Number(book.stock) > 0 && Number(book.stock) <= 3;
  const outOfStock = book && Number(book.stock) === 0;

  if (loading) {
    return (
      <div className="animate-fade-up bg-stone-50">
        {/* Breadcrumb */}
        <div className="border-b border-stone-200 bg-white">
          <div className="container-app py-4">
            <div className="h-4 w-64 animate-pulse rounded bg-stone-100" />
          </div>
        </div>

        <div className="container-app grid gap-10 py-10 md:py-14 lg:grid-cols-[400px_1fr]">
          {/* Cover */}
          <div className="mx-auto w-full max-w-xs sm:max-w-sm lg:mx-0">
            <div className="aspect-[3/4] w-full animate-pulse rounded-2xl bg-stone-200" />
          </div>

          {/* Info */}
          <div>
            <div className="h-6 w-20 animate-pulse rounded-full bg-stone-200" />
            <div className="mt-4 h-10 w-3/4 animate-pulse rounded bg-stone-200" />
            <div className="mt-3 h-5 w-1/2 animate-pulse rounded bg-stone-200" />
            <div className="mt-4 h-4 w-40 animate-pulse rounded bg-stone-200" />

            <div className="mt-6 h-9 w-32 animate-pulse rounded bg-stone-200" />
            <div className="mt-4 h-6 w-44 animate-pulse rounded-full bg-stone-200" />

            <div className="mt-6 space-y-2">
              <div className="h-4 w-full max-w-2xl animate-pulse rounded bg-stone-200" />
              <div className="h-4 w-full max-w-xl animate-pulse rounded bg-stone-200" />
              <div className="h-4 w-2/3 max-w-md animate-pulse rounded bg-stone-200" />
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="h-12 w-28 animate-pulse rounded-full bg-stone-200" />
              <div className="h-12 w-12 animate-pulse rounded-full bg-stone-200" />
              <div className="h-12 w-40 animate-pulse rounded-full bg-stone-200" />
            </div>

            <div className="mt-10 h-32 w-full animate-pulse rounded-2xl bg-stone-200" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="animate-fade-up bg-stone-50">
        <div className="container-app flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
          <p className="text-5xl">😕</p>
          <h1 className="mt-4 font-display text-2xl font-bold text-stone-900">
            Book not found
          </h1>
          <p className="mt-2 text-stone-600">
            {error || 'The book you are looking for does not exist.'}
          </p>
          <Link
            to="/categories"
            className="mt-6 rounded-full bg-teal-700 px-7 py-3 font-semibold text-white transition hover:bg-teal-800"
          >
            Browse all books
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up bg-stone-50">
      {/* Breadcrumb */}
      <div className="border-b border-stone-200 bg-white">
        <div className="container-app py-4">
          <nav className="flex flex-wrap items-center text-sm text-stone-500">
            <Link to="/" className="hover:text-teal-700">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/categories" className="hover:text-teal-700">Books</Link>
            <span className="mx-2">/</span>
                {book.genre && (
                  <>
                    <Link
                      to={`/categories?genre=${encodeURIComponent(book.genre)}`}
                      className="hover:text-teal-700"
                    >
                      {book.genre}
                    </Link>
                    <span className="mx-2">/</span>
                  </>
                )}
            <span className="truncate text-stone-700">{book.title}</span>
          </nav>
        </div>
      </div>

      {/* Main details */}
      <section className="container-app py-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[400px_1fr]">
          {/* Cover */}
          <div className="mx-auto w-full max-w-xs sm:max-w-sm lg:mx-0">
            <div className="relative">
              <div className="absolute inset-0 -z-10 translate-x-3 translate-y-3 rounded-3xl bg-teal-200/40 blur-2xl"></div>
              <div className="rounded-2xl bg-white p-3 shadow-xl ring-1 ring-stone-100">
                <button
                  type="button"
                  onClick={() => setCoverZoomed((zoomed) => !zoomed)}
                  aria-label={`${coverZoomed ? 'Zoom out' : 'Zoom in'} ${book.title} cover`}
                  aria-pressed={coverZoomed}
                  title="Hover or click to zoom"
                  className="group relative block w-full cursor-zoom-in overflow-hidden rounded-xl text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                >
                  <img
                    src={book.cover_url}
                    alt={book.title}
                    className={`aspect-[3/4] w-full rounded-xl object-cover transition-transform duration-500 ease-out motion-reduce:transform-none motion-reduce:transition-none group-hover:scale-110 ${
                      coverZoomed ? 'scale-125' : ''
                    }`}
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1544716278-e513176f20b5?w=600&q=80';
                    }}
                  />
                  <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-stone-900/70 px-2.5 py-1 text-xs font-semibold text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none">
                    {coverZoomed ? 'Click to zoom out' : 'Click to zoom'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Info */}
          <div>
            {book.genre && (
              <Link
                to={`/categories?genre=${encodeURIComponent(book.genre)}`}
                className="inline-block rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 transition hover:bg-teal-100"
              >
                {book.genre}
              </Link>
            )}

            <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-stone-900 sm:text-4xl">
              {book.title}
            </h1>
            <p className="mt-2 text-lg text-stone-500">
              by <span className="font-semibold text-stone-700">{book.author}</span>
            </p>

            {/* Rating — real data fetched by the Reviews section below;
                the hero shows a static fallback until reviews load. */}
            <div className="mt-3 flex items-center gap-2">
              <div className="flex text-amber-400">
                {['★', '★', '★', '★', '☆'].map((s, i) => (
                  <span key={i}>{s}</span>
                ))}
              </div>
              <span className="text-sm text-stone-500">See reviews below</span>
            </div>

            {/* Price */}
            <div className="mt-6 flex items-end gap-3">
              <span className="font-display text-4xl font-bold text-teal-700">
                {CURRENCY.format(book.price)}
              </span>
              <span className="mb-1 text-sm text-stone-400 line-through">
                {CURRENCY.format(Number(book.price) * 1.3)}
              </span>
              <span className="mb-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700">
                23% OFF
              </span>
            </div>

            {/* Stock status */}
            <div className="mt-4">
              {outOfStock ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-600">
                  <span className="h-2 w-2 rounded-full bg-red-500"></span>
                  Out of stock
                </span>
              ) : lowStock ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                  Only {book.stock} left in stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  In stock ({book.stock} available)
                </span>
              )}
            </div>

            {/* Quantity + Add to cart */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1 rounded-full border border-stone-200 bg-white p-1">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="grid h-10 w-10 place-items-center rounded-full bg-stone-100 text-lg font-bold text-stone-700 transition hover:bg-teal-100"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-10 text-center font-semibold text-stone-900">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="grid h-10 w-10 place-items-center rounded-full bg-stone-100 text-lg font-bold text-stone-700 transition hover:bg-teal-100"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Wishlist heart */}
              {onToggleWishlist && (
                <button
                  type="button"
                  onClick={() => onToggleWishlist(book)}
                  aria-label={isWishlisted(book.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                  className={`grid h-12 w-12 place-items-center rounded-full border transition ${
                    isWishlisted(book.id)
                      ? 'border-rose-300 bg-rose-50 text-rose-500 hover:bg-rose-100'
                      : 'border-stone-200 bg-white text-stone-500 hover:border-rose-300 hover:text-rose-500'
                  }`}
                >
                  {isWishlisted(book.id) ? '❤️' : '🤍'}
                </button>
              )}

              {/* Share */}
              <button
                type="button"
                onClick={handleShare}
                aria-label="Share this book"
                className="grid h-12 w-12 place-items-center rounded-full border border-stone-200 bg-white text-stone-500 transition hover:border-teal-300 hover:text-teal-700"
              >
                <Share2 className="h-5 w-5" strokeWidth={1.75} />
              </button>

              <button
                onClick={handleAddToCart}
                disabled={outOfStock || isInCart}
                className={`flex-1 rounded-full px-8 py-3.5 font-semibold text-white shadow-sm transition active:scale-95 sm:flex-none ${
                  outOfStock
                    ? 'cursor-not-allowed bg-stone-300'
                    : isInCart
                      ? 'cursor-default bg-emerald-500'
                      : 'bg-teal-700 hover:bg-teal-800'
                }`}
              >
                {outOfStock
                  ? 'Out of stock'
                  : isInCart
                    ? '✓ Added to cart'
                    : 'Add to cart'}
              </button>

              {isInCart && (
                <Link
                  to="/cart"
                  className="rounded-full border border-teal-700 px-6 py-3.5 font-semibold text-teal-700 transition hover:bg-teal-50"
                >
                  View cart
                </Link>
              )}
            </div>

            {/* Quick facts */}
            <div className="mt-10 grid gap-4 rounded-2xl border border-stone-200 bg-white p-6 sm:grid-cols-2">
              <DetailRow label="Author" value={book.author} />
              <DetailRow label="Genre" value={book.genre || '—'} />
              <DetailRow label="Availability" value={outOfStock ? 'Out of stock' : `${book.stock} in stock`} />
              <DetailRow label="Format" value="Paperback" />
            </div>

            {/* Description */}
            <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-6">
              <h2 className="font-display text-lg font-bold text-stone-900">Description</h2>
              {book.description ? (
                // whitespace-pre-line preserves the paragraph breaks entered by the admin
                <p className="mt-3 max-w-2xl whitespace-pre-line leading-relaxed text-stone-600">
                  {book.description}
                </p>
              ) : (
                <p className="mt-3 text-stone-500">No description available.</p>
              )}
            </div>

            {/* Trust badges */}
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-stone-600">
              <span className="inline-flex items-center gap-2">
                <span>🚚</span> Free shipping over ৳999
              </span>
              <span className="inline-flex items-center gap-2">
                <span>↩️</span> 7-day returns
              </span>
              <span className="inline-flex items-center gap-2">
                <span>🔒</span> Secure checkout
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Related books */}
      {related.length > 0 && (
        <section className="border-t border-stone-200 bg-white">
          <div className="container-app py-12 md:py-16">
            <div className="mb-8">
              <span className="fancy-divider">You may also like</span>
              <h2 className="mt-3 font-display text-2xl font-bold text-stone-900 sm:text-3xl">
                More in {book.genre || 'this genre'}
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((b) => (
                <BookCard
                  key={b.id}
                  book={b}
                  onAddToCart={onAddToCart}
                  isInCart={cartItems.some((item) => item.id === b.id)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== Reviews & Ratings ===== */}
      <Reviews bookId={book.id} isLoggedIn={isLoggedIn} user={user} />

      {/* Share dialog */}
      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        url={window.location.href}
        title={book.title}
        text={`Check out "${book.title}" by ${book.author} on Lumina Books!`}
      />
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-stone-100 pb-2 last:border-0 last:pb-0">
      <span className="text-sm text-stone-500">{label}</span>
      <span className="text-sm font-semibold text-stone-900">{value}</span>
    </div>
  );
}

export default BookDetails;
