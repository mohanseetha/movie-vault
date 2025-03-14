import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import theme from "./theme";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import MovieDetails from "./pages/MovieDetails";
import RecommendationsPage from "./pages/RecommendationsPage";
import SearchResults from "./pages/SearchResults";
import SignUpForm from "./pages/SignUpForm";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Watchlist from "./pages/Watchlist";
import WatchedMovies from "./pages/WatchedMovies.jsx";

const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <Router>
      <Box
        sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        <Navbar />
        <Box sx={{ flex: 1, p: 3 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/search-results" element={<SearchResults />} />
            <Route path="/sign-up" element={<SignUpForm />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/watched-movies" element={<WatchedMovies />} />
          </Routes>
        </Box>
        <Footer />
      </Box>
    </Router>
  </ThemeProvider>
);

export default App;
