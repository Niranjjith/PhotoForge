import express from "express";
import Escrow from "../models/Escrow.js";
import Booking from "../models/Booking.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

// Create escrow for booking
router.post("/create/:bookingId", isAuthenticated, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate("provider")
      .populate("customer");

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Check if escrow already exists
    let escrow = await Escrow.findOne({ booking: booking._id });

    if (!escrow) {
      escrow = new Escrow({
        booking: booking._id,
        provider: booking.provider._id,
        customer: booking.customer._id,
        amount: booking.finalAmount,
        currency: "INR",
        status: "Pending",
        releaseConditions: {
          eventCompleted: false,
          customerApproval: false,
          daysAfterEvent: 3, // Release 3 days after event if no dispute
        },
      });
      await escrow.save();
    }

    res.json({ escrow, message: "Escrow created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error creating escrow: " + error.message });
  }
});

// Release escrow
router.post("/:escrowId/release", isAuthenticated, async (req, res) => {
  try {
    const escrow = await Escrow.findById(req.params.escrowId);
    
    if (!escrow) {
      return res.status(404).json({ error: "Escrow not found" });
    }

    escrow.status = "Released";
    escrow.releasedAt = new Date();
    escrow.releasedBy = req.session.user._id;
    await escrow.save();

    res.json({ escrow, message: "Escrow released successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error releasing escrow" });
  }
});

export default router;

