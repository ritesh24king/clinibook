-- ============================================================
-- CliniBook SR - Seed Data
-- Demo-accounts wachtwoord voor alle gebruikers: 123456
-- (bcrypt-hash hieronder, gegenereerd met bcrypt.hash('123456', 10))
-- ============================================================

USE lms_clone;

-- ------------------------------------------------------------
-- Clinics
-- ------------------------------------------------------------
INSERT INTO clinics (id, name, description) VALUES
  (1, 'Huisarts / Algemene Geneeskunde', 'Eerste aanspreekpunt voor al uw gezondheidsvragen.'),
  (2, 'Cardiologie', 'Gespecialiseerd in hart- en vaatziekten.'),
  (3, 'Dermatologie / Huidarts', 'Behandeling van huid-, haar- en nagelaandoeningen.'),
  (4, 'Gynaecologie', 'Zorg voor de vrouwelijke voortplantingsorganen en zwangerschappen.'),
  (5, 'Tandheelkunde', 'Complete mondzorg en tandheelkundige behandelingen.');

-- ------------------------------------------------------------
-- Users (wachtwoord voor alle accounts: 123456)
-- ------------------------------------------------------------
INSERT INTO users (id, name, email, password_hash, role, clinic_id) VALUES
  (1, 'Lisa Patiënt', 'patient@email.com', '$2b$10$sXQEHCLToSj94LwHEEaKvuzEaONjlveZ3tt8MOlD82UZUkUXFHVnS', 'patient', NULL),
  (2, 'Dr. Amrita Ramdin', 'admin@clinic.com', '$2b$10$sXQEHCLToSj94LwHEEaKvuzEaONjlveZ3tt8MOlD82UZUkUXFHVnS', 'doctor', 1),
  (3, 'SZF Verzekeringen Agency', 'insurance@health.com', '$2b$10$sXQEHCLToSj94LwHEEaKvuzEaONjlveZ3tt8MOlD82UZUkUXFHVnS', 'insurance', NULL);

-- ------------------------------------------------------------
-- Doctors
-- ------------------------------------------------------------
INSERT INTO doctors (id, name, specialty, clinic_id, availability, user_id) VALUES
  (1, 'Dr. Amrita Ramdin', 'Huisarts', 1,
   JSON_OBJECT(
     'Monday', JSON_ARRAY('09:00','09:30','10:00','10:30','11:00','14:00','14:30','15:00'),
     'Tuesday', JSON_ARRAY('09:00','09:30','10:00','10:30','11:00','14:00','14:30','15:00'),
     'Wednesday', JSON_ARRAY('09:00','09:30','10:00','10:30','11:00'),
     'Thursday', JSON_ARRAY('09:00','09:30','10:00','10:30','11:00','14:00','14:30','15:00'),
     'Friday', JSON_ARRAY('09:00','09:30','10:00','10:30','11:00')
   ), 2),
  (2, 'Dr. S. Karkisokromo', 'Cardiologie', 2,
   JSON_OBJECT(
     'Monday', JSON_ARRAY('09:00','10:00','11:00'),
     'Wednesday', JSON_ARRAY('09:00','10:00','11:00','14:00','15:00'),
     'Friday', JSON_ARRAY('14:00','15:00')
   ), NULL),
  (3, 'Dr. S. van Dijk', 'Dermatologie', 3,
   JSON_OBJECT(
     'Tuesday', JSON_ARRAY('13:00','13:30','14:00','14:30','15:00'),
     'Thursday', JSON_ARRAY('10:00','10:30','11:00','13:00','13:30','14:00','14:30')
   ), NULL),
  (4, 'Dr. M. Wijngaarde', 'Gynaecologie', 4,
   JSON_OBJECT(
     'Monday', JSON_ARRAY('13:00','13:30','14:00','14:30','15:00'),
     'Wednesday', JSON_ARRAY('09:00','09:30','10:00','10:30','11:00'),
     'Thursday', JSON_ARRAY('13:00','13:30','14:00','14:30','15:00')
   ), NULL),
  (5, 'Dr. Michael Cairo', 'Tandarts', 5,
   JSON_OBJECT(
     'Tuesday', JSON_ARRAY('09:00','10:00','11:00','14:00','15:00'),
     'Friday', JSON_ARRAY('09:00','10:00','11:00','13:00','14:00','15:00')
   ), NULL);

