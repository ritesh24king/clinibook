const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middlewares/auth');

// GET /api/chats - Get conversation logs
router.get('/', verifyToken, async (req, res) => {
  const { patientId, doctorId } = req.query;

  if (!patientId || !doctorId) {
    return res.status(400).json({ error: "patientId en doctorId zijn verplicht." });
  }

  try {
    const [rows] = await db.query(
      `SELECT * FROM chats 
       WHERE patient_id = ? AND doctor_id = ? 
       ORDER BY timestamp ASC`,
      [patientId, doctorId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Serverfout bij ophalen chatberichten." });
  }
});

// POST /api/chats - Send a message
router.post('/', verifyToken, async (req, res) => {
  const { patientId, doctorId, sender, message } = req.body;

  if (!patientId || !doctorId || !sender || !message) {
    return res.status(400).json({ error: "Alle velden zijn verplicht." });
  }

  try {
    // 1. Insert patient's message
    await db.query(
      'INSERT INTO chats (patient_id, doctor_id, sender, message) VALUES (?, ?, ?, ?)',
      [patientId, doctorId, sender, message]
    );

    // 2. If message is sent by patient, simulate doctor response
    if (sender === 'patient') {
      const doctorReplies = [
        "Bedankt voor uw bericht. Ik raad u aan uw voorgeschreven rust te nemen. Als de symptomen verergeren, neem dan direct contact op.",
        "Ik heb uw medische geschiedenis bekeken. De magnesiumdosering is optimaal. Mocht u buikklachten krijgen, neem ze dan tijdens het eten.",
        "Dat is een goede vraag. Neem de tabletten in met water, niet met melk of calciumrijke dranken om de opname niet te verhinderen.",
        "Ik zie dat uw volgende consult gepland staat. Mocht u tussentijds dringende klachten ervaren, kunt u de poli direct bellen.",
        "Ik adviseer u om uw bloeddruk morgenochtend opnieuw op te meten en de waarden hier in de chat door te geven."
      ];
      const randomReply = doctorReplies[Math.floor(Math.random() * doctorReplies.length)];

      await db.query(
        'INSERT INTO chats (patient_id, doctor_id, sender, message) VALUES (?, ?, ?, ?)',
        [patientId, doctorId, 'doctor', `[Automatisch antwoord]: ${randomReply}`]
      );
    }

    res.status(201).json({ message: "Bericht succesvol verzonden." });

  } catch (err) {
    console.error("Chat sending error:", err);
    res.status(500).json({ error: "Serverfout bij verzenden chatbericht." });
  }
});

module.exports = router;

