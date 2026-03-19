import express from "express";
import Review from "../models/Review.js";
import Provider from "../models/Provider.js";
import Booking from "../models/Booking.js";
import { isAuthenticated, isCustomer } from "../middleware/auth.js";

const router = express.Router();

// Submit a review
router.post("/:providerId", isAuthenticated, isCustomer, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const providerId = req.params.providerId;
    const customerId = req.session.user._id;

    // Check if user already reviewed this provider
    const existingReview = await Review.findOne({
      customer: customerId,
      provider: providerId,
    });

    if (existingReview) {
      req.flash("error", "You have already reviewed this provider");
      return res.redirect(`/providers/${providerId}`);
    }

    // Create review
    const review = new Review({
      customer: customerId,
      provider: providerId,
      rating: parseInt(rating),
      comment: comment || "",
    });
    await review.save();

    // Update provider rating
    const provider = await Provider.findById(providerId);
    if (provider) {
      const reviews = await Review.find({ provider: providerId });
      const avgRating =
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      provider.rating = Math.round(avgRating * 10) / 10;
      provider.totalReviews = reviews.length;
      await provider.save();
    }

    req.flash("success", "Thank you for your review!");
    res.redirect(`/providers/${providerId}`);
  } catch (error) {
    req.flash("error", "Error submitting review: " + error.message);
    res.redirect(`/providers/${req.params.providerId}`);
  }
});

// Get AI-generated review summary
router.get("/:providerId/ai-summary", async (req, res) => {
  try {
    const providerId = req.params.providerId;
    const reviews = await Review.find({ provider: providerId })
      .populate("customer", "name")
      .sort({ createdAt: -1 })
      .limit(20);

    if (reviews.length === 0) {
      return res.json({ summary: "No reviews yet." });
    }

    // AI-powered summary generation
    const ratings = reviews.map((r) => r.rating);
    const avgRating = (
      ratings.reduce((a, b) => a + b, 0) / ratings.length
    ).toFixed(1);
    const positiveCount = ratings.filter((r) => r >= 4).length;
    const negativeCount = ratings.filter((r) => r <= 2).length;

    const comments = reviews
      .filter((r) => r.comment && r.comment.length > 10)
      .map((r) => r.comment)
      .slice(0, 10);

    // Generate AI summary
    let summary = `Based on ${reviews.length} reviews, this provider has an average rating of ${avgRating} stars. `;
    
    if (positiveCount > negativeCount * 2) {
      summary += `The majority of customers (${positiveCount}) are highly satisfied with excellent ratings. `;
    } else if (negativeCount > 0) {
      summary += `While most customers are satisfied, there are some areas for improvement. `;
    }

    if (comments.length > 0) {
      const commonWords = extractCommonWords(comments);
      summary += `Customers frequently mention: ${commonWords.slice(0, 3).join(", ")}. `;
    }

    summary += `Overall, this is a ${avgRating >= 4.5 ? "highly recommended" : avgRating >= 4 ? "recommended" : avgRating >= 3 ? "decent" : "needs improvement"} creator / service.`;

    res.json({ summary, avgRating, totalReviews: reviews.length });
  } catch (error) {
    res.status(500).json({ error: "Error generating summary" });
  }
});

// Helper function to extract common words
function extractCommonWords(comments) {
  const words = comments
    .join(" ")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 4);

  const wordCount = {};
  words.forEach((word) => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  return Object.keys(wordCount)
    .sort((a, b) => wordCount[b] - wordCount[a])
    .slice(0, 10);
}

export default router;

