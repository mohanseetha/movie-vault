import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { addToWatchlist, removeFromWatchlist } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useMovieData } from "../hooks/useMovieData";
import { MovieHero } from "../components/MovieHero";
import { CastSection } from "../components/CastSection";
import { ReviewsSection } from "../components/ReviewsSection";
import { RecommendationsSection } from "../components/RecommendationsSection";
import { LoadingSpinner } from "../components/LoadingSpinner";
import LogMovieModal from "../components/LogMovieModal";

export default function MovieDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  const {
    movie,
    recommendations,
    reviews,
    watchlist,
    existingRating,
    loading,
    loadingRec,
    loadingReviews,
    refreshUserLogAndReviews,
  } = useMovieData(id, user);

  const [localRating, setLocalRating] = useState(null);
  const [lastDeletedReviewUser, setLastDeletedReviewUser] = useState(null);

  useEffect(() => {
    setLocalRating(existingRating);
  }, [existingRating]);

  const isLogged = !!localRating;
  const isInWatchlist = watchlist.some((m) => {
    const movieId = m.movie_id || m;
    return movieId == id || movieId == parseInt(id);
  });

  const handleLogMovie = () => {
    if (!user) return alert("Please log in to rate movies");
    setIsLogModalOpen(true);
  };

  const handleLogSuccess = (action, newRating) => {
    if (action === "delete") {
      setLastDeletedReviewUser(user?.username);
      setLocalRating(null);
    } else if (action === "edit" || action === "add") {
      setLocalRating(newRating);
      setLastDeletedReviewUser(null);
    }
    refreshUserLogAndReviews();
  };

  const handleWatchlistAction = async () => {
    if (!user) return alert("Please log in to manage watchlist");
    setWatchlistLoading(true);
    try {
      if (isInWatchlist) {
        await removeFromWatchlist(user.username, movie.id);
      } else {
        await addToWatchlist(user.username, movie.id);
      }
      refreshUserLogAndReviews();
    } finally {
      setWatchlistLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    }
  };

  if (loading) return <LoadingSpinner message="Loading movie details..." />;

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-surface">
        <div className="text-center">
          <div className="text-6xl mb-4">🎬</div>
          <h2 className="text-2xl font-bold text-text-main mb-2">
            Movie Not Found
          </h2>
          <p className="text-text-soft">
            The movie you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface text-text-main overflow-hidden">
      <MovieHero
        movie={movie}
        existingRating={localRating}
        isLogged={isLogged}
        isInWatchlist={isInWatchlist}
        onLogMovie={handleLogMovie}
        onWatchlistAction={handleWatchlistAction}
        onShare={handleShare}
        watchlistLoading={watchlistLoading}
        shareSuccess={shareSuccess}
      />
      <CastSection cast={movie?.cast || []} />
      <ReviewsSection
        reviews={reviews}
        loading={loadingReviews}
        user={user}
        onLogMovie={handleLogMovie}
        userRating={localRating}
        lastDeletedReviewUser={lastDeletedReviewUser}
      />
      <RecommendationsSection
        recommendations={recommendations}
        loading={loadingRec}
      />
      <LogMovieModal
        movie={movie}
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        existingRating={localRating}
        onSuccess={handleLogSuccess}
      />
    </div>
  );
}
