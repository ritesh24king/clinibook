// ==================== CLINIBOOK SR — SERVER (MySQL-versie) ====================
// Dit bestand is nu KLEIN: het start alleen de server op en koppelt elke
// "afdeling" van de API (auth, afspraken, artsen, ...) aan zijn eigen
// routebestand in de map routes/. De echte logica staat daar, per onderwerp
// opgesplitst, in plaats van alles in één groot bestand.

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Algemene middleware (draait voor ELKE aanvraag) ----------
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));       // de website zelf (HTML/CSS/JS)
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // geüploade receptfoto's

// ---------- API-routes koppelen ----------
// Elk require() haalt een Express-router op uit routes/, en app.use(pad, router)
// zorgt dat alle routes daarin automatisch dat pad als voorvoegsel krijgen.
// Voorbeeld: router.post('/login') in routes/auth.js wordt dan /api/auth/login.
app.use('/api/auth', require('./routes/auth'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/clinics', require('./routes/clinics'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/patients', require('./routes/dossiers'));   // bevat o.a. /api/patients/:id/dossier
app.use('/api/prescriptions', require('./routes/prescriptions'));
app.use('/api/pharmacies', require('./routes/pharmacies'));
app.use('/api/chats', require('./routes/chats'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/reports', require('./routes/reports'));

// ---------- Vangnet voor onbekende /api/-routes ----------
app.use('/api', (req, res) => {
  res.status(404).json({ error: `Route niet gevonden: ${req.method} ${req.originalUrl}` });
});

// ---------- Server starten ----------
app.listen(PORT, () => {
  console.log(`✅ CliniBook SR draait op http://localhost:${PORT}`);
  console.log(`   Database: MySQL (zie config/db.js en je .env-bestand)`);
});
