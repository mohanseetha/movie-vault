import React, { useEffect, useState } from "react";
import { Box, Grid, Typography, CircularProgress, Button } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { searchMovies } from "../api";
import MovieCard from "../components/MovieCard";
import SearchBar from "../components/SearchBar";

const SearchResults = () => {
  const [movies, setMovies] = useState([]);
  const [visibleMovies, setVisibleMovies] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  const query = new URLSearchParams(location.search).get("query");

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      setLoading(true);

      const results = await searchMovies(query);
      const filteredResults = results
        .filter((movie) => movie.director?.trim() && movie.poster_path)
        .sort((a, b) => b.rating - a.rating);

      setMovies(filteredResults);
      setShowAll(false);
      setVisibleMovies(filteredResults.slice(0, 8));
      setLoading(false);
    };

    fetchResults();
  }, [location.search, query]);

  const handleSearch = (newQuery) => {
    if (newQuery.trim()) {
      navigate(`/search-results?query=${encodeURIComponent(newQuery.trim())}`);
    }
  };

  const handleShowMore = () => {
    setShowAll(true);
    setVisibleMovies(movies);
  };

  return (
    <Box sx={{ p: 3 }}>
      <SearchBar value={query || ""} handleSearch={handleSearch} />

      <Typography
        variant="h4"
        mb={3}
        mt={3}
        textAlign="center"
        sx={{ color: "primary.main", fontWeight: "bold" }}
      >
        Search Results for "{query}"
      </Typography>

      {loading ? (
        <CircularProgress sx={{ display: "block", mx: "auto", my: 4 }} />
      ) : movies.length === 0 ? (
        <Typography
          variant="h6"
          sx={{
            textAlign: "center",
            mt: 3,
            color: "text.primary",
            opacity: 0.8,
          }}
        >
          No movies found
        </Typography>
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

          {!showAll && movies.length > 8 && (
            <Box sx={{ textAlign: "center", mt: 4 }}>
              <Button
                variant="h5"
                sx={{ color: "primary.main", fontWeight: "bold" }}
                onClick={handleShowMore}
              >
                Show More
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default SearchResults;
