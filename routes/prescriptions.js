const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const PDFDocument = require('pdfkit');
const db = require('../config/db');
const { verifyToken } = require('../middlewares/auth');

// Configure Multer for File Uploads to /uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = './uploads/';
    // Ensure uploads directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// GET /api/prescriptions - List patient prescriptions
router.get('/', verifyToken, async (req, res) => {
  const { patientId } = req.query;

  try {
    let query = `
      SELECT r.*, p.name as patientName, d.name as doctorName 
      FROM prescriptions r
      LEFT JOIN users p ON r.patient_id = p.id
      LEFT JOIN doctors d ON r.doctor_id = d.id
    `;
    const params = [];

    if (patientId) {
      query += ' WHERE r.patient_id = ?';
      params.push(patientId);
    }

    const [rows] = await db.query(query, params);
    
    // Map database output to frontend expectation
    const formatted = rows.map(r => ({
      id: r.id.toString(),
      patientId: r.patient_id.toString(),
      patientName: r.patientName,
      doctorId: r.doctor_id.toString(),
      doctorName: r.doctorName,
      date: r.prescription_date.toISOString().split('T')[0],
      medication: r.medication,
      dosage: r.dosage,
      instructions: r.instructions,
      validUntil: r.valid_until.toISOString().split('T')[0],
      photoData: r.file_path ? `/uploads/${path.basename(r.file_path)}` : null,
      sentToPharmacyName: r.sent_to_pharmacy_name
    }));

    res.json(formatted);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Serverfout bij ophalen recepten." });
  }
});

