const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { createNotification } = require('../services/notificationService');

// ─── Dashboard Stats ──────────────────────────────────
exports.getDashboardStats = async (req, res) => {
    try {
        const [totalDoctors] = await db.execute('SELECT COUNT(*) AS count FROM doctors');
        const [approvedDoctors] = await db.execute('SELECT COUNT(*) AS count FROM doctors WHERE is_approved = TRUE');
        const [pendingDoctors] = await db.execute('SELECT COUNT(*) AS count FROM doctors WHERE is_approved = FALSE');
        const [totalPatients] = await db.execute('SELECT COUNT(*) AS count FROM users');
        const [totalAppointments] = await db.execute('SELECT COUNT(*) AS count FROM appointments');
        const [todayAppointments] = await db.execute("SELECT COUNT(*) AS count FROM appointments WHERE appointment_date = CURDATE()");
        const [completedAppointments] = await db.execute("SELECT COUNT(*) AS count FROM appointments WHERE status = 'completed'");
        const [cancelledAppointments] = await db.execute("SELECT COUNT(*) AS count FROM appointments WHERE status = 'cancelled'");

        // Revenue (sum of consultation fees for completed appointments)
        const [revenue] = await db.execute(
            "SELECT COALESCE(SUM(d.consultation_fee), 0) AS total FROM appointments a JOIN doctors d ON a.doctor_id = d.id WHERE a.status = 'completed'"
        );

        // Recent appointments
        const [recentAppointments] = await db.execute(
            `SELECT a.*, u.name AS patient_name, d.name AS doctor_name, d.specialization
             FROM appointments a
             JOIN users u ON a.patient_id = u.id
             JOIN doctors d ON a.doctor_id = d.id
             ORDER BY a.created_at DESC LIMIT 10`
        );

        res.json({
            success: true,
            stats: {
                total_doctors: totalDoctors[0].count,
                approved_doctors: approvedDoctors[0].count,
                pending_doctors: pendingDoctors[0].count,
                total_patients: totalPatients[0].count,
                total_appointments: totalAppointments[0].count,
                today_appointments: todayAppointments[0].count,
                completed_appointments: completedAppointments[0].count,
                cancelled_appointments: cancelledAppointments[0].count,
                total_revenue: revenue[0].total
            },
            recent_appointments: recentAppointments
        });
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ success: false, message: 'Failed to get dashboard stats' });
    }
};

