const express = require('express');
const router = express.Router();
const path = require('path');
const db = require('../config/db');
const { verifyToken, authorizeRoles } = require('../middlewares/auth');

// GET /api/patients - Lijst alle patiënten (voor artsen/verzekeraars, bv. dossier opzoeken)
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email FROM users WHERE role = 'patient'"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Serverfout bij ophalen patiënten." });
  }
});

// GET /api/patients/:id/dossier - Fetch full dossier history
router.get('/:id/dossier', verifyToken, authorizeRoles('doctor', 'insurance'), async (req, res) => {
  const patientId = req.params.id;

  try {
    // 1. Verify patient exists
    const [patientRows] = await db.query('SELECT id, name, email FROM users WHERE id = ? AND role = ?', [patientId, 'patient']);
    if (patientRows.length === 0) {
      return res.status(404).json({ error: "Patiënt niet gevonden." });
    }

    const patient = patientRows[0];

    // 2. Fetch appointments
    const [appointments] = await db.query(
      `SELECT a.*, d.name as doctorName, d.specialty 
       FROM appointments a
       LEFT JOIN doctors d ON a.doctor_id = d.id
       WHERE a.patient_id = ?`,
      [patientId]
    );

    // 3. Fetch prescriptions
    const [prescriptions] = await db.query(
      `SELECT p.*, d.name as doctorName 
       FROM prescriptions p
       LEFT JOIN doctors d ON p.doctor_id = d.id
       WHERE p.patient_id = ?`,
      [patientId]
    );

    // 4. Fetch reports
    const [reports] = await db.query(
      `SELECT r.*, d.name as doctorName 
       FROM reports r
       LEFT JOIN doctors d ON r.doctor_id = d.id
       WHERE r.patient_id = ?`,
      [patientId]
    );

    // 5. Fetch insurer dossier notes
    const [dossierNotes] = await db.query(
      `SELECT * FROM dossier_notes WHERE patient_id = ? ORDER BY note_date DESC`,
      [patientId]
    );

    // Format all dates and IDs to match frontend expectation
    const formattedApts = appointments.map(a => ({
      id: a.id.toString(),
      patientId: a.patient_id.toString(),
      doctorId: a.doctor_id.toString(),
      doctorName: a.doctorName,
      specialty: a.specialty,
      date: a.appointment_date.toISOString().split('T')[0],
      timeSlot: a.time_slot,
      reason: a.reason,
      status: a.status
    }));

    const formattedRx = prescriptions.map(p => ({
      id: p.id.toString(),
      patientId: p.patient_id.toString(),
      doctorId: p.doctor_id.toString(),
      doctorName: p.doctorName,
      date: p.prescription_date.toISOString().split('T')[0],
      medication: p.medication,
      dosage: p.dosage,
      instructions: p.instructions,
      validUntil: p.valid_until.toISOString().split('T')[0],
      photoData: p.file_path ? `/uploads/${path.basename(p.file_path)}` : null,
      sentToPharmacyName: p.sent_to_pharmacy_name
    }));

    const formattedReports = reports.map(r => ({
      id: r.id.toString(),
      patientId: r.patient_id.toString(),
      doctorId: r.doctor_id.toString(),
      doctorName: r.doctorName,
      date: r.report_date.toISOString().split('T')[0],
      content: r.content
    }));

    const formattedNotes = dossierNotes.map(n => ({
      id: n.id.toString(),
      patientId: n.patient_id.toString(),
      author: n.author,
      date: n.note_date.toISOString().split('T')[0],
      note: n.note
    }));

    res.json({
      patient,
      appointments: formattedApts,
      prescriptions: formattedRx,
      reports: formattedReports,
      dossierNotes: formattedNotes
    });

  } catch (err) {
    console.error("Dossier error:", err);
    res.status(500).json({ error: "Serverfout bij ophalen patiëntendossier." });
  }
});

// POST /api/patients/:id/dossier/notes - Add notes log
router.post('/:id/dossier/notes', verifyToken, authorizeRoles('doctor', 'insurance'), async (req, res) => {
  const patientId = req.params.id;
  const { author, note } = req.body;

  if (!note || !author) {
    return res.status(400).json({ error: "Auteur en notitie zijn verplicht." });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO dossier_notes (patient_id, author, note_date, note) VALUES (?, ?, ?, ?)',
      [patientId, author, new Date().toISOString().split('T')[0], note]
    );

    res.status(201).json({
      id: result.insertId,
      patientId,
      author,
      date: new Date().toISOString().split('T')[0],
      note
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Serverfout bij opslaan dossiernotitie." });
  }
});

// GET /api/patients/:id/notification-preferences
router.get('/:id/notification-preferences', verifyToken, async (req, res) => {
  const patientId = req.params.id;
  try {
    const [rows] = await db.query('SELECT * FROM notification_preferences WHERE patient_id = ?', [patientId]);
    if (rows.length === 0) {
      return res.json({
        patientId,
        channels: ["email"],
        reminderTime: "2"
      });
    }
    const pref = rows[0];
    res.json({
      patientId: pref.patient_id.toString(),
      channels: pref.channels.split(','),
      reminderTime: pref.reminder_time
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Serverfout bij ophalen notificatievoorkeuren." });
  }
});

// POST /api/patients/:id/notification-preferences
router.post('/:id/notification-preferences', verifyToken, async (req, res) => {
  const patientId = req.params.id;
  const { channels, reminderTime } = req.body;

  const channelsStr = Array.isArray(channels) ? channels.join(',') : 'email';

  try {
    const [rows] = await db.query('SELECT patient_id FROM notification_preferences WHERE patient_id = ?', [patientId]);
    if (rows.length > 0) {
      await db.query(
        'UPDATE notification_preferences SET channels = ?, reminder_time = ? WHERE patient_id = ?',
        [channelsStr, reminderTime || '2', patientId]
      );
    } else {
      await db.query(
        'INSERT INTO notification_preferences (patient_id, channels, reminder_time) VALUES (?, ?, ?)',
        [patientId, channelsStr, reminderTime || '2']
      );
    }

    res.json({
      message: "Voorkeuren opgeslagen",
      preferences: {
        patientId,
        channels,
        reminderTime
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Serverfout bij opslaan notificatievoorkeuren." });
  }
});

module.exports = router;
