const express = require('express');
const router = express.Router();
const appointmentsController = require('../controllers/appointments.controller');
const otpVerify = require('../middleware/otpVerify.middleware');
const { bookingLimiter } = require('../middleware/rateLimit.middleware');

router.post('/', bookingLimiter, otpVerify, appointmentsController.createAppointment);
router.get('/', otpVerify, appointmentsController.getMyAppointments);
router.get('/:id', otpVerify, appointmentsController.getAppointmentById);
router.put('/:id/cancel', otpVerify, appointmentsController.cancelMyAppointment);

module.exports = router;