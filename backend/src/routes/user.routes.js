import { Router } from "express";
import {
  addToWatchlist,
  removeFromWatchlist,
  getLogged,
  getWatchlist,
  getRecommendedMovies,
} from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);
router.post("/add-to-watchlist", addToWatchlist);
router.post("/remove-from-watchlist", removeFromWatchlist);
router.get("/get-logged", getLogged);
router.get("/get-watchlist", getWatchlist);

router.post("/recommended-movies", getRecommendedMovies);

export default router;
