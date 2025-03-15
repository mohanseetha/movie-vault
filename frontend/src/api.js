import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const fetchMovieDetails = async (id) => {
  const [detailsResponse, creditsResponse] = await Promise.all([
    axios.get(`${BASE_URL}/proxy/tmdb/movie/${id}`),
    axios.get(`${BASE_URL}/proxy/tmdb/movie/${id}/credits`),
  ]);

  const movie = detailsResponse.data;

  const director =
    creditsResponse.data.crew.find((member) => member.job === "Director")
      ?.name || "N/A";

  const cast = creditsResponse.data.cast
    .slice(0, 10)
    .map((actor) => actor.name);

  return {
    id,
    title: movie.title,
    original_title: movie.original_title,
    overview: movie.overview,
    tagline: movie.tagline,
    poster_path: movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : null,
    backdrop_path: movie.backdrop_path
      ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
      : null,
    release_date: movie.release_date,
    genres: movie.genres || [],
    rating: movie.vote_average,
    runtime: movie.runtime,
    production_countries: movie.production_countries || [],
    spoken_languages: movie.spoken_languages || [],
    director,
    cast,
  };
};

export const searchMovies = async (query) => {
  try {
    const searchResponse = await axios.get(
      `${BASE_URL}/proxy/tmdb/search/movie`,
      { params: { query } }
    );

    const results = searchResponse.data.results || [];

    const moviesWithDirectors = await Promise.all(
      results.map(async (movie) => {
        try {
          const detailsResponse = await axios.get(
            `${BASE_URL}/proxy/tmdb/movie/${movie.id}`,
            { params: { append_to_response: "credits" } }
          );

          const director =
            detailsResponse.data.credits.crew.find(
              (member) => member.job === "Director"
            )?.name || "Unknown";

          return {
            id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              : null,
            release_date: movie.release_date,
            rating: movie.vote_average,
            director,
          };
        } catch (error) {
          console.error(
            `Error fetching details for movie ID ${movie.id}:`,
            error
          );
          return null;
        }
      })
    );

    return moviesWithDirectors.filter((movie) => movie !== null);
  } catch (error) {
    console.error("Error searching movies:", error);
    return [];
  }
};

export const getRecommendations = async (movie) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/recommendations`,
      { movie },
      { headers: { "Content-Type": "application/json" } }
    );

    const recommendations = Array.isArray(response.data) ? response.data : [];
    const validRecommendations = recommendations.filter((id) => id);

    const enrichedRecommendations = await Promise.allSettled(
      validRecommendations.map((id) =>
        axios.get(`${BASE_URL}/proxy/tmdb/movie/${id}`, {
          params: { append_to_response: "credits" },
        })
      )
    );

    return enrichedRecommendations
      .filter((result) => result.status === "fulfilled")
      .map(({ value }) => {
        const data = value.data || {};
        const director =
          data.credits?.crew.find((member) => member.job === "Director")
            ?.name || "Unknown";

        return {
          id: data.id,
          title: data.title || "Untitled",
          poster_path: data.poster_path || null,
          release_date: data.release_date || "N/A",
          director,
          rating: data.vote_average || "N/A",
        };
      });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return [];
  }
};

export const getTopMoviesWorldwide = async () => {
  const response = await axios.get(
    `${BASE_URL}/proxy/tmdb/trending/movie/week`
  );
  return response.data.results.slice(0, 10);
};

export const getTopMoviesIndia = async () => {
  const response = await axios.get(`${BASE_URL}/proxy/tmdb/discover/movie`, {
    params: {
      region: "IN",
      with_origin_country: "IN",
      page: 1,
    },
  });
  return response.data.results.slice(0, 10);
};

export const logMovie = async (username, movieId) => {
  try {
    await axios.post(`${BASE_URL}/add_logged_movie`, {
      username,
      movie_id: movieId,
    });
    return true;
  } catch {
    return false;
  }
};

export const addToWatchlist = async (username, movieId) => {
  try {
    await axios.post(`${BASE_URL}/add_to_watchlist`, {
      username,
      movie_id: movieId,
    });
    return true;
  } catch {
    return false;
  }
};

export const getLoggedMovies = async (username) => {
  try {
    const response = await axios.get(`${BASE_URL}/get_logged`, {
      params: { username },
    });
    return response.data.logged || [];
  } catch {
    return [];
  }
};

export const getWatchlist = async (username) => {
  try {
    const response = await axios.get(`${BASE_URL}/get_watchlist`, {
      params: { username },
    });
    return response.data.watchlist || [];
  } catch {
    return [];
  }
};

export const removeFromWatchlist = async (username, movieId) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/remove_from_watchlist?username=${username}&movie_id=${movieId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error removing movie from watchlist:",
      error.response?.data || error.message
    );
    return { error: error.response?.data?.error || "An error occurred" };
  }
};

export const removeFromLogged = async (username, movieId) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/remove_from_logged?username=${username}&movie_id=${movieId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error removing from logged movies:", error);
    return { error: "Failed to remove movie from logged movies" };
  }
};

export const getRecommendedMovies = async (username) => {
  try {
    const response = await axios.post(`${BASE_URL}/recommended-movies`, {
      username,
    });

    const recommendations = response.data?.recommendations || [];
    if (recommendations.length > 0) {
      return recommendations.map((rec) => ({
        id: rec.id,
        title: rec.title,
        poster_path: rec.poster,
        release_date: rec.release_date,
        director: rec.director || "Unknown",
        rating: rec.rating,
      }));
    }

    const imdbResponse = await axios.get(
      `${BASE_URL}/proxy/tmdb/movie/top_rated`,
      {
        params: {
          language: "en-US",
          page: 1,
        },
      }
    );

    const topRatedMovies = imdbResponse.data.results
      .slice(0, 10)
      .map((movie) => ({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        director: "Unknown",
        rating: movie.vote_average,
      }));

    return topRatedMovies;
  } catch (error) {
    console.error("Error fetching recommended movies:", error);
    return [];
  }
};

export const signupUser = async (data) => {
  try {
    const response = await axios.post(`${BASE_URL}/signup`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || "Signup failed";
  }
};

export const loginUser = async (user, password) => {
  try {
    const response = await axios.post(`${BASE_URL}/login`, { user, password });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || "Login failed. Please try again.";
  }
};
