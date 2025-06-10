import { useAuth } from "../context/AuthContext";
import { useEffect, useState, useMemo } from "react";
import { getLoggedMovies, getWatchlist, fetchMovieDetails } from "../utils/api";
import MovieCard from "../components/MovieCard";
import SkeletonCard from "../components/SkeletonCard";
import { Popcorn, Ticket, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const useResponsiveSlice = () => {
  const [slice, setSlice] = useState(() => (window.innerWidth <= 768 ? 3 : 5));

  useEffect(() => {
    const onResize = () => setSlice(window.innerWidth <= 768 ? 3 : 5);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return slice;
};

const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

const daysSince = (dateString) => {
  if (!dateString) return null;
  return Math.floor((Date.now() - new Date(dateString)) / 86400000);
};

const FILM_QUOTES = [
  "\"Cinema is a matter of what's in the frame and what's out.\"",
  '"Movies touch our hearts and awaken our vision."',
  '"Here\'s looking at you, kid."',
  '"May the Force be with you."',
  '"Every great film should seem new every time you see it."',
];

const StatBox = ({ label, value }) => (
  <div className="bg-surface/80 rounded-lg px-4 py-2 text-center shadow min-w-[90px]">
    <div className="text-xl font-bold text-accent">{value}</div>
    <div className="text-xs text-text-soft uppercase tracking-wider">
      {label}
    </div>
  </div>
);

const Section = ({
  title,
  icon,
  emptyText,
  emptySub,
  loading,
  movies,
  sliceCount,
  onViewAll,
}) => (
  <section className="mb-12">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-2xl font-bold font-display text-accent">{title}</h2>
      {movies.length > sliceCount && (
        <button
          className="font-display text-accent underline underline-offset-4 text-base md:text-lg font-semibold transition hover:text-accent-dark"
          onClick={onViewAll}
        >
          View All
        </button>
      )}
    </div>

    {loading ? (
      <div className="grid gap-4 grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: sliceCount }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    ) : movies.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-8 text-text-soft">
        {icon}
        <p className="text-lg font-semibold">{emptyText}</p>
        <p className="text-sm">{emptySub}</p>
      </div>
    ) : (
      <div className="grid gap-4 grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {movies.slice(0, sliceCount).map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    )}
  </section>
);

export default function Profile() {
  const { user } = useAuth();
  const [watched, setWatched] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const sliceCount = useResponsiveSlice();

  useEffect(() => {
    if (!user?.username) return;

    setLoading(true);
    Promise.all([
      getLoggedMovies(user.username).then((ids) =>
        Promise.all(ids.map(fetchMovieDetails))
      ),
      getWatchlist(user.username).then((ids) =>
        Promise.all(ids.map(fetchMovieDetails))
      ),
    ])
      .then(([watchedDetails, watchlistDetails]) => {
        setWatched(watchedDetails.filter(Boolean));
        setWatchlist(watchlistDetails.filter(Boolean));
      })
      .finally(() => setLoading(false));
  }, [user]);

  const favoriteGenre = useMemo(() => {
    if (!watched.length) return null;

    const genreCount = {};
    watched.forEach((movie) =>
      (movie.genres || []).forEach((g) => {
        genreCount[g.name] = (genreCount[g.name] || 0) + 1;
      })
    );

    return Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0]?.[0];
  }, [watched]);

  const { avatar, greeting } = useMemo(() => {
    const today = new Date();
    const isFriday = today.getDay() === 5;
    const quoteOfTheDay = FILM_QUOTES[today.getDate() % FILM_QUOTES.length];

    return {
      avatar: (
        <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center shadow-glow mb-2">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt="avatar"
              className="w-full h-full rounded-full object-cover"
            />
          ) : user?.username ? (
            <span className="text-4xl font-bold text-accent font-display">
              {user.username[0].toUpperCase()}
            </span>
          ) : (
            <UserCircle className="text-4xl text-accent" />
          )}
        </div>
      ),
      greeting: isFriday
        ? "It's Friday—perfect for a movie night! 🍿"
        : quoteOfTheDay,
    };
  }, [user]);

  if (!user) {
    return (
      <div className="p-8 text-text-soft">
        Please log in to view your profile.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-main flex flex-col">
      <div className="relative w-full min-h-[50vh] flex items-center justify-center bg-gradient-to-br from-background via-surface to-accent/30 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/assets/film-bg.jpg')] bg-cover bg-center opacity-20" />
        <div className="relative z-10 flex flex-col items-center">
          {avatar}
          <h1 className="text-3xl md:text-4xl font-extrabold font-display tracking-wide mb-1 text-accent drop-shadow">
            {capitalize(user.username)}
          </h1>
          <span className="text-lg italic font-display text-text-soft text-center">
            {greeting}
          </span>
          <div className="flex flex-wrap gap-4 mt-6 justify-center">
            <StatBox label="Watched" value={watched.length} />
            <StatBox label="In Watchlist" value={watchlist.length} />
            <StatBox
              label="Days on MovieVault"
              value={daysSince(user.joined)}
            />
            {favoriteGenre && (
              <div className="bg-accent/20 border border-accent rounded-lg px-4 py-2 text-center shadow mt-2">
                <div className="text-xs text-accent uppercase tracking-wider font-display">
                  Favorite Genre
                </div>
                <div className="text-base font-bold text-accent font-display">
                  {favoriteGenre}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-2 md:px-4 py-8">
        <Section
          title="Watched Movies"
          icon={<Popcorn size={48} className="mb-4 opacity-80 text-accent" />}
          emptyText="No screenings logged yet."
          emptySub="Start watching and log your first film!"
          loading={loading}
          movies={watched}
          sliceCount={sliceCount}
          onViewAll={() => navigate("/watched-movies")}
        />
        <Section
          title="Your Watchlist"
          icon={<Ticket size={48} className="mb-4 opacity-80 text-accent" />}
          emptyText="Your watchlist is feeling lonely."
          emptySub="Add movies you want to see next!"
          loading={loading}
          movies={watchlist}
          sliceCount={sliceCount}
          onViewAll={() => navigate("/watchlist")}
        />
      </main>
    </div>
  );
}
