const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    websiteName: {
      type: String,
      required: true,
      trim: true,
    },
    websiteUrl: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    feedback: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    images: [
      {
        type: String, // store local file paths
      },
    ],
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
