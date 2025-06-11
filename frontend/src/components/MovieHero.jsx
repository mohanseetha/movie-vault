import { useState } from "react";
import { Calendar, Clock, Check, Edit3 } from "lucide-react";
import StarRating from "./StarRating";
import { MovieActions } from "./MovieActions";
import MetricBadge from "./MetricBadge";

function formatWatchedDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function MovieHero({
  movie,
  existingRating,
  isLogged,
  isInWatchlist,
  onLogMovie,
  onWatchlistAction,
  onShare,
  watchlistLoading,
  shareSuccess,
}) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const genreChips = (movie.genres || []).map((g) => (
    <span
      key={g.id || g.name}
      className="bg-gradient-to-r from-accent/20 to-accent/10 text-accent px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm border border-accent/30 hover:bg-accent/20 transition-colors duration-200"
    >
      {g.name}
    </span>
  ));

  return (
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
                  value={movie.rating / 2 || 0}
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
                    <StarRating value={existingRating.rating} size={16} />
                    {formatWatchedDate(existingRating.watched_date) && (
                      <p className="text-white/70 text-xs mt-1">
                        Watched on{" "}
                        {formatWatchedDate(existingRating.watched_date)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={onLogMovie}
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

            <MovieActions
              isLogged={isLogged}
              isInWatchlist={isInWatchlist}
              onLogMovie={onLogMovie}
              onWatchlistAction={onWatchlistAction}
              onShare={onShare}
              watchlistLoading={watchlistLoading}
              shareSuccess={shareSuccess}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