-- ------------------------------------------------------------
-- Appointments
-- ------------------------------------------------------------
INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, time_slot, reason, status) VALUES
  (1, 1, 1, '2026-06-18', '09:30', 'Lichte symptomen van vermoeidheid.', 'approved'),
  (2, 1, 4, '2026-06-24', '13:00', 'Ik wil graag een reguliere controle inplannen.', 'pending');

-- ------------------------------------------------------------
-- Prescriptions
-- ------------------------------------------------------------
INSERT INTO prescriptions (id, patient_id, doctor_id, prescription_date, medication, dosage, instructions, valid_until, file_path, sent_to_pharmacy_name) VALUES
  (1, 1, 1, '2026-06-12', 'Magnesium 400mg & Vitamin B12', '1 tablet per dag', 'Innemen bij het ontbijt. Voldoende water drinken en rust nemen.', '2026-09-12', NULL, 'Apotheek Self-Reliance');

-- ------------------------------------------------------------
-- Reports
-- ------------------------------------------------------------
INSERT INTO reports (id, patient_id, doctor_id, report_date, content) VALUES
  (1, 1, 1, '2026-06-12', 'Patiënt vertoont lichte symptomen van vermoeidheid. Bloeddruk is normaal. Geadviseerd om rust te nemen en over twee weken terug te komen voor controle.');

-- ------------------------------------------------------------
-- Pharmacies
-- ------------------------------------------------------------
INSERT INTO pharmacies (id, name, address, phone) VALUES
  (1, 'Apotheek Self-Reliance', 'Heerenstraat 14, Paramaribo', '+597 472-888'),
  (2, 'Apotheek Suriname Noord', 'Anamoestraat 22, Paramaribo', '+597 453-111'),
  (3, 'Kuldipsingh Apotheek', 'Gemenelandsweg 50, Paramaribo', '+597 497-222');

-- ------------------------------------------------------------
-- Dossier notes
-- ------------------------------------------------------------
INSERT INTO dossier_notes (id, patient_id, author, note_date, note) VALUES
  (1, 1, 'SZF Verzekeringen Agent', '2026-06-13', 'Polisstatus gevalideerd. Patiënt valt onder basisverzekering SZF-1 met volledige dekking voor consulten bij Dr. Amrita Ramdin.');

-- ------------------------------------------------------------
-- Chats
-- ------------------------------------------------------------
INSERT INTO chats (id, patient_id, doctor_id, sender, message, timestamp) VALUES
  (1, 1, 1, 'doctor', 'Hallo Lisa, hoe gaat het vandaag met de voorgeschreven Magnesium-kuren?', '2026-06-13 10:00:00'),
  (2, 1, 1, 'patient', 'Hallo dokter, het helpt erg goed! Ik voel me al een stuk minder vermoeid.', '2026-06-13 10:02:00');

-- ------------------------------------------------------------
-- Questions
-- ------------------------------------------------------------
INSERT INTO questions (id, patient_id, doctor_id, question_date, question, answer, answered_date) VALUES
  (1, 1, 1, '2026-06-12', 'Kan ik deze Magnesium tabletten ook innemen in combinatie met melkproducten?', 'Ja, dat kan wel, maar bij voorkeur neem je ze in met een glas water tijdens de maaltijd voor de beste opname.', '2026-06-12');

-- ------------------------------------------------------------
-- Notification preferences
-- ------------------------------------------------------------
INSERT INTO notification_preferences (patient_id, channels, reminder_time) VALUES
  (1, 'email,push', '2');