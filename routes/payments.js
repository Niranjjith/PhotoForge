import express from "express";
import paypalClient from "../config/paypal.js";
import paypal from "@paypal/checkout-server-sdk";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import { generatePDFBill } from "../utils/pdfGenerator.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create PayPal order for provider registration
router.post("/create-order", async (req, res) => {
  try {
    const { userId, email, name } = req.body;

    if (!userId || !email || !name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Amount in INR (10 rupees = 0.12 USD approximately, but we'll use USD for PayPal)
    // PayPal minimum is usually $0.01, so we'll use $0.15 (approximately 10 INR)
    const amount = "0.15"; // $0.15 USD ≈ 10 INR

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: `PROVIDER_REG_${userId}`,
          description: "Creator Registration Fee - GraphyHub",
          amount: {
            currency_code: "USD",
            value: amount,
            breakdown: {
              item_total: {
                currency_code: "USD",
                value: amount,
              },
            },
          },
          items: [
            {
              name: "Provider Registration",
              description: "Premium Provider Account Registration",
              quantity: "1",
              unit_amount: {
                currency_code: "USD",
                value: amount,
              },
            },
          ],
        },
      ],
      application_context: {
        brand_name: "GraphyHub",
        landing_page: "BILLING",
        user_action: "PAY_NOW",
        payment_method: {
          payer_selected: "PAYPAL",
          payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED",
        },
        return_url: `${req.protocol}://${req.get("host")}/payments/success`,
        cancel_url: `${req.protocol}://${req.get("host")}/payments/cancel`,
      },
    });

    const order = await paypalClient.execute(request);

    // Create payment record
    const payment = new Payment({
      user: userId,
      orderId: `ORDER_${Date.now()}_${userId}`,
      paypalOrderId: order.result.id,
      amount: parseFloat(amount),
      currency: "USD",
      status: "pending",
    });
    await payment.save();

    // Store payment ID in session
    req.session.pendingPayment = payment._id.toString();
    req.session.pendingUserId = userId;

    // Return approval URL
    const approvalUrl = order.result.links.find(
      (link) => link.rel === "approve"
    )?.href;

    res.json({
      orderId: order.result.id,
      approvalUrl: approvalUrl,
    });
  } catch (error) {
    console.error("PayPal order creation error:", error);
    res.status(500).json({ error: "Failed to create payment order" });
  }
});

// PayPal success callback
router.get("/success", async (req, res) => {
  try {
    const { token, PayerID } = req.query;
    const paymentId = req.session.pendingPayment;
    const userId = req.session.pendingUserId;

    if (!token || !paymentId || !userId) {
      req.flash("error", "Payment verification failed");
      return res.redirect("/auth/register");
    }

    // Find payment record
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      req.flash("error", "Payment record not found");
      return res.redirect("/auth/register");
    }

    // Capture the payment using the order ID from payment record
    const request = new paypal.orders.OrdersCaptureRequest(payment.paypalOrderId);
    request.requestBody({});

    const capture = await paypalClient.execute(request);

    if (capture.result.status === "COMPLETED") {
      // Update payment status
      payment.status = "completed";
      payment.paymentId = capture.result.id;
      payment.completedAt = new Date();
      await payment.save();

      // Generate PDF bill
      const user = await User.findById(userId);
      const pdfPath = await generatePDFBill(payment, user);

      // Update payment with PDF path
      payment.billPdf = pdfPath;
      await payment.save();

      // Clear session
      delete req.session.pendingPayment;
      delete req.session.pendingUserId;
      delete req.session.pendingProviderRegistration;

      // Mark user as premium provider
      if (user) {
        user.role = "provider";
        await user.save();
      }

      // Set user in session
      req.session.user = user;

      // Redirect to success page with payment ID
      return res.redirect(`/payments/success-page?paymentId=${payment._id}`);
    } else {
      payment.status = "failed";
      await payment.save();
      req.flash("error", "Payment was not completed");
      return res.redirect("/auth/register");
    }
  } catch (error) {
    console.error("PayPal capture error:", error);
    req.flash("error", "Payment processing failed");
    return res.redirect("/auth/register");
  }
});

// PayPal cancel callback
router.get("/cancel", (req, res) => {
  const paymentId = req.session.pendingPayment;
  if (paymentId) {
    Payment.findByIdAndUpdate(paymentId, { status: "cancelled" }).catch(
      console.error
    );
  }
  delete req.session.pendingPayment;
  delete req.session.pendingUserId;
  req.flash("error", "Payment was cancelled");
  res.redirect("/auth/register");
});

// Payment success page
router.get("/success-page", async (req, res) => {
  try {
    const { paymentId } = req.query;
    if (!paymentId) {
      req.flash("error", "Invalid payment");
      return res.redirect("/");
    }

    const payment = await Payment.findById(paymentId).populate("user");
    if (!payment || payment.status !== "completed") {
      req.flash("error", "Payment not found or not completed");
      return res.redirect("/");
    }

    res.render("payments/success", { payment });
  } catch (error) {
    console.error("Success page error:", error);
    req.flash("error", "Error loading success page");
    res.redirect("/");
  }
});

// Download PDF bill
router.get("/bill/:paymentId", async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId)
      .populate("user");

    if (!payment || !payment.billPdf) {
      req.flash("error", "Bill not found");
      return res.redirect("/");
    }

    // billPdf is stored as /bills/filename.pdf (relative to public)
    const filePath = path.join(__dirname, "..", "public", payment.billPdf);
    if (fs.existsSync(filePath)) {
      res.download(filePath, `GraphyHub_Bill_${payment.orderId}.pdf`);
    } else {
      req.flash("error", "Bill file not found");
      res.redirect("/");
    }
  } catch (error) {
    console.error("Bill download error:", error);
    req.flash("error", "Error downloading bill");
    res.redirect("/");
  }
});

export default router;

