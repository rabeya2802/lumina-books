import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BookCard from './BookCard';
import { getRecentlyViewed, clearRecentlyViewed } from '../services/recentlyViewed';

const CURRENCY = new Intl.NumberFormat('en-BD', {
  style: 'currency',
  currency: 'BDT',
  maximumFractionDigits: 0,
});

/**
 * RecentlyViewed
 * Displays up to 4 recently-viewed books (from localStorage).
 * Uses the same BookCard grid style as the rest of the site.
 *
 * Props:
 * - onAddToCart, cartItems, onToggleWishlist, isWishlisted
 */
function RecentlyViewed({
  onAddToCart,
  cartItems = [],
  onToggleWishlist,
  isWishlisted,
}) {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    setBooks(getRecentlyViewed());
  }, []);

  // Don't render anything if there's no history yet
  if (books.length === 0) return null;

  return (
    <section className="container-app py-12 md:py-16">
      <div className="mb-8 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <span className="fancy-divider">Pick up where you left off</span>
          <h2 className="mt-3 font-display text-2xl font-bold text-stone-900 sm:text-3xl">
            Recently Viewed
          </h2>
        </div>
        <button
          onClick={() => {
            clearRecentlyViewed();
            setBooks([]);
          }}
          className="text-sm font-semibold text-stone-400 transition hover:text-red-500"
        >
          Clear history
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {books.slice(0, 4).map((book) => (
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
    </section>
  );
}

export default RecentlyViewed;