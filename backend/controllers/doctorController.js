const db = require('../config/db');
const { createNotification } = require('../services/notificationService');

// ─── Get Doctor Profile ───────────────────────────────
exports.getProfile = async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT id, name, email, phone, qualification, specialization, experience, 
                    consultation_fee, bio, profile_image, is_approved, rating_avg, total_reviews, created_at 
             FROM doctors WHERE id = ?`,
            [req.user.id]
        );
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Doctor not found' });
        res.json({ success: true, doctor: rows[0] });
    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({ success: false, message: 'Failed to get profile' });
    }
};

// ─── Update Doctor Profile ────────────────────────────
exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, qualification, specialization, experience, consultation_fee, bio } = req.body;
        let profileImage = req.body.profile_image;
        if (req.file) profileImage = `/uploads/${req.file.filename}`;

        await db.execute(
            `UPDATE doctors SET 
                name = COALESCE(?, name), phone = COALESCE(?, phone), 
                qualification = COALESCE(?, qualification), specialization = COALESCE(?, specialization),
                experience = COALESCE(?, experience), consultation_fee = COALESCE(?, consultation_fee),
                bio = COALESCE(?, bio), profile_image = COALESCE(?, profile_image) 
             WHERE id = ?`,
            [name, phone, qualification, specialization, experience, consultation_fee, bio, profileImage, req.user.id]
        );

        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
};

// ─── Get Today's Appointments ─────────────────────────
exports.getTodayAppointments = async (req, res) => {
    try {
        const [appointments] = await db.execute(
            `SELECT a.*, u.name AS patient_name, u.email AS patient_email, u.phone AS patient_phone, 
                    u.age AS patient_age, u.gender AS patient_gender, u.profile_image AS patient_image
             FROM appointments a
             JOIN users u ON a.patient_id = u.id
             WHERE a.doctor_id = ? AND a.appointment_date = CURDATE()
             ORDER BY a.time_slot ASC`,
            [req.user.id]
        );
        res.json({ success: true, appointments });
    } catch (error) {
        console.error('Get Today Error:', error);
        res.status(500).json({ success: false, message: 'Failed to get today\'s appointments' });
    }
};

// ─── Get Upcoming Appointments ────────────────────────
exports.getUpcomingAppointments = async (req, res) => {
    try {
        const [appointments] = await db.execute(
            `SELECT a.*, u.name AS patient_name, u.email AS patient_email, u.phone AS patient_phone,
                    u.age AS patient_age, u.gender AS patient_gender
             FROM appointments a
             JOIN users u ON a.patient_id = u.id
             WHERE a.doctor_id = ? AND a.appointment_date >= CURDATE() AND a.status IN ('pending', 'confirmed')
             ORDER BY a.appointment_date ASC, a.time_slot ASC`,
            [req.user.id]
        );
        res.json({ success: true, appointments });
    } catch (error) {
        console.error('Get Upcoming Error:', error);
        res.status(500).json({ success: false, message: 'Failed to get appointments' });
    }
};

// ─── Get All Appointments (with history) ──────────────
exports.getAllAppointments = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        let query = `SELECT a.*, u.name AS patient_name, u.email AS patient_email, u.phone AS patient_phone
                     FROM appointments a JOIN users u ON a.patient_id = u.id
                     WHERE a.doctor_id = ?`;
        const params = [req.user.id];

        if (status) {
            query += ' AND a.status = ?';
            params.push(status);
        }

        query += ' ORDER BY a.appointment_date DESC, a.time_slot DESC';
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

// ─── Accept Appointment ───────────────────────────────
exports.acceptAppointment = async (req, res) => {
    try {
        const [appointments] = await db.execute(
            "SELECT a.*, u.name AS patient_name FROM appointments a JOIN users u ON a.patient_id = u.id WHERE a.id = ? AND a.doctor_id = ? AND a.status = 'pending'",
            [req.params.id, req.user.id]
        );
        if (appointments.length === 0) {
            return res.status(404).json({ success: false, message: 'Appointment not found or cannot be accepted' });
        }

        await db.execute("UPDATE appointments SET status = 'confirmed' WHERE id = ?", [req.params.id]);

        const apt = appointments[0];
        await createNotification(apt.patient_id, 'patient', 'Appointment Confirmed',
            `Your appointment (${apt.appointment_uid}) on ${apt.appointment_date} at ${apt.time_slot} has been confirmed by the doctor.`, 'booking');

        res.json({ success: true, message: 'Appointment confirmed' });
    } catch (error) {
        console.error('Accept Error:', error);
        res.status(500).json({ success: false, message: 'Failed to accept appointment' });
    }
};

// ─── Reject Appointment ───────────────────────────────
exports.rejectAppointment = async (req, res) => {
    try {
        const [appointments] = await db.execute(
            "SELECT a.*, u.name AS patient_name FROM appointments a JOIN users u ON a.patient_id = u.id WHERE a.id = ? AND a.doctor_id = ? AND a.status = 'pending'",
            [req.params.id, req.user.id]
        );
        if (appointments.length === 0) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        await db.execute("UPDATE appointments SET status = 'cancelled' WHERE id = ?", [req.params.id]);

        const apt = appointments[0];
        await createNotification(apt.patient_id, 'patient', 'Appointment Rejected',
            `Your appointment (${apt.appointment_uid}) on ${apt.appointment_date} was rejected by the doctor. Please book another slot.`, 'cancellation');

        res.json({ success: true, message: 'Appointment rejected' });
    } catch (error) {
        console.error('Reject Error:', error);
        res.status(500).json({ success: false, message: 'Failed to reject appointment' });
    }
};

// ─── Mark Appointment Completed ───────────────────────
exports.completeAppointment = async (req, res) => {
    try {
        const { consultation_notes } = req.body;

        const [appointments] = await db.execute(
            "SELECT a.*, u.name AS patient_name FROM appointments a JOIN users u ON a.patient_id = u.id WHERE a.id = ? AND a.doctor_id = ? AND a.status IN ('pending', 'confirmed')",
            [req.params.id, req.user.id]
        );
        if (appointments.length === 0) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        await db.execute(
            "UPDATE appointments SET status = 'completed', consultation_notes = ? WHERE id = ?",
            [consultation_notes || '', req.params.id]
        );

        const apt = appointments[0];
        await createNotification(apt.patient_id, 'patient', 'Appointment Completed',
            `Your appointment (${apt.appointment_uid}) with Dr. has been marked as completed. You can now leave a review.`, 'general');

        res.json({ success: true, message: 'Appointment marked as completed' });
    } catch (error) {
        console.error('Complete Error:', error);
        res.status(500).json({ success: false, message: 'Failed to complete appointment' });
    }
};

// ─── Add Consultation Notes ───────────────────────────
exports.addNotes = async (req, res) => {
    try {
        const { notes } = req.body;
        await db.execute(
            'UPDATE appointments SET consultation_notes = ? WHERE id = ? AND doctor_id = ?',
            [notes, req.params.id, req.user.id]
        );
        res.json({ success: true, message: 'Notes added successfully' });
    } catch (error) {
        console.error('Add Notes Error:', error);
        res.status(500).json({ success: false, message: 'Failed to add notes' });
    }
};

// ─── Upload Prescription ──────────────────────────────
exports.uploadPrescription = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const [appointments] = await db.execute(
            'SELECT patient_id FROM appointments WHERE id = ? AND doctor_id = ?',
            [req.params.id, req.user.id]
        );
        if (appointments.length === 0) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        const file_url = `/uploads/${req.file.filename}`;
        const { notes } = req.body;

        await db.execute(
            'INSERT INTO prescriptions (appointment_id, doctor_id, patient_id, file_url, notes) VALUES (?, ?, ?, ?, ?)',
            [req.params.id, req.user.id, appointments[0].patient_id, file_url, notes || '']
        );

        await createNotification(appointments[0].patient_id, 'patient', 'Prescription Uploaded',
            `A prescription has been uploaded for your appointment. You can download it from your appointment history.`, 'general');

        res.json({ success: true, message: 'Prescription uploaded successfully', file_url });
    } catch (error) {
        console.error('Upload Prescription Error:', error);
        res.status(500).json({ success: false, message: 'Failed to upload prescription' });
    }
};

// ─── Set Availability ─────────────────────────────────
exports.setAvailability = async (req, res) => {
    try {
        const { availability } = req.body; // Array of { day_of_week, start_time, end_time, is_available }

        if (!Array.isArray(availability)) {
            return res.status(400).json({ success: false, message: 'Availability must be an array' });
        }

        // Delete existing and re-insert
        await db.execute('DELETE FROM availability WHERE doctor_id = ?', [req.user.id]);

        for (const slot of availability) {
            await db.execute(
                'INSERT INTO availability (doctor_id, day_of_week, start_time, end_time, is_available) VALUES (?, ?, ?, ?, ?)',
                [req.user.id, slot.day_of_week, slot.start_time, slot.end_time, slot.is_available !== false]
            );
        }

        res.json({ success: true, message: 'Availability updated successfully' });
    } catch (error) {
        console.error('Set Availability Error:', error);
        res.status(500).json({ success: false, message: 'Failed to set availability' });
    }
};

// ─── Get Availability ─────────────────────────────────
exports.getAvailability = async (req, res) => {
    try {
        const [availability] = await db.execute(
            'SELECT * FROM availability WHERE doctor_id = ?',
            [req.user.id]
        );
        res.json({ success: true, availability });
    } catch (error) {
        console.error('Get Availability Error:', error);
        res.status(500).json({ success: false, message: 'Failed to get availability' });
    }
};

// ─── Block Dates ──────────────────────────────────────
exports.blockDate = async (req, res) => {
    try {
        const { blocked_date, reason } = req.body;

        await db.execute(
            'INSERT INTO blocked_dates (doctor_id, blocked_date, reason) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE reason = ?',
            [req.user.id, blocked_date, reason || 'Holiday', reason || 'Holiday']
        );

        res.json({ success: true, message: 'Date blocked successfully' });
    } catch (error) {
        console.error('Block Date Error:', error);
        res.status(500).json({ success: false, message: 'Failed to block date' });
    }
};

// ─── Unblock Date ─────────────────────────────────────
exports.unblockDate = async (req, res) => {
    try {
        await db.execute(
            'DELETE FROM blocked_dates WHERE doctor_id = ? AND blocked_date = ?',
            [req.user.id, req.params.date]
        );
        res.json({ success: true, message: 'Date unblocked successfully' });
    } catch (error) {
        console.error('Unblock Date Error:', error);
        res.status(500).json({ success: false, message: 'Failed to unblock date' });
    }
};

// ─── Get Blocked Dates ────────────────────────────────
exports.getBlockedDates = async (req, res) => {
    try {
        const [dates] = await db.execute(
            'SELECT * FROM blocked_dates WHERE doctor_id = ? ORDER BY blocked_date ASC',
            [req.user.id]
        );
        res.json({ success: true, blocked_dates: dates });
    } catch (error) {
        console.error('Get Blocked Dates Error:', error);
        res.status(500).json({ success: false, message: 'Failed to get blocked dates' });
    }
};

// ─── Get Earnings Summary ─────────────────────────────
exports.getEarnings = async (req, res) => {
    try {
        const [doctor] = await db.execute('SELECT consultation_fee FROM doctors WHERE id = ?', [req.user.id]);
        const fee = doctor[0]?.consultation_fee || 0;

        const [totalCompleted] = await db.execute(
            "SELECT COUNT(*) AS count FROM appointments WHERE doctor_id = ? AND status = 'completed'",
            [req.user.id]
        );

        const [thisMonth] = await db.execute(
            "SELECT COUNT(*) AS count FROM appointments WHERE doctor_id = ? AND status = 'completed' AND MONTH(appointment_date) = MONTH(CURDATE()) AND YEAR(appointment_date) = YEAR(CURDATE())",
            [req.user.id]
        );

        const [thisWeek] = await db.execute(
            "SELECT COUNT(*) AS count FROM appointments WHERE doctor_id = ? AND status = 'completed' AND YEARWEEK(appointment_date) = YEARWEEK(CURDATE())",
            [req.user.id]
        );

        res.json({
            success: true,
            earnings: {
                consultation_fee: fee,
                total_appointments: totalCompleted[0].count,
                total_earnings: totalCompleted[0].count * fee,
                this_month_appointments: thisMonth[0].count,
                this_month_earnings: thisMonth[0].count * fee,
                this_week_appointments: thisWeek[0].count,
                this_week_earnings: thisWeek[0].count * fee
            }
        });
    } catch (error) {
        console.error('Get Earnings Error:', error);
        res.status(500).json({ success: false, message: 'Failed to get earnings' });
    }
};

// ─── Get Notifications ────────────────────────────────
exports.getNotifications = async (req, res) => {
    try {
        const [notifications] = await db.execute(
            "SELECT * FROM notifications WHERE user_id = ? AND user_type = 'doctor' ORDER BY created_at DESC LIMIT 50",
            [req.user.id]
        );
        const [unread] = await db.execute(
            "SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND user_type = 'doctor' AND is_read = FALSE",
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
            "UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ? AND user_type = 'doctor'",
            [req.params.id, req.user.id]
        );
        res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        console.error('Mark Read Error:', error);
        res.status(500).json({ success: false, message: 'Failed to update notification' });
    }
};
