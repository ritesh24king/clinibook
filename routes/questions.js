const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middlewares/auth');

// GET /api/questions - List patient questions
router.get('/', verifyToken, async (req, res) => {
  const { patientId } = req.query;

  try {
    let query = `
      SELECT q.*, p.name as patientName, d.name as doctorName
      FROM questions q
      LEFT JOIN users p ON q.patient_id = p.id
      LEFT JOIN doctors d ON q.doctor_id = d.id
    `;
    const params = [];

    if (patientId) {
      query += ' WHERE q.patient_id = ?';
      params.push(patientId);
    }

    const [rows] = await db.query(query, params);
    
    // Format date objects to string
    const formatted = rows.map(r => ({
      id: r.id.toString(),
      patientId: r.patient_id.toString(),
      patientName: r.patientName,
      doctorId: r.doctor_id.toString(),
      doctorName: r.doctorName,
      date: r.question_date.toISOString().split('T')[0],
      question: r.question,
      answer: r.answer,
      answeredDate: r.answered_date ? r.answered_date.toISOString().split('T')[0] : null
    }));

    res.json(formatted);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Serverfout bij ophalen medische vragen." });
  }
});

// POST /api/questions - Submit a medical question
router.post('/', verifyToken, async (req, res) => {
  const { doctorId, question } = req.body;
  const patientId = req.user.id;

  if (!doctorId || !question) {
    return res.status(400).json({ error: "Kies a.u.b. een arts en typ uw vraag." });
  }

  try {
    // 1. Verify doctor exists
    const [docRows] = await db.query('SELECT name FROM doctors WHERE id = ?', [doctorId]);
    if (docRows.length === 0) {
      return res.status(400).json({ error: "Geselecteerde arts bestaat niet." });
    }

    // 2. Insert question
    const [result] = await db.query(
      'INSERT INTO questions (patient_id, doctor_id, question_date, question) VALUES (?, ?, ?, ?)',
      [patientId, doctorId, new Date().toISOString().split('T')[0], question]
    );

    res.status(201).json({
      id: result.insertId,
      patientId,
      doctorId,
      question,
      date: new Date().toISOString().split('T')[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Serverfout bij indienen medische vraag." });
  }
});

// POST /api/questions/:id/answer - Doctor answers a question
router.post('/:id/answer', verifyToken, async (req, res) => {
  const questionId = req.params.id;
  const { answer } = req.body;

  if (!answer || answer.trim().length === 0) {
    return res.status(400).json({ error: "Antwoord mag niet leeg zijn." });
  }

  try {
    // 1. Check question exists
    const [rows] = await db.query('SELECT * FROM questions WHERE id = ?', [questionId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Vraag niet gevonden." });
    }

    // 2. Update question with answer
    await db.query(
      'UPDATE questions SET answer = ?, answered_date = ? WHERE id = ?',
      [answer, new Date().toISOString().split('T')[0], questionId]
    );

    res.json({ message: "Vraag succesvol beantwoord." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Serverfout bij beantwoorden vraag." });
  }
});

module.exports = router;
