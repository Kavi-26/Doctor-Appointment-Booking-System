const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
    getDashboardStats,
    getAllDoctors,
    approveDoctor,
    rejectDoctor,
    editDoctor,
    removeDoctor,
    getDoctorPerformance,
    getAllPatients,
    togglePatientBlock,
    resetPatientPassword,
    getAllAppointments,
    forceCancelAppointment,
    getReports,
    getSettings,
    updateSettings
} = require('../controllers/adminController');

// All admin routes require authentication + admin role
router.use(verifyToken, requireRole('admin'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// Doctor Management
router.get('/doctors', getAllDoctors);
router.put('/doctors/:id/approve', approveDoctor);
router.put('/doctors/:id/reject', rejectDoctor);
router.put('/doctors/:id', editDoctor);
router.delete('/doctors/:id', removeDoctor);
router.get('/doctors/:id/performance', getDoctorPerformance);

// Patient Management
router.get('/patients', getAllPatients);
router.put('/patients/:id/block', togglePatientBlock);
router.put('/patients/:id/reset-password', resetPatientPassword);

// Appointment Management
router.get('/appointments', getAllAppointments);
router.put('/appointments/:id/cancel', forceCancelAppointment);

// Reports
router.get('/reports', getReports);

// Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

module.exports = router;
