import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { TextField, Button, Typography, Box, Alert, Link } from "@mui/material";
import { signupUser } from "../api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const SignUpForm = () => {
  const navigate = useNavigate();
  const { login, loggedIn } = useContext(AuthContext);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loggedIn) {
      navigate("/profile");
    }
  }, [loggedIn, navigate]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await signupUser(data);
      alert("User registered successfully");
      login(response.token, response.user.username);
      reset();
      navigate("/profile");
    } catch (error) {
      if (error === "Username already exists. Please choose a different one.") {
        setError(error);
      } else {
        setError("Signup failed");
      }
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
          variant="h4"
          align="center"
          sx={{ fontWeight: "bold", color: "teal", mb: 3 }}
        >
          Sign Up
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField
            fullWidth
            label="Name"
            {...register("name", { required: "Name is required" })}
            error={!!errors.name}
            helperText={errors.name?.message}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Username"
            {...register("username", { required: "Username is required" })}
            error={!!errors.username}
            helperText={errors.username?.message}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            {...register("mail", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: "Invalid email format",
              },
            })}
            error={!!errors.mail}
            helperText={errors.mail?.message}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            error={!!errors.password}
            helperText={errors.password?.message}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) =>
                value === watch("password") || "Passwords do not match",
            })}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            margin="normal"
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3, backgroundColor: "teal" }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Registering..." : "Sign Up"}
          </Button>

          <Typography textAlign="center" mt={2}>
            Already have an account?{" "}
            <Link
              component="button"
              onClick={() => navigate("/login")}
              sx={{ color: "teal", cursor: "pointer" }}
            >
              Login
            </Link>
          </Typography>
        </form>
      </Box>
    </Box>
  );
};

export default SignUpForm;
