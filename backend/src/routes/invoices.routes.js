const express = require('express');
const router = express.Router();
const invoicesController = require('../controllers/invoices.controller');

router.get('/', invoicesController.getAllInvoices);
router.post('/', invoicesController.createInvoice);
router.put('/:id', invoicesController.updateInvoice);
router.delete('/:id', invoicesController.deleteInvoice);

module.exports = router;