const prisma = require('../config/db');
const slotService = require('../services/slot.service');

// GET /api/availability/slots?date=YYYY-MM-DD&serviceId=xxx  → عام
exports.getSlots = async (req, res) => {
  try {
    const { date, serviceId } = req.query;
    if (!date || !serviceId) {
      return res.status(400).json({ error: 'التاريخ ورقم الخدمة مطلوبين' });
    }
    const slots = await slotService.getAvailableSlots(date, serviceId);
    res.json(slots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'حدث خطأ أثناء جلب الأوقات المتاحة' });
  }
};

// ===== لوحة التحكم =====

// GET /api/admin/availability  → جدول الدوام الأسبوعي كامل
exports.getWeeklySchedule = async (req, res) => {
  try {
    const schedule = await prisma.availability.findMany({
      orderBy: { dayOfWeek: 'asc' },
    });
    res.json(schedule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب جدول الدوام' });
  }
};

// PUT /api/admin/availability  → تحديث/إضافة يوم بالجدول الأسبوعي
// body: { dayOfWeek, startTime, endTime, isActive }
exports.setDayAvailability = async (req, res) => {
  try {
    const { dayOfWeek, startTime, endTime, isActive } = req.body;
    if (dayOfWeek === undefined) {
      return res.status(400).json({ error: 'dayOfWeek مطلوب' });
    }

    const existing = await prisma.availability.findFirst({ where: { dayOfWeek } });

    let result;
    if (existing) {
      result = await prisma.availability.update({
        where: { id: existing.id },
        data: {
          ...(startTime !== undefined && { startTime }),
          ...(endTime !== undefined && { endTime }),
          ...(isActive !== undefined && { isActive }),
        },
      });
    } else {
      result = await prisma.availability.create({
        data: {
          dayOfWeek,
          startTime: startTime || '09:00',
          endTime: endTime || '17:00',
          isActive: isActive !== undefined ? isActive : true,
        },
      });
    }

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ أثناء تحديث الدوام' });
  }
};

// GET /api/admin/availability/blocked  → كل الحجوبات
exports.getBlockedSlots = async (req, res) => {
  try {
    const blocked = await prisma.blockedSlot.findMany({
      orderBy: { date: 'asc' },
    });
    res.json(blocked);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب الحجوبات' });
  }
};

// POST /api/admin/availability/blocked  → إضافة حجب (يوم كامل أو فترة)
exports.addBlockedSlot = async (req, res) => {
  try {
    const { date, startTime, endTime, reason } = req.body;
    if (!date) {
      return res.status(400).json({ error: 'التاريخ مطلوب' });
    }
    const blocked = await prisma.blockedSlot.create({
      data: { date: new Date(date), startTime, endTime, reason },
    });
    res.status(201).json(blocked);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ أثناء إضافة الحجب' });
  }
};

// DELETE /api/admin/availability/blocked/:id
exports.removeBlockedSlot = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.blockedSlot.delete({ where: { id } });
    res.json({ message: 'تم إلغاء الحجب' });
  } catch (error) {
    console.error(error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'الحجب غير موجود' });
    }
    res.status(500).json({ error: 'حدث خطأ أثناء إلغاء الحجب' });
  }
};