// ─── Get All Doctors ──────────────────────────────────
exports.getAllDoctors = async (req, res) => {
    try {
        const { status, search } = req.query;
        let query = 'SELECT id, name, email, phone, qualification, specialization, experience, consultation_fee, is_approved, is_active, rating_avg, total_reviews, created_at FROM doctors';
        const params = [];
        const conditions = [];

        if (status === 'approved') { conditions.push('is_approved = TRUE'); }
        else if (status === 'pending') { conditions.push('is_approved = FALSE'); }
        else if (status === 'inactive') { conditions.push('is_active = FALSE'); }

        if (search) {
            conditions.push('(name LIKE ? OR email LIKE ? OR specialization LIKE ?)');
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
        query += ' ORDER BY created_at DESC';

        const [doctors] = await db.execute(query, params);
        res.json({ success: true, doctors });
    } catch (error) {
        console.error('Get Doctors Error:', error);
        res.status(500).json({ success: false, message: 'Failed to get doctors' });
    }
};

// ─── Approve Doctor ───────────────────────────────────
exports.approveDoctor = async (req, res) => {
    try {
        const [doctors] = await db.execute('SELECT name, email FROM doctors WHERE id = ?', [req.params.id]);
        if (doctors.length === 0) return res.status(404).json({ success: false, message: 'Doctor not found' });

        await db.execute('UPDATE doctors SET is_approved = TRUE WHERE id = ?', [req.params.id]);

        await createNotification(parseInt(req.params.id), 'doctor', 'Account Approved',
            'Your account has been approved by the admin. You can now log in and start accepting appointments.', 'approval');

        res.json({ success: true, message: `Dr. ${doctors[0].name} has been approved` });
    } catch (error) {
        console.error('Approve Doctor Error:', error);
        res.status(500).json({ success: false, message: 'Failed to approve doctor' });
    }
};

// ─── Reject Doctor ────────────────────────────────────
exports.rejectDoctor = async (req, res) => {
    try {
        const [doctors] = await db.execute('SELECT name FROM doctors WHERE id = ?', [req.params.id]);
        if (doctors.length === 0) return res.status(404).json({ success: false, message: 'Doctor not found' });

        await db.execute('DELETE FROM doctors WHERE id = ? AND is_approved = FALSE', [req.params.id]);

        res.json({ success: true, message: `Dr. ${doctors[0].name} registration rejected and removed` });
    } catch (error) {
        console.error('Reject Doctor Error:', error);
        res.status(500).json({ success: false, message: 'Failed to reject doctor' });
    }
};

// ─── Edit Doctor ──────────────────────────────────────
exports.editDoctor = async (req, res) => {
    try {
        const { name, phone, qualification, specialization, experience, consultation_fee, is_active } = req.body;

        await db.execute(
            `UPDATE doctors SET 
                name = COALESCE(?, name), phone = COALESCE(?, phone),
                qualification = COALESCE(?, qualification), specialization = COALESCE(?, specialization),
                experience = COALESCE(?, experience), consultation_fee = COALESCE(?, consultation_fee),
                is_active = COALESCE(?, is_active)
             WHERE id = ?`,
            [name, phone, qualification, specialization, experience, consultation_fee, is_active, req.params.id]
        );

        res.json({ success: true, message: 'Doctor profile updated' });
    } catch (error) {
        console.error('Edit Doctor Error:', error);
        res.status(500).json({ success: false, message: 'Failed to edit doctor' });
    }
};

// ─── Remove Doctor ────────────────────────────────────
exports.removeDoctor = async (req, res) => {
    try {
        await db.execute('UPDATE doctors SET is_active = FALSE WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Doctor deactivated' });
    } catch (error) {
        console.error('Remove Doctor Error:', error);
        res.status(500).json({ success: false, message: 'Failed to remove doctor' });
    }
};

// ─── Get Doctor Performance ───────────────────────────
exports.getDoctorPerformance = async (req, res) => {
    try {
        const [doctor] = await db.execute(
            'SELECT id, name, specialization, consultation_fee, rating_avg, total_reviews FROM doctors WHERE id = ?',
            [req.params.id]
        );
        if (doctor.length === 0) return res.status(404).json({ success: false, message: 'Doctor not found' });

        const [totalAppts] = await db.execute('SELECT COUNT(*) AS count FROM appointments WHERE doctor_id = ?', [req.params.id]);
        const [completedAppts] = await db.execute("SELECT COUNT(*) AS count FROM appointments WHERE doctor_id = ? AND status = 'completed'", [req.params.id]);
        const [cancelledAppts] = await db.execute("SELECT COUNT(*) AS count FROM appointments WHERE doctor_id = ? AND status = 'cancelled'", [req.params.id]);

        const [monthlyData] = await db.execute(
            `SELECT MONTH(appointment_date) AS month, YEAR(appointment_date) AS year, COUNT(*) AS count
             FROM appointments WHERE doctor_id = ? AND status = 'completed'
             GROUP BY YEAR(appointment_date), MONTH(appointment_date)
             ORDER BY year DESC, month DESC LIMIT 12`,
            [req.params.id]
        );

        res.json({
            success: true,
            doctor: doctor[0],
            performance: {
                total_appointments: totalAppts[0].count,
                completed: completedAppts[0].count,
                cancelled: cancelledAppts[0].count,
                completion_rate: totalAppts[0].count > 0 ? ((completedAppts[0].count / totalAppts[0].count) * 100).toFixed(1) : 0,
                monthly_data: monthlyData
            }
        });
    } catch (error) {
        console.error('Doctor Performance Error:', error);
        res.status(500).json({ success: false, message: 'Failed to get performance' });
    }
};

