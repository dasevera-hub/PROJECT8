const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');
const router = express.Router();
const redirectIfLoggedIn = require('../middlewares/redirectIfLoggedIn');
const path = require('path');

// Helper: escape output for HTML (optional for server-rendered pages)
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, m => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[m]));
}

// ----------------------
// GET LOGIN / SIGNUP
// ----------------------
router.get('/login', redirectIfLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

router.get('/signup', redirectIfLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/signup.html'));
});

// ----------------------
// POST SIGNUP
// ----------------------
router.post('/signup', async (req, res) => {
  const { username, email, phone, password } = req.body;

  // Server-side validation
  if (!username || !email || !password || !phone) {
    return res.status(400).redirect('/signup.html?error=MissingFields');
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO users (username, email, phone, password, role) VALUES ($1,$2,$3,$4,$5)',
      [username, email, phone, hashedPassword, 'user']
    );

    return res.redirect('/Mainpage.html');
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).redirect('/signup.html?error=ServerError');
  }
});

// ----------------------
// POST LOGIN
// ----------------------
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.redirect('/login.html?error=MissingFields');

  try {
    const result = await pool.query(
      'SELECT id, username, role, password FROM users WHERE email=$1 OR username=$1',
      [email]
    );

    if (!result.rows.length) return res.redirect('/login.html?error=UserNotFound');

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.redirect('/login.html?error=WrongPassword');

    // Save session
    req.session.userId = user.id;
    req.session.userRole = user.role;

    req.session.save(err => {
      if (err) console.error(err);
      if (user.role === 'admin') return res.redirect('/admin.html');
      return res.redirect('/Mainpage.html');
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.redirect('/login.html?error=ServerError');
  }
});

// ----------------------
// LOGOUT
// ----------------------
router.get('/logout', (req, res) => {
  req.session.destroy(err => res.redirect('/login.html'));
});

// ----------------------
// CURRENT USER API
// ----------------------
router.get('/current-user', async (req, res) => {
  if (!req.session.userId) return res.json({ loggedIn: false });

  try {
    const result = await pool.query(
      'SELECT username, role, email FROM users WHERE id=$1',
      [req.session.userId]
    );
    const user = result.rows[0];
    return res.json({
      loggedIn: true,
      username: user.username,
      role: user.role,
      email: user.email
    });
  } catch (err) {
    console.error('Current-user API error:', err);
    return res.json({ loggedIn: false });
  }
});

module.exports = router;
