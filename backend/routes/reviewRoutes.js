const express = require("express");
const router = express.Router();
const {
  createReview,
  getReviews,
  getReviewById,
  deleteReview,
} = require("../controllers/reviewControllers"); // make sure path is correct
const verifyToken = require("../middleware/authMiddleware");

// Debug: check imports
console.log("createReview:", createReview);

// Routes
router.post("/", verifyToken, createReview); // only logged-in users can create review
router.get("/", getReviews); // public: get all reviews
router.get("/:id", getReviewById); // public: get single review
router.delete("/:id", verifyToken, deleteReview); // only owner can delete review

module.exports = router;
