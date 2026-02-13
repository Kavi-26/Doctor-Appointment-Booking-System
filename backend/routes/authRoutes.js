const express = require('express');
const router = express.Router();
const {
    patientRegister,
    patientLogin,
    doctorRegister,
    doctorLogin,
    adminLogin
} = require('../controllers/authController');

// Patient routes
router.post('/patient/register', patientRegister);
router.post('/patient/login', patientLogin);

// Doctor routes
router.post('/doctor/register', doctorRegister);
router.post('/doctor/login', doctorLogin);

// Admin routes
router.post('/admin/login', adminLogin);

module.exports = router;
