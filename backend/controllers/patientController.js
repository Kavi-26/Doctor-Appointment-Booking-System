const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { createNotification, sendBookingConfirmation, sendCancellationAlert } = require('../services/notificationService');

// ─── Get Patient Profile ──────────────────────────────
exports.getProfile = async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT id, name, email, phone, age, gender, profile_image, created_at FROM users WHERE id = ?',
            [req.user.id]
        );
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Patient not found' });
        res.json({ success: true, patient: rows[0] });
    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({ success: false, message: 'Failed to get profile' });
    }
};

// ─── Update Patient Profile ──────────────────────────
exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, age, gender } = req.body;
        let profileImage = req.body.profile_image;

        if (req.file) {
            profileImage = `/uploads/${req.file.filename}`;
        }

        await db.execute(
            'UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), age = COALESCE(?, age), gender = COALESCE(?, gender), profile_image = COALESCE(?, profile_image) WHERE id = ?',
            [name, phone, age, gender, profileImage, req.user.id]
        );

        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
};

// ─── Search Doctors ───────────────────────────────────
exports.searchDoctors = async (req, res) => {
    try {
        const { specialization, experience_min, rating_min, fee_max, search, page = 1, limit = 10 } = req.query;
        let query = `SELECT id, name, email, phone, qualification, specialization, experience, consultation_fee, bio, profile_image, rating_avg, total_reviews 
                      FROM doctors WHERE is_approved = TRUE AND is_active = TRUE`;
        const params = [];

        if (specialization) {
            query += ' AND specialization LIKE ?';
            params.push(`%${specialization}%`);
        }
        if (experience_min) {
            query += ' AND experience >= ?';
            params.push(parseInt(experience_min));
        }
        if (rating_min) {
            query += ' AND rating_avg >= ?';
            params.push(parseFloat(rating_min));
        }
        if (fee_max) {
            query += ' AND consultation_fee <= ?';
            params.push(parseFloat(fee_max));
        }
        if (search) {
            query += ' AND (name LIKE ? OR specialization LIKE ? OR qualification LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        // Count total
        const countQuery = query.replace(/SELECT .* FROM/, 'SELECT COUNT(*) as total FROM');
        const [countResult] = await db.execute(countQuery, params);
        const total = countResult[0].total;

        // Paginate
        const offset = (parseInt(page) - 1) * parseInt(limit);
        query += ' ORDER BY rating_avg DESC, experience DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [doctors] = await db.execute(query, params);

        res.json({
            success: true,
            doctors,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Search Doctors Error:', error);
        res.status(500).json({ success: false, message: 'Failed to search doctors' });
    }
};

// ─── View Doctor Profile ──────────────────────────────
exports.getDoctorProfile = async (req, res) => {
    try {
        const [doctors] = await db.execute(
            `SELECT id, name, email, phone, qualification, specialization, experience, 
                    consultation_fee, bio, profile_image, rating_avg, total_reviews, created_at
             FROM doctors WHERE id = ? AND is_approved = TRUE AND is_active = TRUE`,
            [req.params.id]
        );
        if (doctors.length === 0) return res.status(404).json({ success: false, message: 'Doctor not found' });

        // Get reviews
        const [reviews] = await db.execute(
            `SELECT r.rating, r.comment, r.created_at, u.name AS patient_name 
             FROM reviews r JOIN users u ON r.patient_id = u.id 
             WHERE r.doctor_id = ? ORDER BY r.created_at DESC LIMIT 10`,
            [req.params.id]
        );

        res.json({ success: true, doctor: doctors[0], reviews });
    } catch (error) {
        console.error('Get Doctor Profile Error:', error);
        res.status(500).json({ success: false, message: 'Failed to get doctor profile' });
    }
};

// ─── Check Doctor Availability ────────────────────────
exports.getDoctorAvailability = async (req, res) => {
    try {
        const doctorId = req.params.id;
        const { date } = req.query;

        // Get working hours
        const [availability] = await db.execute(
            'SELECT * FROM availability WHERE doctor_id = ? AND is_available = TRUE',
            [doctorId]
        );

        // Get blocked dates
        const [blockedDates] = await db.execute(
            'SELECT blocked_date, reason FROM blocked_dates WHERE doctor_id = ?',
            [doctorId]
        );

        // Get booked slots for specific date
        let bookedSlots = [];
        if (date) {
            const [booked] = await db.execute(
                `SELECT time_slot FROM appointments 
                 WHERE doctor_id = ? AND appointment_date = ? AND status IN ('pending', 'confirmed')`,
                [doctorId, date]
            );
            bookedSlots = booked.map(b => b.time_slot);
        }

        res.json({
            success: true,
            availability,
            blocked_dates: blockedDates.map(b => b.blocked_date),
            booked_slots: bookedSlots
        });
    } catch (error) {
        console.error('Get Availability Error:', error);
        res.status(500).json({ success: false, message: 'Failed to get availability' });
    }
};

// ─── Book Appointment ─────────────────────────────────
exports.bookAppointment = async (req, res) => {
    try {
        const { doctor_id, appointment_date, time_slot, reason } = req.body;
        const patient_id = req.user.id;

        // Check if doctor exists and is approved
        const [doctors] = await db.execute(
            'SELECT id, name, email FROM doctors WHERE id = ? AND is_approved = TRUE AND is_active = TRUE',
            [doctor_id]
        );
        if (doctors.length === 0) {
            return res.status(404).json({ success: false, message: 'Doctor not found or not available' });
        }

        // Check for blocked date
        const [blocked] = await db.execute(
            'SELECT id FROM blocked_dates WHERE doctor_id = ? AND blocked_date = ?',
            [doctor_id, appointment_date]
        );
        if (blocked.length > 0) {
            return res.status(400).json({ success: false, message: 'Doctor is not available on this date' });
        }

        // Check for duplicate booking
        const [existing] = await db.execute(
            `SELECT id FROM appointments 
             WHERE doctor_id = ? AND appointment_date = ? AND time_slot = ? AND status IN ('pending', 'confirmed')`,
            [doctor_id, appointment_date, time_slot]
        );
        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: 'This time slot is already booked' });
        }

        // Check if patient already has appointment at same time
        const [patientConflict] = await db.execute(
            `SELECT id FROM appointments 
             WHERE patient_id = ? AND appointment_date = ? AND time_slot = ? AND status IN ('pending', 'confirmed')`,
            [patient_id, appointment_date, time_slot]
        );
        if (patientConflict.length > 0) {
            return res.status(409).json({ success: false, message: 'You already have an appointment at this time' });
        }

        // Generate unique appointment ID
        const appointment_uid = 'APT-' + uuidv4().substring(0, 8).toUpperCase();

        // Insert appointment
        const [result] = await db.execute(
            `INSERT INTO appointments (appointment_uid, patient_id, doctor_id, appointment_date, time_slot, reason, status) 
             VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
            [appointment_uid, patient_id, doctor_id, appointment_date, time_slot, reason || '']
        );

        // Get patient info for notification
        const [patients] = await db.execute('SELECT name, email FROM users WHERE id = ?', [patient_id]);

        // Send notifications
        await createNotification(patient_id, 'patient', 'Appointment Booked',
            `Your appointment (${appointment_uid}) with Dr. ${doctors[0].name} on ${appointment_date} at ${time_slot} is pending confirmation.`, 'booking');

        await createNotification(doctor_id, 'doctor', 'New Appointment Request',
            `New appointment (${appointment_uid}) from ${patients[0].name} on ${appointment_date} at ${time_slot}.`, 'booking');

        // Send emails
        await sendBookingConfirmation(patients[0].email, doctors[0].email, {
            appointment_uid,
            doctor_name: doctors[0].name,
            patient_name: patients[0].name,
            appointment_date,
            time_slot
        });

        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully',
            appointment: {
                id: result.insertId,
                appointment_uid,
                doctor_id,
                doctor_name: doctors[0].name,
                appointment_date,
                time_slot,
                status: 'pending'
            }
        });
    } catch (error) {
        console.error('Book Appointment Error:', error);
        res.status(500).json({ success: false, message: 'Failed to book appointment' });
    }
};

// ─── Get Upcoming Appointments ────────────────────────
exports.getUpcomingAppointments = async (req, res) => {
    try {
        const [appointments] = await db.execute(
            `SELECT a.*, d.name AS doctor_name, d.specialization, d.consultation_fee, d.profile_image AS doctor_image
             FROM appointments a
             JOIN doctors d ON a.doctor_id = d.id
             WHERE a.patient_id = ? AND a.appointment_date >= CURDATE() AND a.status IN ('pending', 'confirmed')
             ORDER BY a.appointment_date ASC, a.time_slot ASC`,
            [req.user.id]
        );
        res.json({ success: true, appointments });
    } catch (error) {
        console.error('Get Upcoming Error:', error);
        res.status(500).json({ success: false, message: 'Failed to get appointments' });
    }
};

// ─── Get Appointment History ──────────────────────────
exports.getAppointmentHistory = async (req, res) => {
    try {
        const [appointments] = await db.execute(
            `SELECT a.*, d.name AS doctor_name, d.specialization, d.consultation_fee, d.profile_image AS doctor_image
             FROM appointments a
             JOIN doctors d ON a.doctor_id = d.id
             WHERE a.patient_id = ? AND (a.appointment_date < CURDATE() OR a.status IN ('completed', 'cancelled'))
             ORDER BY a.appointment_date DESC, a.time_slot DESC`,
            [req.user.id]
        );
        res.json({ success: true, appointments });
    } catch (error) {
        console.error('Get History Error:', error);
        res.status(500).json({ success: false, message: 'Failed to get appointment history' });
    }
};

// ─── Cancel Appointment ───────────────────────────────
exports.cancelAppointment = async (req, res) => {
    try {
        const [appointments] = await db.execute(
            `SELECT a.*, d.name AS doctor_name, d.email AS doctor_email, u.name AS patient_name, u.email AS patient_email
             FROM appointments a
             JOIN doctors d ON a.doctor_id = d.id
             JOIN users u ON a.patient_id = u.id
             WHERE a.id = ? AND a.patient_id = ? AND a.status IN ('pending', 'confirmed')`,
            [req.params.id, req.user.id]
        );

        if (appointments.length === 0) {
            return res.status(404).json({ success: false, message: 'Appointment not found or cannot be cancelled' });
        }

        const apt = appointments[0];

        await db.execute("UPDATE appointments SET status = 'cancelled' WHERE id = ?", [req.params.id]);

        // Notifications
        await createNotification(apt.patient_id, 'patient', 'Appointment Cancelled',
            `Your appointment (${apt.appointment_uid}) on ${apt.appointment_date} has been cancelled.`, 'cancellation');
        await createNotification(apt.doctor_id, 'doctor', 'Appointment Cancelled',
            `Appointment (${apt.appointment_uid}) with ${apt.patient_name} on ${apt.appointment_date} has been cancelled by patient.`, 'cancellation');

        await sendCancellationAlert(apt.doctor_email, `Dr. ${apt.doctor_name}`, apt, 'doctor');

        res.json({ success: true, message: 'Appointment cancelled successfully' });
    } catch (error) {
        console.error('Cancel Error:', error);
        res.status(500).json({ success: false, message: 'Failed to cancel appointment' });
    }
};

// ─── Reschedule Appointment ───────────────────────────
exports.rescheduleAppointment = async (req, res) => {
    try {
        const { new_date, new_time_slot } = req.body;

        const [appointments] = await db.execute(
            `SELECT a.*, d.name AS doctor_name FROM appointments a
             JOIN doctors d ON a.doctor_id = d.id
             WHERE a.id = ? AND a.patient_id = ? AND a.status IN ('pending', 'confirmed')`,
            [req.params.id, req.user.id]
        );

        if (appointments.length === 0) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        const apt = appointments[0];

        // Check new slot availability
        const [conflict] = await db.execute(
            `SELECT id FROM appointments 
             WHERE doctor_id = ? AND appointment_date = ? AND time_slot = ? AND status IN ('pending', 'confirmed') AND id != ?`,
            [apt.doctor_id, new_date, new_time_slot, req.params.id]
        );
        if (conflict.length > 0) {
            return res.status(409).json({ success: false, message: 'New time slot is already booked' });
        }

        await db.execute(
            "UPDATE appointments SET appointment_date = ?, time_slot = ?, status = 'rescheduled' WHERE id = ?",
            [new_date, new_time_slot, req.params.id]
        );

        // Immediately set status back to pending after rescheduling
        await db.execute("UPDATE appointments SET status = 'pending' WHERE id = ?", [req.params.id]);

        await createNotification(apt.doctor_id, 'doctor', 'Appointment Rescheduled',
            `Appointment (${apt.appointment_uid}) has been rescheduled to ${new_date} at ${new_time_slot}.`, 'booking');

        res.json({ success: true, message: 'Appointment rescheduled successfully' });
    } catch (error) {
        console.error('Reschedule Error:', error);
        res.status(500).json({ success: false, message: 'Failed to reschedule appointment' });
    }
};

// ─── Get Prescription ─────────────────────────────────
exports.getPrescription = async (req, res) => {
    try {
        const [prescriptions] = await db.execute(
            `SELECT p.*, d.name AS doctor_name
             FROM prescriptions p
             JOIN doctors d ON p.doctor_id = d.id
             WHERE p.appointment_id = ? AND p.patient_id = ?`,
            [req.params.id, req.user.id]
        );

        if (prescriptions.length === 0) {
            return res.status(404).json({ success: false, message: 'No prescription found' });
        }

        res.json({ success: true, prescription: prescriptions[0] });
    } catch (error) {
        console.error('Get Prescription Error:', error);
        res.status(500).json({ success: false, message: 'Failed to get prescription' });
    }
};

// ─── Submit Review ────────────────────────────────────
exports.submitReview = async (req, res) => {
    try {
        const { doctor_id, appointment_id, rating, comment } = req.body;

        // Check appointment exists and is completed
        const [appointments] = await db.execute(
            "SELECT id FROM appointments WHERE id = ? AND patient_id = ? AND doctor_id = ? AND status = 'completed'",
            [appointment_id, req.user.id, doctor_id]
        );
        if (appointments.length === 0) {
            return res.status(400).json({ success: false, message: 'Can only review completed appointments' });
        }

        // Check if already reviewed
        const [existing] = await db.execute(
            'SELECT id FROM reviews WHERE patient_id = ? AND appointment_id = ?',
            [req.user.id, appointment_id]
        );
        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: 'Already reviewed this appointment' });
        }

        await db.execute(
            'INSERT INTO reviews (patient_id, doctor_id, appointment_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, doctor_id, appointment_id, rating, comment || '']
        );

        // Update doctor rating
        const [avgResult] = await db.execute(
            'SELECT AVG(rating) AS avg_rating, COUNT(*) AS total FROM reviews WHERE doctor_id = ?',
            [doctor_id]
        );
        await db.execute(
            'UPDATE doctors SET rating_avg = ?, total_reviews = ? WHERE id = ?',
            [avgResult[0].avg_rating, avgResult[0].total, doctor_id]
        );

        res.json({ success: true, message: 'Review submitted successfully' });
    } catch (error) {
        console.error('Submit Review Error:', error);
        res.status(500).json({ success: false, message: 'Failed to submit review' });
    }
};

// ─── Get Notifications ────────────────────────────────
exports.getNotifications = async (req, res) => {
    try {
        const [notifications] = await db.execute(
            "SELECT * FROM notifications WHERE user_id = ? AND user_type = 'patient' ORDER BY created_at DESC LIMIT 50",
            [req.user.id]
        );
        const [unread] = await db.execute(
            "SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND user_type = 'patient' AND is_read = FALSE",
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
            "UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ? AND user_type = 'patient'",
            [req.params.id, req.user.id]
        );
        res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        console.error('Mark Read Error:', error);
        res.status(500).json({ success: false, message: 'Failed to update notification' });
    }
};

// ─── Mark All Notifications Read ──────────────────────
exports.markAllNotificationsRead = async (req, res) => {
    try {
        await db.execute(
            "UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND user_type = 'patient'",
            [req.user.id]
        );
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Mark All Read Error:', error);
        res.status(500).json({ success: false, message: 'Failed to update notifications' });
    }
};
