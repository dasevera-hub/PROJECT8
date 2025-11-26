const express = require('express');
const pool = require('../db');
const router = express.Router();

// GET all reservations
router.get('/admin/reservations', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reservations ORDER BY id DESC');
    res.json({ success: true, reservations: result.rows });
  } catch (err) {
    console.error('Fetch reservations error:', err);
    res.status(500).json({ success: false, message: 'Database error loading reservations' });
  }
});

// Approve
router.put('/admin/reservations/:id/approve', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('UPDATE reservations SET status = $1 WHERE id = $2', ['Approved', id]);
    res.json({ success: true, message: 'Reservation approved' });
  } catch (err) {
    console.error('Approve error:', err);
    res.status(500).json({ success: false, message: 'Failed to approve reservation' });
  }
});

// Delete
router.delete('/admin/reservations/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM reservations WHERE id = $1', [id]);
    res.json({ success: true, message: 'Reservation deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete reservation' });
  }
});

module.exports = router;
