import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { searchMovies } from "../utils/api";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef();
  const abortControllerRef = useRef();
  const debounceTimeout = useRef();

  const getMaxResults = () => (window.innerWidth < 640 ? 3 : 5);

  const getRatingColor = (rating) => {
    if (rating >= 4) return "text-green-400";
    if (rating >= 3) return "text-yellow-400";
    if (rating >= 2) return "text-orange-400";
    return "text-red-400";
  };

  const fetchSuggestions = useCallback((searchQuery) => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setSuggestions([]);
        setLoading(false);
        return;
      }
      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();
      try {
        const results = await searchMovies(searchQuery, {
          signal: abortControllerRef.current.signal,
        });
        const currentYear = new Date().getFullYear();
        setSuggestions(
          results
            .filter(
              (m) =>
                m.poster_path &&
                m.title &&
                ((m.vote_average || 0) > 0 ||
                  (m.release_date &&
                    parseInt(m.release_date.slice(0, 4)) >= currentYear))
            )
            .slice(0, getMaxResults())
        );
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 250);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchSuggestions(query);
  }, [query, fetchSuggestions]);

  useEffect(() => {
    if (!showDropdown) return;
    const handleClick = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showDropdown]);

  const handleSelect = (movie) => {
    setQuery("");
    setShowDropdown(false);
    navigate(`/movies/${movie.id}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowDropdown(false);
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const renderDropdown = () => (
    <div className="absolute left-0 right-0 mt-2 bg-surface rounded-xl shadow-2xl z-50 border border-accent/20 max-h-96 overflow-y-auto">
      {loading && query.trim() ? (
        <div className="p-6 text-center text-text-soft flex gap-3 items-center justify-center">
          <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          <span className="font-medium">Searching...</span>
        </div>
      ) : suggestions.length > 0 ? (
        <div className="p-2">
          {suggestions.map((movie) => (
            <button
              key={movie.id}
              className="w-full flex items-center gap-4 px-4 py-3 hover:bg-accent/10 transition-all duration-200 text-left rounded-lg"
              onClick={() => handleSelect(movie)}
            >
              {movie.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                  alt={movie.title}
                  className="w-10 h-14 object-cover rounded-lg shadow-md"
                  loading="lazy"
                />
              ) : (
                <div className="w-10 h-14 bg-gray-700 rounded-lg flex items-center justify-center">
                  <Search size={16} className="text-gray-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white truncate text-lg">
                  {movie.title}
                </div>
                <div className="text-sm text-text-soft flex items-center gap-2">
                  <span>{movie.release_date?.slice(0, 4) || "—"}</span>
                  <span>•</span>
                  <span className={getRatingColor(movie.vote_average / 2)}>
                    {(movie.vote_average / 2).toFixed(1)}
                  </span>
                </div>
              </div>
            </button>
          ))}
          <button
            className="w-full px-4 py-3 mt-1 text-accent hover:bg-accent/10 text-left font-semibold transition-all duration-200 flex items-center gap-2 rounded-lg"
            onClick={() => {
              setShowDropdown(false);
              setQuery("");
              navigate(`/search?q=${encodeURIComponent(query.trim())}`);
            }}
          >
            <Search size={18} />
            <span>Show all results for "{query}"</span>
          </button>
        </div>
      ) : (
        query.trim() && (
          <div className="p-6 text-center text-text-soft">
            <Search size={24} className="mx-auto mb-2 opacity-50" />
            <p className="font-medium">No results found for "{query}"</p>
            <p className="text-sm mt-1">Try adjusting your search terms</p>
            <button
              className="mt-4 w-full px-4 py-3 text-accent hover:bg-accent/10 text-left font-semibold transition-all duration-200 flex items-center gap-2 rounded-lg justify-center"
              onClick={() => {
                setShowDropdown(false);
                setQuery("");
                navigate(`/search?q=${encodeURIComponent(query.trim())}`);
              }}
            >
              <Search size={18} />
              <span>Show all results for "{query}"</span>
            </button>
          </div>
        )
      )}
    </div>
  );

  return (
    <div
      className="relative w-full max-w-xs sm:max-w-sm md:w-72 md:max-w-md lg:w-80"
      ref={inputRef}
    >
      <form onSubmit={handleSubmit} autoComplete="off" className="relative">
        <input
          type="text"
          className="w-full rounded-lg px-5 py-2 pr-12 bg-surface border border-surface/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/30 transition-all duration-200 text-base font-medium shadow"
          placeholder="Search movies..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => {
            if (query.trim()) setShowDropdown(true);
          }}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setShowDropdown(false);
                inputRef.current?.focus();
              }}
              className="p-1 text-gray-400 hover:text-white transition-colors duration-200 rounded-full hover:bg-white/10"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
          <button
            type="submit"
            className="p-1 text-accent hover:text-accent-dark focus:text-accent-dark transition-colors duration-200 rounded-full hover:bg-accent/10"
            aria-label="Search"
          >
            <Search size={18} />
          </button>
        </div>
        {loading && (
          <div className="absolute right-14 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin"></div>
          </div>
        )}
      </form>
      {showDropdown && renderDropdown()}
    </div>
  );
}
