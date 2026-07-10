// Basic regex for email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email en wachtwoord zijn verplicht." });
  }
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Voer een geldig e-mailadres in." });
  }
  next();
};

const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Naam, e-mail en wachtwoord zijn verplicht." });
  }
  if (name.trim().length < 2) {
    return res.status(400).json({ error: "Voer een geldige naam in (minimaal 2 tekens)." });
  }
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Voer een geldig e-mailadres in." });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Wachtwoord moet minimaal 6 tekens bevatten." });
  }
  next();
};

const validateAppointment = (req, res, next) => {
  const { doctorId, date, timeSlot, reason } = req.body;
  if (!doctorId || !date || !timeSlot || !reason) {
    return res.status(400).json({ error: "Alle velden (doctorId, date, timeSlot, reason) zijn verplicht." });
  }
  if (reason.trim().length < 3) {
    return res.status(400).json({ error: "Beschrijf de klacht met minimaal 3 tekens." });
  }
  // Validate YYYY-MM-DD date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: "Ongeldig datumformaat (gebruik YYYY-MM-DD)." });
  }
  next();
};

const validateClinic = (req, res, next) => {
  const { name } = req.body;
  if (!name || name.trim().length === 0) {
    return res.status(400).json({ error: "Polikliniek naam is verplicht." });
  }
  next();
};

const validateDoctor = (req, res, next) => {
  const { name, specialty, clinicId } = req.body;
  if (!name || !specialty || !clinicId) {
    return res.status(400).json({ error: "Naam, specialisme en polikliniek zijn verplicht." });
  }
  next();
};

const validatePrescription = (req, res, next) => {
  const { patientId, medication, dosage, instructions, validUntil } = req.body;
  if (!patientId || !medication || !dosage || !instructions || !validUntil) {
    return res.status(400).json({ error: "Alle receptvelden (patientId, medicatie, dosering, instructies, geldigheid) zijn verplicht." });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(validUntil)) {
    return res.status(400).json({ error: "Ongeldig datumformaat voor geldigheid (YYYY-MM-DD)." });
  }
  next();
};

module.exports = {
  validateLogin,
  validateRegister,
  validateAppointment,
  validateClinic,
  validateDoctor,
  validatePrescription
};
