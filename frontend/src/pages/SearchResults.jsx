/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { searchMovies, fetchMovieDetails } from "../api";
import MovieCard from "../components/MovieCard";
import SearchBar from "../components/SearchBar";

const SearchResults = () => {
  const [movies, setMovies] = useState([]);
  const [visibleMovies, setVisibleMovies] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("rating");
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search).get("query");

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      setLoading(true);

      const results = await searchMovies(query);
      const filteredResults = results.filter(
        (movie) => movie.director?.trim() && movie.poster_path
      );

      const detailedResults = await Promise.all(
        filteredResults.map(async (movie) => {
          const details = await fetchMovieDetails(movie.id);
          return {
            ...movie,
            release_date: details.release_date || "",
            runtime: details.runtime || 0,
          };
        })
      );

      setMovies(detailedResults);
      handleSorting(detailedResults, sortBy, false);
      setLoading(false);
    };

    fetchResults();
  }, [location.search]);

  const handleSorting = (moviesList, criteria, showAllState) => {
    const sortedMovies = [...moviesList];

    switch (criteria) {
      case "title-asc":
        sortedMovies.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-desc":
        sortedMovies.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "rating":
        sortedMovies.sort((a, b) => b.rating - a.rating);
        break;
      case "year-oldest":
        sortedMovies.sort(
          (a, b) => new Date(a.release_date) - new Date(b.release_date)
        );
        break;
      case "year-newest":
        sortedMovies.sort(
          (a, b) => new Date(b.release_date) - new Date(a.release_date)
        );
        break;
      case "runtime-longest":
        sortedMovies.sort((a, b) => b.runtime - a.runtime);
        break;
      case "runtime-shortest":
        sortedMovies.sort((a, b) => a.runtime - b.runtime);
        break;
      default:
        break;
    }

    setMovies(sortedMovies);
    setVisibleMovies(showAllState ? sortedMovies : sortedMovies.slice(0, 8));
  };

  const handleSearch = (newQuery) => {
    if (newQuery.trim()) {
      navigate(`/search-results?query=${encodeURIComponent(newQuery.trim())}`);
    }
  };

  const handleShowMore = () => {
    setShowAll(true);
    setVisibleMovies(movies);
  };

  const handleShowLess = () => {
    setShowAll(false);
    setVisibleMovies(movies.slice(0, 8));
  };

  const handleSortChange = (event) => {
    const newSortBy = event.target.value;
    setSortBy(newSortBy);
    handleSorting(movies, newSortBy, showAll);
  };

  return (
    <Box sx={{ p: 3 }}>
      <SearchBar value={query || ""} handleSearch={handleSearch} />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: { xs: "column", sm: "row" },
          my: 2,
          gap: 2,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: "primary.main",
            fontWeight: "bold",
            textAlign: { xs: "center", sm: "left" },
          }}
        >
          Search Results for "{query}"
        </Typography>
        <Box>
          <InputLabel>Sort By</InputLabel>
          <FormControl
            sx={{
              minWidth: 220,
              backgroundColor: "rgba(0, 150, 136, 0.1)",
              borderRadius: 3,
              border: "0.5px solid",
              borderColor: "primary.main",
            }}
          >
            <Select
              value={sortBy}
              onChange={handleSortChange}
              sx={{
                color: "text.primary",
                fontWeight: "bold",
              }}
            >
              <MenuItem value="title-asc">A-Z</MenuItem>
              <MenuItem value="title-desc">Z-A</MenuItem>
              <MenuItem value="rating">Rating (Highest First)</MenuItem>
              <MenuItem value="year-oldest">
                Release Year (Oldest First)
              </MenuItem>
              <MenuItem value="year-newest">
                Release Year (Newest First)
              </MenuItem>
              <MenuItem value="runtime-longest">
                Runtime (Longest First)
              </MenuItem>
              <MenuItem value="runtime-shortest">
                Runtime (Shortest First)
              </MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {loading ? (
        <Box
          sx={{
            display: "flex",
            height: "60vh",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              backgroundColor: "background.paper",
              px: 3,
              py: 1.5,
              borderRadius: "20px",
              boxShadow: 3,
            }}
          >
            <CircularProgress
              size={20}
              thickness={5}
              sx={{ color: "primary.main" }}
            />
            <Typography
              variant="body1"
              sx={{
                color: "primary.main",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: 1.5,
              }}
            >
              Searching...
            </Typography>
          </Box>
        </Box>
      ) : (
        <>
          <Grid container spacing={2}>
            {visibleMovies.map((movie) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id}>
                <MovieCard
                  movie={movie}
                  onClick={(selectedMovie) =>
                    navigate(`/movie/${selectedMovie.id}`)
                  }
                />
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: "center", mt: 4 }}>
            {!showAll && movies.length > 8 && (
              <Button
                variant="h5"
                sx={{ color: "primary.main", fontWeight: "bold" }}
                onClick={handleShowMore}
              >
                Show More
              </Button>
            )}

            {showAll && (
              <Button
                variant="h5"
                sx={{ color: "primary.main", fontWeight: "bold" }}
                onClick={handleShowLess}
              >
                Show Less
              </Button>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default SearchResults;
