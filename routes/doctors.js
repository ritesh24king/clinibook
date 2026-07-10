const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/db');
const { verifyToken, authorizeRoles } = require('../middlewares/auth');

// Helper: Get weekday name from date string (YYYY-MM-DD)
function getWeekdayName(dateString) {
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const date = new Date(dateString);
  return weekdays[date.getDay()];
}

// GET /api/doctors - List all doctors
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT d.*, c.name as clinic_name 
      FROM doctors d
      LEFT JOIN clinics c ON d.clinic_id = c.id
    `);

    // BELANGRIJK: de frontend (public/js/script.js) filtert artsen op basis
    // van `d.clinicId` (camelCase, als tekst — want een <select>-waarde in
    // HTML is altijd een string). MySQL geeft standaard de kolomnaam
    // `clinic_id` (met underscore) terug, als getal. Zonder deze alias
    // zou de artsenlijst dus altijd leeg blijven bij het boeken van een
    // afspraak. We voegen `clinicId` toe zonder de bestaande velden te breken.
    const doctors = rows.map(d => ({
      ...d,
      clinicId: String(d.clinic_id)
    }));

    res.json(doctors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Serverfout bij ophalen artsen." });
  }
});

// GET /api/doctors/:id/availability - Get available slots for date (YYYY-MM-DD)
router.get('/:id/availability', async (req, res) => {
  const doctorId = req.params.id;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: "Datum parameter (date) is verplicht (YYYY-MM-DD)." });
  }

  try {
    // 1. Fetch doctor details
    const [docRows] = await db.query('SELECT * FROM doctors WHERE id = ?', [doctorId]);
    if (docRows.length === 0) {
      return res.status(404).json({ error: "Dokter niet gevonden." });
    }

    const doctor = docRows[0];
    const weekday = getWeekdayName(date);
    
    // Parse availability JSON column
    let availabilityObj = doctor.availability;
    if (typeof availabilityObj === 'string') {
      availabilityObj = JSON.parse(availabilityObj);
    }
    
    const totalSlots = availabilityObj[weekday] || [];

    // 2. Fetch all booked/pending appointments for this doctor on this day
    const [bookedRows] = await db.query(
      `SELECT time_slot FROM appointments 
       WHERE doctor_id = ? AND appointment_date = ? AND status IN ('approved', 'pending')`,
      [doctorId, date]
    );

    const bookedSlots = bookedRows.map(row => row.time_slot);

    // 3. Filter out booked slots
    const availableSlots = totalSlots.filter(slot => !bookedSlots.includes(slot));

    res.json({
      weekday,
      totalSlots,
      bookedSlots,
      availableSlots
    });

  } catch (err) {
    console.error("Availability error:", err);
    res.status(500).json({ error: "Serverfout bij ophalen beschikbaarheidsrooster." });
  }
});

// POST /api/doctors - Nieuwe arts toevoegen (alleen artsen/admins)
router.post('/', verifyToken, authorizeRoles('doctor'), async (req, res) => {
  const { name, specialty, clinicId, availability } = req.body;

  if (!name || !specialty || !clinicId) {
    return res.status(400).json({ error: "Naam, specialisme en polikliniek zijn verplicht." });
  }

  try {
    // 1. Check of de polikliniek bestaat
    const [clinicRows] = await db.query('SELECT * FROM clinics WHERE id = ?', [clinicId]);
    if (clinicRows.length === 0) {
      return res.status(400).json({ error: "Geselecteerde polikliniek bestaat niet." });
    }

    // Standaard rooster als er niks is meegegeven
    const schedule = availability || {
      "Monday": ["09:00", "10:00", "11:00", "14:00", "15:00"],
      "Wednesday": ["09:00", "10:00", "11:00", "14:00", "15:00"],
      "Friday": ["09:00", "10:00", "11:00"]
    };

    // 2. Standaardwachtwoord '123456' hashen voor het nieuwe artsenaccount
    const passwordHash = await bcrypt.hash('123456', 10);
    const doctorEmail = `dr.${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@clinic.com`;

    // 3. Login-account aanmaken in de users-tabel
    const [userResult] = await db.query(
      'INSERT INTO users (name, email, password_hash, role, clinic_id) VALUES (?, ?, ?, ?, ?)',
      [name, doctorEmail, passwordHash, 'doctor', clinicId]
    );
    const userId = userResult.insertId;

    // 4. Dokter-record aanmaken, gekoppeld aan het account
    const [docResult] = await db.query(
      'INSERT INTO doctors (name, specialty, clinic_id, availability, user_id) VALUES (?, ?, ?, ?, ?)',
      [name, specialty, clinicId, JSON.stringify(schedule), userId]
    );

    res.status(201).json({
      doctor: {
        id: docResult.insertId,
        name,
        specialty,
        clinicId,
        availability: schedule
      },
      credentials: {
        email: doctorEmail,
        password: "123456"
      }
    });

  } catch (err) {
    console.error("Add doctor error:", err);
    res.status(500).json({ error: "Serverfout bij registreren medisch specialist." });
  }
});

module.exports = router;

