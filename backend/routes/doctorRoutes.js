const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { verifyToken, requireRole } = require('../middleware/auth');
const { sanitizeInputs } = require('../middleware/validate');
const upload = require('../middleware/upload');

// All doctor routes require authentication
router.use(verifyToken);
router.use(requireRole('doctor'));
router.use(sanitizeInputs);

// Profile
router.get('/profile', doctorController.getProfile);
router.put('/profile', upload.single('profile_image'), doctorController.updateProfile);

// Appointments
router.get('/appointments/today', doctorController.getTodayAppointments);
router.get('/appointments/upcoming', doctorController.getUpcomingAppointments);
router.get('/appointments', doctorController.getAllAppointments);
router.put('/appointments/:id/accept', doctorController.acceptAppointment);
router.put('/appointments/:id/reject', doctorController.rejectAppointment);
router.put('/appointments/:id/complete', doctorController.completeAppointment);
router.put('/appointments/:id/notes', doctorController.addNotes);
router.post('/appointments/:id/prescription', upload.single('prescription'), doctorController.uploadPrescription);

// Availability
router.get('/availability', doctorController.getAvailability);
router.post('/availability', doctorController.setAvailability);
router.get('/blocked-dates', doctorController.getBlockedDates);
router.post('/blocked-dates', doctorController.blockDate);
router.delete('/blocked-dates/:date', doctorController.unblockDate);

// Earnings
router.get('/earnings', doctorController.getEarnings);

// Notifications
router.get('/notifications', doctorController.getNotifications);
router.put('/notifications/:id/read', doctorController.markNotificationRead);

module.exports = router;
