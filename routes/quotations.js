import express from "express";
import Quotation from "../models/Quotation.js";
import Provider from "../models/Provider.js";
import { isAuthenticated, isProvider } from "../middleware/auth.js";

const router = express.Router();

// Generate automated quotation
router.post("/generate", isAuthenticated, isProvider, async (req, res) => {
  try {
    const { customerId, eventType, eventDate, guests, services } = req.body;
    const provider = await Provider.findOne({ owner: req.session.user._id });

    if (!provider) {
      return res.status(404).json({ error: "Provider not found" });
    }

    // Calculate pricing
    let subtotal = 0;
    const quotationServices = [];

    if (services && Array.isArray(services)) {
      services.forEach((serviceName) => {
        const svc = (provider.services || provider.menu || []).find((m) => m.name === serviceName);
        if (svc) {
          const quantity = parseInt(guests) || 1;
          const unitPrice = svc.price ?? svc.pricePerHead ?? 0;
          const total = unitPrice * quantity;
          subtotal += total;

          quotationServices.push({
            name: svc.name,
            description: svc.description || "",
            quantity: quantity,
            unitPrice: unitPrice,
            total: total,
          });
        }
      });
    }

    // Apply discounts and calculate tax
    const discount = 0; // Can be customized
    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal - discount + tax;

    // Valid for 7 days
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 7);

    const quotation = new Quotation({
      provider: provider._id,
      customer: customerId,
      eventType: eventType || "Other",
      eventDate: new Date(eventDate),
      guests: parseInt(guests) || 1,
      services: quotationServices,
      subtotal: subtotal,
      discount: discount,
      tax: tax,
      total: total,
      validUntil: validUntil,
      status: "Sent",
    });

    await quotation.save();
    res.json({ quotation, message: "Quotation generated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error generating quotation: " + error.message });
  }
});

// Get quotations
router.get("/", isAuthenticated, async (req, res) => {
  try {
    let query = {};
    if (req.session.user.role === "provider") {
      const Provider = (await import("../models/Provider.js")).default;
      const provider = await Provider.findOne({ owner: req.session.user._id });
      if (provider) query.provider = provider._id;
    } else {
      query.customer = req.session.user._id;
    }

    const quotations = await Quotation.find(query)
      .populate("provider", "businessName")
      .populate("customer", "name email")
      .sort({ createdAt: -1 });

    res.json({ quotations });
  } catch (error) {
    res.status(500).json({ error: "Error fetching quotations" });
  }
});

export default router;

