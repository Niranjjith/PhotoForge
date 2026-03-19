import express from "express";
import Booking from "../models/Booking.js";
import Provider from "../models/Provider.js";
import { isAuthenticated, isCustomer, isProvider } from "../middleware/auth.js";

const router = express.Router();

// Create booking
router.post("/:providerId", isAuthenticated, async (req, res) => {
  try {
    const {
      eventDate,
      eventTime,
      guests,
      eventType,
      eventAddress,
      eventCity,
      eventLat,
      eventLng,
      specialRequests,
      services,
    } = req.body;

    const provider = await Provider.findById(req.params.providerId);
    if (!provider) {
      req.flash("error", "Provider not found");
      return res.redirect("/providers");
    }

    // Calculate total amount
    let totalAmount = 0;
    const selectedServices = [];
    
    if (services && Array.isArray(services)) {
      services.forEach((serviceName) => {
        const menuItem = provider.menu.find((m) => m.name === serviceName);
        if (menuItem) {
          const quantity = parseInt(guests) || 1;
          const serviceTotal = menuItem.pricePerHead * quantity;
          totalAmount += serviceTotal;
          selectedServices.push({
            name: menuItem.name,
            pricePerHead: menuItem.pricePerHead,
            quantity: quantity,
          });
        }
      });
    }

    // Apply student discount if applicable
    const User = (await import("../models/User.js")).default;
    const customer = await User.findById(req.session.user._id);
    let discount = 0;
    let finalAmount = totalAmount;
    
    if (customer.isStudent && totalAmount > 0) {
      discount = totalAmount * 0.1; // 10% discount
      finalAmount = totalAmount - discount;
    }

    const booking = new Booking({
      provider: req.params.providerId,
      customer: req.session.user._id,
      services: selectedServices,
      eventDate: new Date(eventDate),
      eventTime: eventTime || "",
      guests: parseInt(guests) || 1,
      eventType: eventType || "Other",
      eventLocation: {
        address: eventAddress || "",
        city: eventCity || "",
        coordinates: eventLat && eventLng ? [parseFloat(eventLng), parseFloat(eventLat)] : [0, 0],
      },
      specialRequests: specialRequests || "",
      totalAmount,
      discount,
      finalAmount,
      status: "Pending",
    });

    await booking.save();
    req.flash("success", "Booking request sent! The provider will review it soon.");
    res.redirect(`/bookings/my-bookings`);
  } catch (error) {
    req.flash("error", "Error creating booking: " + error.message);
    res.redirect(`/providers/${req.params.providerId}`);
  }
});

// My Bookings (Customer)
router.get("/my-bookings", isAuthenticated, async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.session.user._id })
      .populate("provider", "businessName phone address coverImage")
      .sort({ createdAt: -1 });

    res.render("bookings/my-bookings", { bookings });
  } catch (error) {
    req.flash("error", "Error loading bookings");
    res.redirect("/");
  }
});

// Provider Bookings
router.get("/provider-bookings", isAuthenticated, isProvider, async (req, res) => {
  try {
    const Provider = (await import("../models/Provider.js")).default;
    const provider = await Provider.findOne({ owner: req.session.user._id });
    
    if (!provider) {
      req.flash("error", "Provider profile not found");
      return res.redirect("/providers/dashboard");
    }

    const bookings = await Booking.find({ provider: provider._id })
      .populate("customer", "name email phone")
      .sort({ createdAt: -1 });

    res.render("bookings/provider-bookings", { bookings, provider });
  } catch (error) {
    req.flash("error", "Error loading bookings");
    res.redirect("/providers/dashboard");
  }
});

// Update booking status (Provider)
router.post("/:id/status", isAuthenticated, isProvider, async (req, res) => {
  try {
    const { status, providerNotes } = req.body;
    const booking = await Booking.findById(req.params.id)
      .populate("provider");

    if (!booking) {
      req.flash("error", "Booking not found");
      return res.redirect("/bookings/provider-bookings");
    }

    // Verify provider owns this booking
    const Provider = (await import("../models/Provider.js")).default;
    const provider = await Provider.findOne({ owner: req.session.user._id });
    
    if (booking.provider._id.toString() !== provider._id.toString()) {
      req.flash("error", "Unauthorized");
      return res.redirect("/bookings/provider-bookings");
    }

    booking.status = status;
    if (providerNotes) booking.providerNotes = providerNotes;
    await booking.save();

    req.flash("success", "Booking status updated");
    res.redirect("/bookings/provider-bookings");
  } catch (error) {
    req.flash("error", "Error updating booking");
    res.redirect("/bookings/provider-bookings");
  }
});

// Cancel booking (Customer)
router.post("/:id/cancel", isAuthenticated, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      req.flash("error", "Booking not found");
      return res.redirect("/bookings/my-bookings");
    }

    if (booking.customer.toString() !== req.session.user._id.toString()) {
      req.flash("error", "Unauthorized");
      return res.redirect("/bookings/my-bookings");
    }

    booking.status = "Cancelled";
    await booking.save();

    req.flash("success", "Booking cancelled");
    res.redirect("/bookings/my-bookings");
  } catch (error) {
    req.flash("error", "Error cancelling booking");
    res.redirect("/bookings/my-bookings");
  }
});

export default router;
