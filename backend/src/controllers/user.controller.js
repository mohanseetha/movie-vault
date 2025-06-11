import axios from "axios";
import User from "../models/user.model.js";

const getUser = async (username) => User.findOne({ username });

export const addToWatchlist = async (req, res) => {
  const { username, movie_id } = req.body;
  if (!username || !movie_id)
    return res
      .status(400)
      .json({ error: "Username and movie ID are required" });
  const user = await getUser(username);
  if (!user) return res.status(404).json({ error: "User not found" });
  await User.updateOne({ username }, { $pull: { logged: movie_id } });
  await User.updateOne({ username }, { $addToSet: { watchlist: movie_id } });
  return res
    .status(200)
    .json({ message: "Movie added to watchlist successfully" });
};

export const removeFromWatchlist = async (req, res) => {
  const { username, movie_id } = req.body;
  const user = await getUser(username);
  if (!user) return res.status(404).json({ error: "User not found" });
  if (!user.watchlist.includes(movie_id))
    return res.status(400).json({ error: "Movie not in watchlist" });
  await User.updateOne({ username }, { $pull: { watchlist: movie_id } });
  return res
    .status(200)
    .json({ message: "Movie removed from watchlist successfully" });
};

export const getLogged = async (req, res) => {
  const { username } = req.query;
  const user = await getUser(username);
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.status(200).json({ logged: user.logged || [] });
};

export const getWatchlist = async (req, res) => {
  const { username } = req.query;
  const user = await getUser(username);
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.status(200).json({ watchlist: user.watchlist || [] });
};

export const getRecommendedMovies = async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "Username is required" });

  const user = await User.findOne({ username }, { logged: 1, watchlist: 1 });
  if (!user) return res.status(404).json({ error: "User not found" });

  const loggedMovies = Array.isArray(user.logged)
    ? Array.from(new Set(user.logged.map(String)))
    : [];
  const watchlistMovies = new Set(
    Array.isArray(user.watchlist) ? user.watchlist.map(String) : []
  );
  const TMDB_API_KEY = process.env.TMDB_API_KEY;
  const TMDB_BASE_URL = "https://api.themoviedb.org/3";
  const ratingThreshold = 6.5;

  if (loggedMovies.length > 0) {
    const loggedDetails = await Promise.all(
      loggedMovies.map((id) =>
        axios
          .get(`${TMDB_BASE_URL}/movie/${id}`, {
            params: { api_key: TMDB_API_KEY, append_to_response: "credits" },
          })
          .then((res) => res.data)
          .catch(() => null)
      )
    );

    const favoriteGenres = {};
    const favoriteDirectors = {};
    const favoriteActors = {};

    for (const movie of loggedDetails) {
      if (!movie) continue;
      for (const genre of movie.genres || [])
        favoriteGenres[genre.id] = (favoriteGenres[genre.id] || 0) + 1;
      for (const crew of movie.credits?.crew || []) {
        if (crew.job === "Director")
          favoriteDirectors[crew.name] =
            (favoriteDirectors[crew.name] || 0) + 1;
      }
      for (const cast of (movie.credits?.cast || []).slice(0, 5))
        favoriteActors[cast.name] = (favoriteActors[cast.name] || 0) + 1;
    }

    const recResults = await Promise.all(
      loggedMovies.map((id) =>
        axios
          .get(`${TMDB_BASE_URL}/movie/${id}/recommendations`, {
            params: { api_key: TMDB_API_KEY, language: "en-US", page: 1 },
          })
          .then((res) => res.data.results || [])
          .catch(() => [])
      )
    );

    const recMovieIds = new Set();
    for (const recs of recResults) {
      for (const rec of recs) {
        const recId = String(rec.id);
        if (
          !loggedMovies.includes(recId) &&
          !watchlistMovies.has(recId) &&
          !rec.adult
        )
          recMovieIds.add(recId);
      }
    }

    const recDetails = await Promise.all(
      Array.from(recMovieIds).map((id) =>
        axios
          .get(`${TMDB_BASE_URL}/movie/${id}`, {
            params: { api_key: TMDB_API_KEY, append_to_response: "credits" },
          })
          .then((res) => res.data)
          .catch(() => null)
      )
    );

    const recommendations = [];
    for (const movie of recDetails) {
      if (!movie) continue;
      if ((movie.runtime || 0) < 70) continue;
      if ((movie.vote_average || 0) < ratingThreshold) continue;
      const director =
        (movie.credits?.crew || []).find((c) => c.job === "Director")?.name ||
        "Unknown";
      let score = 0;
      for (const genre of movie.genres || [])
        if (favoriteGenres[genre.id]) score += favoriteGenres[genre.id];
      if (favoriteDirectors[director]) score += 2 * favoriteDirectors[director];
      for (const cast of (movie.credits?.cast || []).slice(0, 5))
        if (favoriteActors[cast.name]) score += favoriteActors[cast.name];
      if (score > 0) {
        recommendations.push({
          id: String(movie.id),
          title: movie.title || "Untitled",
          poster_path: movie.poster_path,
          release_date: movie.release_date || "N/A",
          director,
          rating: movie.vote_average || "N/A",
          score,
        });
      }
    }

    recommendations.sort((a, b) => b.score - a.score || b.rating - a.rating);
    const uniqueRecommendations = Array.from(
      new Map(recommendations.map((item) => [item.id, item])).values()
    ).slice(0, 15);

    return res.status(200).json({ recommendations: uniqueRecommendations });
  } else {
    try {
      const { data } = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
        params: { api_key: TMDB_API_KEY, language: "en-US", page: 1 },
      });
      const movies = (data.results || [])
        .filter(
          (movie) =>
            !movie.adult &&
            (movie.vote_average || 0) >= ratingThreshold &&
            (movie.runtime || 70) >= 70
        )
        .slice(0, 15)
        .map((movie) => ({
          id: String(movie.id),
          title: movie.title || "Untitled",
          poster_path: movie.poster_path,
          release_date: movie.release_date || "N/A",
          director: "Unknown",
          rating: movie.vote_average || "N/A",
          score: 0,
        }));
      return res.status(200).json({ recommendations: movies });
    } catch {
      return res.status(200).json({ recommendations: [] });
    }
  }
};
