import express from "express";
import Provider from "../models/Provider.js";
import User from "../models/User.js";
import Review from "../models/Review.js";
import { isAuthenticated, isProvider, optionalAuth } from "../middleware/auth.js";

const router = express.Router();

// Apply optional auth to all routes (for showing user info in nav)
router.use(optionalAuth);

// Advanced Search/Browse providers with full-text and geo-search
router.get("/", async (req, res) => {
  try {
    const { search, city, lat, lng, radius = 50, minRating, maxPrice, eventType, specialties } = req.query;
    let query = { isVerified: true };

    // Full-text search across multiple fields
    if (search) {
      const searchTerms = search.split(" ").filter(term => term.length > 0);
      query.$or = [
        { businessName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
        { "portfolio.bio": { $regex: search, $options: "i" } },
        { "portfolio.specialties": { $in: searchTerms.map(term => new RegExp(term, "i")) } },
        { "menu.name": { $regex: search, $options: "i" } },
        { "menu.description": { $regex: search, $options: "i" } },
      ];
    }

    if (city) {
      query.$or = query.$or || [];
      query.$or.push({ city: { $regex: city, $options: "i" } });
    }

    // Filter by rating
    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    // Filter by price range
    if (maxPrice) {
      query["menu.pricePerHead"] = { $lte: parseFloat(maxPrice) };
    }

    // Filter by event type / specialties
    if (specialties) {
      query["portfolio.specialties"] = { $in: Array.isArray(specialties) ? specialties : [specialties] };
    }

    let providers;
    let sortOptions = {};

    // Location-based search (nearest first) with geo-search
    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const maxDistance = parseFloat(radius) * 1000; // Convert km to meters

      // Use geoNear for better performance
      providers = await Provider.aggregate([
        {
          $geoNear: {
            near: { type: "Point", coordinates: [longitude, latitude] },
            distanceField: "distance",
            maxDistance: maxDistance,
            spherical: true,
            query: query,
          },
        },
        { $limit: 50 },
      ]);

      // Populate owner field
      const providerIds = providers.map(p => p._id);
      const populatedProviders = await Provider.find({ _id: { $in: providerIds } })
        .populate("owner", "name email")
        .lean();

      // Merge distance info
      providers = populatedProviders.map(p => {
        const geoData = providers.find(g => g._id.toString() === p._id.toString());
        return { ...p, distance: geoData?.distance ? (geoData.distance / 1000).toFixed(2) : null };
      });

      // Sort by distance
      sortOptions = { distance: 1 };
    } else {
      // Regular search with sorting
      sortOptions = { rating: -1, isFeatured: -1, totalReviews: -1 };
      providers = await Provider.find(query)
        .populate("owner", "name email")
        .sort(sortOptions)
        .limit(50);
    }

    res.render("providers/search", { providers, search, city, lat, lng, radius, minRating, maxPrice, eventType, specialties });
  } catch (error) {
    console.error("Search error:", error);
    req.flash("error", "Error searching providers");
    res.redirect("/");
  }
});

// Booking form
router.get("/:id/book", isAuthenticated, async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);
    if (!provider) {
      req.flash("error", "Provider not found");
      return res.redirect("/providers");
    }
    res.render("bookings/book", { provider, user: req.session?.user });
  } catch (error) {
    req.flash("error", "Error loading booking form");
    res.redirect("/providers");
  }
});

// Show single provider profile/portfolio
router.get("/:id", async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id)
      .populate("owner", "name email avatar")
      .populate({
        path: "owner",
        select: "name email avatar",
      });

    if (!provider) {
      req.flash("error", "Provider not found");
      return res.redirect("/providers");
    }

    // Get reviews
    const reviews = await Review.find({ provider: provider._id })
      .populate("customer", "name avatar")
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate average rating
    const avgRating = await Review.aggregate([
      { $match: { provider: provider._id } },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } },
    ]);

    if (avgRating.length > 0) {
      provider.rating = Math.round(avgRating[0].avgRating * 10) / 10;
      await provider.save();
    }

    res.render("providers/show", { provider, reviews, user: req.session?.user });
  } catch (error) {
    req.flash("error", "Error loading provider");
    res.redirect("/providers");
  }
});

