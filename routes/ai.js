import express from "express";
import Provider from "../models/Provider.js";
import Review from "../models/Review.js";
import Booking from "../models/Booking.js";
import { optionalAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(optionalAuth);

// AI-powered recommendations based on user preferences
router.get("/recommendations", async (req, res) => {
  try {
    const userId = req.session?.user?._id;
    let recommendations = [];

    if (userId) {
      // Get user's booking history
      const userBookings = await Booking.find({ customer: userId })
        .populate("provider")
        .sort({ createdAt: -1 })
        .limit(10);

      if (userBookings.length > 0) {
        // Find similar providers based on past bookings
        const bookedProviderIds = userBookings.map((b) => b.provider._id);
        const eventTypes = userBookings.map((b) => b.eventType);
        const avgGuests =
          userBookings.reduce((sum, b) => sum + b.guests, 0) /
          userBookings.length;

        // Find providers with similar specialties
        const similarProviders = await Provider.find({
          _id: { $nin: bookedProviderIds },
          isVerified: true,
          rating: { $gte: 4.0 },
        })
          .populate("owner", "name")
          .sort({ rating: -1 })
          .limit(5);

        recommendations = similarProviders;
      }
    }

    // If no user history, recommend top-rated providers
    if (recommendations.length === 0) {
      recommendations = await Provider.find({ isVerified: true })
        .populate("owner", "name")
        .sort({ rating: -1, totalReviews: -1 })
        .limit(5);
    }

    // Add AI-generated reasons
    const recommendationsWithReasons = recommendations.map((provider) => {
      let reason = "";
      if (provider.rating >= 4.5) {
        reason = `Highly rated with ${provider.totalReviews} reviews`;
      } else if (provider.isFeatured) {
        reason = "Featured provider with excellent service";
      } else if (provider.portfolio.yearsOfExperience > 10) {
        reason = `Experienced provider with ${provider.portfolio.yearsOfExperience} years in business`;
      } else {
        reason = "Popular choice among customers";
      }

      return {
        ...provider.toObject(),
        aiReason: reason,
      };
    });

    res.json({ recommendations: recommendationsWithReasons });
  } catch (error) {
    console.error("AI recommendations error:", error);
    res.status(500).json({ error: "Error generating recommendations" });
  }
});

// AI-powered search suggestions
router.get("/search-suggestions", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.length < 2) {
      return res.json({ suggestions: [] });
    }

    // Search providers
    const providers = await Provider.find({
      $or: [
        { businessName: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { city: { $regex: query, $options: "i" } },
        { "portfolio.specialties": { $regex: query, $options: "i" } },
      ],
      isVerified: true,
    })
      .select("businessName city portfolio.specialties rating")
      .limit(5);

    // Generate AI suggestions
    const suggestions = providers.map((p) => ({
      text: `${p.businessName} - ${p.city}`,
      type: "provider",
      id: p._id,
      rating: p.rating,
    }));

    // Add common search terms
    const commonTerms = [
      "wedding photography",
      "video editing",
      "commercial",
      "event coverage",
      "portrait",
    ];
    const matchingTerms = commonTerms
      .filter((term) => term.toLowerCase().includes(query.toLowerCase()))
      .map((term) => ({
        text: term,
        type: "search_term",
      }));

    res.json({ suggestions: [...suggestions, ...matchingTerms] });
  } catch (error) {
    res.status(500).json({ error: "Error generating suggestions" });
  }
});

// AI-generated provider description enhancement
router.get("/enhance-description/:providerId", async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.providerId)
      .populate("owner", "name");

    if (!provider) {
      return res.status(404).json({ error: "Provider not found" });
    }

    // Generate enhanced description using AI logic
    let enhancedDescription = provider.description || "";

    if (provider.portfolio.yearsOfExperience > 0) {
      enhancedDescription += ` With ${provider.portfolio.yearsOfExperience} years of experience,`;
    }

    if (provider.portfolio.specialties && provider.portfolio.specialties.length > 0) {
      enhancedDescription += ` we specialize in ${provider.portfolio.specialties.join(", ")}.`;
    }

    if (provider.rating >= 4.5) {
      enhancedDescription += ` Our ${provider.rating}-star rating from ${provider.totalReviews} reviews reflects our commitment to excellence.`;
    }

    if (provider.isVerified) {
      enhancedDescription += ` We are a verified and trusted creator on GraphyHub.`;
    }

    res.json({ enhancedDescription });
  } catch (error) {
    res.status(500).json({ error: "Error enhancing description" });
  }
});

export default router;

