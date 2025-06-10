import { useEffect, useState, useCallback } from "react";
import {
  getTopMoviesWorldwide,
  getTopMoviesIndia,
  getRecommendedMovies,
} from "../utils/api";
import MovieCarousel from "../components/MovieCarousel";
import { useAuth } from "../context/AuthContext";
import { TrendingUp, MapPin, Heart, Sparkles } from "lucide-react";

const CACHE_CONFIG = {
  recommendations: { ttl: 5 * 60 * 1000 },
};

function getCache(key) {
  try {
    const cached = sessionStorage.getItem(key);
    if (!cached) return null;

    const { data, expiry } = JSON.parse(cached);
    if (expiry && Date.now() > expiry) {
      sessionStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCache(key, data, ttlMs = 10 * 60 * 1000) {
  try {
    const expiry = Date.now() + ttlMs;
    sessionStorage.setItem(key, JSON.stringify({ data, expiry }));
  } catch {
    // Silently fail if storage is full
  }
}

function useMovieData(fetchFn, cacheKey, ttl) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const cached = getCache(cacheKey);
      if (cached) {
        setData(cached);
        setLoading(false);
        return;
      }

      const result = await fetchFn();
      const movieData = result.results || result || [];

      setData(movieData);
      setCache(cacheKey, movieData, ttl);
    } catch (err) {
      setError(err.message || "Failed to load movies");
    } finally {
      setLoading(false);
    }
  }, [fetchFn, cacheKey, ttl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

function WelcomeHeader({ user }) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 16) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="relative mb-8 md:mb-12">
      <div className="absolute inset-0 bg-accent/10 rounded-3xl blur-3xl opacity-30"></div>
      <div className="relative glass rounded-2xl md:rounded-3xl p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="text-accent animate-pulse" size={24} />
          <h1 className="text-2xl md:text-4xl lg:text-4xl font-extrabold tracking-tight font-sans text-gradient">
            {user
              ? `${getGreeting()}, ${user.username}!`
              : "Welcome to MovieVault"}
          </h1>
        </div>
        <p className="text-text-soft text-sm md:text-base lg:text-lg font-medium">
          Discover your next favorite movie from our curated collections
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();

  const trendingFetch = useCallback(getTopMoviesWorldwide, []);
  const indianFetch = useCallback(getTopMoviesIndia, []);
  const recommendationsFetch = useCallback(
    () => getRecommendedMovies(user?.username),
    [user?.username]
  );

  const recommendationsData = useMovieData(
    recommendationsFetch,
    `recommendations_${user?.username}`,
    CACHE_CONFIG.recommendations.ttl
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <main className="relative z-10 container mx-auto px-3 md:px-6 lg:px-8 py-6 md:py-8 lg:py-12">
        <WelcomeHeader user={user} />

        <MovieCarousel
          title="Trending Worldwide"
          icon={TrendingUp}
          fetchMovies={trendingFetch}
        />

        <MovieCarousel
          title="Top in India"
          icon={MapPin}
          fetchMovies={indianFetch}
        />

        {user && (
          <MovieCarousel
            title="Recommended for You"
            icon={Heart}
            movies={recommendationsData.data}
            loading={recommendationsData.loading}
          />
        )}
      </main>
    </div>
  );
}