// Provider Dashboard - View
router.get("/dashboard", isAuthenticated, isProvider, async (req, res) => {
  try {
    let provider = await Provider.findOne({ owner: req.session.user._id })
      .populate("owner");

    if (!provider) {
      // Create new provider profile
      provider = new Provider({
        owner: req.session.user._id,
        businessName: "",
        phone: "",
      });
      await provider.save();
    }

    // Get bookings for this provider
    const Booking = (await import("../models/Booking.js")).default;
    const bookings = await Booking.find({ provider: provider._id })
      .populate("customer", "name email")
      .sort({ createdAt: -1 })
      .limit(20);

    // Check payment status
    const Payment = (await import("../models/Payment.js")).default;
    const payment = await Payment.findOne({ 
      user: req.session.user._id, 
      status: "completed" 
    });

    res.render("providers/dashboard", { provider, bookings, hasPayment: !!payment });
  } catch (error) {
    req.flash("error", "Error loading dashboard");
    res.redirect("/");
  }
});

// Provider Dashboard - Update
router.post("/dashboard", isAuthenticated, isProvider, async (req, res) => {
  try {
    const {
      businessName,
      phone,
      email,
      address,
      city,
      state,
      zipCode,
      description,
      lat,
      lng,
      bio,
      specialties,
      yearsOfExperience,
      website,
      facebook,
      instagram,
      twitter,
      coverImage,
      logo,
      serviceRadius,
      menu,
    } = req.body;

    let provider = await Provider.findOne({ owner: req.session.user._id });

    if (!provider) {
      provider = new Provider({ owner: req.session.user._id });
    }

    // Update basic info
    provider.businessName = businessName || provider.businessName;
    provider.phone = phone || provider.phone;
    provider.email = email || provider.email;
    provider.address = address || provider.address;
    provider.city = city || provider.city;
    provider.state = state || provider.state;
    provider.zipCode = zipCode || provider.zipCode;
    provider.description = description || provider.description;
    provider.serviceRadius = serviceRadius ? parseFloat(serviceRadius) : provider.serviceRadius;

    // Update location
    if (lat && lng) {
      provider.location = {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)],
      };
    }

    // Update portfolio
    if (bio) provider.portfolio.bio = bio;
    if (specialties) {
      provider.portfolio.specialties = Array.isArray(specialties)
        ? specialties
        : specialties.split(",").map((s) => s.trim());
    }
    if (yearsOfExperience)
      provider.portfolio.yearsOfExperience = parseInt(yearsOfExperience);

    // Update social links
    if (website) provider.socialLinks.website = website;
    if (facebook) provider.socialLinks.facebook = facebook;
    if (instagram) provider.socialLinks.instagram = instagram;
    if (twitter) provider.socialLinks.twitter = twitter;

    // Update images
    if (coverImage) provider.coverImage = coverImage;
    if (logo) provider.logo = logo;

    // Update menu
    if (menu) {
      const menuArray = Array.isArray(menu) ? menu : [menu];
      provider.menu = menuArray.map((item) => ({
        name: item.name || "",
        description: item.description || "",
        pricePerHead: parseFloat(item.pricePerHead) || 0,
        image: item.image || "",
        category: item.category || "main",
      }));
    }

    await provider.save();
    req.flash("success", "Profile updated successfully!");
    res.redirect("/providers/dashboard");
  } catch (error) {
    req.flash("error", "Error updating profile: " + error.message);
    res.redirect("/providers/dashboard");
  }
});

// Add portfolio image
router.post("/dashboard/portfolio/image", isAuthenticated, isProvider, async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const provider = await Provider.findOne({ owner: req.session.user._id });
    if (provider && imageUrl) {
      if (!provider.portfolio.images) provider.portfolio.images = [];
      provider.portfolio.images.push(imageUrl);
      await provider.save();
      req.flash("success", "Image added to portfolio");
    }
    res.redirect("/providers/dashboard");
  } catch (error) {
    req.flash("error", "Error adding image");
    res.redirect("/providers/dashboard");
  }
});

// Remove portfolio image
router.post("/dashboard/portfolio/image/:index", isAuthenticated, isProvider, async (req, res) => {
  try {
    if (req.query._method !== 'DELETE') {
      return res.redirect("/providers/dashboard");
    }
    const index = parseInt(req.params.index);
    const provider = await Provider.findOne({ owner: req.session.user._id });
    if (provider && provider.portfolio.images && provider.portfolio.images[index]) {
      provider.portfolio.images.splice(index, 1);
      await provider.save();
      req.flash("success", "Image removed from portfolio");
    }
    res.redirect("/providers/dashboard");
  } catch (error) {
    req.flash("error", "Error removing image");
    res.redirect("/providers/dashboard");
  }
});

export default router;
