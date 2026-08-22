const prisma = require('../config/db');

// GET /api/profile  → عام، تجيب بيانات الدكتورة للصفحة الرئيسية
exports.getProfile = async (req, res) => {
  try {
    const profile = await prisma.doctorProfile.findFirst();

    if (!profile) {
      return res.status(404).json({ error: 'لم يتم إعداد بيانات الدكتورة بعد' });
    }

    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب البيانات' });
  }
};

// PUT /api/admin/profile  → تعديل بيانات الدكتورة (يُنشئ السجل لو ما كان موجود)
exports.updateProfile = async (req, res) => {
  try {
    const { name, title, bio, imageUrl, phone, whatsapp, email, address } = req.body;

    const existing = await prisma.doctorProfile.findFirst();

    let profile;

    if (existing) {
      // تعديل السجل الموجود
      profile = await prisma.doctorProfile.update({
        where: { id: existing.id },
        data: {
          ...(name !== undefined && { name }),
          ...(title !== undefined && { title }),
          ...(bio !== undefined && { bio }),
          ...(imageUrl !== undefined && { imageUrl }),
          ...(phone !== undefined && { phone }),
          ...(whatsapp !== undefined && { whatsapp }),
          ...(email !== undefined && { email }),
          ...(address !== undefined && { address }),
        },
      });
    } else {
      // أول مرة — إنشاء السجل
      if (!name || !title || !bio || !phone) {
        return res.status(400).json({ error: 'الاسم والتخصص والنبذة والهاتف مطلوبين' });
      }
      profile = await prisma.doctorProfile.create({
        data: { name, title, bio, imageUrl, phone, whatsapp, email, address },
      });
    }

    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ أثناء تعديل البيانات' });
  }
};