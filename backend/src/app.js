import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import moviesRoutes from "./routes/movies.routes.js";
import ratingRoutes from "./routes/ratings.routes.js";

dotenv.config();

const allowedOrigins = [
  "https://movie-vault-two.vercel.app",
  "http://localhost:5173",
];

const app = express();

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/movies", moviesRoutes);
app.use("/api/ratings", ratingRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the Movie Vault API!");
});

export default app;
