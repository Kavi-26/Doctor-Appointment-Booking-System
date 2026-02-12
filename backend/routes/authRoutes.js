const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { validatePatientRegistration, validateDoctorRegistration, sanitizeInputs } = require('../middleware/validate');

// Sanitize all inputs
router.use(sanitizeInputs);

// Patient
router.post('/patient/register', validatePatientRegistration, authController.patientRegister);
router.post('/patient/login', authController.patientLogin);

// Doctor
router.post('/doctor/register', validateDoctorRegistration, authController.doctorRegister);
router.post('/doctor/login', authController.doctorLogin);

// Admin
router.post('/admin/login', authController.adminLogin);

// Current User (any authenticated user)
router.get('/me', verifyToken, authController.getCurrentUser);

module.exports = router;
