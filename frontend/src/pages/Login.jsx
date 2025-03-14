import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Link,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, loggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loggedIn) {
      navigate("/profile");
    }
  }, [loggedIn, navigate]);

  const handleLogin = async () => {
    setError("");
    if (!user || !password) {
      setError("Both fields are required");
      return;
    }

    setLoading(true);
    try {
      const response = await loginUser(user, password);
      const { token } = response;

      if (token && user) {
        login(token, user);
        alert(response.message);
        navigate("/");
      } else {
        throw new Error("Token or username not provided");
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 128px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: { xs: 400, sm: 450, md: 600 },
          boxShadow: 3,
          borderRadius: 2,
          backgroundColor: "#f0f2f5",
          p: 4,
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          textAlign="center"
          color="teal"
          mb={2}
        >
          Login
        </Typography>

        {error && (
          <Typography color="error" textAlign="center" mb={2}>
            {error}
          </Typography>
        )}

        <TextField
          label="Username or Email"
          variant="outlined"
          fullWidth
          value={user}
          onChange={(e) => setUser(e.target.value)}
          onKeyDown={handleKeyPress}
          margin="normal"
        />

        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyPress}
          margin="normal"
        />

        <Button
          variant="contained"
          fullWidth
          onClick={handleLogin}
          disabled={loading}
          sx={{ mt: 2, backgroundColor: "teal" }}
        >
          {loading ? <CircularProgress size={24} /> : "Login"}
        </Button>

        <Typography textAlign="center" mt={2}>
          Don't have an account?{" "}
          <Link
            component="button"
            onClick={() => navigate("/sign-up")}
            sx={{ color: "teal", cursor: "pointer" }}
          >
            Sign up
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;
