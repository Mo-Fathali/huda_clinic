const rateLimit = require('express-rate-limit');

// حد عام على كل الـ API
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 200,
  message: { error: 'طلبات كتير، حاول بعد شوية' },
  standardHeaders: true,
  legacyHeaders: false,
});

// حد أخص على مسار إنشاء الحجز
exports.bookingLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: { error: 'محاولات حجز كتير، حاول بعد شوية' },
  standardHeaders: true,
  legacyHeaders: false,
});