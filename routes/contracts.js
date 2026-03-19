import express from "express";
import Contract from "../models/Contract.js";
import Booking from "../models/Booking.js";
import Provider from "../models/Provider.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

// Generate contract for booking
router.post("/generate/:bookingId", isAuthenticated, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate("provider")
      .populate("customer");

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Check if contract already exists
    let contract = await Contract.findOne({ booking: booking._id });
    
    if (!contract) {
      contract = new Contract({
        provider: booking.provider._id,
        customer: booking.customer._id,
        booking: booking._id,
        contractType: booking.finalAmount > 50000 ? "Premium" : "Standard",
        terms: {
          paymentTerms: "50% advance payment, 50% on event completion",
          cancellationPolicy: "Cancellation 7 days before event: 50% refund",
          liability: "Provider maintains comprehensive insurance coverage",
          forceMajeure: "Force majeure events exempt both parties from liability",
        },
        compliance: {
          fssaiLicense: booking.provider.portfolio?.certifications?.find(c => c.includes("FSSAI")) || "",
          insuranceValid: booking.provider.isVerified,
          taxCompliant: true,
        },
        expiresAt: new Date(booking.eventDate.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days after event
      });
      await contract.save();
    }

    res.json({ contract, message: "Contract generated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error generating contract: " + error.message });
  }
});

// Get contract
router.get("/:contractId", isAuthenticated, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.contractId)
      .populate("provider")
      .populate("customer")
      .populate("booking");

    if (!contract) {
      return res.status(404).json({ error: "Contract not found" });
    }

    res.json({ contract });
  } catch (error) {
    res.status(500).json({ error: "Error fetching contract" });
  }
});

// Accept contract
router.post("/:contractId/accept", isAuthenticated, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.contractId);
    
    if (!contract) {
      return res.status(404).json({ error: "Contract not found" });
    }

    contract.status = "Accepted";
    contract.signedAt = new Date();
    await contract.save();

    res.json({ contract, message: "Contract accepted" });
  } catch (error) {
    res.status(500).json({ error: "Error accepting contract" });
  }
});

export default router;

