const db = require('../config/db');
const { createNotification } = require('../services/notificationService');

// ============================================
// GET DOCTOR DASHBOARD
// ============================================
const getDashboard = async (req, res) => {
    try {
        const doctorId = req.user.id;

        const [statsRows] = await db.query(
            `SELECT
                SUM(CASE WHEN appointment_date = CURDATE() AND status IN ('pending','confirmed') THEN 1 ELSE 0 END) AS today,
                SUM(CASE WHEN appointment_date > CURDATE() AND status IN ('pending','confirmed') THEN 1 ELSE 0 END) AS upcoming,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed,
                COUNT(*) AS total
            FROM appointments WHERE doctor_id = ?`,
            [doctorId]
        );

        const stats = {
            today: statsRows[0].today || 0,
            upcoming: statsRows[0].upcoming || 0,
            completed: statsRows[0].completed || 0,
            total: statsRows[0].total || 0
        };

        const [todayAppts] = await db.query(
            `SELECT a.*, u.name AS patient_name, u.email AS patient_email, u.phone AS patient_phone
            FROM appointments a
            JOIN users u ON a.patient_id = u.id
            WHERE a.doctor_id = ? AND a.appointment_date = CURDATE()
            ORDER BY a.time_slot ASC`,
            [doctorId]
        );

        res.json({ success: true, data: { stats, today: todayAppts } });
    } catch (error) {
        console.error('Doctor dashboard error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ============================================
// GET DOCTOR PROFILE
// ============================================
const getProfile = async (req, res) => {
    try {
        const [doctors] = await db.query(
            `SELECT id, name, email, phone, qualification, specialization, experience,
              license_number, consultation_fee, bio, profile_image, is_approved,
              rating_avg, total_reviews, created_at
       FROM doctors WHERE id = ?`,
            [req.user.id]
        );
        if (doctors.length === 0) {
            return res.status(404).json({ success: false, message: 'Doctor not found.' });
        }
        res.json({ success: true, data: doctors[0] });
    } catch (error) {
        console.error('Get doctor profile error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ============================================
// UPDATE DOCTOR PROFILE
// ============================================
const updateProfile = async (req, res) => {
    try {
        const { name, phone, qualification, specialization, experience, consultation_fee, bio } = req.body;
        const profile_image = req.file ? `/uploads/profiles/${req.file.filename}` : undefined;

        const updates = [];
        const params = [];

        if (name) { updates.push('name = ?'); params.push(name); }
        if (phone) { updates.push('phone = ?'); params.push(phone); }
        if (qualification) { updates.push('qualification = ?'); params.push(qualification); }
        if (specialization) { updates.push('specialization = ?'); params.push(specialization); }
        if (experience !== undefined) { updates.push('experience = ?'); params.push(experience); }
        if (consultation_fee !== undefined) { updates.push('consultation_fee = ?'); params.push(consultation_fee); }
        if (bio !== undefined) { updates.push('bio = ?'); params.push(bio); }
        if (profile_image) { updates.push('profile_image = ?'); params.push(profile_image); }

        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: 'No fields to update.' });
        }

        params.push(req.user.id);
        await db.query(`UPDATE doctors SET ${updates.join(', ')} WHERE id = ?`, params);

        res.json({ success: true, message: 'Profile updated successfully.' });
    } catch (error) {
        console.error('Update doctor profile error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ============================================
// GET TODAY'S APPOINTMENTS
// ============================================
const getTodayAppointments = async (req, res) => {
    try {
        const [appointments] = await db.query(
            `SELECT a.*, u.name AS patient_name, u.email AS patient_email, u.phone AS patient_phone, u.age AS patient_age, u.gender AS patient_gender
       FROM appointments a
       JOIN users u ON a.patient_id = u.id
       WHERE a.doctor_id = ? AND a.appointment_date = CURDATE()
       ORDER BY a.time_slot ASC`,
            [req.user.id]
        );
        res.json({ success: true, data: appointments });
    } catch (error) {
        console.error('Get today appointments error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ============================================
// GET UPCOMING APPOINTMENTS
// ============================================
const getUpcomingAppointments = async (req, res) => {
    try {
        const [appointments] = await db.query(
            `SELECT a.*, u.name AS patient_name, u.email AS patient_email, u.phone AS patient_phone
       FROM appointments a
       JOIN users u ON a.patient_id = u.id
       WHERE a.doctor_id = ? AND a.appointment_date >= CURDATE() AND a.status IN ('pending', 'confirmed')
       ORDER BY a.appointment_date ASC, a.time_slot ASC`,
            [req.user.id]
        );
        res.json({ success: true, data: appointments });
    } catch (error) {
        console.error('Get upcoming appointments error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ============================================
// GET ALL APPOINTMENTS
// ============================================
const getAllAppointments = async (req, res) => {
    try {
        const [appointments] = await db.query(
            `SELECT a.*, u.name AS patient_name, u.email AS patient_email, u.phone AS patient_phone
       FROM appointments a
       JOIN users u ON a.patient_id = u.id
       WHERE a.doctor_id = ?
       ORDER BY a.appointment_date DESC, a.time_slot DESC`,
            [req.user.id]
        );
        res.json({ success: true, data: appointments });
    } catch (error) {
        console.error('Get all appointments error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ============================================
// ACCEPT APPOINTMENT
// ============================================
const acceptAppointment = async (req, res) => {
    try {
        const [result] = await db.query(
            'UPDATE appointments SET status = ? WHERE id = ? AND doctor_id = ? AND status = ?',
            ['confirmed', req.params.id, req.user.id, 'pending']
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Appointment not found or cannot be accepted.' });
        }

        // Notify patient
        const [appt] = await db.query(
            'SELECT a.*, u.name AS patient_name FROM appointments a JOIN users u ON a.patient_id = u.id WHERE a.id = ?',
            [req.params.id]
        );
        if (appt.length > 0) {
            await createNotification(appt[0].patient_id, 'patient', 'Appointment Confirmed',
                `Your appointment (${appt[0].appointment_uid}) has been confirmed by the doctor.`, 'booking');
        }

        res.json({ success: true, message: 'Appointment accepted.' });
    } catch (error) {
        console.error('Accept appointment error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ============================================
// REJECT APPOINTMENT
// ============================================
const rejectAppointment = async (req, res) => {
    try {
        const [result] = await db.query(
            'UPDATE appointments SET status = ? WHERE id = ? AND doctor_id = ? AND status = ?',
            ['rejected', req.params.id, req.user.id, 'pending']
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Appointment not found or cannot be rejected.' });
        }

        const [appt] = await db.query(
            'SELECT a.*, u.name AS patient_name FROM appointments a JOIN users u ON a.patient_id = u.id WHERE a.id = ?',
            [req.params.id]
        );
        if (appt.length > 0) {
            await createNotification(appt[0].patient_id, 'patient', 'Appointment Rejected',
                `Your appointment (${appt[0].appointment_uid}) was rejected by the doctor.`, 'cancellation');
        }

        res.json({ success: true, message: 'Appointment rejected.' });
    } catch (error) {
        console.error('Reject appointment error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ============================================
// MARK APPOINTMENT COMPLETED
// ============================================
const completeAppointment = async (req, res) => {
    try {
        const { consultation_notes } = req.body;
        const [result] = await db.query(
            'UPDATE appointments SET status = ?, consultation_notes = ? WHERE id = ? AND doctor_id = ? AND status = ?',
            ['completed', consultation_notes || '', req.params.id, req.user.id, 'confirmed']
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Appointment not found or not in confirmed state.' });
        }
        res.json({ success: true, message: 'Appointment marked as completed.' });
    } catch (error) {
        console.error('Complete appointment error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ============================================
// ADD CONSULTATION NOTES
// ============================================
const addNotes = async (req, res) => {
    try {
        const { consultation_notes } = req.body;
        await db.query(
            'UPDATE appointments SET consultation_notes = ? WHERE id = ? AND doctor_id = ?',
            [consultation_notes, req.params.id, req.user.id]
        );
        res.json({ success: true, message: 'Notes added successfully.' });
    } catch (error) {
        console.error('Add notes error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ============================================
// UPLOAD PRESCRIPTION
// ============================================
const uploadPrescription = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded.' });
        }

        const file_url = `/uploads/prescriptions/${req.file.filename}`;
        const { notes } = req.body;

        // Get appointment info
        const [appt] = await db.query(
            'SELECT * FROM appointments WHERE id = ? AND doctor_id = ?',
            [req.params.id, req.user.id]
        );
        if (appt.length === 0) {
            return res.status(404).json({ success: false, message: 'Appointment not found.' });
        }

        await db.query(
            'INSERT INTO prescriptions (appointment_id, doctor_id, patient_id, file_url, notes) VALUES (?, ?, ?, ?, ?)',
            [req.params.id, req.user.id, appt[0].patient_id, file_url, notes || '']
        );

        res.status(201).json({ success: true, message: 'Prescription uploaded.', data: { file_url } });
    } catch (error) {
        console.error('Upload prescription error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ============================================
// ADD AVAILABILITY (single slot)
// ============================================
const addAvailability = async (req, res) => {
    try {
        const { day_of_week, start_time, end_time } = req.body;
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = typeof day_of_week === 'number' ? days[day_of_week] : day_of_week;

        if (!dayName || !start_time || !end_time) {
            return res.status(400).json({ success: false, message: 'Day, start time, and end time are required.' });
        }

        // Check for existing slot on same day
        const [existing] = await db.query(
            'SELECT id FROM availability WHERE doctor_id = ? AND day_of_week = ?',
            [req.user.id, dayName]
        );
        if (existing.length > 0) {
            // Update existing
            await db.query(
                'UPDATE availability SET start_time = ?, end_time = ?, is_available = TRUE WHERE doctor_id = ? AND day_of_week = ?',
                [start_time, end_time, req.user.id, dayName]
            );
        } else {
            await db.query(
                'INSERT INTO availability (doctor_id, day_of_week, start_time, end_time, is_available) VALUES (?, ?, ?, ?, TRUE)',
                [req.user.id, dayName, start_time, end_time]
            );
        }

        res.json({ success: true, message: 'Availability added successfully.' });
    } catch (error) {
        console.error('Add availability error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ============================================
// DELETE AVAILABILITY
// ============================================
const deleteAvailability = async (req, res) => {
    try {
        await db.query('DELETE FROM availability WHERE id = ? AND doctor_id = ?', [req.params.id, req.user.id]);
        res.json({ success: true, message: 'Availability removed.' });
    } catch (error) {
        console.error('Delete availability error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ============================================
// GET AVAILABILITY
// ============================================
const getAvailability = async (req, res) => {
    try {
        const [schedule] = await db.query(
            'SELECT * FROM availability WHERE doctor_id = ? ORDER BY FIELD(day_of_week, "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday")',
            [req.user.id]
        );
        res.json({ success: true, data: schedule });
    } catch (error) {
        console.error('Get availability error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ============================================
// BLOCK DATES
// ============================================
const blockDate = async (req, res) => {
    try {
        const { blocked_date, reason } = req.body;
        if (!blocked_date) {
            return res.status(400).json({ success: false, message: 'Date is required.' });
        }

        await db.query(
            'INSERT INTO blocked_dates (doctor_id, blocked_date, reason) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE reason = ?',
            [req.user.id, blocked_date, reason || '', reason || '']
        );

        res.json({ success: true, message: 'Date blocked successfully.' });
    } catch (error) {
        console.error('Block date error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ============================================
// GET BLOCKED DATES
// ============================================
const getBlockedDates = async (req, res) => {
    try {
        const [dates] = await db.query(
            'SELECT * FROM blocked_dates WHERE doctor_id = ? ORDER BY blocked_date ASC',
            [req.user.id]
        );
        res.json({ success: true, data: dates });
    } catch (error) {
        console.error('Get blocked dates error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ============================================
// UNBLOCK DATE
// ============================================
const unblockDate = async (req, res) => {
    try {
        await db.query('DELETE FROM blocked_dates WHERE id = ? AND doctor_id = ?', [req.params.id, req.user.id]);
        res.json({ success: true, message: 'Date unblocked successfully.' });
    } catch (error) {
        console.error('Unblock date error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ============================================
// GET EARNINGS SUMMARY
// ============================================
const getEarnings = async (req, res) => {
    try {
        const [total] = await db.query(
            `SELECT COUNT(*) AS total_appointments,
              SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed,
              SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,
              SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending
       FROM appointments WHERE doctor_id = ?`,
            [req.user.id]
        );

        const [doctor] = await db.query('SELECT consultation_fee FROM doctors WHERE id = ?', [req.user.id]);
        const fee = doctor[0]?.consultation_fee || 0;

        res.json({
            success: true,
            data: {
                ...total[0],
                consultation_fee: fee,
                total_earnings: (total[0].completed || 0) * fee
            }
        });
    } catch (error) {
        console.error('Get earnings error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ============================================
// GET NOTIFICATIONS
// ============================================
const getNotifications = async (req, res) => {
    try {
        const [notifications] = await db.query(
            'SELECT * FROM notifications WHERE user_id = ? AND user_type = ? ORDER BY created_at DESC LIMIT 50',
            [req.user.id, 'doctor']
        );
        res.json({ success: true, data: notifications });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

module.exports = {
    getDashboard,
    getProfile,
    updateProfile,
    getTodayAppointments,
    getUpcomingAppointments,
    getAllAppointments,
    acceptAppointment,
    rejectAppointment,
    completeAppointment,
    addNotes,
    uploadPrescription,
    addAvailability,
    deleteAvailability,
    getAvailability,
    blockDate,
    getBlockedDates,
    unblockDate,
    getEarnings,
    getNotifications
};
