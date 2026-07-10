-- ==================== CLINIBOOK SR DATABASE SCHEMA ====================
-- Database naam: clinibook (zie .env.example / DB_NAME)

CREATE TABLE IF NOT EXISTS clinics (
  id INT AUTO_INCREMENT NOT NULL,
  name VARCHAR(250) NOT NULL,
  description TEXT,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT NOT NULL,
  name VARCHAR(250) NOT NULL,
  email VARCHAR(250) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'patient', -- patient, doctor, insurance
  clinic_id INT,
  PRIMARY KEY (id),
  CONSTRAINT users_clinic_id_fk FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS doctors (
  id INT AUTO_INCREMENT NOT NULL,
  name VARCHAR(250) NOT NULL,
  specialty VARCHAR(250) NOT NULL,
  clinic_id INT NOT NULL,
  availability JSON NOT NULL, -- Weekday availability e.g. {"Monday": ["09:00", "09:30"]}
  user_id INT, -- link to login credentials
  PRIMARY KEY (id),
  CONSTRAINT doctors_clinic_id_fk FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE,
  CONSTRAINT doctors_user_id_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT NOT NULL,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  appointment_date DATE NOT NULL,
  time_slot VARCHAR(50) NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  PRIMARY KEY (id),
  CONSTRAINT appointments_patient_id_fk FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT appointments_doctor_id_fk FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS prescriptions (
  id INT AUTO_INCREMENT NOT NULL,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  prescription_date DATE NOT NULL,
  medication VARCHAR(250) NOT NULL,
  dosage VARCHAR(250) NOT NULL,
  instructions TEXT NOT NULL,
  valid_until DATE NOT NULL,
  file_path VARCHAR(255) DEFAULT NULL, -- Path to uploaded scan in /uploads
  sent_to_pharmacy_name VARCHAR(250) DEFAULT NULL,
  PRIMARY KEY (id),
  CONSTRAINT prescriptions_patient_id_fk FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT prescriptions_doctor_id_fk FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reports (
  id INT AUTO_INCREMENT NOT NULL,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  report_date DATE NOT NULL,
  content TEXT NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT reports_patient_id_fk FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT reports_doctor_id_fk FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pharmacies (
  id INT AUTO_INCREMENT NOT NULL,
  name VARCHAR(250) NOT NULL,
  address VARCHAR(250) NOT NULL,
  phone VARCHAR(100) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS dossier_notes (
  id INT AUTO_INCREMENT NOT NULL,
  patient_id INT NOT NULL,
  author VARCHAR(250) NOT NULL,
  note_date DATE NOT NULL,
  note TEXT NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT dossier_notes_patient_id_fk FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chats (
  id INT AUTO_INCREMENT NOT NULL,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  sender VARCHAR(50) NOT NULL, -- patient, doctor
  message TEXT NOT NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT chats_patient_id_fk FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chats_doctor_id_fk FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS questions (
  id INT AUTO_INCREMENT NOT NULL,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  question_date DATE NOT NULL,
  question TEXT NOT NULL,
  answer TEXT DEFAULT NULL,
  answered_date DATE DEFAULT NULL,
  PRIMARY KEY (id),
  CONSTRAINT questions_patient_id_fk FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT questions_doctor_id_fk FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notification_preferences (
  patient_id INT NOT NULL,
  channels VARCHAR(250) NOT NULL DEFAULT 'email', -- e.g. "email,push"
  reminder_time VARCHAR(50) NOT NULL DEFAULT '2',
  PRIMARY KEY (patient_id),
  CONSTRAINT notifications_patient_id_fk FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Let op: seed-data (voorbeeldgegevens) staat NIET in dit bestand.
-- Voer na dit schema apart sql/seed.sql uit om de tabellen te vullen.
-- (In een eerdere versie stond dezelfde data hier ook nog eens dubbel,
--  wat "Duplicate entry" fouten gaf als je schema.sql én seed.sql beide draaide.)


