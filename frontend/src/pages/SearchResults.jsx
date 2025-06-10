import RowSkeleton from "../components/RowSkeleton";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { searchMovies } from "../utils/api";
import { Star, Calendar, TrendingUp } from "lucide-react";

const SORT_OPTIONS = [
  { value: "popularity", text: "Original (Popularity)" },
  { value: "date-desc", text: "Release Date (Newest First)" },
  { value: "date-asc", text: "Release Date (Oldest First)" },
  { value: "rating-desc", text: "Rating (Highest First)" },
  { value: "rating-asc", text: "Rating (Lowest First)" },
];

export default function SearchResults() {
  const query = new URLSearchParams(useLocation().search).get("q");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("popularity");
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    if (query) {
      searchMovies(query)
        .then((results) => {
          const currentYear = new Date().getFullYear();
          const filtered = results.filter((movie) => {
            const hasPoster = !!movie.poster_path;
            const hasTitle = !!movie.title;
            const rating = movie.rating || movie.vote_average || 0;
            const year = movie.release_date
              ? parseInt(movie.release_date.slice(0, 4))
              : null;
            return hasPoster && hasTitle && (rating > 0 || year >= currentYear);
          });
          setMovies(filtered);
        })
        .catch(() => {
          setMovies([]);
        })
        .finally(() => setLoading(false));
    } else {
      setMovies([]);
      setLoading(false);
    }
  }, [query]);

  const sortedMovies = [...movies].sort((a, b) => {
    const getYear = (m) =>
      m.release_date ? parseInt(m.release_date.slice(0, 4)) : 0;
    const getRating = (m) => m.rating || m.vote_average || 0;
    switch (sortBy) {
      case "popularity":
        return 0;
      case "date-desc":
        return getYear(b) - getYear(a);
      case "date-asc":
        return getYear(a) - getYear(b);
      case "rating-desc":
        return getRating(b) - getRating(a);
      case "rating-asc":
        return getRating(a) - getRating(b);
      default:
        return 0;
    }
  });

  const getRatingColor = (rating) => {
    const normalizedRating = rating / 2;
    if (normalizedRating >= 4) return "text-green-400";
    if (normalizedRating >= 3) return "text-yellow-400";
    if (normalizedRating >= 2) return "text-orange-400";
    return "text-red-400";
  };

  const getPopularityBadge = (popularity) => {
    if (popularity > 100)
      return {
        text: "Hot",
        color: "bg-red-500/20 text-red-400 border-red-400/30",
      };
    if (popularity > 50)
      return {
        text: "Popular",
        color: "bg-orange-500/20 text-orange-400 border-orange-400/30",
      };
    if (popularity > 20)
      return {
        text: "Rising",
        color: "bg-blue-500/20 text-blue-400 border-blue-400/30",
      };
    return null;
  };

  return (
    <div className="min-h-screen bg-background text-text-main flex flex-col">
      <main className="flex-1 container mx-auto px-2 md:px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight mb-2">
              Search Results
              {query && <span className="text-accent"> for "{query}"</span>}
            </h1>
            <div className="h-1 w-16 bg-accent rounded-full mb-2" />
            {!loading && sortedMovies.length > 0 && (
              <p className="text-text-soft text-sm">
                Found {sortedMovies.length} movie
                {sortedMovies.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-text-soft">
              Sort by:
            </label>
            <div className="relative">
              <select
                className="appearance-none px-4 py-2 rounded-xl bg-surface text-white border border-surface/40 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/30 pr-10 font-semibold shadow-sm transition-all duration-200"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.text}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-accent">
                ▼
              </span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <RowSkeleton key={i} />
            ))}
          </div>
        ) : sortedMovies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-surface/50 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl">🎬</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              No movies found
            </h3>
            <p className="text-text-soft text-center max-w-md">
              {query
                ? `We couldn't find any movies matching "${query}". Try different keywords or check the spelling.`
                : "Start by searching for a movie title, actor, or genre."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {sortedMovies.map((movie) => {
              const rating = (movie.rating || movie.vote_average || 0) / 2;
              const popularity = movie.popularity || 0;
              const popularityBadge = getPopularityBadge(popularity);
              const releaseYear = movie.release_date?.slice(0, 4);
              const isUpcoming =
                releaseYear && parseInt(releaseYear) > new Date().getFullYear();

              return (
                <article
                  key={movie.id}
                  className="relative bg-surface/80 backdrop-blur-sm rounded-2xl shadow-lg border border-surface/40 transition-all duration-300 cursor-pointer overflow-hidden hover:shadow-xl hover:scale-[1.01]"
                  onClick={() => navigate(`/movies/${movie.id}`)}
                >
                  <div className="relative flex items-center gap-6 p-5">
                    <div className="relative flex-shrink-0">
                      <div className="w-24 h-36 md:w-28 md:h-42 rounded-xl overflow-hidden shadow-lg">
                        <img
                          loading="lazy"
                          src={
                            movie.poster_path
                              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                              : "/assets/placeholder.jpg"
                          }
                          alt={movie.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="space-y-1">
                        <h2 className="text-xl md:text-2xl font-bold text-white line-clamp-2">
                          {movie.title}
                        </h2>
                        {releaseYear && (
                          <div className="flex items-center gap-2 text-text-soft">
                            <Calendar size={14} />
                            <span className="text-sm font-medium">
                              {releaseYear}
                              {isUpcoming && (
                                <span className="ml-2 text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full border border-blue-400/30">
                                  Upcoming
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 flex-wrap">
                        {rating > 0 && (
                          <div className="flex items-center gap-2">
                            <div
                              className={`flex items-center gap-1 ${getRatingColor(
                                movie.rating || movie.vote_average
                              )}`}
                            >
                              <Star size={16} fill="currentColor" />
                              <span className="font-bold">
                                {rating.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        )}

                        {popularityBadge && (
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${popularityBadge.color}`}
                          >
                            <TrendingUp size={12} className="inline mr-1" />
                            {popularityBadge.text}
                          </div>
                        )}
                      </div>

                      {movie.overview && (
                        <p className="text-text-soft text-sm line-clamp-2 leading-relaxed">
                          {movie.overview}
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
