import express from "express";
import Booking from "../models/Booking.js";
import Provider from "../models/Provider.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

// Check availability and capacity
router.post("/check-availability", async (req, res) => {
  try {
    const { providerId, eventDate, guests } = req.body;

    const provider = await Provider.findById(providerId);
    if (!provider) {
      return res.status(404).json({ error: "Provider not found" });
    }

    // Check existing bookings on the same date
    const existingBookings = await Booking.find({
      provider: providerId,
      eventDate: {
        $gte: new Date(new Date(eventDate).setHours(0, 0, 0, 0)),
        $lt: new Date(new Date(eventDate).setHours(23, 59, 59, 999)),
      },
      status: { $in: ["Pending", "Accepted"] },
    });

    // Calculate total capacity used
    const totalGuestsBooked = existingBookings.reduce(
      (sum, booking) => sum + (booking.guests || 0),
      0
    );

    // Assume provider capacity (can be added to provider model)
    const maxCapacity = provider.serviceRadius * 100 || 1000; // Default capacity
    const availableCapacity = maxCapacity - totalGuestsBooked;
    const isAvailable = availableCapacity >= parseInt(guests);

    // Calculate time slots availability
    const timeSlots = calculateAvailableTimeSlots(existingBookings);

    res.json({
      isAvailable,
      availableCapacity,
      totalCapacity: maxCapacity,
      bookedCapacity: totalGuestsBooked,
      timeSlots,
      message: isAvailable
        ? "Available for booking"
        : `Only ${availableCapacity} guests capacity available`,
    });
  } catch (error) {
    res.status(500).json({ error: "Error checking availability: " + error.message });
  }
});

// Route optimization
router.post("/optimize-route", async (req, res) => {
  try {
    const { providerLocation, eventLocations } = req.body;

    // Simple route optimization (nearest neighbor algorithm)
    const optimizedRoute = optimizeRoute(providerLocation, eventLocations);

    // Calculate travel cost
    const travelCost = calculateTravelCost(optimizedRoute);

    res.json({
      optimizedRoute,
      travelCost,
      totalDistance: calculateTotalDistance(optimizedRoute),
    });
  } catch (error) {
    res.status(500).json({ error: "Error optimizing route" });
  }
});

// Helper functions
function calculateAvailableTimeSlots(bookings) {
  const slots = [
    "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"
  ];
  const bookedSlots = bookings.map(b => b.eventTime?.substring(0, 5)).filter(Boolean);
  return slots.filter(slot => !bookedSlots.includes(slot));
}

function optimizeRoute(startLocation, locations) {
  if (!locations || locations.length === 0) return [];
  
  const route = [startLocation];
  let remaining = [...locations];
  let current = startLocation;

  while (remaining.length > 0) {
    let nearest = remaining[0];
    let minDistance = calculateDistance(current, nearest);

    remaining.forEach(loc => {
      const dist = calculateDistance(current, loc);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = loc;
      }
    });

    route.push(nearest);
    remaining = remaining.filter(loc => loc !== nearest);
    current = nearest;
  }

  return route;
}

function calculateDistance(loc1, loc2) {
  const R = 6371; // Earth radius in km
  const dLat = ((loc2.lat - loc1.lat) * Math.PI) / 180;
  const dLon = ((loc2.lng - loc1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((loc1.lat * Math.PI) / 180) *
      Math.cos((loc2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculateTravelCost(route) {
  const costPerKm = 5; // ₹5 per km
  let totalDistance = 0;
  for (let i = 0; i < route.length - 1; i++) {
    totalDistance += calculateDistance(route[i], route[i + 1]);
  }
  return Math.round(totalDistance * costPerKm);
}

function calculateTotalDistance(route) {
  let total = 0;
  for (let i = 0; i < route.length - 1; i++) {
    total += calculateDistance(route[i], route[i + 1]);
  }
  return Math.round(total * 10) / 10;
}

export default router;