// POST /api/prescriptions - Create new prescription (Multer single file upload)
router.post('/', verifyToken, upload.single('prescriptionPhoto'), async (req, res) => {
  const { patientId, medication, dosage, instructions, validUntil } = req.body;
  const doctorId = req.user.doctorId || 1; // Fallback to doc 1

  if (!patientId || !medication || !dosage || !instructions || !validUntil) {
    return res.status(400).json({ error: "Alle velden (patientId, medicatie, dosering, instructies, geldigheid) zijn verplicht." });
  }

  const filePath = req.file ? req.file.path : null;

  try {
    // 1. Verify patient exists
    const [patientRows] = await db.query('SELECT name FROM users WHERE id = ? AND role = ?', [patientId, 'patient']);
    if (patientRows.length === 0) {
      return res.status(400).json({ error: "Geselecteerde patiënt bestaat niet." });
    }

    // 2. Insert into MySQL
    const [result] = await db.query(
      `INSERT INTO prescriptions 
       (patient_id, doctor_id, prescription_date, medication, dosage, instructions, valid_until, file_path) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [patientId, doctorId, new Date().toISOString().split('T')[0], medication, dosage, instructions, validUntil, filePath]
    );

    res.status(201).json({
      id: result.insertId,
      patientId,
      doctorId,
      medication,
      dosage,
      instructions,
      validUntil,
      filePath
    });

  } catch (err) {
    console.error("Prescription error:", err);
    res.status(500).json({ error: "Serverfout bij uitschrijven recept." });
  }
});

// POST /api/prescriptions/:id/send-to-pharmacy - Send prescription to pharmacy
router.post('/:id/send-to-pharmacy', verifyToken, async (req, res) => {
  const prescriptionId = req.params.id;
  const { pharmacyId } = req.body;

  if (!pharmacyId) {
    return res.status(400).json({ error: "Selecteer een geldige apotheek." });
  }

  try {
    // 1. Check if pharmacy exists
    const [pharRows] = await db.query('SELECT name FROM pharmacies WHERE id = ?', [pharmacyId]);
    if (pharRows.length === 0) {
      return res.status(400).json({ error: "Geselecteerde apotheek bestaat niet." });
    }

    const pharmacyName = pharRows[0].name;

    // 2. Check if prescription exists
    const [rxRows] = await db.query('SELECT id FROM prescriptions WHERE id = ?', [prescriptionId]);
    if (rxRows.length === 0) {
      return res.status(404).json({ error: "Recept niet gevonden." });
    }

    // 3. Update prescription sent_to_pharmacy_name
    await db.query(
      'UPDATE prescriptions SET sent_to_pharmacy_name = ? WHERE id = ?',
      [pharmacyName, prescriptionId]
    );

    res.json({ message: `Recept succesvol verzonden naar ${pharmacyName}` });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Serverfout bij doorsturen recept." });
  }
});

// GET /api/prescriptions/:id/pdf - Generate and download PDF
router.get('/:id/pdf', async (req, res) => {
  const prescriptionId = req.params.id;

  try {
    const [rows] = await db.query(`
      SELECT r.*, p.name as patientName, d.name as doctorName 
      FROM prescriptions r
      LEFT JOIN users p ON r.patient_id = p.id
      LEFT JOIN doctors d ON r.doctor_id = d.id
      WHERE r.id = ?
    `, [prescriptionId]);

    if (rows.length === 0) {
      return res.status(404).send("Recept niet gevonden.");
    }

    const rx = rows[0];

    res.setHeader('Content-disposition', `attachment; filename=Recept_${rx.id}.pdf`);
    res.setHeader('Content-type', 'application/pdf');

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    // --- PDF Header ---
    doc.rect(0, 0, 612, 100).fill('#115e59');
    doc.fillColor('#ffffff')
       .fontSize(22)
       .font('Helvetica-Bold')
       .text('CLINIBOOK SR MEDICAL CENTER', 50, 30);
    doc.fontSize(10)
       .font('Helvetica')
       .text('Paramaribo, Suriname | Tel: +597 123-4567 | info@clinibooksr.com', 50, 60);

    // Title
    doc.fillColor('#1e293b')
       .fontSize(18)
       .font('Helvetica-Bold')
       .text('OFFICIEEL MEDISCH RECEPT', 50, 130);

    doc.fontSize(10)
       .fillColor('#991b1b')
       .text(`GELDIG TOT: ${rx.valid_until.toISOString().split('T')[0]}`, 400, 136, { align: 'right' });

    doc.moveTo(50, 160)
       .lineTo(562, 160)
       .lineWidth(1)
       .strokeColor('#cbd5e1')
       .stroke();

    // Patient Info
    doc.rect(50, 180, 240, 90).fill('#f8fafc');
    doc.fillColor('#475569')
       .fontSize(10)
       .font('Helvetica-Bold')
       .text('PATIËNT DETAILS', 60, 190);
    doc.fillColor('#1e293b')
       .font('Helvetica')
       .text(`Naam: ${rx.patientName}`, 60, 210)
       .text(`Datum: ${rx.prescription_date.toISOString().split('T')[0]}`, 60, 230)
       .text(`Recept Nr: ${rx.id}`, 60, 250);

    // Doctor Info
    doc.rect(322, 180, 240, 90).fill('#f8fafc');
    doc.fillColor('#475569')
       .font('Helvetica-Bold')
       .text('ARTS DETAILS', 332, 190);
    doc.fillColor('#1e293b')
       .font('Helvetica')
       .text(`Arts: ${rx.doctorName}`, 332, 210)
       .text(`Polikliniek: Algemene Zorg`, 332, 230)
       .text(`Recept Status: ${rx.sent_to_pharmacy_name ? 'Verzonden' : 'Lokaal'}`, 332, 250);

    // Content
    doc.fontSize(14)
       .fillColor('#1e293b')
       .font('Helvetica-Bold')
       .text('Voorgeschreven Medicatie & Dosering', 50, 300);

    doc.rect(50, 325, 512, 25).fill('#114e4a');
    doc.fillColor('#ffffff')
       .font('Helvetica-Bold')
       .fontSize(10)
       .text('Medicijn / Behandeling', 60, 332)
       .text('Dosering', 320, 332)
       .text('Instructie', 440, 332);

    doc.fillColor('#1e293b')
       .font('Helvetica')
       .fontSize(10)
       .text(rx.medication, 60, 365, { width: 240 })
       .text(rx.dosage, 320, 365, { width: 110 })
       .text(rx.instructions, 440, 365, { width: 110 });

    doc.rect(50, 350, 512, 100).strokeColor('#e2e8f0').stroke();

    // Check if photo uploaded
    if (rx.file_path) {
      doc.fontSize(9)
         .fillColor('#115e59')
         .font('Helvetica-Oblique')
         .text('* Dit recept heeft een originele geüploade foto-scan bijgevoegd in de database.', 50, 470);
    }

    // Barcode
    doc.fontSize(8)
       .font('Helvetica')
       .fillColor('#94a3b8')
       .text('SCAN VOOR APOTHEEK INTEGRATIE', 50, 520);
    
    let xOffset = 50;
    for(let i=0; i<30; i++) {
      let width = Math.random() > 0.4 ? (Math.random() > 0.7 ? 4 : 2) : 1;
      doc.rect(xOffset, 535, width, 30).fill('#1e293b');
      xOffset += width + (Math.random() > 0.6 ? 2 : 1);
    }
    doc.fontSize(8)
       .fillColor('#1e293b')
       .text(`*CB-${rx.id.toString().toUpperCase()}*`, 50, 570);

    // Signature
    doc.moveTo(380, 550)
       .lineTo(540, 550)
       .lineWidth(1)
       .strokeColor('#94a3b8')
       .stroke();
    doc.fontSize(9)
       .fillColor('#64748b')
       .text('Handtekening medisch specialist', 395, 555);
    doc.fontSize(12)
       .font('Courier-Oblique')
       .fillColor('#0f172a')
       .text(rx.doctorName, 405, 535);

    doc.fontSize(8)
       .font('Helvetica')
       .fillColor('#94a3b8')
       .text('Dit is een officieel digitaal ondertekend document gegenereerd door CliniBook SR.', 50, 720, { align: 'center' });

    doc.end();

  } catch (err) {
    console.error(err);
    res.status(500).send("Fout bij genereren PDF.");
  }
});

module.exports = router;

