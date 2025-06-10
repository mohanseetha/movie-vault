import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  fetchMovieDetails,
  getMovieRecommendations,
  getLoggedMovies,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  getRatings,
} from "../utils/api";
import { useAuth } from "../context/AuthContext";
import {
  Star,
  Calendar,
  Clock,
  Users,
  Play,
  Heart,
  Share2,
  Check,
  Edit3,
  MessageSquare,
  LogIn,
  LogOut,
} from "lucide-react";
import MovieCarousel from "../components/MovieCarousel";
import StarRating from "../components/StarRating";
import InteractiveStarRating from "../components/InteractiveStarRating";
import ActionButton from "../components/ActionButton";
import MetricBadge from "../components/MetricBadge";
import ReviewCard from "../components/ReviewCard";
import LogMovieModal from "../components/LogMovieModal";

function Section({ children, className = "" }) {
  return (
    <section className={`relative z-30 bg-background py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">{children}</div>
    </section>
  );
}

function SectionHeading({ icon: Icon, children, count }) {
  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold text-text-main mb-2 flex items-center gap-3">
        {Icon && <Icon className="text-accent" size={32} />}
        {children}
        {typeof count === "number" && (
          <span className="text-accent/70 font-normal">({count})</span>
        )}
      </h2>
      <div className="w-24 h-1 bg-gradient-to-r from-accent to-accent/50 rounded-full"></div>
    </div>
  );
}

export default function MovieDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [movie, setMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRec, setLoadingRec] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [loggedMovies, setLoggedMovies] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [existingRating, setExistingRating] = useState(null);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [watchlistSuccess, setWatchlistSuccess] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setImageLoaded(false);
    fetchMovieDetails(id)
      .then(setMovie)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    setLoadingRec(true);
    if (movie?.id) {
      getMovieRecommendations(movie.id)
        .then((data) => {
          setRecommendations(Array.isArray(data) ? data : data?.results || []);
          setLoadingRec(false);
        })
        .catch(() => {
          setRecommendations([]);
          setLoadingRec(false);
        });
    } else {
      setRecommendations([]);
      setLoadingRec(false);
    }
  }, [movie]);

  useEffect(() => {
    if (movie?.id) {
      setLoadingReviews(true);
      getRatings(movie.id)
        .then((data) => {
          setReviews(Array.isArray(data) ? data : []);
          const existingLog = data.find((r) => r.username === user?.username);
          console.log("Existing log:", existingLog);
          setExistingRating(existingLog || null);
        })
        .catch(() => {
          setReviews([]);
        })
        .finally(() => {
          setLoadingReviews(false);
        });
    }
  }, [movie]);

  useEffect(() => {
    if (user?.username) {
      // Fetch logged movies
      getLoggedMovies(user.username).then((movies) => {
        setLoggedMovies(movies || []);
        const existingLog = (movies || []).find((m) => {
          // Handle both string and number movie_id formats
          const movieId = m.movie_id || m;
          return movieId == id || movieId == parseInt(id);
        });
      });

      // Fetch watchlist
      getWatchlist(user.username).then((list) => {
        setWatchlist(list || []);
      });
    }
  }, [user?.username, id]);

  const isLogged = !!existingRating;
  const isInWatchlist = watchlist.some((m) => {
    // Handle both string and number movie_id formats
    const movieId = m.movie_id || m;
    return movieId == id || movieId == parseInt(id);
  });

  const handleLogMovie = () => {
    if (!user) {
      alert("Please log in to rate movies");
      return;
    }
    setIsLogModalOpen(true);
  };

  const handleLogSuccess = () => {
    if (user?.username) {
      // Refresh logged movies
      getLoggedMovies(user.username).then((movies) => {
        setLoggedMovies(movies || []);
        const existingLog = (movies || []).find((m) => {
          // Handle both string and number movie_id formats
          const movieId = m.movie_id || m;
          return movieId == id || movieId == parseInt(id);
        });
        setExistingRating(existingLog || null);
      });

      // Refresh watchlist (movie should be removed from watchlist when logged)
      getWatchlist(user.username).then((list) => {
        setWatchlist(list || []);
      });
    }

    // Refresh reviews
    if (movie?.id) {
      getRatings(movie.id).then((data) => {
        setReviews(Array.isArray(data) ? data : []);
      });
    }
  };

  const handleAddToWatchlist = async () => {
    if (!user) {
      alert("Please log in to add to watchlist");
      return;
    }

    setWatchlistLoading(true);
    try {
      await addToWatchlist(user.username, movie.id);
      setWatchlistSuccess(true);
      // Refresh watchlist
      getWatchlist(user.username).then((list) => setWatchlist(list || []));
      setTimeout(() => setWatchlistSuccess(false), 2000);
    } catch (err) {
      alert("Failed to add to watchlist");
    } finally {
      setWatchlistLoading(false);
    }
  };

  const handleRemoveFromWatchlist = async () => {
    if (!user) {
      alert("Please log in to remove from watchlist");
      return;
    }

    setWatchlistLoading(true);
    try {
      await removeFromWatchlist(user.username, movie.id);
      // Refresh watchlist
      getWatchlist(user.username).then((list) => setWatchlist(list || []));
      setWatchlistSuccess(false);
    } catch (err) {
      alert("Failed to remove from watchlist");
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
    } catch (err) {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-accent/40 rounded-full animate-spin animation-delay-75"></div>
          </div>
          <p className="text-text-soft font-medium">Loading movie details...</p>
        </div>
      </div>
    );
  }

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

  const genreChips = (movie.genres || []).map((g) => (
    <span
      key={g.id || g.name}
      className="bg-gradient-to-r from-accent/20 to-accent/10 text-accent px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm border border-accent/30 hover:bg-accent/20 transition-colors duration-200"
    >
      {g.name}
    </span>
  ));

  const topCast = movie?.cast || [];

  // Button logic based on logged and watchlist status
  let logButtonLabel = isLogged ? "Edit Log" : "Log Movie";
  let logButtonIcon = isLogged ? Edit3 : Play;
  let logButtonDisabled = false; // Always allow logging

  let watchlistButtonLabel = isInWatchlist
    ? "Remove from Watchlist"
    : "Add to Watchlist";
  let watchlistButtonIcon = isInWatchlist ? LogOut : Heart;
  let watchlistButtonAction = isInWatchlist
    ? handleRemoveFromWatchlist
    : handleAddToWatchlist;
  let watchlistButtonDisabled = isLogged; // Disable if movie is logged

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface text-text-main overflow-hidden">
      <div className="relative w-full min-h-[100vh] flex items-center">
        {movie.backdrop_path && (
          <>
            <div
              className={`absolute inset-0 z-0 transition-opacity duration-700 ${
                imageLoaded ? "opacity-60" : "opacity-0"
              }`}
              style={{
                backgroundImage: `url(${movie.backdrop_path})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed",
              }}
            />
            <img
              src={movie.backdrop_path}
              alt=""
              className="hidden"
              onLoad={() => setImageLoaded(true)}
            />
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 md:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-4 flex justify-center lg:justify-start">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent rounded-2xl blur-xl transform group-hover:scale-105 transition-transform duration-300"></div>
                <img
                  src={movie.poster_path || "/assets/placeholder.jpg"}
                  alt={movie.title}
                  className="relative rounded-2xl shadow-2xl object-cover border border-white/10 aspect-[2/3] w-72 max-w-full transform group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {isLogged && (
                  <div className="absolute top-4 right-4 bg-accent/90 backdrop-blur-sm rounded-full p-2">
                    <Check size={16} className="text-white" />
                  </div>
                )}
              </div>
            </div>
            <div className="lg:col-span-8 space-y-6">
              <div className="space-y-2">
                <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight bg-gradient-to-r from-white to-white/80 bg-clip-text">
                  {movie.title}
                </h1>
                {movie.director && (
                  <p className="text-accent text-lg font-medium">
                    Directed by {movie.director}
                  </p>
                )}
                {movie.tagline && movie.tagline.trim() && (
                  <p className="text-white/80 text-xl italic font-light">
                    "{movie.tagline}"
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-4">
                <MetricBadge
                  icon={Calendar}
                  value={movie.release_date?.slice(0, 4) || "N/A"}
                  label="Year"
                />
                <div className="bg-black/30 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10">
                  <StarRating
                    value={movie.rating || 0}
                    size={16}
                    showText={true}
                  />
                </div>
                {movie.runtime && (
                  <MetricBadge
                    icon={Clock}
                    value={`${Math.floor(movie.runtime / 60)}h ${
                      movie.runtime % 60
                    }m`}
                    label="Runtime"
                  />
                )}
              </div>
              {isLogged && existingRating && (
                <div className="bg-accent/10 backdrop-blur-md px-4 py-3 rounded-xl border border-accent/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-accent font-medium text-sm">
                        Your Rating
                      </p>
                      <InteractiveStarRating
                        rating={existingRating.rating}
                        onRatingChange={() => {}}
                        size={16}
                      />
                      <p className="text-white/70 text-xs mt-1">
                        Watched on{" "}
                        {new Date(
                          existingRating.watched_date
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={handleLogMovie}
                      className="p-2 hover:bg-accent/20 rounded-lg transition-colors"
                    >
                      <Edit3 size={16} className="text-accent" />
                    </button>
                  </div>
                  {existingRating.review && (
                    <p className="text-white/80 text-sm mt-2 italic">
                      "{existingRating.review}"
                    </p>
                  )}
                </div>
              )}
              {genreChips.length > 0 && (
                <div className="flex flex-wrap gap-2">{genreChips}</div>
              )}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">Overview</h3>
                <p className="text-white/90 text-lg leading-relaxed max-w-3xl">
                  {movie.overview || "No overview available."}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 pt-4">
                <ActionButton
                  icon={logButtonIcon}
                  label={logButtonLabel}
                  primary={true}
                  onClick={handleLogMovie}
                  disabled={logButtonDisabled}
                />
                <ActionButton
                  icon={watchlistButtonIcon}
                  label={watchlistButtonLabel}
                  onClick={watchlistButtonAction}
                  disabled={watchlistButtonDisabled || watchlistLoading}
                />
                <ActionButton
                  icon={shareSuccess ? Check : Share2}
                  label={shareSuccess ? "Copied!" : "Share"}
                  onClick={handleShare}
                />
              </div>
              {watchlistButtonDisabled && (
                <p className="text-yellow-400 text-sm">
                  Remove from logged movies to add to watchlist
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      {topCast.length > 0 && (
        <Section>
          <SectionHeading icon={Users}>Top Cast</SectionHeading>
          <div className="flex flex-wrap gap-2">
            {topCast.slice(0, 12).map((actor, idx) => (
              <span
                key={actor || idx}
                className="bg-accent/10 text-accent px-3 py-1.5 rounded-full text-sm font-medium border border-accent/20 hover:bg-accent/20 transition-colors duration-200"
              >
                {actor}
              </span>
            ))}
            {topCast.length > 12 && (
              <span className="text-text-soft text-sm px-3 py-1.5">
                +{topCast.length - 12} more
              </span>
            )}
          </div>
        </Section>
      )}
      <Section>
        <SectionHeading icon={MessageSquare} count={reviews.length}>
          Reviews
        </SectionHeading>
        {loadingReviews ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/10 rounded-xl p-6 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-surface rounded-full"></div>
                  <div className="space-y-2">
                    <div className="w-24 h-4 bg-surface rounded"></div>
                    <div className="w-16 h-3 bg-surface rounded"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-3 bg-surface rounded"></div>
                  <div className="w-3/4 h-3 bg-surface rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review, index) => (
              <ReviewCard key={review.id || index} review={review} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">💬</div>
            <p className="text-text-soft text-lg mb-4">
              No reviews yet. Be the first to share your thoughts!
            </p>
            {user && (
              <button
                onClick={handleLogMovie}
                className="px-6 py-3 bg-accent hover:bg-accent/90 text-white rounded-xl font-medium transition-colors"
              >
                Write a Review
              </button>
            )}
          </div>
        )}
      </Section>
      <Section>
        <SectionHeading icon={Star}>You Might Also Like</SectionHeading>
        {loadingRec ? (
          <div className="space-y-4">
            <div className="flex gap-4 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="flex-none w-48 h-72 bg-white/10 rounded-xl animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        ) : recommendations.length > 0 ? (
          <MovieCarousel movies={recommendations} title="" />
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-text-soft text-lg">
              No recommendations available at this time
            </p>
          </div>
        )}
      </Section>
      <LogMovieModal
        movie={movie}
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        existingRating={existingRating}
        onSuccess={handleLogSuccess}
      />
    </div>
  );
}
