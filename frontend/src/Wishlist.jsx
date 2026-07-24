import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Heart, ArrowRight } from 'lucide-react';
import BookCard from './components/BookCard';

const CURRENCY = new Intl.NumberFormat('en-BD', {
  style: 'currency',
  currency: 'BDT',
  maximumFractionDigits: 0,
});

/**
 * Wishlist page
 * Shows saved books with quick add-to-cart + remove.
 */
function Wishlist({ wishlist, onToggleWishlist, onAddToCart, cartItems = [], onClearWishlist }) {
  const navigate = useNavigate();

  const handleAddAll = () => {
    wishlist.forEach((book) => {
      onAddToCart(book);
    });
    toast.success(`${wishlist.length} book(s) added to cart! 🛒`);
  };

  // Empty state
  if (wishlist.length === 0) {
    return (
      <div className="animate-fade-up bg-stone-50">
        <div className="container-app flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
          <div className="relative grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br from-rose-50 to-rose-100 ring-8 ring-rose-50/50 sm:h-32 sm:w-32">
            <Heart className="h-12 w-12 text-rose-500 sm:h-14 sm:w-14" strokeWidth={1.5} />
          </div>
          <h1 className="mt-7 font-display text-2xl font-bold text-stone-900 sm:text-3xl">
            Your wishlist is empty
          </h1>
          <p className="mt-2 max-w-md text-sm text-stone-600 sm:text-base">
            Tap the heart on any book to save it here for later, so it's easy to find again.
          </p>
          <button
            onClick={() => navigate('/categories')}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-teal-700 px-8 py-3.5 font-semibold text-white transition hover:bg-teal-800 active:scale-95"
          >
            Browse books
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up bg-stone-50">
      {/* Header */}
      <div className="border-b border-stone-200 bg-white">
        <div className="container-app py-10 md:py-14">
          <nav className="text-sm text-stone-500">
            <button onClick={() => navigate('/')} className="hover:text-teal-700">Home</button>
            <span className="mx-2">/</span>
            <span className="text-stone-700">Wishlist</span>
          </nav>
          <div className="mt-2 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h1 className="font-display text-3xl font-bold text-stone-900 sm:text-4xl">
                Your wishlist
              </h1>
              <p className="mt-2 text-stone-600">
                {wishlist.length} saved {wishlist.length === 1 ? 'book' : 'books'}.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAddAll}
                className="rounded-full bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 active:scale-95"
              >
                Add all to cart
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Remove all books from your wishlist?')) {
                    onClearWishlist();
                    toast.info('Wishlist cleared.');
                  }
                }}
                className="rounded-full border border-stone-300 px-5 py-2.5 text-sm font-semibold text-stone-600 transition hover:bg-stone-50"
              >
                Clear all
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="container-app py-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {wishlist.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onAddToCart={onAddToCart}
              isInCart={cartItems.some((item) => item.id === book.id)}
              onToggleWishlist={onToggleWishlist}
              isWishlisted={true}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Wishlist;