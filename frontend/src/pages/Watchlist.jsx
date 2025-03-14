import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { getWatchlist, fetchMovieDetails } from "../api";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Grid,
  Card,
  CardMedia,
} from "@mui/material";
import ListAltIcon from "@mui/icons-material/ListAlt";
import { useNavigate, Navigate } from "react-router-dom";

const Watchlist = () => {
  const { loggedIn, user, loading } = useContext(AuthContext);
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
        const watchlistIds = await getWatchlist(user);
        const watchlistData = await fetchMoviesByIds(watchlistIds);
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
        mt: 4,
        padding: { xs: 3, sm: 5, md: 6 },
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: "bold",
          color: "#333",
          fontSize: { xs: "1.5rem", sm: "2rem" },
          textAlign: "center",
        }}
      >
        Your Watchlist
      </Typography>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          mt: 2,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 50,
              height: 50,
              backgroundColor: "secondary.light",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "white",
              fontSize: "2rem",
              borderRadius: "50%",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
            }}
          >
            <ListAltIcon fontSize="sm" />
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: "#333",
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
              letterSpacing: "0.5px",
              textAlign: "center",
            }}
          >
            {watchlist.length} Movies in Watchlist
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3} mt={2}>
        {watchlist.map((movie) => (
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

      {watchlist.length === 0 && (
        <Typography sx={{ color: "#666", textAlign: "center", mt: 4 }}>
          No movies in your watchlist yet.
        </Typography>
      )}
    </Box>
  );
};

export default Watchlist;
