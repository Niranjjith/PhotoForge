import express from "express";
import User from "../models/User.js";
import Provider from "../models/Provider.js";
import Booking from "../models/Booking.js";
import Review from "../models/Review.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(isAuthenticated);
router.use(isAdmin);

// Admin Dashboard
router.get("/", async (req, res) => {
  try {
    const stats = {
      totalUsers: await User.countDocuments(),
      totalProviders: await Provider.countDocuments(),
      totalBookings: await Booking.countDocuments(),
      totalReviews: await Review.countDocuments(),
      pendingBookings: await Booking.countDocuments({ status: "Pending" }),
      activeProviders: await Provider.countDocuments({ isVerified: true }),
    };

    // Recent activity
    const recentBookings = await Booking.find()
      .populate("customer", "name email")
      .populate("provider", "businessName")
      .sort({ createdAt: -1 })
      .limit(10);

    const recentProviders = await Provider.find()
      .populate("owner", "name email")
      .sort({ createdAt: -1 })
      .limit(10);

    res.render("admin/dashboard", { stats, recentBookings, recentProviders });
  } catch (error) {
    req.flash("error", "Error loading admin dashboard");
    res.redirect("/");
  }
});

// Manage Users
router.get("/users", async (req, res) => {
  try {
    const { search, role } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (role) query.role = role;

    const users = await User.find(query).sort({ createdAt: -1 }).limit(100);
    res.render("admin/users", { users, search, role });
  } catch (error) {
    req.flash("error", "Error loading users");
    res.redirect("/admin");
  }
});

// Manage Providers
router.get("/providers", async (req, res) => {
  try {
    const { search, verified, featured } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
      ];
    }
    if (verified !== undefined) query.isVerified = verified === "true";
    if (featured !== undefined) query.isFeatured = featured === "true";

    const providers = await Provider.find(query)
      .populate("owner", "name email")
      .sort({ createdAt: -1 })
      .limit(100);

    res.render("admin/providers", { providers, search, verified, featured });
  } catch (error) {
    req.flash("error", "Error loading providers");
    res.redirect("/admin");
  }
});

// Manage Bookings
router.get("/bookings", async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};
    if (status) query.status = status;
    if (search) {
      const providers = await Provider.find({
        businessName: { $regex: search, $options: "i" },
      });
      query.provider = { $in: providers.map((p) => p._id) };
    }

    const bookings = await Booking.find(query)
      .populate("customer", "name email")
      .populate("provider", "businessName")
      .sort({ createdAt: -1 })
      .limit(100);

    res.render("admin/bookings", { bookings, status, search });
  } catch (error) {
    req.flash("error", "Error loading bookings");
    res.redirect("/admin");
  }
});

// Update Provider Status
router.post("/providers/:id/verify", async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);
    if (provider) {
      provider.isVerified = !provider.isVerified;
      await provider.save();
      req.flash("success", `Provider ${provider.isVerified ? "verified" : "unverified"}`);
    }
    res.redirect("/admin/providers");
  } catch (error) {
    req.flash("error", "Error updating provider");
    res.redirect("/admin/providers");
  }
});

router.post("/providers/:id/feature", async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);
    if (provider) {
      provider.isFeatured = !provider.isFeatured;
      await provider.save();
      req.flash("success", `Provider ${provider.isFeatured ? "featured" : "unfeatured"}`);
    }
    res.redirect("/admin/providers");
  } catch (error) {
    req.flash("error", "Error updating provider");
    res.redirect("/admin/providers");
  }
});

// Update Booking Status
router.post("/bookings/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (booking) {
      booking.status = status;
      await booking.save();
      req.flash("success", "Booking status updated");
    }
    res.redirect("/admin/bookings");
  } catch (error) {
    req.flash("error", "Error updating booking");
    res.redirect("/admin/bookings");
  }
});

// Delete User
router.delete("/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    req.flash("success", "User deleted");
    res.redirect("/admin/users");
  } catch (error) {
    req.flash("error", "Error deleting user");
    res.redirect("/admin/users");
  }
});

// Delete Provider
router.delete("/providers/:id", async (req, res) => {
  try {
    await Provider.findByIdAndDelete(req.params.id);
    req.flash("success", "Provider deleted");
    res.redirect("/admin/providers");
  } catch (error) {
    req.flash("error", "Error deleting provider");
    res.redirect("/admin/providers");
  }
});

export default router;

