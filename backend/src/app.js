process.env.TZ = 'Africa/Cairo'; // ثبّت التايم زون الفعلي للعيادة

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const adminAuth = require('./middleware/adminAuth.middleware');
const { apiLimiter } = require('./middleware/rateLimit.middleware');

const app = express();

// Middleware أساسي
app.use(helmet());

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiLimiter);

// Health check — للتأكد إن السيرفر شغال
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// ==== Routes ====
app.use('/api/services', require('./routes/services.routes'));
app.use('/api/profile', require('./routes/profile.routes'));
app.use('/api/appointments', require('./routes/appointments.routes'));
app.use('/api/availability', require('./routes/availability.routes'));
app.use('/api/auth', require('./routes/auth.routes'));

// محمي بتسجيل دخول الأدمن (الدكتورة) — كل ما تحت /api/admin يحتاج توكن صالح
app.use('/api/admin', adminAuth, require('./routes/admin.routes'));

// معالج الأخطاء العام (يمسك أي خطأ ما تم التعامل معه)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'حدث خطأ بالسيرفر' });
});

// معالج المسارات غير الموجودة
app.use((req, res) => {
  res.status(404).json({ error: 'المسار غير موجود' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 السيرفر شغال على http://localhost:${PORT}`);
});