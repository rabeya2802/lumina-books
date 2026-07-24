import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

/**
 * StarRating
 * Interactive (selectable) or read-only star display.
 *
 * Props:
 * - value: number (current rating)
 * - onChange: function(newRating) | undefined  (undefined = read-only)
 * - size: 'sm' | 'md' | 'lg'
 */
function StarRating({ value = 0, onChange, size = 'md' }) {
  const [hover, setHover] = useState(0);
  const sizes = { sm: 'text-base', md: 'text-xl', lg: 'text-3xl' };
  const active = hover || value;

  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!onChange}
          onMouseEnter={() => onChange && setHover(star)}
          onMouseLeave={() => onChange && setHover(0)}
          onClick={() => onChange && onChange(star)}
          className={`${
            onChange ? 'cursor-pointer' : 'cursor-default'
          } transition-transform ${onChange ? 'hover:scale-110' : ''}`}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          <span className={`${sizes[size]} ${star <= active ? 'text-amber-400' : 'text-stone-300'}`}>
            ★
          </span>
        </button>
      ))}
    </div>
  );
}

/**
 * Reviews
 * Full reviews & ratings section for a single book.
 *
 * Props:
 * - bookId: number
 * - isLoggedIn: boolean
 * - user: object | null  (must contain id)
 *
 * Features:
 * - Average rating summary with star breakdown
 * - Write-a-review form (1–5 stars + comment)
 * - List of reviews with reviewer name, date, stars, comment
 * - Delete own review
 */
