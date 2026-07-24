import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './services/api';

function AdminBooks() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state for add/edit
  const [form, setForm] = useState({
    title: '',
    author: '',
    genre: '',
    price: '',
    stock: '',
    cover_url: '',
    description: '',
    is_book_of_the_week: false,
  });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');

      if (!token || !user) {
        navigate('/login');
        return;
      }

      const userData = JSON.parse(user);
      
      if (userData.role !== 'admin') {
        navigate('/');
        return;
      }

      fetchBooks();
    } catch (err) {
      setError('❌ Access Denied: Admin privileges required');
      setTimeout(() => navigate('/'), 2000);
    }
  };

  const fetchBooks = async () => {
    try {
      const response = await api.get('/api/books');
      setBooks(response.data.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    // Validation
    if (!form.title || !form.author || !form.price || form.stock === '') {
      alert('❌ Please fill in all required fields: Title, Author, Price, Stock');
      return;
    }

    try {
      if (editingId) {
        // UPDATE
        await api.put(
          `/api/books/${editingId}`,
          form,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        alert('✅ Book updated successfully!');
      } else {
        // ADD NEW
        await api.post('/api/books', form, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        alert('✅ Book added successfully!');
      }

      // Reset form
      setForm({ title: '', author: '', genre: '', price: '', stock: '', cover_url: '', description: '', is_book_of_the_week: false });
      setEditingId(null);
      setIsAddingNew(false);
      
      // Refresh books list
      fetchBooks();
    } catch (err) {
      alert(err.response?.data?.message || '❌ Error saving book');
      console.error('Error:', err);
    }
  };

  const handleDelete = async (bookId) => {
    if (!window.confirm('⚠️ Are you sure you want to delete this book? This cannot be undone!')) return;

    const token = localStorage.getItem('token');
    try {
      await api.delete(`/api/books/${bookId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      alert('✅ Book deleted successfully!');
      fetchBooks();
    } catch (err) {
      alert(err.response?.data?.message || '❌ Error deleting book');
    }
  };

  const handleEdit = (book) => {
    // description may be null in the DB; default to '' so the textarea stays controlled.
    // is_book_of_the_week comes back as 0/1 from MySQL; coerce to a real boolean for the checkbox.
    setForm({
      ...book,
      description: book.description || '',
      is_book_of_the_week: Boolean(book.is_book_of_the_week),
    });
    setEditingId(book.id);
    setIsAddingNew(false);
    window.scrollTo(0, 0);
  };

  const handleCancel = () => {
    setForm({ title: '', author: '', genre: '', price: '', stock: '', cover_url: '', description: '', is_book_of_the_week: false });
    setEditingId(null);
    setIsAddingNew(false);
  };

  // Filter books by search query
  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="min-h-screen bg-blue-50 flex items-center justify-center text-xl">Loading books...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">📚 Book Management</h1>
          <p className="text-gray-600">Add, edit, or delete books from your store</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-100 p-4 border-l-4 border-red-500 text-red-700">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <button
            onClick={() => {
              setIsAddingNew(!isAddingNew);
              setEditingId(null);
              setForm({ title: '', author: '', genre: '', price: '', stock: '', cover_url: '', description: '', is_book_of_the_week: false });
            }}
            className="rounded-lg bg-green-600 hover:bg-green-700 px-6 py-3 font-semibold text-white transition shadow-md hover:shadow-lg"
          >
            {isAddingNew ? '✕ Cancel' : '✨ Add New Book'}
          </button>

          {/* Search Box */}
          <div className="w-full sm:w-auto flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow">
            <input
              type="text"
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 outline-none text-sm"
            />
            <span className="text-lg">🔍</span>
          </div>

          <div className="text-sm text-gray-600 font-semibold">
            {filteredBooks.length} of {books.length} books
          </div>
        </div>

        {/* Add/Edit Form */}
        {(isAddingNew || editingId) && (
          <div className="mb-8 rounded-2xl bg-white p-6 shadow-xl border-2 border-blue-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingId ? '✏️ Edit Book' : '➕ Add New Book'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📖 Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Harry Potter"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                  />
                </div>

                {/* Author */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ✍️ Author <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., J.K. Rowling"
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    required
                    className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                  />
                </div>

                {/* Genre */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🏷️ Genre
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Fantasy, Mystery"
                    value={form.genre}
                    onChange={(e) => setForm({ ...form, genre: e.target.value })}
                    className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    💰 Price (৳) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 299.99"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                    step="0.01"
                    min="0"
                    className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📦 Stock <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 50"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    required
                    min="0"
                    className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                  />
                </div>

                {/* Cover URL */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🖼️ Cover Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={form.cover_url}
                    onChange={(e) => setForm({ ...form, cover_url: e.target.value })}
                    className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📝 Book Description
                  </label>
                  <textarea
                    placeholder="Write a description for this book. You can use multiple paragraphs."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={6}
                    className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition resize-y"
                  />
                </div>

                {/* Book of the Week */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 rounded-lg border-2 border-amber-200 bg-amber-50 px-4 py-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_book_of_the_week}
                      onChange={(e) => setForm({ ...form, is_book_of_the_week: e.target.checked })}
                      className="h-5 w-5 rounded border-2 border-amber-400 text-amber-600 focus:ring-amber-400"
                    />
                    <span className="text-sm font-semibold text-gray-700">
                      ⭐ Mark as Book of the Week
                    </span>
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    Only one book can be Book of the Week. Selecting this will unmark the current one.
                  </p>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-700 px-6 py-3 font-semibold text-white transition shadow-md hover:shadow-lg"
                >
                  {editingId ? '💾 Update Book' : '➕ Add Book'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 rounded-lg bg-gray-400 hover:bg-gray-500 px-6 py-3 font-semibold text-white transition shadow-md hover:shadow-lg"
                >
                  ✕ Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Books Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredBooks.length > 0 ? (
            filteredBooks.map((book) => (
              <div
                key={book.id}
                className="rounded-xl border-2 border-blue-200 bg-white p-4 shadow-lg hover:shadow-xl transition overflow-hidden"
              >
                {/* Book Cover */}
                {book.cover_url ? (
                  <img
                    src={book.cover_url}
                    alt={book.title}
                    className="h-48 w-full rounded-lg object-cover mb-3 border border-gray-200"
                    onError={(e) => (e.target.style.display = 'none')}
                  />
                ) : (
                  <div className="h-48 w-full rounded-lg bg-gradient-to-br from-blue-200 to-blue-100 mb-3 flex items-center justify-center text-4xl">
                    📚
                  </div>
                )}

                {/* Book Info */}
                {book.is_book_of_the_week && (
                  <p className="text-xs font-bold text-amber-600 mb-1">⭐ Book of the Week</p>
                )}
                <h3 className="text-lg font-bold text-gray-900 truncate">{book.title}</h3>
                <p className="text-sm text-gray-600 truncate">by {book.author}</p>

                {book.genre && (
                  <p className="text-xs text-gray-500 mt-1">🏷️ {book.genre}</p>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <p className="text-lg font-bold text-blue-600">৳{book.price}</p>
                  <p className="text-sm text-gray-600 bg-amber-100 px-2 py-1 rounded">
                    Stock: {book.stock}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleEdit(book)}
                    className="flex-1 rounded-lg bg-yellow-500 hover:bg-yellow-600 px-3 py-2 text-sm font-semibold text-white transition cursor-pointer"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(book.id)}
                    className="flex-1 rounded-lg bg-red-500 hover:bg-red-600 px-3 py-2 text-sm font-semibold text-white transition cursor-pointer"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full rounded-lg bg-blue-50 p-8 text-center border-2 border-dashed border-blue-300">
              <p className="text-2xl text-gray-600">📭 No books found</p>
              {searchQuery && (
                <p className="text-gray-500 mt-2">Try searching with different keywords</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminBooks;
