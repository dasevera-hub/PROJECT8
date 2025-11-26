const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const adminRoutes = require('./routes/adminRoutes');

const requireLogin = require('./middlewares/requireLogin');
const requireAdmin = require('./middlewares/requireAdmin');
require('dotenv').config();

const app = express();

// Prevent browser caching (back button)
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Body parser + static files
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Sessions
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true
}));

// Mount routes
app.use(authRoutes);
app.use(reservationRoutes);
app.use(adminRoutes);

// ----------------------------
// Mainpage route (public + logged-in version)
// ----------------------------
app.get('/Mainpage.html', (req, res) => {
  if (req.session && req.session.userId) {
    // Logged-in version
    res.sendFile(path.join(__dirname, 'public', 'Mainpage-loggedin.html'));
  } else {
    // Public version
    res.sendFile(path.join(__dirname, 'public', 'Mainpage.html'));
  }
});

// Admin page (protected)
app.get('/admin.html', requireLogin, requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Default root -> public main page
app.get('/', (req, res) => {
  res.redirect('/Mainpage.html');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
