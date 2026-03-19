import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import session from "express-session";
import flash from "connect-flash";
import methodOverride from "method-override";
import path from "path";
import { fileURLToPath } from "url";

import indexRoutes from "./routes/index.js";
import authRoutes from "./routes/auth.js";
import providerRoutes from "./routes/providers.js";
import bookingRoutes from "./routes/bookings.js";
import adminRoutes from "./routes/admin.js";
import paymentRoutes from "./routes/payments.js";
import reviewRoutes from "./routes/reviews.js";
import aiRoutes from "./routes/ai.js";
import staffRoutes from "./routes/staff.js";
import customerRoutes from "./routes/customer.js";
import contractRoutes from "./routes/contracts.js";
import messagingRoutes from "./routes/messaging.js";
import quotationRoutes from "./routes/quotations.js";
import analyticsRoutes from "./routes/analytics.js";
import escrowRoutes from "./routes/escrow.js";
import schedulingRoutes from "./routes/scheduling.js";
import aiMenuRoutes from "./routes/ai-menu.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database
import connectDB from "./config/db.js";
connectDB();

// Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());

// Flash messages middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.user = req.session?.user || null;
  next();
});

// Routes
app.use("/", indexRoutes);
app.use("/auth", authRoutes);
app.use("/providers", providerRoutes);
app.use("/bookings", bookingRoutes);
app.use("/admin", adminRoutes);
app.use("/payments", paymentRoutes);
app.use("/reviews", reviewRoutes);
app.use("/ai", aiRoutes);
app.use("/staff", staffRoutes);
app.use("/customer", customerRoutes);
app.use("/contracts", contractRoutes);
app.use("/messages", messagingRoutes);
app.use("/quotations", quotationRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/escrow", escrowRoutes);
app.use("/scheduling", schedulingRoutes);
app.use("/ai-menu", aiMenuRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
