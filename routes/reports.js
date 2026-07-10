const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middlewares/auth');

// GET /api/reports - Compile clinic metrics (Admins/Doctors only)
router.get('/', verifyToken, async (req, res) => {
  try {
    // 1. Get total appointments, approved, pending, rejected counts
    const [countRows] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
      FROM appointments
    `);
    const summaryCounts = countRows[0];

    // 2. Count total doctors, clinics, prescriptions
    const [[{ totalDocs }]] = await db.query('SELECT COUNT(*) as totalDocs FROM doctors');
    const [[{ totalClinics }]] = await db.query('SELECT COUNT(*) as totalClinics FROM clinics');
    const [[{ totalRx }]] = await db.query('SELECT COUNT(*) as totalRx FROM prescriptions');

    // 3. Appointments per doctor
    const [docAptsRows] = await db.query(`
      SELECT d.id as doctorId, d.name as doctorName, d.specialty, COUNT(a.id) as count
      FROM doctors d
      LEFT JOIN appointments a ON d.id = a.doctor_id
      GROUP BY d.id, d.name, d.specialty
    `);

    // 4. Clinic loads
    const [clinicLoadsRows] = await db.query(`
      SELECT c.id as clinicId, c.name as clinicName, COUNT(a.id) as count
      FROM clinics c
      LEFT JOIN doctors d ON c.id = d.clinic_id
      LEFT JOIN appointments a ON d.id = a.doctor_id
      GROUP BY c.id, c.name
    `);

    res.json({
      summary: {
        totalAppointments: summaryCounts.total || 0,
        approvedAppointments: summaryCounts.approved || 0,
        pendingAppointments: summaryCounts.pending || 0,
        rejectedAppointments: summaryCounts.rejected || 0,
        totalDoctors: totalDocs,
        totalClinics: totalClinics,
        totalPrescriptions: totalRx
      },
      appointmentsPerDoctor: docAptsRows,
      clinicLoads: clinicLoadsRows
    });

  } catch (err) {
    console.error("Reports compile error:", err);
    res.status(500).json({ error: "Serverfout bij compileren statistieken." });
  }
});

// GET /api/reports/patient - Get diagnostic reports for patient
router.get('/patient', verifyToken, async (req, res) => {
  const { patientId } = req.query;

  if (!patientId) {
    return res.status(400).json({ error: "patientId parameter is verplicht." });
  }

  try {
    const [rows] = await db.query(`
      SELECT r.*, d.name as doctorName 
      FROM reports r
      LEFT JOIN doctors d ON r.doctor_id = d.id
      WHERE r.patient_id = ?
    `, [patientId]);

    const formatted = rows.map(r => ({
      id: r.id.toString(),
      patientId: r.patient_id.toString(),
      doctorId: r.doctor_id.toString(),
      doctorName: r.doctorName,
      date: r.report_date.toISOString().split('T')[0],
      content: r.content
    }));

    res.json(formatted);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Serverfout bij ophalen medische verslagen." });
  }
});

module.exports = router;

