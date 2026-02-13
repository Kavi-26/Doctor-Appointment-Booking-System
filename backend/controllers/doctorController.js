const db = require('../config/db');
const { createNotification } = require('../services/notificationService');

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
// SET AVAILABILITY
// ============================================
const setAvailability = async (req, res) => {
    try {
        const { schedule } = req.body;
        // schedule = [{ day_of_week, start_time, end_time, is_available }]

        if (!schedule || !Array.isArray(schedule)) {
            return res.status(400).json({ success: false, message: 'Schedule array is required.' });
        }

        // Delete existing availability and re-insert
        await db.query('DELETE FROM availability WHERE doctor_id = ?', [req.user.id]);

        for (const slot of schedule) {
            await db.query(
                'INSERT INTO availability (doctor_id, day_of_week, start_time, end_time, is_available) VALUES (?, ?, ?, ?, ?)',
                [req.user.id, slot.day_of_week, slot.start_time, slot.end_time, slot.is_available !== false]
            );
        }

        res.json({ success: true, message: 'Availability updated successfully.' });
    } catch (error) {
        console.error('Set availability error:', error);
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
    getProfile,
    updateProfile,
    getTodayAppointments,
    getUpcomingAppointments,
    acceptAppointment,
    rejectAppointment,
    completeAppointment,
    addNotes,
    uploadPrescription,
    setAvailability,
    getAvailability,
    blockDate,
    getBlockedDates,
    unblockDate,
    getEarnings,
    getNotifications
};
