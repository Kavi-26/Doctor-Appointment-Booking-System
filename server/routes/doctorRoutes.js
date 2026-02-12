const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', doctorController.getAllDoctors);
router.get('/:id', doctorController.getDoctorById);

// Protected routes (Doctor only - add role check later if needed)
router.post('/profile', auth, doctorController.createDoctorProfile);

module.exports = router;
