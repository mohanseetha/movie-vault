// api.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// TMDB Proxy
export const fetchMovieDetails = async (id) => {
  const [detailsResponse, creditsResponse] = await Promise.all([
    axios.get(`${BASE_URL}/api/movies/proxy/tmdb/movie/${id}`, {
      headers: getAuthHeaders(),
    }),
    axios.get(`${BASE_URL}/api/movies/proxy/tmdb/movie/${id}/credits`, {
      headers: getAuthHeaders(),
    }),
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
      `${BASE_URL}/api/movies/proxy/tmdb/search/movie`,
      { params: { query }, headers: getAuthHeaders() }
    );
    const results = searchResponse.data.results || [];
    return results;
  } catch (error) {
    console.error("Error searching movies:", error);
    return [];
  }
};

export const getTopMoviesWorldwide = async (page = 1) => {
  const response = await axios.get(
    `${BASE_URL}/api/movies/proxy/tmdb/trending/movie/week`,
    { params: { page }, headers: getAuthHeaders() }
  );
  const results = response.data.results || [];
  const hasMore = results.length === 20;
  return { results, hasMore };
};

export const getTopMoviesIndia = async (page = 1) => {
  const response = await axios.get(
    `${BASE_URL}/api/movies/proxy/tmdb/discover/movie`,
    {
      params: {
        region: "IN",
        with_origin_country: "IN",
        page,
      },
      headers: getAuthHeaders(),
    }
  );
  const results = response.data.results || [];
  const hasMore = results.length === 20;
  return { results, hasMore };
};

export const getMovieRecommendations = async (movieId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/movies/proxy/tmdb/movie/${movieId}/recommendations`,
      { headers: getAuthHeaders() }
    );
    return response.data.results || [];
  } catch (error) {
    console.error("Error fetching movie recommendations:", error);
    return [];
  }
};
// USER MOVIE LISTS

export const addToWatchlist = async (username, movieId) => {
  try {
    await axios.post(
      `${BASE_URL}/api/user/add-to-watchlist`,
      { username, movie_id: movieId },
      { headers: getAuthHeaders() }
    );
    return true;
  } catch {
    return false;
  }
};

export const removeFromWatchlist = async (username, movieId) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/user/remove-from-watchlist`,
      { username, movie_id: movieId },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    return { error: error.response?.data?.error || "An error occurred" };
  }
};

export const getLoggedMovies = async (username) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/user/get-logged`, {
      params: { username },
      headers: getAuthHeaders(),
    });
    return response.data.logged || [];
  } catch {
    return [];
  }
};

export const getWatchlist = async (username) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/user/get-watchlist`, {
      params: { username },
      headers: getAuthHeaders(),
    });
    return response.data.watchlist || [];
  } catch {
    return [];
  }
};

export const getRecommendedMovies = async (username) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/user/recommended-movies`,
      { username },
      { headers: getAuthHeaders() }
    );
    return response.data?.recommendations || [];
  } catch (error) {
    console.error("Error fetching recommended movies:", error.message);
    return [];
  }
};

// AUTH

export const signupUser = async (data) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/signup`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || "Signup failed";
  }
};

export const loginUser = async (user, password) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      user,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || "Login failed. Please try again.";
  }
};

// RATINGS

export const addRating = async (
  username,
  movieId,
  rating,
  review = "",
  watchedDate
) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/ratings/add-rating`,
      {
        username,
        movie_id: movieId,
        rating,
        review,
        watched_date: watchedDate,
      },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || "Failed to add rating";
  }
};

export const editRating = async (username, movieId, rating, review = "") => {
  try {
    const response = await axios.put(
      `${BASE_URL}/api/ratings/edit-rating`,
      { username, movie_id: movieId, rating, review },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || "Failed to edit rating";
  }
};

export const deleteRating = async (username, movieId) => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/api/ratings/delete-rating`,
      {
        data: { username, movie_id: movieId },
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || "Failed to delete rating";
  }
};

export const getRatings = async (movieId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/ratings/get-ratings/${movieId}`,
      {
        headers: getAuthHeaders(),
      }
    );
    console.log("Ratings response:", response.data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || "Failed to fetch ratings";
  }
};
