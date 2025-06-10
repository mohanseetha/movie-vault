import { Router } from "express";
import {
  addRating,
  editRating,
  deleteRating,
  getRatings,
} from "../controllers/ratings.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);
router.post("/add-rating", addRating);
router.put("/edit-rating", editRating);
router.delete("/delete-rating", deleteRating);
router.get("/get-ratings/:movie_id", getRatings);

export default router;
