const prisma = require('../config/db');

// GET /api/admin/invoices?status=&month=&year=
exports.getAllInvoices = async (req, res) => {
  try {
    const { status, month, year } = req.query;
    const where = {};
    if (status) where.status = status;

    if (year) {
      const y = parseInt(year);
      const m = month ? parseInt(month) - 1 : null;
      const start = m !== null ? new Date(y, m, 1) : new Date(y, 0, 1);
      const end = m !== null ? new Date(y, m + 1, 1) : new Date(y + 1, 0, 1);
      where.date = { gte: start, lt: end };
    }

    const invoices = await prisma.invoice.findMany({
      where,
      orderBy: { date: 'desc' },
    });
    res.json(invoices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب الفواتير' });
  }
};

// POST /api/admin/invoices
exports.createInvoice = async (req, res) => {
  try {
    const { patientName, patientPhone, description, amount, status, date } = req.body;

    if (!patientName || !amount) {
      return res.status(400).json({ error: 'اسم المريضة والمبلغ مطلوبين' });
    }

    const invoice = await prisma.invoice.create({
      data: {
        patientName,
        patientPhone,
        description,
        amount,
        status: status || 'paid',
        date: date ? new Date(date) : new Date(),
      },
    });
    res.status(201).json(invoice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ أثناء إنشاء الفاتورة' });
  }
};

// PUT /api/admin/invoices/:id
exports.updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { patientName, patientPhone, description, amount, status, date } = req.body;

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        ...(patientName !== undefined && { patientName }),
        ...(patientPhone !== undefined && { patientPhone }),
        ...(description !== undefined && { description }),
        ...(amount !== undefined && { amount }),
        ...(status !== undefined && { status }),
        ...(date !== undefined && { date: new Date(date) }),
      },
    });
    res.json(invoice);
  } catch (error) {
    console.error(error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'الفاتورة غير موجودة' });
    }
    res.status(500).json({ error: 'حدث خطأ أثناء تعديل الفاتورة' });
  }
};

// DELETE /api/admin/invoices/:id
exports.deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.invoice.delete({ where: { id } });
    res.json({ message: 'تم حذف الفاتورة' });
  } catch (error) {
    console.error(error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'الفاتورة غير موجودة' });
    }
    res.status(500).json({ error: 'حدث خطأ أثناء حذف الفاتورة' });
  }
};