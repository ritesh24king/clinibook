const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { validateClinic } = require('../middlewares/validation');
const { verifyToken, authorizeRoles } = require('../middlewares/auth');

// GET /api/clinics - Lijst alle poliklinieken
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM clinics');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Serverfout bij ophalen poliklinieken." });
  }
});

// POST /api/clinics - Nieuwe polikliniek toevoegen (alleen artsen)
router.post('/', verifyToken, authorizeRoles('doctor'), validateClinic, async (req, res) => {
  const { name, description } = req.body;

  try {
    const [result] = await db.query(
      'INSERT INTO clinics (name, description) VALUES (?, ?)',
      [name, description || ""]
    );
    res.status(201).json({ id: result.insertId, name, description });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Serverfout bij toevoegen polikliniek." });
  }
});

module.exports = router;

