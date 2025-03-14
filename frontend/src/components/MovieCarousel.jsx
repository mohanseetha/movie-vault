import { Box, Card, CardMedia, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

const MovieCarousel = ({ movies = [] }) => {
  const navigate = useNavigate();

  const validMovies = Array.isArray(movies)
    ? movies.filter((movie) => movie?.id && movie?.title && movie?.poster_path)
    : [];

  if (validMovies.length === 0) return null;

  return (
    <Carousel
      additionalTransfrom={0}
      arrows
      autoPlay
      autoPlaySpeed={3000}
      infinite
      keyBoardControl
      responsive={{
        desktop: { breakpoint: { max: 3000, min: 1024 }, items: 4 },
        tablet: { breakpoint: { max: 1024, min: 464 }, items: 3 },
        mobile: { breakpoint: { max: 464, min: 0 }, items: 2 },
      }}
      itemClass="carousel-item-padding"
    >
      {validMovies.map((movie) => (
        <Card
          key={movie.id}
          onClick={() => navigate(`/movie/${movie.id}`)}
          sx={{
            position: "relative",
            cursor: "pointer",
            mx: 1,
            "&:hover .zoomEffect": { transform: "scale(1.05)" },
            "&:hover .overlay": { opacity: 1 },
          }}
        >
          <CardMedia
            component="img"
            image={`https://image.tmdb.org/t/p/w780${movie.poster_path}`}
            alt={movie.title}
            className="zoomEffect"
            sx={{
              height: { xs: "200px", sm: "300px", md: "450px" },
              transition: "transform 0.3s ease-in-out",
            }}
          />
          <Box
            className="overlay"
            sx={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              background: "rgba(0, 0, 0, 0.7)",
              color: "#FFFFFF",
              textAlign: "center",
              opacity: 0,
              transition: "opacity 0.3s ease-in-out",
              p: 1,
            }}
          >
            <Typography variant="body1" fontWeight="bold">
              {movie.title}
            </Typography>
          </Box>
        </Card>
      ))}
    </Carousel>
  );
};

export default MovieCarousel;
