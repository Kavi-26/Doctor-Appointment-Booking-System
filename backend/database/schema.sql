-- ============================================
-- Doctor Appointment Booking System
-- Complete MySQL Database Schema
-- ============================================

CREATE DATABASE IF NOT EXISTS doctor_appointment_db;
USE doctor_appointment_db;

-- ============================================
-- 1. PATIENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    age INT,
    gender ENUM('Male', 'Female', 'Other') DEFAULT 'Other',
    profile_image VARCHAR(255) DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_phone (phone)
) ENGINE=InnoDB;

-- ============================================
-- 2. DOCTORS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    qualification VARCHAR(200) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    experience INT DEFAULT 0,
    license_number VARCHAR(100) NOT NULL UNIQUE,
    consultation_fee DECIMAL(10,2) DEFAULT 0.00,
    bio TEXT,
    profile_image VARCHAR(255) DEFAULT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    rating_avg DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_specialization (specialization),
    INDEX idx_approved (is_approved),
    INDEX idx_rating (rating_avg)
) ENGINE=InnoDB;

-- ============================================
-- 3. ADMINS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'super_admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB;

-- ============================================
-- 4. APPOINTMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_uid VARCHAR(20) NOT NULL UNIQUE,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    time_slot VARCHAR(20) NOT NULL,
    reason TEXT,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled', 'rescheduled', 'rejected') DEFAULT 'pending',
    consultation_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    INDEX idx_patient (patient_id),
    INDEX idx_doctor (doctor_id),
    INDEX idx_date (appointment_date),
    INDEX idx_status (status),
    INDEX idx_uid (appointment_uid)
) ENGINE=InnoDB;

-- ============================================
-- 5. DOCTOR AVAILABILITY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS availability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id INT NOT NULL,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    INDEX idx_doctor_day (doctor_id, day_of_week),
    UNIQUE KEY unique_doctor_day (doctor_id, day_of_week)
) ENGINE=InnoDB;

-- ============================================
-- 6. BLOCKED DATES TABLE (Doctor Holidays)
-- ============================================
CREATE TABLE IF NOT EXISTS blocked_dates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id INT NOT NULL,
    blocked_date DATE NOT NULL,
    reason VARCHAR(255),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    INDEX idx_doctor_date (doctor_id, blocked_date),
    UNIQUE KEY unique_doctor_date (doctor_id, blocked_date)
) ENGINE=InnoDB;

-- ============================================
-- 7. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_type ENUM('patient', 'doctor', 'admin') NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('booking', 'cancellation', 'reminder', 'approval', 'system', 'review') DEFAULT 'system',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id, user_type),
    INDEX idx_read (is_read)
) ENGINE=InnoDB;

-- ============================================
-- 8. REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    UNIQUE KEY unique_review (patient_id, appointment_id),
    INDEX idx_doctor (doctor_id),
    INDEX idx_rating (rating)
) ENGINE=InnoDB;

-- ============================================
-- 9. PRESCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS prescriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT NOT NULL,
    doctor_id INT NOT NULL,
    patient_id INT NOT NULL,
    file_url VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_appointment (appointment_id)
) ENGINE=InnoDB;

-- ============================================
-- 10. SYSTEM SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- SEED DATA
-- ============================================

-- Default Admin (password: admin123)
-- bcrypt hash for 'admin123'
INSERT INTO admins (name, email, password_hash, role) VALUES
('System Admin', 'admin@system.com', '$2a$10$8K1p/a0dR1xqM8K6hT5O5eXXBgRw5KZQO2DPfBG5FHnMCfN4/Oy6', 'super_admin')
ON DUPLICATE KEY UPDATE name = name;

-- Default System Settings
INSERT INTO system_settings (setting_key, setting_value) VALUES
('reminder_hours_before', '24'),
('appointment_slot_duration', '30'),
('max_appointments_per_day', '20'),
('allow_same_day_booking', 'true'),
('notification_email_enabled', 'true'),
('notification_sms_enabled', 'false'),
('system_name', 'Doctor Appointment Booking System'),
('system_email', 'noreply@docbooking.com')
ON DUPLICATE KEY UPDATE setting_value = setting_value;
