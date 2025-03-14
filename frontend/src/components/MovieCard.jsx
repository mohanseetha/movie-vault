import {
  Card,
  CardMedia,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

function MovieCard({ movie, onClick }) {
  const theme = useTheme();
  return (
    <Card
      onClick={() => movie.id && onClick(movie)}
      sx={{
        cursor: "pointer",
        width: "100%",
        height: 400,
        borderRadius: 4,
        overflow: "hidden",
        position: "relative",
        boxShadow: `0 4px 12px ${theme.palette.action.hover}`,
        "&:hover .image": { transform: "scale(1.05)" },
      }}
    >
      <CardMedia
        component="img"
        image={
          movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : "/assets/no-image-available.png"
        }
        alt={movie.title || "No Title"}
        className="image"
        sx={{
          height: "100%",
          width: "100%",
          objectFit: "cover",
          transition: "transform 0.3s ease-in-out",
          filter: "brightness(90%)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          background: "rgba(0, 0, 0, 0.75)",
          color: theme.palette.text.light,
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            variant="body1"
            fontWeight="bold"
            sx={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {movie.title || "N/A"}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "rgba(255, 255, 255, 0.8)",
              opacity: 0.9,
            }}
          >
            {movie.director || "N/A"}
          </Typography>
        </Box>

        <Box sx={{ position: "relative", display: "inline-flex" }}>
          <CircularProgress
            variant="determinate"
            value={(movie.rating || 0) * 10}
            size={34}
            thickness={5}
            sx={{
              color:
                (movie.rating || 0) >= 7
                  ? theme.palette.success.main
                  : (movie.rating || 0) >= 5
                  ? theme.palette.warning.main
                  : theme.palette.error.main,
            }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: "absolute",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="caption"
              color="white"
              sx={{ fontWeight: "bold", fontSize: "0.75rem" }}
            >
              {movie.rating?.toFixed(1) || "N/A"}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Card>
  );
}

export default MovieCard;
