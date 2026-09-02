// backend/src/controllers/auth.controller.js

const jwt = require('jsonwebtoken');
const otpService = require('../services/otp.service');
const prisma = require('../config/db');

function isValidPhone(phone) {
  return /^\+?[0-9]{8,15}$/.test(phone);
}

// POST /api/auth/send-otp   body: { phone }
exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'رقم الهاتف مطلوب' });
    }
    if (!isValidPhone(phone)) {
      return res.status(400).json({ error: 'رقم الهاتف غير صحيح' });
    }
    const result = await otpService.sendOtp(phone);
    res.json(result);
  } catch (error) {
    res.status(error.status || 400).json({ error: error.message });
  }
};

// POST /api/auth/verify-otp   body: { phone, code, name? }
exports.verifyOtp = async (req, res) => {
  try {
    const { phone, code, name } = req.body;
    if (!phone || !code) {
      return res.status(400).json({ error: 'رقم الهاتف والرمز مطلوبين' });
    }

    const patient = await otpService.verifyOtp(phone, code);

    // لو أول مرة والاسم متوفر، حدّثه
    if (name && !patient.name) {
      await prisma.patient.update({ where: { id: patient.id }, data: { name } });
    }

    // تحقق البلاك ليست
    if (patient.isBlacklisted) {
      return res.status(403).json({ error: 'هذا الرقم محظور من الحجز، تواصل مع العيادة' });
    }

    const token = jwt.sign(
      { patientId: patient.id, phone: patient.phone },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({ token, patient });
  } catch (error) {
    res.status(error.status || 400).json({ error: error.message });
  }
};
