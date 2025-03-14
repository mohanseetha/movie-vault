import { useEffect, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getTopMoviesWorldwide, getTopMoviesIndia, searchMovies } from "../api";
import Recommended from "../components/Recommended";
import MovieCarousel from "../components/MovieCarousel";
import SearchBar from "../components/SearchBar";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const [worldwideMovies, setWorldwideMovies] = useState([]);
  const [indiaMovies, setIndiaMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSearch = async (query) => {
    if (!query.trim()) return;
    const results = await searchMovies(query);
    results.length
      ? navigate(`/search-results?query=${query}`)
      : alert("No movies found.");
  };

  useEffect(() => {
    const fetchTopMovies = async () => {
      try {
        const [worldwide, india] = await Promise.all([
          getTopMoviesWorldwide(),
          getTopMoviesIndia(),
        ]);
        setWorldwideMovies(worldwide);
        setIndiaMovies(india);
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopMovies();
  }, []);

  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress size={80} sx={{ color: "teal" }} />
      </Box>
    );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <SearchBar onSearch={handleSearch} />
      </Box>

      {user && <Recommended />}

      <Typography variant="h4" sx={{ mb: 3, textAlign: "center" }}>
        Top 10 Movies Worldwide
      </Typography>
      <MovieCarousel movies={worldwideMovies} />

      <Typography variant="h4" sx={{ mt: 5, mb: 3, textAlign: "center" }}>
        Top 10 Movies in India
      </Typography>
      <MovieCarousel movies={indiaMovies} />
    </Box>
  );
};

export default Home;
