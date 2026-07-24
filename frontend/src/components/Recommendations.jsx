import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import BookCard from './BookCard';
import BookCardSkeleton from './BookCardSkeleton';
import { getRecentlyViewed } from '../services/recentlyViewed';

/**
 * Recommendations
 * Personalized "You May Also Like" section based on the user's recently
 * viewed books. It derives the user's preferred genres from their history
 * and suggests books from those genres that they haven't viewed yet.
 *
 * Falls back to newest arrivals if there's no history yet.
 *
 * Props: onAddToCart, cartItems, onToggleWishlist, isWishlisted
 */
function Recommendations({
  onAddToCart,
  cartItems = [],
  onToggleWishlist,
  isWishlisted,
}) {
  const [allBooks, setAllBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    let active = true;
    async function fetchBooks() {
      try {
        const res = await api.get('/api/books');
        if (active) setAllBooks(res.data.data || []);
      } catch {
        // silent
      } finally {
        if (active) setLoading(false);
      }
    }
    setRecentlyViewed(getRecentlyViewed());
    fetchBooks();
    return () => {
      active = false;
    };
  }, []);

  // Build personalized recommendations
  const recommended = (() => {
    if (allBooks.length === 0) return [];

    // Genres the user has browsed, ordered by recency (most recent first)
    const viewedGenres = [];
    recentlyViewed.forEach((b) => {
      const g = (b.genre || 'Other').trim();
      if (!viewedGenres.includes(g)) viewedGenres.push(g);
    });

    // IDs the user has already viewed (to exclude them)
    const viewedIds = new Set(recentlyViewed.map((b) => b.id));

    // Score each book: higher = more relevant
    // - +3 if it matches the user's most-recent genre
    // - +2 if it matches any other viewed genre
    // - +1 for being a recent arrival (newest first)
    const scored = allBooks
      .filter((b) => !viewedIds.has(b.id))
      .map((b, idx) => {
        const g = (b.genre || 'Other').trim();
        let score = 0;
        if (viewedGenres.length > 0) {
          if (g === viewedGenres[0]) score += 3;
          else if (viewedGenres.includes(g)) score += 2;
        }
        score += Math.max(0, 5 - idx) * 0.1; // slight recency boost
        return { book: b, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((item) => item.book);

    // If we have no history (no viewed genres), just return newest 4
    if (viewedGenres.length === 0) {
      return allBooks.slice(0, 4);
    }

    return scored;
  })();

  // Determine the "reason" text for the heading
  const reasonText = (() => {
    if (recentlyViewed.length === 0) return 'Fresh arrivals for you';
    const topGenre = (recentlyViewed[0].genre || '').trim();
    return topGenre
      ? `Because you viewed ${topGenre}`
      : 'Based on your recent views';
  })();

  // Don't render if we have no books at all
  if (!loading && recommended.length === 0) return null;

  return (
    <section className="container-app py-12 md:py-16">
      <div className="mb-8 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <span className="fancy-divider">Personalized for you</span>
          <h2 className="mt-3 font-display text-2xl font-bold text-stone-900 sm:text-3xl">
            You May Also Like
          </h2>
          <p className="mt-1 text-sm text-stone-600">{reasonText}</p>
        </div>
        <Link
          to="/categories"
          className="rounded-full border border-teal-700 px-5 py-2 text-sm font-semibold text-teal-700 transition hover:bg-teal-50"
        >
          Explore all →
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <BookCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recommended.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onAddToCart={onAddToCart}
              isInCart={cartItems.some((item) => item.id === book.id)}
              onToggleWishlist={onToggleWishlist}
              isWishlisted={isWishlisted(book.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default Recommendations;