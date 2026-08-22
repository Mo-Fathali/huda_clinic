const prisma = require('../config/db');
const slotService = require('../services/slot.service');
const emailService = require('../services/email.service');

// ===== الزبون =====

// POST /api/appointments  (محتاج توكن — بعد OTP)
// body: { serviceId, date, startTime }
exports.createAppointment = async (req, res) => {
  try {
    const { patientId } = req.patient; // من otpVerify.middleware
    const { serviceId, date, startTime } = req.body;

    if (!serviceId || !date || !startTime) {
      return res.status(400).json({ error: 'الخدمة والتاريخ والوقت مطلوبين' });
    }

    // تحقق: الزبون مو محظور
    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (patient.isBlacklisted) {
      return res.status(403).json({ error: 'هذا الحساب محظور من الحجز، تواصل مع العيادة' });
    }

    // طبقة: حجز pending/confirmed واحد بس بنفس الوقت لنفس الزبون
    const now = new Date();
    const existingUpcoming = await prisma.appointment.findFirst({
      where: {
        patientId,
        status: { in: ['pending', 'confirmed'] },
        date: { gte: now },
      },
    });
    if (existingUpcoming) {
      return res.status(400).json({ error: 'لديك حجز قادم بالفعل، لا يمكن حجز موعد آخر' });
    }

    // تحقق إن الخدمة موجودة ونشطة
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service || !service.isActive) {
      return res.status(404).json({ error: 'الخدمة غير متاحة' });
    }

    // كل التحقق من توفر السلوت + الإنشاء بيحصل جوه transaction واحدة
    // عشان نمنع اثنين يحجزوا نفس اللحظة بالظبط (race condition)
    const appointment = await prisma.$transaction(async (tx) => {
      const availableSlots = await slotService.getAvailableSlots(date, serviceId, tx);
      const slot = availableSlots.find(s => s.startTime === startTime);

      if (!slot) {
        const err = new Error('هذا الوقت لم يعد متاحاً، الرجاء اختيار وقت آخر');
        err.status = 409;
        throw err;
      }

      return tx.appointment.create({
        data: {
          patientId,
          serviceId,
          date: new Date(date),
          startTime: slot.startTime,
          endTime: slot.endTime,
          status: 'confirmed', // OTP اتحقق منه قبل الوصول هنا
          otpVerified: true,
        },
        include: { service: true, patient: true },
      });
    });

   res.status(201).json(appointment);

emailService.sendNewBookingNotification(appointment).catch(() => {});
  } catch (error) {
    // الحماية الأخيرة: لو اثنين عدّوا فحص التوفر بنفس اللحظة، الـ DB unique constraint هيرفض واحد منهم
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'هذا الوقت تم حجزه للتو، الرجاء اختيار وقت آخر' });
    }
    if (error.status === 409) {
      return res.status(409).json({ error: error.message });
    }
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ أثناء إنشاء الحجز' });
  }



};

// GET /api/appointments  (محتاج توكن) → حجوزات الزبون نفسه
exports.getMyAppointments = async (req, res) => {
  try {
    const { patientId } = req.patient;
    const appointments = await prisma.appointment.findMany({
      where: { patientId },
      include: { service: true },
      orderBy: { date: 'desc' },
    });
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب الحجوزات' });
  }
};

// GET /api/appointments/:id  (محتاج توكن) → تفاصيل حجز وحد (لصفحة الوصل/PDF)
exports.getAppointmentById = async (req, res) => {
  try {
    const { patientId } = req.patient;
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { service: true, patient: true },
    });

    if (!appointment) {
      return res.status(404).json({ error: 'الحجز غير موجود' });
    }
    if (appointment.patientId !== patientId) {
      return res.status(403).json({ error: 'غير مصرح لك بعرض هذا الحجز' });
    }

    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب الحجز' });
  }
};

// PUT /api/appointments/:id/cancel  (محتاج توكن المريضة) → إلغاء من عند المريضة نفسها
exports.cancelMyAppointment = async (req, res) => {
  try {
    const { patientId } = req.patient;
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { service: true, patient: true },
    });

    if (!appointment) {
      return res.status(404).json({ error: 'الحجز غير موجود' });
    }
    if (appointment.patientId !== patientId) {
      return res.status(403).json({ error: 'غير مصرح لك بإلغاء هذا الحجز' });
    }
    if (appointment.status === 'cancelled') {
      return res.status(400).json({ error: 'الحجز ملغى بالفعل' });
    }
    if (appointment.status === 'completed') {
      return res.status(400).json({ error: 'لا يمكن إلغاء حجز مكتمل' });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: 'cancelled' },
      include: { service: true, patient: true },
    });

    res.json(updated);

    emailService.sendCancellationNotification(updated).catch(() => {});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ أثناء إلغاء الحجز' });
  }
};

// ===== لوحة التحكم =====

// GET /api/admin/appointments?status=&date=  → كل الحجوزات مع فلاتر
exports.getAllAppointments = async (req, res) => {
  try {
    const { status, date } = req.query;
    const where = {};
    if (status) where.status = status;
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      where.date = { gte: start, lte: end };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: { service: true, patient: true },
      orderBy: { date: 'asc' },
    });
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب الحجوزات' });
  }
};

// PUT /api/admin/appointments/:id  → تعديل موعد/حالة (تعديل، تأكيد، إتمام، no-show)
// body: { date?, startTime?, endTime?, status?, notes? }
exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, startTime, endTime, status, notes } = req.body;

    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment) {
      return res.status(404).json({ error: 'الحجز غير موجود' });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        ...(date !== undefined && { date: new Date(date) }),
        ...(startTime !== undefined && { startTime }),
        ...(endTime !== undefined && { endTime }),
        ...(status !== undefined && { status }),
        ...(notes !== undefined && { notes }),
      },
      include: { service: true, patient: true },
    });

    // طبقة: تتبع الـ no-show وحظر تلقائي بعد التكرار
    if (status === 'no-show') {
      const patient = await prisma.patient.update({
        where: { id: appointment.patientId },
        data: { noShowCount: { increment: 1 } },
      });
      if (patient.noShowCount >= 3) {
        await prisma.patient.update({
          where: { id: patient.id },
          data: { isBlacklisted: true },
        });
      }
    }

    // TODO: هنا لاحقاً نستدعي NotificationService لو تغير الموعد أو الحالة
    // if (date || startTime || status === 'cancelled') { await notificationService.notify(...) }

    res.json(updated);
  } catch (error) {
    console.error(error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'هذا الوقت محجوز لموعد آخر' });
    }
    res.status(500).json({ error: 'حدث خطأ أثناء تعديل الحجز' });
  }
};

// DELETE /api/admin/appointments/:id  → إلغاء (soft — يحول لحالة cancelled)
exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status: 'cancelled' },
    });
    res.json({ message: 'تم إلغاء الحجز', appointment });
  } catch (error) {
    console.error(error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'الحجز غير موجود' });
    }
    res.status(500).json({ error: 'حدث خطأ أثناء إلغاء الحجز' });
  }
};