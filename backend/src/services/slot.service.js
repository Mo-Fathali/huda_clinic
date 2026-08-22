const prisma = require('../config/db');

// يحول "09:00" لعدد دقائق من بداية اليوم (540)
function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

// يحول عدد الدقائق رجوع لصيغة "09:00"
function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

// client اختياري: يسمح باستدعاء الدالة جوه Prisma transaction (tx) بدل الـ prisma العادي
exports.getAvailableSlots = async (dateStr, serviceId, client = prisma) => {
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay(); // 0 = الأحد

  // 1. جيب الخدمة عشان نعرف مدتها
  const service = await client.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.isActive) {
    throw new Error('الخدمة غير موجودة أو غير متاحة');
  }
  const duration = service.duration;

  // 2. جيب دوام هذا اليوم من الأسبوع
  const availability = await client.availability.findFirst({
    where: { dayOfWeek, isActive: true },
  });
  if (!availability) return []; // يوم مقفول

  let dayStart = timeToMinutes(availability.startTime);
  const dayEnd = timeToMinutes(availability.endTime);

  // 3. جيب الحجوبات (BlockedSlot) لنفس اليوم
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const blockedSlots = await client.blockedSlot.findMany({
    where: { date: { gte: startOfDay, lte: endOfDay } },
  });

  // لو فيه حجب ليوم كامل (startTime و endTime = null)
  const isFullDayBlocked = blockedSlots.some(b => !b.startTime && !b.endTime);
  if (isFullDayBlocked) return [];

  // 4. جيب الحجوزات الموجودة (غير الملغاة) بنفس اليوم
  const existingAppointments = await client.appointment.findMany({
    where: {
      date: { gte: startOfDay, lte: endOfDay },
      status: { not: 'cancelled' },
    },
  });

  // 5. ولّد كل الشرائح الممكنة بحجم "duration"
  const slots = [];
  const now = new Date();
  const isToday = startOfDay.toDateString() === now.toDateString();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  for (let t = dayStart; t + duration <= dayEnd; t += duration) {
    const slotStart = t;
    const slotEnd = t + duration;

    // تجاهل أي وقت فات لو اليوم النهاردة
    if (isToday && slotStart <= nowMinutes) continue;

    // تحقق: هل يتعارض مع حجب جزئي؟
    const isBlocked = blockedSlots.some(b => {
      if (!b.startTime || !b.endTime) return false;
      const bStart = timeToMinutes(b.startTime);
      const bEnd = timeToMinutes(b.endTime);
      return slotStart < bEnd && slotEnd > bStart; // تقاطع
    });
    if (isBlocked) continue;

    // تحقق: هل يتعارض مع حجز موجود؟
    const isTaken = existingAppointments.some(a => {
      const aStart = timeToMinutes(a.startTime);
      const aEnd = timeToMinutes(a.endTime);
      return slotStart < aEnd && slotEnd > aStart;
    });
    if (isTaken) continue;

    slots.push({
      startTime: minutesToTime(slotStart),
      endTime: minutesToTime(slotEnd),
    });
  }

  return slots;
};