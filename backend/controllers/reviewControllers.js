const Review = require("../models/reviewModel");
const User = require("../models/userModel"); // import your User model

// Create a new review
const createReview = async (req, res) => {
  try {
    const { websiteName, websiteUrl, feedback, rating } = req.body;

    // Fetch the user from the DB to get the username
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const review = new Review({
      websiteName,
      websiteUrl,
      feedback,
      rating,
      userId: req.user.id,
      username: user.name, // get username from DB
    });

    await review.save();
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all reviews
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single review by ID
const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    // Fetch username from userId
    const user = await User.findById(review.userId);
    const reviewWithUsername = {
      ...review.toObject(),
      username: user ? user.name : "Unknown",
    };

    res.json(reviewWithUsername);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    // Check if logged-in user is the owner
    if (review.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    await review.remove();
    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createReview,
  getReviews,
  getReviewById,
  deleteReview,
};