import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Grid,
  Card,
  CardMedia,
  Avatar,
} from "@mui/material";
import { getLoggedMovies, getWatchlist, fetchMovieDetails } from "../api";
import MovieIcon from "@mui/icons-material/Movie";
import ListAltIcon from "@mui/icons-material/ListAlt";

const Profile = () => {
  const { loggedIn, loading, user } = useContext(AuthContext);
  const [loggedMovies, setLoggedMovies] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchMoviesByIds = async (movieIds) => {
    try {
      const movies = await Promise.all(
        movieIds.map((id) => fetchMovieDetails(id))
      );
      return movies.filter((movie) => movie);
    } catch (err) {
      console.error("Error fetching movie details:", err);
      throw new Error("Failed to fetch movie details");
    }
  };

  useEffect(() => {
    const loadMovies = async () => {
      if (!user) return;

      try {
        const [loggedMovieIds, watchlistIds] = await Promise.all([
          getLoggedMovies(user),
          getWatchlist(user),
        ]);

        const [loggedMoviesData, watchlistData] = await Promise.all([
          fetchMoviesByIds(loggedMovieIds),
          fetchMoviesByIds(watchlistIds),
        ]);

        setLoggedMovies(loggedMoviesData.reverse());
        setWatchlist(watchlistData.reverse());
      } catch (err) {
        console.error("Error loading movies:", err);
        setError("Failed to load movies. Please try again later.");
      } finally {
        setLoadingData(false);
      }
    };

    if (loggedIn) {
      loadMovies();
    } else {
      setLoadingData(false);
    }
  }, [loggedIn, user]);

  if (loading || loadingData) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f4f6f9",
        }}
      >
        <CircularProgress size={70} sx={{ color: "#008080" }} />
      </Box>
    );
  }

  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (error) {
    return (
      <Box sx={{ padding: 3, textAlign: "center" }}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
        <Button
          onClick={() => setLoadingData(true)}
          variant="contained"
          sx={{
            mt: 2,
            backgroundColor: "#008080",
            "&:hover": { backgroundColor: "#006f6f" },
          }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #f0fdfd, #ffffff)",
        color: "#333",
        borderRadius: "12px",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
        margin: "auto",
        maxWidth: { xs: "100%", sm: "90%", md: "80%" },
        mt: 4,
        padding: { xs: 3, sm: 5, md: 6 },
      }}
    >
      <Box mb={5} sx={{ textAlign: "left" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Avatar sx={{ bgcolor: "primary.main", color: "white" }}>
            {user[0].toUpperCase()}
          </Avatar>
          <Typography
            variant="h6"
            sx={{
              color: "#333",
              fontSize: { xs: "1.2rem", sm: "1.4rem" },
            }}
          >
            {"Hello, " +
              String(user[0]).toUpperCase() +
              String(user).slice(1) +
              "!"}
          </Typography>
        </Box>

        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            color: "#333",
            fontSize: { xs: "1.1rem", sm: "1.3rem" },
            mb: 2,
          }}
        >
          Your Movie Journey
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: { xs: 2, sm: 4 },
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: { xs: 40, sm: 50 },
                height: { xs: 40, sm: 50 },
                backgroundColor: "primary.light",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "white",
                borderRadius: "50%",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
              }}
            >
              <MovieIcon fontSize="medium" />
            </Box>
            <Typography
              variant="body1"
              sx={{
                fontWeight: "500",
                color: "#555",
                fontSize: { xs: "1rem", sm: "1.2rem" },
              }}
            >
              {loggedMovies.length} Movies Watched
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: { xs: 40, sm: 50 },
                height: { xs: 40, sm: 50 },
                backgroundColor: "secondary.light",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "white",
                borderRadius: "50%",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
              }}
            >
              <ListAltIcon fontSize="medium" />
            </Box>
            <Typography
              variant="body1"
              sx={{
                fontWeight: "500",
                color: "#555",
                fontSize: { xs: "1rem", sm: "1.2rem" },
              }}
            >
              {watchlist.length} Movies in Watchlist
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h5"
          sx={{
            mb: 2,
            fontWeight: "bold",
            color: "#333",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            fontSize: { xs: "1.25rem", sm: "1.5rem" },
            justifyContent: "center",
          }}
        >
          <MovieIcon sx={{ mr: 1, color: "#333" }} />
          Movies Watched by You
        </Typography>
        {loggedMovies.length > 0 ? (
          <Grid container spacing={3}>
            {loggedMovies.slice(0, 4).map((movie) => (
              <Grid item xs={6} sm={4} md={3} key={movie.id}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                    cursor: "pointer",
                    overflow: "hidden",
                  }}
                  onClick={() => handleMovieClick(movie.id)}
                >
                  <CardMedia
                    component="img"
                    image={movie.poster_path || "/default-poster.jpg"}
                    alt={movie.title || "Movie Title"}
                    sx={{
                      height: { xs: 180, sm: 200, md: 400 },
                      objectFit: "cover",
                      borderTopLeftRadius: 3,
                      borderTopRightRadius: 3,
                    }}
                  />
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography sx={{ color: "#666", textAlign: "center" }}>
            No movies watched yet.
          </Typography>
        )}
        {loggedMovies.length > 0 && (
          <Button
            sx={{
              fontSize: { xs: "1rem", sm: "1.25rem" },
              mt: 5,
              color: "#008080",
              textTransform: "none",
              fontWeight: "bold",
              "&:hover": { backgroundColor: "#f4f6f9" },
              display: "block",
              margin: "auto",
            }}
            variant="text"
            onClick={() => navigate("/watched-movies")}
          >
            View All
          </Button>
        )}
      </Box>
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h5"
          sx={{
            mb: 2,
            fontWeight: "bold",
            color: "#333",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            fontSize: { xs: "1.25rem", sm: "1.5rem" },
            justifyContent: "center",
          }}
        >
          <ListAltIcon sx={{ mr: 1, color: "#333" }} />
          Watchlist
        </Typography>
        {watchlist.length > 0 ? (
          <Grid container spacing={3}>
            {watchlist.slice(0, 4).map((movie) => (
              <Grid item xs={6} sm={4} md={3} key={movie.id}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                    cursor: "pointer",
                    overflow: "hidden",
                  }}
                  onClick={() => handleMovieClick(movie.id)}
                >
                  <CardMedia
                    component="img"
                    image={movie.poster_path || "/default-poster.jpg"}
                    alt={movie.title || "Movie Title"}
                    sx={{
                      height: { xs: 180, sm: 200, md: 400 },
                      objectFit: "cover",
                      borderTopLeftRadius: 3,
                      borderTopRightRadius: 3,
                    }}
                  />
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography sx={{ color: "#666", textAlign: "center" }}>
            No movies in watchlist.
          </Typography>
        )}
        {watchlist.length > 0 && (
          <Button
            sx={{
              fontSize: { xs: "1rem", sm: "1.25rem" },
              mt: 5,
              color: "#008080",
              textTransform: "none",
              fontWeight: "bold",
              "&:hover": { backgroundColor: "#f4f6f9" },
              display: "block",
              margin: "auto",
            }}
            variant="text"
            onClick={() => navigate("/watchlist")}
          >
            View All
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default Profile;