function Reviews({ bookId, isLoggedIn, user }) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);

  // Form state
  const [formRating, setFormRating] = useState(0);
  const [formComment, setFormComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // My existing review (so we can show "edit" vs "write")
  const [myReview, setMyReview] = useState(null);

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/books/${bookId}/reviews`);
      setReviews(res.data.data || []);
      setAverage(res.data.average || 0);
      setCount(res.data.count || 0);

      if (user) {
        const mine = (res.data.data || []).find((r) => r.user_id === user.id);
        setMyReview(mine || null);
        if (mine) {
          setFormRating(mine.rating);
          setFormComment(mine.comment || '');
        }
      }
    } catch {
      // silent fail — reviews are non-critical
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      toast.info('Please sign in to leave a review.');
      navigate('/login');
      return;
    }

    if (formRating === 0) {
      toast.error('Please select a star rating.');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api.post(
        `/api/books/${bookId}/reviews`,
        { rating: formRating, comment: formComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAverage(res.data.average);
      setCount(res.data.count);
      toast.success(myReview ? 'Review updated!' : 'Review posted! ⭐');
      setMyReview({ rating: formRating, comment: formComment });
      await fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save review.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Delete your review?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await api.delete(
        `/api/books/${bookId}/reviews/${reviewId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAverage(res.data.average);
      setCount(res.data.count);
      setMyReview(null);
      setFormRating(0);
      setFormComment('');
      toast.info('Review deleted.');
      await fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete review.');
    }
  };

  // Star breakdown (e.g. 60% 5-star, 30% 4-star…)
  const breakdown = [5, 4, 3, 2, 1].map((star) => {
    const n = reviews.filter((r) => r.rating === star).length;
    return { star, count: n, pct: count > 0 ? (n / count) * 100 : 0 };
  });

  return (
    <section className="border-t border-stone-200 bg-stone-50">
      <div className="container-app py-12 md:py-16">
        {/* Heading */}
        <div className="mb-8">
          <span className="fancy-divider">Reader reviews</span>
          <h2 className="mt-3 font-display text-2xl font-bold text-stone-900 sm:text-3xl">
            Ratings & Reviews
          </h2>
        </div>

        {loading ? (
          <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
            <div className="h-48 animate-pulse rounded-2xl bg-white" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 animate-pulse rounded-2xl bg-white" />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
            {/* ===== Summary column ===== */}
            <aside>
              <div className="rounded-2xl border border-stone-200 bg-white p-6">
                {/* Big average */}
                <div className="text-center">
                  <p className="font-display text-5xl font-bold text-stone-900">
                    {average > 0 ? average.toFixed(1) : '—'}
                  </p>
                  <div className="mt-2 flex justify-center">
                    <StarRating value={Math.round(average)} size="lg" />
                  </div>
                  <p className="mt-2 text-sm text-stone-500">
                    {count > 0
                      ? `Based on ${count} review${count === 1 ? '' : 's'}`
                      : 'No reviews yet'}
                  </p>
                </div>

                {/* Breakdown bars */}
                {count > 0 && (
                  <div className="mt-6 space-y-2">
                    {breakdown.map((b) => (
                      <div key={b.star} className="flex items-center gap-2 text-sm">
                        <span className="w-3 text-stone-500">{b.star}</span>
                        <span className="text-amber-400">★</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-100">
                          <div
                            className="h-full rounded-full bg-amber-400"
                            style={{ width: `${b.pct}%` }}
                          />
                        </div>
                        <span className="w-6 text-right text-xs text-stone-400">
                          {b.count}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Write review CTA / form */}
              {!isLoggedIn ? (
                <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-6 text-center">
                  <p className="text-sm text-stone-600">
                    Sign in to share your thoughts.
                  </p>
                  <button
                    onClick={() => navigate('/login')}
                    className="mt-4 w-full rounded-full bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800"
                  >
                    Sign in to review
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="mt-4 rounded-2xl border border-stone-200 bg-white p-6"
                >
                  <h3 className="font-display text-lg font-bold text-stone-900">
                    {myReview ? 'Edit your review' : 'Write a review'}
                  </h3>

                  <div className="mt-4">
                    <label className="mb-2 block text-sm font-semibold text-stone-700">
                      Your rating
                    </label>
                    <StarRating value={formRating} onChange={setFormRating} size="lg" />
                  </div>

                  <div className="mt-4">
                    <label className="mb-1.5 block text-sm font-semibold text-stone-700">
                      Your review <span className="font-normal text-stone-400">(optional)</span>
                    </label>
                    <textarea
                      value={formComment}
                      onChange={(e) => setFormComment(e.target.value)}
                      rows={4}
                      placeholder="What did you think of this book?"
                      className="w-full resize-y rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>

                  <div className="mt-4 flex gap-3">
                    <button
                      type="submit"
                      disabled={submitting || formRating === 0}
                      className="flex-1 rounded-full bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting ? 'Saving…' : myReview ? 'Update' : 'Post review'}
                    </button>

                    {myReview && (
                      <button
                        type="button"
                        onClick={() => handleDelete(myReview.id)}
                        className="rounded-full border border-stone-300 px-5 py-2.5 text-sm font-semibold text-stone-600 transition hover:bg-red-50 hover:text-red-600"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </form>
              )}
            </aside>

            {/* ===== Reviews list ===== */}
            <div>
              {reviews.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-stone-200 bg-white p-12 text-center">
                  <p className="text-4xl">✍️</p>
                  <p className="mt-3 text-lg font-semibold text-stone-700">
                    No reviews yet
                  </p>
                  <p className="text-stone-500">
                    Be the first to review this book!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <ReviewCard
                      key={r.id}
                      review={r}
                      isMine={user && r.user_id === user.id}
                      onDelete={() => handleDelete(r.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Single review card.
 */
function ReviewCard({ review, isMine, onDelete }) {
  const date = new Date(review.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-teal-700 text-sm font-bold text-white">
            {(review.user_name || 'A').charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="font-semibold text-stone-900">{review.user_name || 'Anonymous'}</p>
            <p className="text-xs text-stone-400">{date}</p>
          </div>
        </div>
        <StarRating value={review.rating} size="sm" />
      </div>

      {review.comment && (
        <p className="mt-4 text-sm leading-relaxed text-stone-600">
          {review.comment}
        </p>
      )}

      {isMine && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={onDelete}
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-stone-400 transition hover:bg-red-50 hover:text-red-600"
          >
            🗑️ Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default Reviews;