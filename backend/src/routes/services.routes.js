const express = require('express');
const router = express.Router();
const servicesController = require('../controllers/services.controller');

// عام — للصفحة الرئيسية
router.get('/', servicesController.getActiveServices);

module.exports = router;