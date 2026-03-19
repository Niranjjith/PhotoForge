import express from "express";
import Analytics from "../models/Analytics.js";
import Provider from "../models/Provider.js";
import Booking from "../models/Booking.js";
import Review from "../models/Review.js";
import { isAuthenticated, isProvider } from "../middleware/auth.js";

const router = express.Router();

router.use(isAuthenticated);
router.use(isProvider);

// Get analytics dashboard
router.get("/dashboard", async (req, res) => {
  try {
    const provider = await Provider.findOne({ owner: req.session.user._id });
    if (!provider) {
      return res.status(404).json({ error: "Provider not found" });
    }

    // Get last 30 days data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const bookings = await Booking.find({
      provider: provider._id,
      createdAt: { $gte: thirtyDaysAgo },
    });

    const reviews = await Review.find({
      provider: provider._id,
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Calculate metrics
    const metrics = {
      views: 0, // Would need tracking system
      bookings: bookings.length,
      revenue: bookings
        .filter((b) => b.status === "Completed" || b.status === "Accepted")
        .reduce((sum, b) => sum + (b.finalAmount || 0), 0),
      cancellations: bookings.filter((b) => b.status === "Cancelled").length,
      averageRating:
        reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : provider.rating,
      newCustomers: new Set(bookings.map((b) => b.customer.toString())).size,
      repeatCustomers: 0, // Would need customer history
    };

    // Predictive forecasting
    const avgBookingsPerMonth = bookings.length;
    const avgRevenuePerMonth = metrics.revenue;
    const growthRate = 0.1; // 10% growth assumption

    const forecasts = {
      nextMonthBookings: Math.round(avgBookingsPerMonth * (1 + growthRate)),
      nextMonthRevenue: Math.round(avgRevenuePerMonth * (1 + growthRate)),
      peakDays: calculatePeakDays(bookings),
      recommendedPricing: calculateRecommendedPricing(provider, bookings),
    };

    // Save analytics
    const analytics = new Analytics({
      provider: provider._id,
      date: new Date(),
      metrics,
      forecasts,
    });
    await analytics.save();

    res.json({ metrics, forecasts, analytics });
  } catch (error) {
    res.status(500).json({ error: "Error generating analytics: " + error.message });
  }
});

// Helper functions
function calculatePeakDays(bookings) {
  const dayCounts = {};
  bookings.forEach((booking) => {
    const day = new Date(booking.eventDate).toLocaleDateString("en-US", {
      weekday: "long",
    });
    dayCounts[day] = (dayCounts[day] || 0) + 1;
  });
  return Object.keys(dayCounts)
    .sort((a, b) => dayCounts[b] - dayCounts[a])
    .slice(0, 3);
}

function calculateRecommendedPricing(provider, bookings) {
  const services = provider.services || provider.menu || [];
  if (bookings.length === 0) return services[0]?.price ?? services[0]?.pricePerHead ?? 500;
  const avgPrice =
    bookings.reduce((sum, b) => {
      const serviceTotal = b.services?.reduce(
        (s, sv) => s + (sv.price ?? sv.pricePerHead ?? 0) * (b.guests || 1),
        0
      );
      return sum + (serviceTotal || 0) / (b.guests || 1);
    }, 0) / bookings.length;
  return Math.round(avgPrice * 1.1); // 10% increase recommendation
}

export default router;

