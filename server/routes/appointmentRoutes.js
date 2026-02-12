const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const auth = require('../middleware/auth');

router.post('/', auth, appointmentController.bookAppointment);
router.get('/my', auth, appointmentController.getMyAppointments);
router.put('/:id/status', auth, appointmentController.updateStatus);

module.exports = router;
