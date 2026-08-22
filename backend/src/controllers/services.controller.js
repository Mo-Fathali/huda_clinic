const prisma = require('../config/db');

// GET /api/services  → الخدمات النشطة فقط (للصفحة العامة)
exports.getActiveServices = async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب الخدمات' });
  }
};

// GET /api/admin/services  → كل الخدمات (نشطة وغير نشطة) — للوحة التحكم
exports.getAllServices = async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      orderBy: { order: 'asc' },
    });
    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب الخدمات' });
  }
};

// POST /api/admin/services  → إضافة خدمة جديدة
exports.createService = async (req, res) => {
  try {
    const { name, description, duration, price, order } = req.body;

    if (!name || !duration || !price) {
      return res.status(400).json({ error: 'الاسم والمدة والسعر مطلوبين' });
    }

    const service = await prisma.service.create({
      data: {
        name,
        description,
        duration: Number(duration),
        price: Number(price),
        order: order ? Number(order) : 0,
      },
    });

    res.status(201).json(service);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ أثناء إضافة الخدمة' });
  }
};

// PUT /api/admin/services/:id  → تعديل خدمة
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, duration, price, order, isActive } = req.body;

    const service = await prisma.service.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(duration !== undefined && { duration: Number(duration) }),
        ...(price !== undefined && { price: Number(price) }),
        ...(order !== undefined && { order: Number(order) }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json(service);
  } catch (error) {
    console.error(error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'الخدمة غير موجودة' });
    }
    res.status(500).json({ error: 'حدث خطأ أثناء تعديل الخدمة' });
  }
};

// DELETE /api/admin/services/:id  → تعطيل الخدمة (soft delete)
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await prisma.service.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({ message: 'تم تعطيل الخدمة', service });
  } catch (error) {
    console.error(error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'الخدمة غير موجودة' });
    }
    res.status(500).json({ error: 'حدث خطأ أثناء حذف الخدمة' });
  }
};