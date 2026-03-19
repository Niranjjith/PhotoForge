import express from "express";
import Provider from "../models/Provider.js";
import Review from "../models/Review.js";
import { optionalAuth } from "../middleware/auth.js";

const router = express.Router();

// Apply optional auth to show user info in nav
router.use(optionalAuth);

router.get("/", async (req, res) => {
  try {
    // Get featured and popular providers
    const featuredProviders = await Provider.find({ isFeatured: true, isVerified: true })
      .populate("owner", "name")
      .sort({ rating: -1 })
      .limit(6);

    const popularProviders = await Provider.find({ isVerified: true })
      .populate("owner", "name")
      .sort({ rating: -1, totalReviews: -1 })
      .limit(8);

    // Get recent reviews for testimonials
    const recentReviews = await Review.find()
      .populate("customer", "name")
      .populate("provider", "businessName")
      .sort({ createdAt: -1 })
      .limit(5);

    res.render("index", {
      featuredProviders,
      popularProviders,
      recentReviews,
      user: req.session?.user || null,
    });
  } catch (error) {
    console.error("Error loading home page:", error);
    res.render("index", {
      featuredProviders: [],
      popularProviders: [],
      recentReviews: [],
      user: req.session?.user || null,
    });
  }
});

export default router;
