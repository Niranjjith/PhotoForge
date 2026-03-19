import express from "express";
import Provider from "../models/Provider.js";
import Booking from "../models/Booking.js";
import Review from "../models/Review.js";
import { optionalAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(optionalAuth);

// AI Menu Recommendation System
router.post("/recommend", async (req, res) => {
  try {
    const { eventType, guests, budget, preferences, dietaryRestrictions } = req.body;

    // Get providers with similar event history
    const similarBookings = await Booking.find({
      eventType: eventType || { $exists: true },
      guests: { $gte: guests * 0.8, $lte: guests * 1.2 }, // Similar guest count
      status: "Completed",
    })
      .populate("provider")
      .limit(50);

    // Analyze popular menu items
    const menuItemFrequency = {};
    similarBookings.forEach(booking => {
      booking.services?.forEach(service => {
        menuItemFrequency[service.name] = (menuItemFrequency[service.name] || 0) + 1;
      });
    });

    // Get top recommended items
    const recommendedItems = Object.entries(menuItemFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name]) => name);

    // Get providers with these items
    const providers = await Provider.find({
      $or: [
        { "services.name": { $in: recommendedItems } },
        { "menu.name": { $in: recommendedItems } },
      ],
      isVerified: true,
    })
      .populate("owner", "name")
      .limit(10);

    // Generate AI recommendations
    const recommendations = providers.map(provider => {
      const menu = provider.services || provider.menu || [];
      const matchingMenu = menu.filter(item => 
        recommendedItems.includes(item.name)
      );
      const avgPrice = matchingMenu.length
        ? matchingMenu.reduce((sum, item) => sum + (item.price ?? item.pricePerHead ?? 0), 0) / matchingMenu.length
        : 0;
      const priceFit = budget ? (budget / guests) / avgPrice : 1;

      return {
        provider: {
          _id: provider._id,
          businessName: provider.businessName,
          rating: provider.rating,
          city: provider.city,
        },
        recommendedMenu: matchingMenu,
        priceFit: priceFit > 0.8 && priceFit < 1.2 ? "Perfect" : priceFit < 0.8 ? "Budget-friendly" : "Premium",
        matchScore: calculateMatchScore(provider, eventType, guests, budget),
        aiReason: generateAIReason(provider, eventType, matchingMenu),
      };
    });

    // Sort by match score
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    res.json({ recommendations: recommendations.slice(0, 5) });
  } catch (error) {
    res.status(500).json({ error: "Error generating recommendations: " + error.message });
  }
});

function calculateMatchScore(provider, eventType, guests, budget) {
  let score = 0;

  // Rating score (40%)
  score += provider.rating * 8;

  // Review count score (20%)
  score += Math.min(provider.totalReviews || 0, 50) * 0.4;

  // Price fit score (20%)
  const menu = provider.services || provider.menu || [];
  if (budget && menu.length > 0) {
    const avgPrice = menu.reduce((sum, item) => sum + (item.price ?? item.pricePerHead ?? 0), 0) / menu.length;
    const targetPrice = budget / guests;
    const priceDiff = Math.abs(avgPrice - targetPrice) / targetPrice;
    score += (1 - Math.min(priceDiff, 1)) * 20;
  }

  // Specialty match (20%)
  if (eventType && provider.portfolio.specialties) {
    const specialtyMatch = provider.portfolio.specialties.some(s => 
      s.toLowerCase().includes(eventType.toLowerCase())
    );
    score += specialtyMatch ? 20 : 0;
  }

  return Math.round(score);
}

function generateAIReason(provider, eventType, menu) {
  let reason = `Based on ${provider.totalReviews || 0} reviews and ${provider.rating.toFixed(1)}-star rating, `;
  
  if (eventType) {
    reason += `this provider specializes in ${eventType.toLowerCase()} events. `;
  }
  
  if (menu.length > 0) {
    reason += `Recommended services: ${menu.slice(0, 3).map(m => m.name).join(", ")}.`;
  }

  return reason;
}

export default router;

