import express from "express";
import Provider from "../models/Provider.js";
import Booking from "../models/Booking.js";
import Review from "../models/Review.js";
import { isAuthenticated, isCustomer } from "../middleware/auth.js";

const router = express.Router();

// Customer Dashboard
router.get("/dashboard", isAuthenticated, isCustomer, async (req, res) => {
  try {
    // Get user bookings
    const bookings = await Booking.find({ customer: req.session.user._id })
      .populate("provider", "businessName address coverImage")
      .sort({ createdAt: -1 })
      .limit(10);

    // Get all providers for browsing
    const providers = await Provider.find({ isVerified: true })
      .populate("owner", "name")
      .sort({ rating: -1, totalReviews: -1 })
      .limit(12);

    // Get user reviews
    const myReviews = await Review.find({ customer: req.session.user._id })
      .populate("provider", "businessName")
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate stats
    const totalSpent = bookings
      .filter((b) => b.status === "Completed" || b.status === "Accepted")
      .reduce((sum, b) => sum + (b.finalAmount || 0), 0);

    const reviewsGiven = await Review.countDocuments({ customer: req.session.user._id });

    res.render("customer/dashboard", {
      user: req.session.user,
      bookings,
      providers,
      myReviews,
      totalSpent,
      reviewsGiven,
    });
  } catch (error) {
    req.flash("error", "Error loading dashboard");
    res.redirect("/");
  }
});

export default router;

