import express from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
const router = express.Router();

router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, isStudent } = req.body;
    
    if (!name || !email || !password) {
      req.flash("error", "All fields are required");
      return res.redirect("/auth/register");
    }

    const existing = await User.findOne({ email });
    if (existing) {
      req.flash("error", "User with this email already exists");
      return res.redirect("/auth/register");
    }

    // For providers, create user but don't activate yet - payment required
    const userRole = role || "customer";
    const user = new User({ 
      name, 
      email, 
      password, 
      role: userRole === "provider" ? "customer" : userRole, // Set as customer initially for providers
      isStudent: isStudent === "on" || isStudent === true 
    });
    await user.save();

    // If provider, redirect to payment page
    if (userRole === "provider") {
      req.session.pendingProviderRegistration = {
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
      };
      return res.redirect("/auth/provider-payment");
    }

    req.flash("success", "Registered successfully! You can now log in.");
    res.redirect("/auth/login");
  } catch (error) {
    req.flash("error", "Error registering user: " + error.message);
    res.redirect("/auth/register");
  }
});

// Provider payment page
router.get("/provider-payment", (req, res) => {
  const pendingReg = req.session.pendingProviderRegistration;
  if (!pendingReg) {
    req.flash("error", "No pending registration found");
    return res.redirect("/auth/register");
  }
  res.render("auth/provider-payment", { 
    userId: pendingReg.userId,
    email: pendingReg.email,
    name: pendingReg.name,
  });
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    req.flash("error", "Invalid email or password");
    return res.redirect("/auth/login");
  }

  req.session.user = user;
  
  // Redirect by role
  if (user.role === "admin") {
    return res.redirect("/admin");
  } else if (user.role === "provider") {
    return res.redirect("/providers/dashboard");
  } else {
    return res.redirect("/customer/dashboard");
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

export default router;
