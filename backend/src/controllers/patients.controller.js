const prisma = require('../config/db');

const excelService = require('../services/excel.service');

// GET /api/admin/patients?search=&filter=all|blacklisted|active
exports.getAllPatients = async (req, res) => {
  try {
    const { search, filter } = req.query;

    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    if (filter === 'blacklisted') {
      where.isBlacklisted = true;
    } else if (filter === 'active') {
      where.isBlacklisted = false;
    }

    const patients = await prisma.patient.findMany({
      where,
      include: {
        _count: { select: { appointments: true } },
        medicalRecord: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(patients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب الحالات' });
  }
};

// GET /api/admin/patients/:id  → تفاصيل مريضة + سجل مرضي + تاريخ الحجوزات
exports.getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        medicalRecord: true,
        appointments: {
          include: { service: true },
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!patient) {
      return res.status(404).json({ error: 'الحالة غير موجودة' });
    }

    res.json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب بيانات الحالة' });
  }
};

// PUT /api/admin/patients/:id  → تعديل بيانات أساسية (الاسم، الحظر)
exports.updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, isBlacklisted } = req.body;

    const patient = await prisma.patient.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(isBlacklisted !== undefined && { isBlacklisted }),
      },
    });

    res.json(patient);
  } catch (error) {
    console.error(error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'الحالة غير موجودة' });
    }
    res.status(500).json({ error: 'حدث خطأ أثناء تعديل بيانات المريضة' });
  }
};

// PUT /api/admin/patients/:id/medical-record  → إنشاء أو تعديل السجل المرضي
exports.upsertMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      bloodType, allergies, chronicConditions, currentMedications,
      skinType, historySummary, proceduresSummary, notes,
    } = req.body;

    const patient = await prisma.patient.findUnique({ where: { id } });
    if (!patient) {
      return res.status(404).json({ error: 'المريضة غير موجودة' });
    }

    const data = {
      ...(bloodType !== undefined && { bloodType }),
      ...(allergies !== undefined && { allergies }),
      ...(chronicConditions !== undefined && { chronicConditions }),
      ...(currentMedications !== undefined && { currentMedications }),
      ...(skinType !== undefined && { skinType }),
      ...(historySummary !== undefined && { historySummary }),
      ...(proceduresSummary !== undefined && { proceduresSummary }),
      ...(notes !== undefined && { notes }),
    };

    const record = await prisma.medicalRecord.upsert({
      where: { patientId: id },
      update: data,
      create: { patientId: id, ...data },
    });

    res.json(record);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ أثناء حفظ السجل المرضي' });
  }
};

// GET /api/admin/patients/export  → تحميل كل المريضات كملف إكسل
exports.exportPatients = async (req, res) => {
  try {
    const patients = await prisma.patient.findMany({
      include: { medicalRecord: true },
      orderBy: { name: 'asc' },
    });

    const buffer = await excelService.exportPatientsToExcel(patients);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename="patients.xlsx"');
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ أثناء تصدير الملف' });
  }
};

// POST /api/admin/patients/import  → رفع ملف إكسل (إنشاء/تحديث بالهاتف كمعرّف فريد)
exports.importPatients = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'لم يتم رفع أي ملف' });
    }

    const rows = await excelService.parsePatientsExcel(req.file.buffer);

    let created = 0;
    let updated = 0;
    const errors = [];

    for (const row of rows) {
      try {
        const phone = row.phone;
        if (!/^\+?[0-9]{8,15}$/.test(phone)) {
          errors.push(`رقم هاتف غير صحيح: "${phone}"`);
          continue;
        }

        const existing = await prisma.patient.findUnique({ where: { phone } });

        const patient = await prisma.patient.upsert({
          where: { phone },
          update: { ...(row.name && { name: row.name }) },
          create: { phone, name: row.name || 'بدون اسم' },
        });

        const medicalData = {
          bloodType: row.bloodType || undefined,
          allergies: row.allergies || undefined,
          chronicConditions: row.chronicConditions || undefined,
          currentMedications: row.currentMedications || undefined,
          skinType: row.skinType || undefined,
          historySummary: row.historySummary || undefined,
          proceduresSummary: row.proceduresSummary || undefined,
          notes: row.notes || undefined,
        };

        const hasMedicalData = Object.values(medicalData).some((v) => v !== undefined);
        if (hasMedicalData) {
          await prisma.medicalRecord.upsert({
            where: { patientId: patient.id },
            update: medicalData,
            create: { patientId: patient.id, ...medicalData },
          });
        }

        existing ? updated++ : created++;
      } catch (rowError) {
        errors.push(`خطأ في صف الهاتف "${row.phone}": ${rowError.message}`);
      }
    }

    res.json({
      message: 'تم الاستيراد',
      created,
      updated,
      totalRows: rows.length,
      errors,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'حدث خطأ أثناء استيراد الملف' });
  }
};