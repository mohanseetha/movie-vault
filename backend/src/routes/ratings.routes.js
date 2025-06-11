import { Router } from "express";
import {
  addRating,
  editRating,
  deleteRating,
  getRatings,
} from "../controllers/ratings.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/add-rating", authenticate, addRating);
router.put("/edit-rating", authenticate, editRating);
router.delete("/delete-rating", authenticate, deleteRating);
router.get("/get-ratings/:movie_id", getRatings);

export default router;
