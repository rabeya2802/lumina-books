import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const CURRENCY = new Intl.NumberFormat('en-BD', {
  style: 'currency',
  currency: 'BDT',
  maximumFractionDigits: 0,
});

/**
 * BookCard
 * Reusable card for displaying a single book.
 *
 * Props:
 * - book: { id, title, author, genre, price, stock, cover_url }
 * - onAddToCart: function(book)
 * - isInCart: boolean (true when this book is already in the cart)
 */
function BookCard({ book, onAddToCart, isInCart = false, onToggleWishlist, isWishlisted }) {
  const handleAdd = () => {
    onAddToCart({
      id: book.id,
      title: book.title,
      author: book.author,
      price: book.price,
      cover_url: book.cover_url,
    });
    toast.success(`"${book.title}" added to cart!`);
  };

  const lowStock = Number(book.stock) > 0 && Number(book.stock) <= 3;
  const outOfStock = Number(book.stock) === 0;

  return (
    <article className="group flex w-full max-w-none flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white card-lift sm:max-w-[15rem] lg:max-w-[15.5rem]">
      {/* Cover (links to details) */}
      <Link
        to={`/books/${book.id}`}
        className="relative block aspect-[4/3] overflow-hidden bg-stone-100"
      >
        {/* Wishlist heart */}
        {onToggleWishlist && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleWishlist(book);
            }}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className={`absolute right-3 bottom-3 z-10 grid h-9 w-9 place-items-center rounded-full backdrop-blur transition ${
              isWishlisted
                ? 'bg-rose-500 text-white'
                : 'bg-white/80 text-stone-600 hover:bg-white hover:text-rose-500'
            }`}
          >
            {isWishlisted ? '❤️' : '🤍'}
          </button>
        )}
        <img
          src={book.cover_url}
          alt={`Cover of ${book.title}`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1544716278-e513176f20b5?w=600&q=80';
          }}
        />
        {/* Genre badge */}
        {book.genre && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2.5 py-0.5 text-[0.65rem] font-semibold text-teal-700 shadow-sm backdrop-blur">
            {book.genre}
          </span>
        )}
        {/* Stock badge */}
        {outOfStock ? (
          <span className="absolute right-2.5 top-2.5 rounded-full bg-red-500 px-2.5 py-0.5 text-[0.65rem] font-bold text-white shadow-sm">
            Sold out
          </span>
        ) : lowStock ? (
          <span className="absolute right-2.5 top-2.5 rounded-full bg-amber-500 px-2.5 py-0.5 text-[0.65rem] font-bold text-white shadow-sm">
            Only {book.stock} left
          </span>
        ) : null}
      </Link>

      {/* Body */}
      <div className="flex flex-col p-3">
        <Link to={`/books/${book.id}`}>
          <h3 className="font-display text-sm font-bold leading-tight text-stone-900 line-clamp-2 transition hover:text-teal-700 sm:text-[0.95rem]">
            {book.title}
          </h3>
        </Link>
        <p className="mt-0.5 text-[0.7rem] text-stone-500 sm:text-[0.8rem]">by {book.author}</p>

        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-sm font-bold text-teal-700 sm:text-[0.95rem]">
            {CURRENCY.format(book.price)}
          </span>
        </div>

        <button
          onClick={handleAdd}
          disabled={outOfStock || isInCart}
          className={`mt-2 w-full rounded-xl px-3 py-2 text-[0.7rem] font-semibold transition-all sm:text-xs ${
            outOfStock
              ? 'cursor-not-allowed bg-stone-100 text-stone-400'
              : isInCart
                ? 'cursor-default bg-emerald-100 text-emerald-700'
                : 'bg-teal-700 text-white hover:bg-teal-800 active:scale-[0.98]'
          }`}
        >
          {outOfStock ? 'Out of stock' : isInCart ? '✓ Added' : 'Add to Cart'}
        </button>
      </div>
    </article>
  );
}

export default BookCard;
