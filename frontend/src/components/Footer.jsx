import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import tmdbLogo from "../assets/tmdb.svg";

function Footer() {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: theme.palette.primary.dark,
        color: theme.palette.text.light,
        textAlign: "center",
        py: 2,
        mt: 4,
      }}
    >
      <Typography variant="body2">
        This product uses the TMDB API but is not endorsed or certified by TMDB
        <img
          src={tmdbLogo}
          alt="TMDB Logo"
          style={{ height: 20, verticalAlign: "middle", margin: "0 5px" }}
        />
      </Typography>
      <Typography variant="body2" sx={{ mt: 1 }}>
        &copy; {new Date().getFullYear()} Movie Recommendation System
      </Typography>
    </Box>
  );
}

export default Footer;
