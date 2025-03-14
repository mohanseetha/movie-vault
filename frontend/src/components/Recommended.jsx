import { useEffect, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { getRecommendedMovies } from "../api";
import MovieCarousel from "./MovieCarousel";
import MovieIcon from "@mui/icons-material/Movie";
import { useAuth } from "../context/AuthContext";

const Recommended = () => {
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecommendedMovies = async () => {
      try {
        if (!user) return;

        setLoading(true);

        const storedRecommendedMovies = sessionStorage.getItem(
          `recommendedMovies_${user}`
        );

        if (storedRecommendedMovies) {
          setRecommendedMovies(JSON.parse(storedRecommendedMovies));
        } else {
          const recommended = await getRecommendedMovies(user);
          setRecommendedMovies(recommended);
          sessionStorage.setItem(
            `recommendedMovies_${user}`,
            JSON.stringify(recommended)
          );
        }
      } catch (error) {
        console.error("Error fetching recommended movies:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchRecommendedMovies();
  }, [user]);

  if (!user || (!loading && recommendedMovies.length === 0)) return null;

  return (
    <Box sx={{ my: 4 }}>
      {loading ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "350px",
            backgroundColor: "rgba(0, 150, 136, 0.15)",
            borderRadius: 2,
            boxShadow: 3,
            mb: 3,
            p: 3,
            textAlign: "center",
          }}
        >
          <CircularProgress sx={{ color: "teal", mb: 2 }} size={60} />
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="h5"
              sx={{ color: "teal", fontWeight: 500, mr: 1 }}
            >
              Collecting Recommendations
            </Typography>
            {""}
            <MovieIcon />{" "}
          </Box>
          <Typography variant="body2" sx={{ mt: 1, color: "#aaa" }}>
            Personalized picks are on their way!
          </Typography>
        </Box>
      ) : (
        <>
          <Typography variant="h4" sx={{ mb: 3, textAlign: "center" }}>
            Recommended for You
          </Typography>
          <MovieCarousel movies={recommendedMovies} />
        </>
      )}
    </Box>
  );
};

export default Recommended;
