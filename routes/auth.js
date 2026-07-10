const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { validateLogin, validateRegister } = require('../middlewares/validation');
const { verifyToken } = require('../middlewares/auth');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// POST /api/auth/register - Nieuw patiëntaccount aanmaken
router.post('/register', validateRegister, async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // 1. Check of dit e-mailadres al bestaat
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: "Er bestaat al een account met dit e-mailadres." });
    }

    // 2. Wachtwoord hashen (nooit als platte tekst opslaan!)
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Nieuw account aanmaken. Zelfregistratie is altijd rol 'patient' —
    //    artsen/verzekeraars-accounts worden apart aangemaakt door een arts/admin.
    const [result] = await db.query(
      'INSERT INTO users (name, email, password_hash, role, clinic_id) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.toLowerCase(), passwordHash, 'patient', null]
    );

    // 4. Meteen inloggen na registratie: token genereren, net als bij /login
    const token = jwt.sign(
      { id: result.insertId, name: name.trim(), email: email.toLowerCase(), role: 'patient', doctorId: null },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 8 * 60 * 60 * 1000
    });

    res.status(201).json({
      message: "Account succesvol aangemaakt",
      token,
      user: {
        id: result.insertId,
        name: name.trim(),
        email: email.toLowerCase(),
        role: 'patient',
        doctorId: null
      }
    });

  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Er is een serverfout opgetreden bij het registreren." });
  }
});

// POST /api/auth/login
router.post('/login', validateLogin, async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user in MySQL database
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: "Onjuiste inloggegevens. Gebruik de demo-accounts." });
    }

    const user = rows[0];
    // Verify password with bcrypt
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: "Onjuiste inloggegevens. Gebruik de demo-accounts." });
    }

    // Retrieve doctorId if user is a doctor
    // BELANGRIJK: overal elders in de API (bv. GET /api/appointments) komt
    // doctorId terug als STRING (r.doctor_id.toString()). MySQL geeft hier
    // een getal terug — zonder String(...) zou "2" === 2 altijd false zijn,
    // waardoor een arts zijn eigen afspraken nooit te zien zou krijgen.
    let doctorId = null;
    if (user.role === 'doctor') {
      const [docRows] = await db.query('SELECT id FROM doctors WHERE user_id = ?', [user.id]);
      if (docRows.length > 0) {
        doctorId = String(docRows[0].id);
      }
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role, doctorId },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Zet het token ook als HttpOnly cookie (extra optie, niet verplicht)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 8 * 60 * 60 * 1000 // 8 uur
    });

    // BELANGRIJK: de frontend (script.js) gebruikt Bearer-token authenticatie,
    // dus het token moet ook gewoon in de JSON-body terugkomen.
    res.json({
      message: "Inloggen succesvol",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        doctorId
      }
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Er is een serverfout opgetreden bij het inloggen." });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: "Succesvol uitgelogd" });
});

// GET /api/auth/me (Check active session)
router.get('/me', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
