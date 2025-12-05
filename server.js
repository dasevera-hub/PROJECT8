const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
const adminRoutes = require("./routes/adminRoutes");

const requireLogin = require("./middlewares/requireLogin");
const requireAdmin = require("./middlewares/requireAdmin");

const app = express();

// No cache
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

// Routes
app.use(authRoutes);
app.use(reservationRoutes);
app.use(adminRoutes);

// Mainpage router
app.get("/Mainpage.html", (req, res) => {
  if (req.session && req.session.userId) {
    return res.sendFile(path.join(__dirname, "public", "Mainpage.html"));
  }
  res.sendFile(path.join(__dirname, "public", "Mainpage.html"));
});

// Admin
app.get("/admin.html", requireLogin, requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// Root redirect
app.get("/", (req, res) => res.redirect("/Mainpage.html"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
