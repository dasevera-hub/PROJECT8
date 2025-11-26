const express = require('express');
const pool = require('../db');
const requireLogin = require('../middlewares/requireLogin');
const router = express.Router();

router.post('/reserve', requireLogin, async (req, res) => {
  const { fullname, email, checkin, checkout, roomType } = req.body;

  if (!fullname || !email || !checkin || !checkout || !roomType) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO reservations (fullname, email, checkin, checkout, room_type, status)
       VALUES ($1, $2, $3, $4, $5, 'Pending') RETURNING id`,
      [fullname, email, checkin, checkout, roomType]
    );

    res.json({ success: true, id: result.rows[0].id });
  } catch (err) {
    console.error('Reserve error:', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

module.exports = router;
