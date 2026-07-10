const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middlewares/auth');

// GET /api/pharmacies - Get all pharmacies
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM pharmacies');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Serverfout bij ophalen apotheken." });
  }
});

// POST /api/pharmacies - Add a new pharmacy
router.post('/', verifyToken, async (req, res) => {
  const { name, address, phone } = req.body;

  if (!name || !address || !phone) {
    return res.status(400).json({ error: "Alle velden (naam, adres, telefoon) zijn verplicht." });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO pharmacies (name, address, phone) VALUES (?, ?, ?)',
      [name, address, phone]
    );

    res.status(201).json({
      id: result.insertId,
      name,
      address,
      phone
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Serverfout bij toevoegen apotheek." });
  }
});

module.exports = router;

