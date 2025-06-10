import { Router } from "express";
import { proxyTMDB } from "../controllers/movies.controller.js";

const router = Router();

router.get("/proxy/tmdb/{*splat}", proxyTMDB);

export default router;
