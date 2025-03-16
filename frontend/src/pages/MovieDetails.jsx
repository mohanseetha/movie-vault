import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchMovieDetails,
  getLoggedMovies,
  getWatchlist,
  logMovie,
  addToWatchlist,
  removeFromWatchlist,
  removeFromLogged,
  getUserRating,
} from "../api";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Divider,
  Chip,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Bookmark,
  BookmarkBorder,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "@mui/material/styles";
import Rating from "@mui/material/Rating";
import { rateMovie } from "../api";
import StarIcon from "@mui/icons-material/Star";

const MovieDetails = () => {
  const { id } = useParams();
  const { loggedIn, user } = useAuth();
  const [movie, setMovie] = useState(null);
  const [showMore, setShowMore] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchMovieDetails(id);
        setMovie(data);
        setLoading(false);

        if (data && loggedIn) {
          const loggedMovies = await getLoggedMovies(user);
          setIsWatched(loggedMovies.includes(data.id));

          const watchlistMovies = await getWatchlist(user);
          setInWatchlist(watchlistMovies.includes(data.id));

          const userRatingData = await getUserRating(user, id);
          setUserRating(userRatingData);
        }
      } catch (error) {
        console.error("Error fetching movie details:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [id, loggedIn, user]);

  const handleLogMovie = async () => {
    if (user && movie) {
      try {
        if (isWatched) {
          if (userRating != 0) {
            setUserRating(0);
          }
          await removeFromLogged(user, id);
          setIsWatched(false);
        } else {
          await logMovie(user, id);
          setIsWatched(true);
          setInWatchlist(false);
        }
      } catch (error) {
        console.error("Error updating logged movies:", error);
      }
    }
  };

  const handleWatchlistToggle = async () => {
    if (user && movie) {
      try {
        if (inWatchlist) {
          await removeFromWatchlist(user, id);
          setInWatchlist(false);
        } else {
          await addToWatchlist(user, id);
          setInWatchlist(true);
          setIsWatched(false);
          if (userRating != 0) {
            setUserRating(0);
          }
        }
      } catch (error) {
        console.error("Error updating watchlist:", error);
      }
    }
  };

  const handleRate = async (value) => {
    try {
      if (isWatched == false) {
        handleLogMovie();
      }
      await rateMovie(user, id, value);
      setUserRating(value);
    } catch {
      alert("Failed to submit rating");
    }
  };

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
        <Typography variant="h5">Grabbing movie details... 🍿</Typography>
        <CircularProgress sx={{ color: "teal", mt: 2 }} />
      </Box>
    );

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #f0fdfd, #ffffff)",
        color: "#333",
        borderRadius: "12px",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
        maxWidth: "1200px",
        margin: "auto",
        mt: 4,
        pb: 4,
      }}
    >
      {movie.backdrop_path && (
        <Box
          sx={{
            display: { xs: "none", md: "block" },
            position: "relative",
            height: { md: "400px" },
            backgroundImage: `url(${movie.backdrop_path})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: "12px 12px 0 0",
            width: "100%",
          }}
        />
      )}

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
          p: 3,
        }}
      >
        {movie.poster_path && (
          <Box
            component="img"
            src={movie.poster_path}
            alt={movie.title}
            sx={{
              width: { xs: "100%", md: "250px" },
              borderRadius: 2,
              objectFit: "cover",
            }}
          />
        )}

        <Box sx={{ flex: 1 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="h4" fontWeight="bold">
                {movie.title}
              </Typography>
              {movie.original_title &&
                movie.original_title.toLowerCase() !==
                  movie.title.toLowerCase() && (
                  <Typography variant="subtitle1" sx={{ opacity: 0.7 }}>
                    {movie.original_title}
                  </Typography>
                )}
              {movie.tagline && (
                <Typography
                  variant="subtitle1"
                  sx={{ fontStyle: "italic", mb: 1, opacity: 0.8 }}
                >
                  {movie.tagline}
                </Typography>
              )}
            </Box>
            {loggedIn && (
              <Box sx={{ display: "flex", gap: 2 }}>
                <Tooltip
                  title={isWatched ? "Remove from Watched" : "Add to Watched"}
                  arrow
                >
                  <IconButton
                    onClick={handleLogMovie}
                    color="primary"
                    sx={{ fontSize: "2rem" }}
                  >
                    {isWatched ? (
                      <VisibilityOff fontSize="large" />
                    ) : (
                      <Visibility fontSize="large" />
                    )}
                  </IconButton>
                </Tooltip>
                <Tooltip
                  title={
                    inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"
                  }
                  arrow
                >
                  <IconButton
                    onClick={handleWatchlistToggle}
                    color="primary"
                    sx={{ fontSize: "2rem" }}
                  >
                    {inWatchlist ? (
                      <Bookmark fontSize="large" />
                    ) : (
                      <BookmarkBorder fontSize="large" />
                    )}
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>

          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            {new Date(movie.release_date).getFullYear()}
          </Typography>

          <Typography variant="body2">Director: {movie.director}</Typography>

          <Typography variant="body2">
            Genres: {movie.genres.map((g) => g.name).join(", ")}
          </Typography>

          <Typography variant="body2">Runtime: {movie.runtime} mins</Typography>

          {movie.cast && (
            <Box mt={1}>
              <Typography variant="body2" fontWeight="bold">
                Cast:
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                {movie.cast.slice(0, 10).map((actor) => (
                  <Chip
                    key={actor}
                    label={actor}
                    sx={{
                      backgroundColor: "#b8e1e0",
                      color: theme.palette.primary.main,
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
            <Box sx={{ position: "relative", display: "inline-flex" }}>
              <CircularProgress
                variant="determinate"
                value={movie.rating * 10}
                sx={{
                  color:
                    (movie.rating || 0) >= 7
                      ? theme.palette.success.main
                      : (movie.rating || 0) >= 5
                      ? theme.palette.warning.main
                      : theme.palette.error.main,
                  width: "55px",
                  height: "55px",
                  thickness: 5,
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontWeight: "bold",
                  fontSize: "1rem",
                }}
              >
                {movie.rating.toFixed(1) == 0
                  ? "N/A"
                  : (movie.rating / 2).toFixed(1)}
              </Box>
            </Box>
            <Typography>Users Rating</Typography>
            {loggedIn && (
              <Box
                sx={{
                  ml: { xs: 0, sm: 4 },
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: "center",
                  gap: 1,
                  textAlign: { xs: "center", sm: "left" },
                }}
              >
                {userRating !== 0 && <Typography>Your Rating:</Typography>}
                <Tooltip title="Rate this movie">
                  <Rating
                    name="movie-rating"
                    value={userRating}
                    onChange={(event, newValue) => handleRate(newValue)}
                    precision={0.5}
                    icon={<StarIcon fontSize="large" />}
                    emptyIcon={<StarIcon fontSize="large" color="disabled" />}
                    sx={{
                      "& .MuiSvgIcon-root": {
                        fontSize: { xs: "1.8rem", sm: "2.4rem" },
                      },
                    }}
                  />
                </Tooltip>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <Divider />

      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          Overview
        </Typography>

        <Typography
          variant="body1"
          sx={{ fontSize: "1.2rem", lineHeight: 1.7 }}
        >
          {showMore || movie.overview.length <= 200
            ? movie.overview
            : `${movie.overview.slice(0, 200)}...`}
          {movie.overview.length > 200 && (
            <Button
              sx={{ color: "teal", textTransform: "none", p: 0, ml: 0.5 }}
              onClick={() => setShowMore(!showMore)}
            >
              {showMore ? "Show Less" : "Show More"}
            </Button>
          )}
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "teal",
              color: "white",
              px: 4,
              py: 1.5,
              borderRadius: "30px",
              boxShadow: 3,
              "&:hover": {
                backgroundColor: "darkslategray",
              },
            }}
            onClick={() => navigate(`/recommendations?id=${movie.id}`)}
          >
            Show Recommendations
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default MovieDetails;
