import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from './services/api';
import { SearchX, RotateCcw } from 'lucide-react';
import BookCard from './components/BookCard';
import BookCardSkeleton from './components/BookCardSkeleton';

/**
 * Categories / Browse Books page
 * - Sidebar with genre filters (derived from books data)
 * - Search box (synced with navbar search via activeSearch prop)
 * - Sort dropdown (newest, price, title)
 * - Responsive grid of BookCards
 * - Deep-links via ?genre=Fiction
 */
function Categories({ onAddToCart, activeSearch, cartItems = [], onToggleWishlist, isWishlisted }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [localSearch, setLocalSearch] = useState(activeSearch || '');
  const [sort, setSort] = useState('newest');

  const selectedGenre = searchParams.get('genre') || 'All';

  useEffect(() => {
    setLocalSearch(activeSearch || '');
  }, [activeSearch]);

  useEffect(() => {
    let active = true;
    async function fetchBooks() {
      try {
        const response = await api.get('/api/books');
        const booksArray = response.data.data || response.data;
        if (active) setBooks(booksArray);
      } catch {
        if (active) setError('Could not load books. Please try again later.');
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchBooks();
    return () => {
      active = false;
    };
  }, []);

  // Build genre list from data
  const genres = useMemo(() => {
    const set = new Set();
    books.forEach((b) => set.add((b.genre || 'Other').trim()));
    return ['All', ...Array.from(set).sort()];
  }, [books]);

  // Apply filters + sort
  const visibleBooks = useMemo(() => {
    let result = [...books];

    if (selectedGenre !== 'All') {
      result = result.filter((b) => (b.genre || 'Other').trim() === selectedGenre);
    }

    const q = (activeSearch || localSearch).toLowerCase().trim();
    if (q) {
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          (b.genre || '').toLowerCase().includes(q)
      );
    }

    switch (sort) {
      case 'price-low':
        result.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price-high':
        result.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        // newest: keep API order (created_at DESC)
        break;
    }

    return result;
  }, [books, selectedGenre, activeSearch, localSearch, sort]);

  const setGenre = (g) => {
    if (g === 'All') {
      searchParams.delete('genre');
    } else {
      searchParams.set('genre', g);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="animate-fade-up bg-stone-50">
      {/* Page header */}
      <div className="border-b border-stone-200 bg-white">
        <div className="container-app py-10 md:py-14">
          <nav className="text-sm text-stone-500">
            <Link to="/" className="hover:text-emerald-700">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-stone-700">Books</span>
          </nav>
          <h1 className="mt-2 font-display text-3xl font-bold text-stone-900 sm:text-4xl">
            Browse our collection
          </h1>
          <p className="mt-2 max-w-2xl text-stone-600">
            Filter by category, search by title or author, and find the perfect
            read.
          </p>
        </div>
      </div>

      <div className="container-app grid gap-8 py-10 lg:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-28 lg:h-fit">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search books…"
              className="w-full rounded-full border border-stone-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
              🔍
            </span>
          </div>

          {/* Genre filter */}
          <div className="mt-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500">
              Categories
            </h3>
            <ul className="mt-4 space-y-1">
              {genres.map((g) => {
                const count =
                  g === 'All'
                    ? books.length
                    : books.filter((b) => (b.genre || 'Other').trim() === g).length;
                return (
                  <li key={g}>
                    <button
                      onClick={() => setGenre(g)}
                      className={`flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                        selectedGenre === g
                          ? 'bg-emerald-700 text-white shadow-sm'
                          : 'text-stone-600 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                    >
                      <span>{g}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          selectedGenre === g
                            ? 'bg-white/20'
                            : 'bg-stone-100 text-stone-500'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Help card */}
          <div className="mt-8 rounded-2xl bg-brand-gradient p-6 text-white">
            <p className="text-2xl">💡</p>
            <h4 className="mt-2 font-semibold">Need help choosing?</h4>
            <p className="mt-1 text-sm text-emerald-50">
              Our team can recommend the perfect book for you.
            </p>
            <Link
              to="/contact"
              className="mt-4 inline-block rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
            >
              Ask us
            </Link>
          </div>
        </aside>

        {/* Main grid */}
        <div>
          {/* Toolbar */}
          <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-sm text-stone-600">
              Showing <strong className="text-stone-900">{visibleBooks.length}</strong>{' '}
              {visibleBooks.length === 1 ? 'book' : 'books'}
              {selectedGenre !== 'All' && (
                <>
                  {' '}
                  in <strong className="text-emerald-700">{selectedGenre}</strong>
                </>
              )}
            </p>
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm text-stone-500">Sort:</label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm outline-none focus:border-emerald-500"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="title">Title: A–Z</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl bg-red-50 p-6 text-center text-red-700">
              {error}
            </div>
          )}

          {loading && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <BookCardSkeleton key={i} />
              ))}
            </div>
          )}

          {!error && !loading && visibleBooks.length === 0 && (
            <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-stone-200 bg-white px-6 py-16 text-center">
              <div className="grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-stone-100 to-stone-200 ring-8 ring-stone-50">
                <SearchX className="h-10 w-10 text-stone-500" strokeWidth={1.5} />
              </div>
              <p className="mt-6 text-xl font-bold text-stone-800">
                No books found
              </p>
              <p className="mt-1 max-w-sm text-sm text-stone-500">
                We couldn't find any matches. Try clearing filters or searching with different keywords.
              </p>
              <button
                onClick={() => {
                  setGenre('All');
                  setLocalSearch('');
                }}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 active:scale-95"
              >
                <RotateCcw className="h-4 w-4" />
                Reset filters
              </button>
            </div>
          )}

          {!error && !loading && visibleBooks.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleBooks.map((book) => (
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
        </div>
      </div>
    </div>
  );
}

export default Categories;