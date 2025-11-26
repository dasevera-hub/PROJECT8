const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');
const router = express.Router();
const redirectIfLoggedIn = require('../middlewares/redirectIfLoggedIn');
const path = require('path');

// GET login/signup
router.get('/login', redirectIfLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});
router.get('/signup', redirectIfLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/signup.html'));
});

// POST signup
router.post('/signup', async (req, res) => {
  const { username, email, phone, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (username, email, phone, password, role) VALUES ($1,$2,$3,$4,$5)',
      [username,email,phone,hashedPassword,'user']
    );
    return res.redirect('/Mainpage.html');
  } catch (err) {
    console.error(err);
    return res.redirect('/signup.html?error=AccountAlreadyCreated');
  }
});

// POST login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT id, username, role, password FROM users WHERE email=$1 OR username=$1',
      [email]
    );
    if (!result.rows.length) return res.redirect('/login.html?error=UserNotFound');

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.redirect('/login.html?error=WrongPassword');

    req.session.userId = user.id;
    req.session.userRole = user.role;

    req.session.save(err => {
      if (err) console.error(err);
      if (user.role === 'admin') return res.redirect('/admin.html');
      return res.redirect('/Mainpage.html');
    });
  } catch (err) {
    console.error(err);
    return res.redirect('/login.html?error=ServerError');
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(err => res.redirect('/login.html'));
});

// Current user API
router.get('/current-user', async (req,res)=>{
  if(!req.session.userId) return res.json({loggedIn:false});
  try{
    const result = await pool.query(
      'SELECT username, role, email FROM users WHERE id=$1',
      [req.session.userId]
    );
    return res.json({
      loggedIn:true,
      username: result.rows[0].username,
      role: result.rows[0].role,
      email: result.rows[0].email
    });
  } catch {
    return res.json({loggedIn:false});
  }
});

module.exports = router;
