const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
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
} = require('../controllers/patientController');

// All patient routes require authentication + patient role
router.use(verifyToken, requireRole('patient'));

// Profile
router.get('/profile', getProfile);
router.put('/profile', upload.single('profile_image'), updateProfile);

// Search & View Doctors
router.get('/doctors', searchDoctors);
router.get('/doctors/:id', viewDoctor);
router.get('/doctors/:id/availability', checkAvailability);
router.get('/specializations', getSpecializations);

// Appointments
router.post('/appointments', bookAppointment);
router.get('/appointments/upcoming', getUpcomingAppointments);
router.get('/appointments/history', getAppointmentHistory);
router.put('/appointments/:id/cancel', cancelAppointment);
router.put('/appointments/:id/reschedule', rescheduleAppointment);

// Reviews
router.post('/reviews', submitReview);

// Notifications
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);

module.exports = router;
