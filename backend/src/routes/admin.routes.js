const express = require('express');
const router = express.Router();
const servicesController = require('../controllers/services.controller');
const profileController = require('../controllers/profile.controller');
const availabilityController = require('../controllers/availability.controller');
const appointmentsController = require('../controllers/appointments.controller');


router.get('/services', servicesController.getAllServices);
router.post('/services', servicesController.createService);
router.put('/services/:id', servicesController.updateService);
router.delete('/services/:id', servicesController.deleteService);

router.put('/profile', profileController.updateProfile);

router.get('/availability', availabilityController.getWeeklySchedule);
router.put('/availability', availabilityController.setDayAvailability);
router.get('/availability/blocked', availabilityController.getBlockedSlots);
router.post('/availability/blocked', availabilityController.addBlockedSlot);
router.delete('/availability/blocked/:id', availabilityController.removeBlockedSlot);
router.get('/appointments', appointmentsController.getAllAppointments);
router.put('/appointments/:id', appointmentsController.updateAppointment);
router.delete('/appointments/:id', appointmentsController.cancelAppointment);
router.use('/patients', require('./patients.routes'));
router.use('/invoices', require('./invoices.routes'));
router.use('/suppliers', require('./suppliers.routes'));
router.use('/finance', require('./finance.routes'));

module.exports = router;