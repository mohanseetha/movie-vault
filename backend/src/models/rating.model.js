import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
  username: { type: String, required: true },
  movie_id: { type: String, required: true },
  rating: { type: Number, default: 0 },
  review: { type: String, default: "" },
  watched_date: { type: Date, default: Date.now },
});

const Rating = mongoose.model("Rating", ratingSchema);

export default Rating;
