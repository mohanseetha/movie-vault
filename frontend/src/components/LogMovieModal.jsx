// LogMovieModal.jsx

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Play, X, Check, Trash2 } from "lucide-react";
import StarRating from "./StarRating";
import InteractiveStarRating from "./InteractiveStarRating";
import { addRating, editRating, deleteRating } from "../utils/api";

// Helper to ensure yyyy-MM-dd format for <input type="date" />
function formatDate(date) {
  if (!date) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  const d = new Date(date);
  if (isNaN(d)) return "";
  return d.toISOString().split("T")[0];
}

export default function LogMovieModal({
  movie,
  isOpen,
  onClose,
  existingRating,
  onSuccess,
}) {
  const { user } = useAuth();
  const [rating, setRating] = useState(existingRating?.rating || 0);
  const [review, setReview] = useState(existingRating?.review || "");
  const [watchedDate, setWatchedDate] = useState(
    existingRating?.watched_date
      ? formatDate(existingRating.watched_date)
      : new Date().toISOString().split("T")[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const isEditing = !!existingRating;

  useEffect(() => {
    if (existingRating) {
      setRating(existingRating.rating || 0);
      setReview(existingRating.review || "");
      setWatchedDate(formatDate(existingRating.watched_date));
    } else {
      setRating(0);
      setReview("");
      setWatchedDate(new Date().toISOString().split("T")[0]);
    }
    setError("");
  }, [existingRating, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.username || rating === 0) {
      setError("Please select a rating");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      if (isEditing) {
        await editRating(
          user.username,
          movie.id,
          rating,
          review,
          formatDate(watchedDate)
        );
      } else {
        await addRating(
          user.username,
          movie.id,
          rating,
          review,
          formatDate(watchedDate)
        );
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.toString());
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this rating?")) {
      return;
    }
    setIsSubmitting(true);
    try {
      await deleteRating(user.username, movie.id);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.toString());
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-surface/30 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-surface/30">
          <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
            <Play size={20} className="text-accent" />
            {isEditing ? "Edit Rating" : "Log Movie"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface/50 rounded-lg transition-colors"
          >
            <X size={20} className="text-text-soft" />
          </button>
        </div>
        <div className="p-6 border-b border-surface/30">
          <div className="flex gap-4">
            <img
              src={movie.poster_path || "/assets/placeholder.jpg"}
              alt={movie.title}
              className="w-16 h-24 object-cover rounded-lg border border-surface/30"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-text-main text-lg leading-tight">
                {movie.title}
              </h3>
              <p className="text-text-soft text-sm mt-1">
                {movie.release_date?.slice(0, 4)} • {movie.director}
              </p>
              <div className="mt-2">
                <StarRating value={movie.rating} size={14} showText={false} />
              </div>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-text-main font-medium mb-3">
              Your Rating *
            </label>
            <div className="flex items-center justify-center py-2">
              <InteractiveStarRating
                rating={rating}
                onRatingChange={setRating}
                size={32}
              />
            </div>
            <p className="text-center text-text-soft text-sm mt-2">
              {rating > 0 ? `${rating}/5 stars` : "Click to rate"}
            </p>
          </div>
          <div>
            <label className="block text-text-main font-medium mb-3">
              Watched Date
            </label>
            <input
              type="date"
              value={watchedDate}
              onChange={(e) => setWatchedDate(e.target.value)}
              className="w-full p-3 bg-background border border-surface/30 rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-text-main font-medium mb-3">
              Review (Optional)
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="What did you think about this movie?"
              className="w-full h-32 p-3 bg-background border border-surface/30 rounded-lg text-text-main placeholder-text-soft resize-none focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-colors"
              maxLength={500}
            />
            <p className="text-right text-text-soft text-xs mt-1">
              {review.length}/500
            </p>
          </div>
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          <div className="flex gap-3">
            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <Trash2 size={16} />
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-surface/50 hover:bg-surface/70 text-text-soft border border-surface/30 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check size={16} />
                  {isEditing ? "Update" : "Log Movie"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
