const express = require('express');
const router = express.Router();
const multer = require('multer');
const patientsController = require('../controllers/patients.controller');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('يجب أن يكون الملف بصيغة Excel (.xlsx)'));
  },
});

router.get('/export', patientsController.exportPatients);
router.post('/import', upload.single('file'), patientsController.importPatients);

router.get('/', patientsController.getAllPatients);
router.get('/:id', patientsController.getPatientById);
router.put('/:id', patientsController.updatePatient);
router.put('/:id/medical-record', patientsController.upsertMedicalRecord);

module.exports = router;