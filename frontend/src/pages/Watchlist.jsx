import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { fetchMovieDetails, getWatchlist } from "../utils/api";
import { Bookmark } from "lucide-react";
import { MovieGridSection } from "../components/MovieGridSection";

export default function Watchlist() {
  const { user } = useAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setMovies([]);
    setLoading(true);
    getWatchlist(user.username)
      .then((movieIds) =>
        Promise.all(movieIds.map((id) => fetchMovieDetails(id)))
      )
      .then((results) => setMovies(results.filter(Boolean)))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user)
    return (
      <div className="p-8 text-gray-400">
        Please log in to see your watchlist.
      </div>
    );

  return (
    <MovieGridSection
      loading={loading}
      movies={movies}
      icon={<Bookmark className="text-accent mb-2" size={40} />}
      title="Your Watchlist"
      loadingText="Loading your watchlist..."
      emptyText="Your watchlist is empty."
      emptySub="Add movies you want to see next!"
    />
  );
}
