import { useState } from 'react';
import { Star } from 'lucide-react';
import reviewService from '../../services/reviewService';
import type { Order } from '../../services/orderService';

interface ReviewFormProps {
  order: Order;
  onSubmitted: (orderId: number, rating: number, comment: string) => void;
}

export default function ReviewForm({ order, onSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (rating < 1) {
      setError('Please select a star rating.');
      return;
    }
    if (comment.trim().length < 10) {
      setError('Please write at least a few words about your experience.');
      return;
    }

    setSubmitting(true);
    try {
      await reviewService.submit(order.id, rating, comment.trim());
      onSubmitted(order.id, rating, comment.trim());
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit your review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-purple-700/20 space-y-3">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            className="p-0.5"
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                star <= (hoverRating || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="How was your experience with this order?"
        rows={3}
        className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 focus:outline-none transition-colors text-sm resize-none"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="px-5 py-2 bg-linear-to-r from-purple-600 to-purple-700 text-white rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </div>
  );
}
