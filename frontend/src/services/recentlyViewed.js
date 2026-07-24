/**
 * Recently viewed books utility.
 * Stores up to 8 most-recently-viewed books in localStorage, newest first,
 * with no duplicates.
 */

const STORAGE_KEY = 'bookstoreRecentlyViewed';
const MAX_ITEMS = 8;

export const getRecentlyViewed = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addRecentlyViewed = (book) => {
  if (!book || !book.id) return;

  try {
    const current = getRecentlyViewed();

    // Remove duplicate (if exists) so we can re-insert at the front
    const filtered = current.filter((b) => b.id !== book.id);

    // Prepend the book with only the fields we need
    const entry = {
      id: book.id,
      title: book.title,
      author: book.author,
      genre: book.genre,
      price: book.price,
      stock: book.stock,
      cover_url: book.cover_url,
    };

    const updated = [entry, ...filtered].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage might be full or unavailable — fail silently
  }
};

export const clearRecentlyViewed = () => {
  localStorage.removeItem(STORAGE_KEY);
};