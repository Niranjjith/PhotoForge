import express from "express";
import Staff from "../models/Staff.js";
import Provider from "../models/Provider.js";
import { isAuthenticated, isProvider, optionalAuth } from "../middleware/auth.js";

const router = express.Router();

// Apply optional auth
router.use(optionalAuth);

// Staff registration page
router.get("/register", (req, res) => {
  res.render("staff/register", { user: req.session?.user || null });
});

// Submit staff application
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      lat,
      lng,
      experience,
      skills,
      availability,
      expectedSalary,
      interestedProviderId,
    } = req.body;

    if (!name || !phone) {
      req.flash("error", "Name and phone number are required");
      return res.redirect("/staff/register");
    }

    const staff = new Staff({
      name,
      email: email || "",
      phone,
      address: address || "",
      city: city || "",
      state: state || "",
      zipCode: zipCode || "",
      location: {
        type: "Point",
        coordinates: lat && lng ? [parseFloat(lng), parseFloat(lat)] : [0, 0],
      },
      experience: experience || "",
      skills: Array.isArray(skills) ? skills : skills ? skills.split(",").map((s) => s.trim()) : [],
      availability: availability || "Event-based",
      expectedSalary: expectedSalary ? parseFloat(expectedSalary) : 0,
      interestedProvider: interestedProviderId || null,
      lastLocationUpdate: new Date(),
    });

    await staff.save();
    req.flash("success", "Thank you for your interest! Providers will be able to contact you soon.");
    res.redirect("/staff/register");
  } catch (error) {
    req.flash("error", "Error submitting application: " + error.message);
    res.redirect("/staff/register");
  }
});

// Update staff location (for real-time tracking)
router.post("/:id/location", async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({ error: "Staff not found" });
    }

    staff.location = {
      type: "Point",
      coordinates: [parseFloat(lng), parseFloat(lat)],
    };
    staff.lastLocationUpdate = new Date();
    await staff.save();

    res.json({ success: true, message: "Location updated" });
  } catch (error) {
    res.status(500).json({ error: "Error updating location" });
  }
});

// Provider: View all staff applications
router.get("/applications", isAuthenticated, isProvider, async (req, res) => {
  try {
    const provider = await Provider.findOne({ owner: req.session.user._id });
    if (!provider) {
      req.flash("error", "Provider profile not found");
      return res.redirect("/providers/dashboard");
    }

    const { status, search, nearMe } = req.query;
    let query = { isActive: true };

    if (status && status !== "all") {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
        { skills: { $in: [new RegExp(search, "i")] } },
      ];
    }

    let staffList;

    // Find nearby staff if requested
    if (nearMe === "true" && provider.location.coordinates[0] !== 0) {
      const [lng, lat] = provider.location.coordinates;
      staffList = await Staff.find({
        ...query,
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [lng, lat] },
            $maxDistance: 50000, // 50km
          },
        },
      })
        .sort({ createdAt: -1 })
        .limit(100);
    } else {
      staffList = await Staff.find(query).sort({ createdAt: -1 }).limit(100);
    }

    res.render("staff/applications", {
      staffList,
      provider,
      status,
      search,
      nearMe,
    });
  } catch (error) {
    req.flash("error", "Error loading staff applications");
    res.redirect("/providers/dashboard");
  }
});

// Provider: View single staff application
router.get("/applications/:id", isAuthenticated, isProvider, async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      req.flash("error", "Staff application not found");
      return res.redirect("/staff/applications");
    }

    const provider = await Provider.findOne({ owner: req.session.user._id });
    if (!provider) {
      req.flash("error", "Provider profile not found");
      return res.redirect("/providers/dashboard");
    }

    // Calculate distance if both have locations
    let distance = null;
    if (
      provider.location.coordinates[0] !== 0 &&
      staff.location.coordinates[0] !== 0
    ) {
      // Simple distance calculation (Haversine formula approximation)
      const [lng1, lat1] = provider.location.coordinates;
      const [lng2, lat2] = staff.location.coordinates;
      distance = calculateDistance(lat1, lng1, lat2, lng2);
    }

    res.render("staff/view", { staff, provider, distance });
  } catch (error) {
    req.flash("error", "Error loading staff application");
    res.redirect("/staff/applications");
  }
});

// Provider: Update staff status
router.post("/applications/:id/status", isAuthenticated, isProvider, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      req.flash("error", "Staff application not found");
      return res.redirect("/staff/applications");
    }

    staff.status = status;
    if (notes) staff.notes = notes;

    if (status === "Contacted") {
      staff.contactedAt = new Date();
    } else if (status === "Hired") {
      staff.hiredAt = new Date();
      const provider = await Provider.findOne({ owner: req.session.user._id });
      if (provider) {
        staff.interestedProvider = provider._id;
      }
    }

    await staff.save();
    req.flash("success", "Staff status updated");
    res.redirect(`/staff/applications/${req.params.id}`);
  } catch (error) {
    req.flash("error", "Error updating staff status");
    res.redirect("/staff/applications");
  }
});

// Helper function to calculate distance
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Distance in km
}

export default router;

