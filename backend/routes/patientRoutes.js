const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { verifyToken, requireRole } = require('../middleware/auth');
const { sanitizeInputs } = require('../middleware/validate');
const upload = require('../middleware/upload');

// All patient routes require authentication
router.use(verifyToken);
router.use(requireRole('patient'));
router.use(sanitizeInputs);

// Profile
router.get('/profile', patientController.getProfile);
router.put('/profile', upload.single('profile_image'), patientController.updateProfile);

// Doctor Search & View
router.get('/doctors', patientController.searchDoctors);
router.get('/doctors/:id', patientController.getDoctorProfile);
router.get('/doctors/:id/availability', patientController.getDoctorAvailability);

// Appointments
router.post('/appointments', patientController.bookAppointment);
router.get('/appointments/upcoming', patientController.getUpcomingAppointments);
router.get('/appointments/history', patientController.getAppointmentHistory);
router.put('/appointments/:id/cancel', patientController.cancelAppointment);
router.put('/appointments/:id/reschedule', patientController.rescheduleAppointment);
router.get('/appointments/:id/prescription', patientController.getPrescription);

// Reviews
router.post('/reviews', patientController.submitReview);

// Notifications
router.get('/notifications', patientController.getNotifications);
router.put('/notifications/:id/read', patientController.markNotificationRead);
router.put('/notifications/read-all', patientController.markAllNotificationsRead);

module.exports = router;
