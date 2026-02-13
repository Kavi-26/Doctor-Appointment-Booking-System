const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
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
} = require('../controllers/doctorController');

// All doctor routes require authentication + doctor role
router.use(verifyToken, requireRole('doctor'));

// Profile
router.get('/profile', getProfile);
router.put('/profile', upload.single('profile_image'), updateProfile);

// Appointments
router.get('/appointments/today', getTodayAppointments);
router.get('/appointments/upcoming', getUpcomingAppointments);
router.put('/appointments/:id/accept', acceptAppointment);
router.put('/appointments/:id/reject', rejectAppointment);
router.put('/appointments/:id/complete', completeAppointment);
router.put('/appointments/:id/notes', addNotes);
router.post('/appointments/:id/prescription', upload.single('prescription'), uploadPrescription);

// Availability
router.get('/availability', getAvailability);
router.post('/availability', setAvailability);

// Blocked Dates
router.get('/blocked-dates', getBlockedDates);
router.post('/blocked-dates', blockDate);
router.delete('/blocked-dates/:id', unblockDate);

// Earnings
router.get('/earnings', getEarnings);

// Notifications
router.get('/notifications', getNotifications);

module.exports = router;
