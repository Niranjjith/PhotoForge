// Authentication middleware
export const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  req.flash("error", "Please login to access this page");
  res.redirect("/auth/login");
};

// Check if user is admin
export const isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === "admin") {
    return next();
  }
  req.flash("error", "Access denied. Admin privileges required.");
  res.redirect("/");
};

// Check if user is provider
export const isProvider = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === "provider") {
    return next();
  }
  req.flash("error", "Access denied. Provider account required.");
  res.redirect("/");
};

// Check if user is customer
export const isCustomer = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === "customer") {
    return next();
  }
  req.flash("error", "Access denied. Customer account required.");
  res.redirect("/");
};

// Optional authentication (doesn't redirect)
export const optionalAuth = (req, res, next) => {
  res.locals.user = req.session?.user || null;
  next();
};

