const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { createNotification } = require('../services/notificationService');
const { exec } = require('child_process');
const path = require('path');

// ============================================
// ADMIN DASHBOARD STATS
// ============================================
const getDashboardStats = async (req, res) => {
    try {
        const [doctorCount] = await db.query('SELECT COUNT(*) AS count FROM doctors');
        const [patientCount] = await db.query('SELECT COUNT(*) AS count FROM users');
        const [appointmentCount] = await db.query('SELECT COUNT(*) AS count FROM appointments');
        const [pendingDoctors] = await db.query('SELECT COUNT(*) AS count FROM doctors WHERE is_approved = FALSE');
        const [todayAppointments] = await db.query(
            'SELECT COUNT(*) AS count FROM appointments WHERE appointment_date = CURDATE()'
        );
        const [completedAppointments] = await db.query(
            "SELECT COUNT(*) AS count FROM appointments WHERE status = 'completed'"
        );

        // Revenue calculation
        const [revenue] = await db.query(
            `SELECT COALESCE(SUM(d.consultation_fee), 0) AS total_revenue
       FROM appointments a JOIN doctors d ON a.doctor_id = d.id
       WHERE a.status = 'completed'`
        );

        res.json({
            success: true,
            data: {
                totalDoctors: doctorCount[0].count,
                totalPatients: patientCount[0].count,
                totalAppointments: appointmentCount[0].count,
                pendingApprovals: pendingDoctors[0].count,
                todayAppointments: todayAppointments[0].count,
                completedAppointments: completedAppointments[0].count,
                totalRevenue: revenue[0].total_revenue
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ============================================
// GET ALL DOCTORS
// ============================================
const getAllDoctors = async (req, res) => {
    try {
        const { status } = req.query;
        let query = 'SELECT id, name, email, phone, qualification, specialization, experience, license_number, consultation_fee, is_approved, is_active, rating_avg, total_reviews, created_at FROM doctors';
        const params = [];

        if (status === 'pending') {
            query += ' WHERE is_approved = FALSE';
        } else if (status === 'approved') {
            query += ' WHERE is_approved = TRUE';
        }

        query += ' ORDER BY created_at DESC';
        const [doctors] = await db.query(query, params);
        res.json({ success: true, data: doctors });
    } catch (error) {
        console.error('Get all doctors error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ============================================
// APPROVE DOCTOR
// ============================================
const approveDoctor = async (req, res) => {
    try {
        const [result] = await db.query(
            'UPDATE doctors SET is_approved = TRUE WHERE id = ?',
            [req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Doctor not found.' });
        }

        await createNotification(req.params.id, 'doctor', 'Account Approved',
            'Your account has been approved! You can now login and start accepting appointments.', 'approval');

        res.json({ success: true, message: 'Doctor approved successfully.' });
    } catch (error) {
        console.error('Approve doctor error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ============================================
// REJECT DOCTOR
// ============================================
const rejectDoctor = async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM doctors WHERE id = ? AND is_approved = FALSE', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Doctor not found or already approved.' });
        }
        res.json({ success: true, message: 'Doctor registration rejected.' });
    } catch (error) {
        console.error('Reject doctor error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ============================================
// EDIT DOCTOR
// ============================================
const editDoctor = async (req, res) => {
    try {
        const { name, phone, qualification, specialization, experience, consultation_fee, is_active } = req.body;
        const updates = [];
        const params = [];

        if (name) { updates.push('name = ?'); params.push(name); }
        if (phone) { updates.push('phone = ?'); params.push(phone); }
        if (qualification) { updates.push('qualification = ?'); params.push(qualification); }
        if (specialization) { updates.push('specialization = ?'); params.push(specialization); }
        if (experience !== undefined) { updates.push('experience = ?'); params.push(experience); }
        if (consultation_fee !== undefined) { updates.push('consultation_fee = ?'); params.push(consultation_fee); }
        if (is_active !== undefined) { updates.push('is_active = ?'); params.push(is_active); }

        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: 'No fields to update.' });
        }

        params.push(req.params.id);
        await db.query(`UPDATE doctors SET ${updates.join(', ')} WHERE id = ?`, params);

        res.json({ success: true, message: 'Doctor updated successfully.' });
    } catch (error) {
        console.error('Edit doctor error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ============================================
// REMOVE DOCTOR
// ============================================
const removeDoctor = async (req, res) => {
    try {
        await db.query('DELETE FROM doctors WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Doctor removed successfully.' });
    } catch (error) {
        console.error('Remove doctor error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ============================================
// GET DOCTOR PERFORMANCE
// ============================================
const getDoctorPerformance = async (req, res) => {
    try {
        const [doctor] = await db.query(
            'SELECT name, specialization, rating_avg, total_reviews FROM doctors WHERE id = ?',
            [req.params.id]
        );
        if (doctor.length === 0) {
            return res.status(404).json({ success: false, message: 'Doctor not found.' });
        }

        const [stats] = await db.query(
            `SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected
       FROM appointments WHERE doctor_id = ?`,
            [req.params.id]
        );

        res.json({ success: true, data: { ...doctor[0], ...stats[0] } });
    } catch (error) {
        console.error('Doctor performance error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ============================================
// GET ALL PATIENTS
// ============================================
const getAllPatients = async (req, res) => {
    try {
        const [patients] = await db.query(
            'SELECT id, name, email, phone, age, gender, is_active, created_at FROM users ORDER BY created_at DESC'
        );
        res.json({ success: true, data: patients });
    } catch (error) {
        console.error('Get all patients error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ============================================
// BLOCK/UNBLOCK PATIENT
// ============================================
const togglePatientBlock = async (req, res) => {
    try {
        const { is_active } = req.body;
        await db.query('UPDATE users SET is_active = ? WHERE id = ?', [is_active, req.params.id]);
        res.json({ success: true, message: `Patient ${is_active ? 'unblocked' : 'blocked'} successfully.` });
    } catch (error) {
        console.error('Toggle patient block error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ============================================
// RESET PATIENT PASSWORD
// ============================================
const resetPatientPassword = async (req, res) => {
    try {
        const newPassword = 'reset123'; // Default reset password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);

        await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, req.params.id]);
        res.json({ success: true, message: 'Password reset successfully. New password: reset123' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ============================================
// GET ALL APPOINTMENTS
// ============================================
const getAllAppointments = async (req, res) => {
    try {
        const { status, date } = req.query;
        let query = `
      SELECT a.*, u.name AS patient_name, u.email AS patient_email,
             d.name AS doctor_name, d.specialization
      FROM appointments a
      JOIN users u ON a.patient_id = u.id
      JOIN doctors d ON a.doctor_id = d.id
    `;
        const conditions = [];
        const params = [];

        if (status) { conditions.push('a.status = ?'); params.push(status); }
        if (date) { conditions.push('a.appointment_date = ?'); params.push(date); }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY a.appointment_date DESC, a.time_slot DESC';
        const [appointments] = await db.query(query, params);
        res.json({ success: true, data: appointments });
    } catch (error) {
        console.error('Get all appointments error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ============================================
// FORCE CANCEL APPOINTMENT
// ============================================
const forceCancelAppointment = async (req, res) => {
    try {
        await db.query("UPDATE appointments SET status = 'cancelled' WHERE id = ?", [req.params.id]);
        res.json({ success: true, message: 'Appointment cancelled by admin.' });
    } catch (error) {
        console.error('Force cancel error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ============================================
// REPORTS & ANALYTICS
// ============================================
const getReports = async (req, res) => {
    try {
        const { period } = req.query; // daily, weekly, monthly

        // Appointment trends (last 30 days)
        const [trends] = await db.query(`
      SELECT DATE(appointment_date) AS date, COUNT(*) AS count, status
      FROM appointments
      WHERE appointment_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE(appointment_date), status
      ORDER BY date ASC
    `);

        // Top specializations
        const [specializations] = await db.query(`
      SELECT d.specialization, COUNT(a.id) AS appointment_count
      FROM appointments a JOIN doctors d ON a.doctor_id = d.id
      GROUP BY d.specialization
      ORDER BY appointment_count DESC
      LIMIT 10
    `);

        // Monthly revenue
        const [monthlyRevenue] = await db.query(`
      SELECT DATE_FORMAT(a.appointment_date, '%Y-%m') AS month,
             COUNT(*) AS appointments, COALESCE(SUM(d.consultation_fee), 0) AS revenue
      FROM appointments a JOIN doctors d ON a.doctor_id = d.id
      WHERE a.status = 'completed'
      GROUP BY month ORDER BY month DESC LIMIT 12
    `);

        res.json({
            success: true,
            data: { trends, specializations, monthlyRevenue }
        });
    } catch (error) {
        console.error('Reports error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ============================================
// GET SYSTEM SETTINGS
// ============================================
const getSettings = async (req, res) => {
    try {
        const [settings] = await db.query('SELECT * FROM system_settings');
        const settingsObj = {};
        settings.forEach(s => { settingsObj[s.setting_key] = s.setting_value; });
        res.json({ success: true, data: settingsObj });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ============================================
// UPDATE SYSTEM SETTINGS
// ============================================
const updateSettings = async (req, res) => {
    try {
        const settings = req.body;
        for (const [key, value] of Object.entries(settings)) {
            await db.query(
                'INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
                [key, value, value]
            );
        }
        res.json({ success: true, message: 'Settings updated successfully.' });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

module.exports = {
    getDashboardStats,
    getAllDoctors,
    approveDoctor,
    rejectDoctor,
    editDoctor,
    removeDoctor,
    getDoctorPerformance,
    getAllPatients,
    togglePatientBlock,
    resetPatientPassword,
    getAllAppointments,
    forceCancelAppointment,
    getReports,
    getSettings,
    updateSettings
};
