const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middleware/auth');
const { sanitizeInputs } = require('../middleware/validate');

// All admin routes require authentication
router.use(verifyToken);
router.use(requireRole('admin'));
router.use(sanitizeInputs);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Manage Doctors
router.get('/doctors', adminController.getAllDoctors);
router.put('/doctors/:id/approve', adminController.approveDoctor);
router.put('/doctors/:id/reject', adminController.rejectDoctor);
router.put('/doctors/:id', adminController.editDoctor);
router.delete('/doctors/:id', adminController.removeDoctor);
router.get('/doctors/:id/performance', adminController.getDoctorPerformance);

// Manage Patients
router.get('/patients', adminController.getAllPatients);
router.put('/patients/:id/block', adminController.blockPatient);
router.put('/patients/:id/reset-password', adminController.resetPatientPassword);

// Manage Appointments
router.get('/appointments', adminController.getAllAppointments);
router.put('/appointments/:id/cancel', adminController.forceCancelAppointment);

// Reports & Analytics
router.get('/reports', adminController.getReports);

// System Settings
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

// Notifications
router.get('/notifications', adminController.getNotifications);
router.put('/notifications/:id/read', adminController.markNotificationRead);

module.exports = router;
