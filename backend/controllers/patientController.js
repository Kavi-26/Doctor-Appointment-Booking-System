const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { notifyBookingConfirmation, notifyCancellation, createNotification } = require('../services/notificationService');

// ============================================
// GET PATIENT PROFILE
// ============================================
const getProfile = async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, name, email, phone, age, gender, profile_image, created_at FROM users WHERE id = ?',
            [req.user.id]
        );
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        res.json({ success: true, data: users[0] });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ============================================
// UPDATE PATIENT PROFILE
// ============================================
const updateProfile = async (req, res) => {
    try {
        const { name, phone, age, gender } = req.body;
        const profile_image = req.file ? `/uploads/profiles/${req.file.filename}` : undefined;

        let query = 'UPDATE users SET ';
        const params = [];
        const updates = [];

        if (name) { updates.push('name = ?'); params.push(name); }
        if (phone) { updates.push('phone = ?'); params.push(phone); }
        if (age) { updates.push('age = ?'); params.push(age); }
        if (gender) { updates.push('gender = ?'); params.push(gender); }
        if (profile_image) { updates.push('profile_image = ?'); params.push(profile_image); }

        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: 'No fields to update.' });
        }

        query += updates.join(', ') + ' WHERE id = ?';
        params.push(req.user.id);

        await db.query(query, params);
        res.json({ success: true, message: 'Profile updated successfully.' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ============================================
// SEARCH DOCTORS
// ============================================
const searchDoctors = async (req, res) => {
    try {
        const { specialization, experience, rating, search, fee_min, fee_max } = req.query;

        let query = `
      SELECT id, name, email, phone, qualification, specialization, experience,
             consultation_fee, bio, profile_image, rating_avg, total_reviews
      FROM doctors
      WHERE is_approved = TRUE AND is_active = TRUE
    `;
        const params = [];

        if (specialization) {
            query += ' AND specialization = ?';
            params.push(specialization);
        }
        if (experience) {
            query += ' AND experience >= ?';
            params.push(parseInt(experience));
        }
        if (rating) {
            query += ' AND rating_avg >= ?';
            params.push(parseFloat(rating));
        }
        if (fee_min) {
            query += ' AND consultation_fee >= ?';
            params.push(parseFloat(fee_min));
        }
        if (fee_max) {
            query += ' AND consultation_fee <= ?';
            params.push(parseFloat(fee_max));
        }
        if (search) {
            query += ' AND (name LIKE ? OR specialization LIKE ? OR qualification LIKE ?)';
            const s = `%${search}%`;
            params.push(s, s, s);
        }

        query += ' ORDER BY rating_avg DESC, experience DESC';

        const [doctors] = await db.query(query, params);
        res.json({ success: true, data: doctors });
    } catch (error) {
        console.error('Search doctors error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ============================================
// VIEW SINGLE DOCTOR PROFILE
// ============================================
const viewDoctor = async (req, res) => {
    try {
        const [doctors] = await db.query(
            `SELECT id, name, email, phone, qualification, specialization, experience,
              consultation_fee, bio, profile_image, rating_avg, total_reviews
       FROM doctors WHERE id = ? AND is_approved = TRUE AND is_active = TRUE`,
            [req.params.id]
        );

        if (doctors.length === 0) {
            return res.status(404).json({ success: false, message: 'Doctor not found.' });
        }

        // Get reviews
        const [reviews] = await db.query(
            `SELECT r.*, u.name AS patient_name FROM reviews r
       JOIN users u ON r.patient_id = u.id
       WHERE r.doctor_id = ? ORDER BY r.created_at DESC LIMIT 10`,
            [req.params.id]
        );

        res.json({ success: true, data: { ...doctors[0], reviews } });
    } catch (error) {
        console.error('View doctor error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ============================================
// CHECK DOCTOR AVAILABILITY
// ============================================
const checkAvailability = async (req, res) => {
    try {
        const doctorId = req.params.id;
        const { date } = req.query;

        // Get doctor's availability schedule
        const [availability] = await db.query(
            'SELECT * FROM availability WHERE doctor_id = ? AND is_available = TRUE',
            [doctorId]
        );

        // Get blocked dates
        const [blockedDates] = await db.query(
            'SELECT blocked_date FROM blocked_dates WHERE doctor_id = ?',
            [doctorId]
        );

        // Get booked slots for the specified date
        let bookedSlots = [];
        if (date) {
            const [booked] = await db.query(
                'SELECT time_slot FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND status IN (?, ?)',
                [doctorId, date, 'pending', 'confirmed']
            );
            bookedSlots = booked.map(b => b.time_slot);
        }

        res.json({
            success: true,
            data: {
                schedule: availability,
                blockedDates: blockedDates.map(d => d.blocked_date),
                bookedSlots
            }
        });
    } catch (error) {
        console.error('Check availability error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ============================================
// BOOK APPOINTMENT
// ============================================
const bookAppointment = async (req, res) => {
    try {
        const { doctor_id, date, time_slot, reason } = req.body;
        const patient_id = req.user.id;

        if (!doctor_id || !date || !time_slot) {
            return res.status(400).json({ success: false, message: 'Doctor, date, and time slot are required.' });
        }

        // Verify doctor exists and is approved
        const [doctors] = await db.query('SELECT * FROM doctors WHERE id = ? AND is_approved = TRUE AND is_active = TRUE', [doctor_id]);
        if (doctors.length === 0) {
            return res.status(404).json({ success: false, message: 'Doctor not found.' });
        }

        // Check if date is blocked
        const [blocked] = await db.query(
            'SELECT id FROM blocked_dates WHERE doctor_id = ? AND blocked_date = ?',
            [doctor_id, date]
        );
        if (blocked.length > 0) {
            return res.status(400).json({ success: false, message: 'Doctor is not available on this date.' });
        }

        // Check for duplicate booking (same doctor, date, time)
        const [existing] = await db.query(
            'SELECT id FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND time_slot = ? AND status IN (?, ?)',
            [doctor_id, date, time_slot, 'pending', 'confirmed']
        );
        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: 'This time slot is already booked.' });
        }

        // Check if patient already has an appointment at this time
        const [patientConflict] = await db.query(
            'SELECT id FROM appointments WHERE patient_id = ? AND appointment_date = ? AND time_slot = ? AND status IN (?, ?)',
            [patient_id, date, time_slot, 'pending', 'confirmed']
        );
        if (patientConflict.length > 0) {
            return res.status(409).json({ success: false, message: 'You already have an appointment at this time.' });
        }

        // Generate unique appointment ID
        const appointment_uid = 'APT-' + uuidv4().substring(0, 8).toUpperCase();

        // Create appointment
        const [result] = await db.query(
            'INSERT INTO appointments (appointment_uid, patient_id, doctor_id, appointment_date, time_slot, reason) VALUES (?, ?, ?, ?, ?, ?)',
            [appointment_uid, patient_id, doctor_id, date, time_slot, reason || '']
        );

        // Get patient info for notification
        const [patients] = await db.query('SELECT name, email FROM users WHERE id = ?', [patient_id]);

        // Send notifications
        await notifyBookingConfirmation(
            { appointment_uid, patient_id, doctor_id, appointment_date: date, time_slot },
            patients[0].email,
            doctors[0].email,
            patients[0].name,
            doctors[0].name
        );

        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully.',
            data: {
                id: result.insertId,
                appointment_uid,
                doctor_name: doctors[0].name,
                date,
                time_slot,
                status: 'pending'
            }
        });
    } catch (error) {
        console.error('Book appointment error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ============================================
// GET UPCOMING APPOINTMENTS
// ============================================
const getUpcomingAppointments = async (req, res) => {
    try {
        const [appointments] = await db.query(
            `SELECT a.*, d.name AS doctor_name, d.specialization, d.profile_image AS doctor_image, d.consultation_fee
       FROM appointments a
       JOIN doctors d ON a.doctor_id = d.id
       WHERE a.patient_id = ? AND a.appointment_date >= CURDATE() AND a.status IN ('pending', 'confirmed')
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
// GET APPOINTMENT HISTORY
// ============================================
const getAppointmentHistory = async (req, res) => {
    try {
        const [appointments] = await db.query(
            `SELECT a.*, d.name AS doctor_name, d.specialization, d.profile_image AS doctor_image
       FROM appointments a
       JOIN doctors d ON a.doctor_id = d.id
       WHERE a.patient_id = ?
       ORDER BY a.appointment_date DESC, a.time_slot DESC`,
            [req.user.id]
        );
        res.json({ success: true, data: appointments });
    } catch (error) {
        console.error('Get appointment history error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ============================================
// CANCEL APPOINTMENT
// ============================================
const cancelAppointment = async (req, res) => {
    try {
        const [appointments] = await db.query(
            `SELECT a.*, u.name AS patient_name, u.email AS patient_email, d.name AS doctor_name, d.email AS doctor_email
       FROM appointments a
       JOIN users u ON a.patient_id = u.id
       JOIN doctors d ON a.doctor_id = d.id
       WHERE a.id = ? AND a.patient_id = ?`,
            [req.params.id, req.user.id]
        );

        if (appointments.length === 0) {
            return res.status(404).json({ success: false, message: 'Appointment not found.' });
        }

        const appt = appointments[0];
        if (['cancelled', 'completed'].includes(appt.status)) {
            return res.status(400).json({ success: false, message: `Cannot cancel a ${appt.status} appointment.` });
        }

        await db.query('UPDATE appointments SET status = ? WHERE id = ?', ['cancelled', req.params.id]);

        // Send cancellation notification
        await notifyCancellation(appt, 'patient', appt.patient_email, appt.doctor_email, appt.patient_name, appt.doctor_name);

        res.json({ success: true, message: 'Appointment cancelled successfully.' });
    } catch (error) {
        console.error('Cancel appointment error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ============================================
// RESCHEDULE APPOINTMENT
// ============================================
const rescheduleAppointment = async (req, res) => {
    try {
        const { date, time_slot } = req.body;

        if (!date || !time_slot) {
            return res.status(400).json({ success: false, message: 'New date and time slot are required.' });
        }

        const [appointments] = await db.query(
            'SELECT * FROM appointments WHERE id = ? AND patient_id = ?',
            [req.params.id, req.user.id]
        );

        if (appointments.length === 0) {
            return res.status(404).json({ success: false, message: 'Appointment not found.' });
        }

        const appt = appointments[0];
        if (['cancelled', 'completed'].includes(appt.status)) {
            return res.status(400).json({ success: false, message: `Cannot reschedule a ${appt.status} appointment.` });
        }

        // Check new slot availability
        const [conflict] = await db.query(
            'SELECT id FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND time_slot = ? AND status IN (?, ?) AND id != ?',
            [appt.doctor_id, date, time_slot, 'pending', 'confirmed', req.params.id]
        );
        if (conflict.length > 0) {
            return res.status(409).json({ success: false, message: 'New time slot is not available.' });
        }

        await db.query(
            'UPDATE appointments SET appointment_date = ?, time_slot = ?, status = ? WHERE id = ?',
            [date, time_slot, 'rescheduled', req.params.id]
        );

        res.json({ success: true, message: 'Appointment rescheduled successfully.' });
    } catch (error) {
        console.error('Reschedule appointment error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ============================================
// SUBMIT REVIEW
// ============================================
const submitReview = async (req, res) => {
    try {
        const { doctor_id, appointment_id, rating, comment } = req.body;

        if (!doctor_id || !appointment_id || !rating) {
            return res.status(400).json({ success: false, message: 'Doctor ID, appointment ID, and rating are required.' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
        }

        // Verify the appointment belongs to this patient and is completed
        const [appt] = await db.query(
            'SELECT id FROM appointments WHERE id = ? AND patient_id = ? AND doctor_id = ? AND status = ?',
            [appointment_id, req.user.id, doctor_id, 'completed']
        );
        if (appt.length === 0) {
            return res.status(400).json({ success: false, message: 'Can only review completed appointments.' });
        }

        // Check for existing review
        const [existing] = await db.query(
            'SELECT id FROM reviews WHERE patient_id = ? AND appointment_id = ?',
            [req.user.id, appointment_id]
        );
        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: 'You have already reviewed this appointment.' });
        }

        await db.query(
            'INSERT INTO reviews (patient_id, doctor_id, appointment_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, doctor_id, appointment_id, rating, comment || '']
        );

        // Update doctor's average rating
        const [ratingData] = await db.query(
            'SELECT AVG(rating) AS avg_rating, COUNT(*) AS total FROM reviews WHERE doctor_id = ?',
            [doctor_id]
        );
        await db.query(
            'UPDATE doctors SET rating_avg = ?, total_reviews = ? WHERE id = ?',
            [ratingData[0].avg_rating, ratingData[0].total, doctor_id]
        );

        res.status(201).json({ success: true, message: 'Review submitted successfully.' });
    } catch (error) {
        console.error('Submit review error:', error);
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
            [req.user.id, 'patient']
        );
        res.json({ success: true, data: notifications });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ============================================
// MARK NOTIFICATION AS READ
// ============================================
const markNotificationRead = async (req, res) => {
    try {
        await db.query(
            'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ? AND user_type = ?',
            [req.params.id, req.user.id, 'patient']
        );
        res.json({ success: true, message: 'Notification marked as read.' });
    } catch (error) {
        console.error('Mark notification read error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ============================================
// GET SPECIALIZATIONS LIST
// ============================================
const getSpecializations = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT DISTINCT specialization FROM doctors WHERE is_approved = TRUE AND is_active = TRUE ORDER BY specialization'
        );
        res.json({ success: true, data: rows.map(r => r.specialization) });
    } catch (error) {
        console.error('Get specializations error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    searchDoctors,
    viewDoctor,
    checkAvailability,
    bookAppointment,
    getUpcomingAppointments,
    getAppointmentHistory,
    cancelAppointment,
    rescheduleAppointment,
    submitReview,
    getNotifications,
    markNotificationRead,
    getSpecializations
};