// ─── Get All Patients ─────────────────────────────────
exports.getAllPatients = async (req, res) => {
    try {
        const { search } = req.query;
        let query = 'SELECT id, name, email, phone, age, gender, is_active, created_at FROM users';
        const params = [];

        if (search) {
            query += ' WHERE name LIKE ? OR email LIKE ? OR phone LIKE ?';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY created_at DESC';
        const [patients] = await db.execute(query, params);
        res.json({ success: true, patients });
    } catch (error) {
        console.error('Get Patients Error:', error);
        res.status(500).json({ success: false, message: 'Failed to get patients' });
    }
};

// ─── Block Patient ────────────────────────────────────
exports.blockPatient = async (req, res) => {
    try {
        const [users] = await db.execute('SELECT is_active FROM users WHERE id = ?', [req.params.id]);
        if (users.length === 0) return res.status(404).json({ success: false, message: 'Patient not found' });

        const newStatus = !users[0].is_active;
        await db.execute('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, req.params.id]);

        res.json({ success: true, message: newStatus ? 'Patient unblocked' : 'Patient blocked' });
    } catch (error) {
        console.error('Block Patient Error:', error);
        res.status(500).json({ success: false, message: 'Failed to update patient status' });
    }
};

// ─── Reset Patient Password ──────────────────────────
exports.resetPatientPassword = async (req, res) => {
    try {
        const { new_password } = req.body;
        if (!new_password || new_password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(new_password, salt);

        await db.execute('UPDATE users SET password_hash = ? WHERE id = ?', [hash, req.params.id]);
        res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ success: false, message: 'Failed to reset password' });
    }
};

// ─── Get All Appointments ─────────────────────────────
exports.getAllAppointments = async (req, res) => {
    try {
        const { status, date, page = 1, limit = 20 } = req.query;
        let query = `SELECT a.*, u.name AS patient_name, u.email AS patient_email,
                            d.name AS doctor_name, d.specialization, d.email AS doctor_email
                     FROM appointments a
                     JOIN users u ON a.patient_id = u.id
                     JOIN doctors d ON a.doctor_id = d.id`;
        const params = [];
        const conditions = [];

        if (status) { conditions.push('a.status = ?'); params.push(status); }
        if (date) { conditions.push('a.appointment_date = ?'); params.push(date); }

        if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
        query += ' ORDER BY a.created_at DESC';

        const offset = (parseInt(page) - 1) * parseInt(limit);
        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [appointments] = await db.execute(query, params);
        res.json({ success: true, appointments });
    } catch (error) {
        console.error('Get All Appointments Error:', error);
        res.status(500).json({ success: false, message: 'Failed to get appointments' });
    }
};

// ─── Force Cancel Appointment ─────────────────────────
exports.forceCancelAppointment = async (req, res) => {
    try {
        const [appointments] = await db.execute(
            "SELECT a.*, u.name AS patient_name, d.name AS doctor_name FROM appointments a JOIN users u ON a.patient_id = u.id JOIN doctors d ON a.doctor_id = d.id WHERE a.id = ? AND a.status IN ('pending', 'confirmed')",
            [req.params.id]
        );
        if (appointments.length === 0) {
            return res.status(404).json({ success: false, message: 'Appointment not found or already resolved' });
        }

        await db.execute("UPDATE appointments SET status = 'cancelled' WHERE id = ?", [req.params.id]);

        const apt = appointments[0];
        await createNotification(apt.patient_id, 'patient', 'Appointment Cancelled by Admin',
            `Your appointment (${apt.appointment_uid}) has been cancelled by the system administrator.`, 'cancellation');
        await createNotification(apt.doctor_id, 'doctor', 'Appointment Cancelled by Admin',
            `Appointment (${apt.appointment_uid}) with ${apt.patient_name} has been cancelled by the system administrator.`, 'cancellation');

        res.json({ success: true, message: 'Appointment cancelled by admin' });
    } catch (error) {
        console.error('Force Cancel Error:', error);
        res.status(500).json({ success: false, message: 'Failed to cancel appointment' });
    }
};

// ─── Reports & Analytics ──────────────────────────────
exports.getReports = async (req, res) => {
    try {
        const { period = 'monthly' } = req.query;

        // Appointment trends
        let trendQuery;
        if (period === 'daily') {
            trendQuery = `SELECT DATE(appointment_date) AS label, COUNT(*) AS appointments,
                          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed
                          FROM appointments WHERE appointment_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                          GROUP BY DATE(appointment_date) ORDER BY label`;
        } else if (period === 'weekly') {
            trendQuery = `SELECT YEARWEEK(appointment_date) AS label, COUNT(*) AS appointments,
                          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed
                          FROM appointments WHERE appointment_date >= DATE_SUB(CURDATE(), INTERVAL 12 WEEK)
                          GROUP BY YEARWEEK(appointment_date) ORDER BY label`;
        } else {
            trendQuery = `SELECT DATE_FORMAT(appointment_date, '%Y-%m') AS label, COUNT(*) AS appointments,
                          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed
                          FROM appointments WHERE appointment_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
                          GROUP BY DATE_FORMAT(appointment_date, '%Y-%m') ORDER BY label`;
        }
        const [trends] = await db.execute(trendQuery);

        // Top doctors
        const [topDoctors] = await db.execute(
            `SELECT d.name, d.specialization, COUNT(a.id) AS total_appointments, d.rating_avg
             FROM doctors d
             LEFT JOIN appointments a ON d.id = a.doctor_id AND a.status = 'completed'
             WHERE d.is_approved = TRUE
             GROUP BY d.id ORDER BY total_appointments DESC LIMIT 10`
        );

        // Specialization distribution
        const [specializations] = await db.execute(
            'SELECT specialization, COUNT(*) AS count FROM doctors WHERE is_approved = TRUE GROUP BY specialization ORDER BY count DESC'
        );

        // Status distribution
        const [statusDist] = await db.execute(
            'SELECT status, COUNT(*) AS count FROM appointments GROUP BY status'
        );

        res.json({
            success: true,
            reports: { trends, top_doctors: topDoctors, specializations, status_distribution: statusDist }
        });
    } catch (error) {
        console.error('Reports Error:', error);
        res.status(500).json({ success: false, message: 'Failed to get reports' });
    }
};

// ─── Get System Settings ──────────────────────────────
exports.getSettings = async (req, res) => {
    try {
        const [settings] = await db.execute('SELECT * FROM system_settings');
        const settingsObj = {};
        settings.forEach(s => { settingsObj[s.setting_key] = s.setting_value; });
        res.json({ success: true, settings: settingsObj });
    } catch (error) {
        console.error('Get Settings Error:', error);
        res.status(500).json({ success: false, message: 'Failed to get settings' });
    }
};

// ─── Update System Settings ───────────────────────────
exports.updateSettings = async (req, res) => {
    try {
        const settings = req.body;
        for (const [key, value] of Object.entries(settings)) {
            await db.execute(
                'INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
                [key, value, value]
            );
        }
        res.json({ success: true, message: 'Settings updated' });
    } catch (error) {
        console.error('Update Settings Error:', error);
        res.status(500).json({ success: false, message: 'Failed to update settings' });
    }
};

// ─── Get Notifications ────────────────────────────────
exports.getNotifications = async (req, res) => {
    try {
        const [notifications] = await db.execute(
            "SELECT * FROM notifications WHERE user_id = ? AND user_type = 'admin' ORDER BY created_at DESC LIMIT 50",
            [req.user.id]
        );
        const [unread] = await db.execute(
            "SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND user_type = 'admin' AND is_read = FALSE",
            [req.user.id]
        );
        res.json({ success: true, notifications, unread_count: unread[0].count });
    } catch (error) {
        console.error('Get Notifications Error:', error);
        res.status(500).json({ success: false, message: 'Failed to get notifications' });
    }
};

// ─── Mark Notification Read ───────────────────────────
exports.markNotificationRead = async (req, res) => {
    try {
        await db.execute(
            "UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ? AND user_type = 'admin'",
            [req.params.id, req.user.id]
        );
        res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        console.error('Mark Read Error:', error);
        res.status(500).json({ success: false, message: 'Failed to update notification' });
    }
};
