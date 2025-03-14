import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchMovieDetails, getRecommendations } from "../api";
import { Box, Typography, CircularProgress, Grid, Button } from "@mui/material";
import MovieCard from "../components/MovieCard";
import { useTheme } from "@mui/material";

const RecommendationsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState({ movie: null, recommendations: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const theme = useTheme();

  const searchParams = new URLSearchParams(location.search);
  const movieId = searchParams.get("id");

  useEffect(() => {
    const fetchData = async () => {
      if (!movieId) return;

      const cachedData = sessionStorage.getItem(`recommendations_${movieId}`);
      if (cachedData) {
        setData(JSON.parse(cachedData));
        setLoading(false);
        return;
      }

      try {
        const movieDetails = await fetchMovieDetails(movieId);
        if (movieDetails) {
          const recommendations = await getRecommendations(movieDetails);
          const newData = { movie: movieDetails, recommendations };
          setData(newData);
          sessionStorage.setItem(
            `recommendations_${movieId}`,
            JSON.stringify(newData)
          );
        } else {
          setData({ movie: null, recommendations: [] });
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [movieId]);

  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          color: "teal",
        }}
      >
        <Typography variant="h5">Finding great movies... 🎬</Typography>
        <CircularProgress sx={{ color: "teal", mt: 2 }} />
      </Box>
    );

  if (error)
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="h6" color="error">
          Oops! Something went wrong. Please try again.
        </Typography>
        <Button
          variant="outlined"
          sx={{ color: "teal", mt: 2 }}
          onClick={() => navigate(`/movie/${movieId}`)}
        >
          Back to Movie
        </Button>
      </Box>
    );

  const { movie, recommendations } = data;

  return (
    <Box sx={{ p: 3 }}>
      {movie && (
        <Typography
          variant="h4"
          fontWeight="bold"
          textAlign="center"
          mb={3}
          color={theme.palette.primary.main}
        >
          Recommendations for '{movie.title}'
        </Typography>
      )}

      {recommendations && recommendations.length > 0 ? (
        <Grid container spacing={3}>
          {recommendations.map((movie) => (
            <Grid item key={movie.id} xs={12} sm={6} md={4} lg={3}>
              <MovieCard
                movie={movie}
                onClick={(selectedMovie) =>
                  navigate(`/movie/${selectedMovie.id}`)
                }
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="h6" sx={{ textAlign: "center", mt: 4 }}>
          No recommendations found.
        </Typography>
      )}

      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <Button
          variant="outlined"
          sx={{
            fontSize: "1rem",
            borderRadius: 1,
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.text.light,
          }}
          onClick={() => navigate(`/movie/${movieId}`)}
        >
          Back to Movie
        </Button>
      </Box>
    </Box>
  );
};

export default RecommendationsPage;
