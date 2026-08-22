const prisma = require('../config/db');
const resalaService = require('./resala.service');

const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;

// يحوّل أي صيغة رقم ليبي شائعة (0912345678 أو 218912345678 أو +218912345678) لصيغة Resala: 218912345678
function normalizeLibyanPhone(phone) {
  let digits = phone.replace(/[^0-9]/g, '');
  if (digits.startsWith('218')) return digits;
  if (digits.startsWith('0')) return `218${digits.slice(1)}`;
  if (digits.length === 9) return `218${digits}`;
  return digits;
}

exports.sendOtp = async (phone) => {
  const normalizedPhone = normalizeLibyanPhone(phone);

  // فترة تهدئة: منع إعادة الإرسال قبل مرور 60 ثانية على آخر رمز لنفس الرقم
  const recentOtp = await prisma.otp.findFirst({
    where: { phone, verified: false },
    orderBy: { createdAt: 'desc' },
  });

  if (recentOtp) {
    const secondsSinceLastSend = (Date.now() - new Date(recentOtp.lastSentAt).getTime()) / 1000;
    if (secondsSinceLastSend < RESEND_COOLDOWN_SECONDS) {
      const wait = Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSinceLastSend);
      const err = new Error(`الرجاء الانتظار ${wait} ثانية قبل طلب رمز جديد`);
      err.status = 429;
      throw err;
    }
  }

  const result = await resalaService.sendPin(normalizedPhone, {
    serviceName: 'عيادة هدى', // اسم العيادة كما سيظهر داخل نص الرسالة
  });

  // نمسح أي رموز قديمة غير مُتحقق منها لنفس الرقم قبل إنشاء رمز جديد
  await prisma.otp.deleteMany({ where: { phone, verified: false } });

  await prisma.otp.create({
    data: {
      phone,
      code: result.pin,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
      lastSentAt: new Date(),
      attempts: 0,
      verified: false,
    },
  });

  return { message: 'تم إرسال رمز التحقق' };
};

exports.verifyOtp = async (phone, inputCode) => {
  const otp = await prisma.otp.findFirst({
    where: { phone, verified: false },
    orderBy: { createdAt: 'desc' },
  });

  if (!otp) {
    const err = new Error('لا يوجد رمز تحقق فعّال، الرجاء طلب رمز جديد');
    err.status = 400;
    throw err;
  }

  if (new Date() > otp.expiresAt) {
    const err = new Error('انتهت صلاحية رمز التحقق، الرجاء طلب رمز جديد');
    err.status = 400;
    throw err;
  }

  if (otp.attempts >= MAX_ATTEMPTS) {
    const err = new Error('تم تجاوز الحد الأقصى للمحاولات، الرجاء طلب رمز جديد');
    err.status = 429;
    throw err;
  }

  if (otp.code !== inputCode) {
    await prisma.otp.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
    });
    const remaining = MAX_ATTEMPTS - (otp.attempts + 1);
    const err = new Error(`رمز التحقق غير صحيح، محاولات متبقية: ${remaining}`);
    err.status = 400;
    throw err;
  }

  await prisma.otp.update({ where: { id: otp.id }, data: { verified: true } });

  const patient = await prisma.patient.upsert({
    where: { phone },
    update: {},
    create: { phone, name: '' },
  });

  return patient;
};