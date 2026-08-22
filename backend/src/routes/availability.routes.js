const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availability.controller');

router.get('/slots', availabilityController.getSlots);

module.exports = router;