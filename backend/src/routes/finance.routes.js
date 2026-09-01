const express = require('express');
const router = express.Router();
const financeController = require('../controllers/finance.controller');

router.get('/summary', financeController.getSummary);

module.exports = router;