import Rating from "../models/rating.model.js";
import User from "../models/user.model.js";

export const addRating = async (req, res) => {
  const { username, movie_id, rating, review, watched_date } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });
    const existing = await Rating.findOne({ username, movie_id });
    if (existing)
      return res
        .status(400)
        .json({ message: "Rating already exists for this movie" });
    const newRating = new Rating({
      username,
      movie_id,
      rating: rating !== undefined ? rating : 0,
      review: review !== undefined ? review : "",
      watched_date,
    });
    const savedRating = await newRating.save();
    if (!user.logged.includes(movie_id)) {
      user.logged.push(movie_id);
      user.watchlist = user.watchlist.filter((id) => id !== movie_id);
      await user.save();
    }
    res.status(201).json(savedRating);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error saving rating", error: error.message });
  }
};

export const editRating = async (req, res) => {
  const { username, movie_id, rating, review } = req.body;
  try {
    const ratingDoc = await Rating.findOne({ username, movie_id });
    if (!ratingDoc)
      return res.status(404).json({ message: "Rating not found" });
    if (rating !== undefined) ratingDoc.rating = rating;
    if (review !== undefined) ratingDoc.review = review;
    const updated = await ratingDoc.save();
    res.status(200).json(updated);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating rating", error: error.message });
  }
};

export const deleteRating = async (req, res) => {
  const { username, movie_id } = req.body;
  try {
    const ratingDoc = await Rating.findOneAndDelete({ username, movie_id });
    if (!ratingDoc)
      return res.status(404).json({ message: "Rating not found" });
    const user = await User.findOne({ username });
    if (user) {
      user.logged = user.logged.filter((id) => id !== movie_id);
      await user.save();
    }
    res.status(200).json({ message: "Rating deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting rating", error: error.message });
  }
};

export const getRatings = async (req, res) => {
  const { movie_id } = req.params;
  try {
    const ratings = await Rating.find({ movie_id }).sort({ watched_date: -1 });
    if (ratings.length === 0) {
      return res
        .status(404)
        .json({ message: "No ratings found for this movie" });
    }
    res.status(200).json(ratings);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching ratings", error: error.message });
  }
};
