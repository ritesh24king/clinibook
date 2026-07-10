const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { validateAppointment } = require('../middlewares/validation');
const { verifyToken } = require('../middlewares/auth');

// GET /api/appointments - List appointments (Filtered by role/query)
router.get('/', verifyToken, async (req, res) => {
  const { patientId, doctorId } = req.query;

  try {
    let query = `
      SELECT a.*, p.name as patientName, d.name as doctorName, d.specialty
      FROM appointments a
      LEFT JOIN users p ON a.patient_id = p.id
      LEFT JOIN doctors d ON a.doctor_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (patientId) {
      query += ' AND a.patient_id = ?';
      params.push(patientId);
    }
    if (doctorId) {
      query += ' AND a.doctor_id = ?';
      params.push(doctorId);
    }

    const [rows] = await db.query(query, params);
    
    // Format rows to match frontend expectation
    const formatted = rows.map(r => ({
      id: r.id.toString(),
      patientId: r.patient_id.toString(),
      patientName: r.patientName,
      doctorId: r.doctor_id.toString(),
      doctorName: r.doctorName,
      specialty: r.specialty,
      date: r.appointment_date.toISOString().split('T')[0],
      timeSlot: r.time_slot,
      reason: r.reason,
      status: r.status
    }));

    res.json(formatted);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Serverfout bij ophalen afspraken." });
  }
});

// POST /api/appointments - Book new appointment
router.post('/', verifyToken, validateAppointment, async (req, res) => {
  const { doctorId, date, timeSlot, reason } = req.body;
  const patientId = req.user.id; // From verifyToken JWT decode

  try {
    // 1. Verify doctor exists
    const [docRows] = await db.query('SELECT * FROM doctors WHERE id = ?', [doctorId]);
    if (docRows.length === 0) {
      return res.status(400).json({ error: "Geselecteerde arts bestaat niet." });
    }

    // 2. Verify double-booking
    const [bookedRows] = await db.query(
      "SELECT id FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND time_slot = ? AND status IN ('approved', 'pending')",
      [doctorId, date, timeSlot]
    );

    if (bookedRows.length > 0) {
      return res.status(400).json({ error: "Dit tijdslot is helaas al bezet of gereserveerd." });
    }

    // 3. Insert appointment
    const [result] = await db.query(
      'INSERT INTO appointments (patient_id, doctor_id, appointment_date, time_slot, reason, status) VALUES (?, ?, ?, ?, ?, ?)',
      [patientId, doctorId, date, timeSlot, reason, 'pending']
    );

    res.status(201).json({
      id: result.insertId,
      patientId,
      doctorId,
      date,
      timeSlot,
      reason,
      status: 'pending'
    });

  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ error: "Serverfout bij boeken afspraak." });
  }
});

// POST /api/appointments/:id/status - Approve or reject appointment
router.post('/:id/status', verifyToken, async (req, res) => {
  const appointmentId = req.params.id;
  const { status, doctorReport } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: "Status moet approved of rejected zijn." });
  }

  try {
    // 1. Check appointment exists
    const [aptRows] = await db.query('SELECT * FROM appointments WHERE id = ?', [appointmentId]);
    if (aptRows.length === 0) {
      return res.status(404).json({ error: "Afspraak niet gevonden." });
    }

    const apt = aptRows[0];

    // 2. Update status
    await db.query('UPDATE appointments SET status = ? WHERE id = ?', [status, appointmentId]);

    // 3. If approved and notes are supplied, insert report
    if (status === 'approved' && doctorReport) {
      await db.query(
        'INSERT INTO reports (patient_id, doctor_id, report_date, content) VALUES (?, ?, ?, ?)',
        [apt.patient_id, apt.doctor_id, new Date().toISOString().split('T')[0], doctorReport]
      );
    }

    res.json({ message: `Afspraak status succesvol bijgewerkt naar ${status}` });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Serverfout bij bijwerken afspraakstatus." });
  }
});

module.exports = router;
