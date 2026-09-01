const express = require('express');
const router = express.Router();
const suppliersController = require('../controllers/suppliers.controller');

router.get('/', suppliersController.getAllSuppliers);
router.get('/:id', suppliersController.getSupplierById);
router.post('/', suppliersController.createSupplier);
router.put('/:id', suppliersController.updateSupplier);
router.delete('/:id', suppliersController.deleteSupplier);

router.post('/:id/transactions', suppliersController.addTransaction);
router.delete('/transactions/:transactionId', suppliersController.deleteTransaction);

module.exports = router;