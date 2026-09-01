const prisma = require('../config/db');

// GET /api/admin/suppliers?search=
exports.getAllSuppliers = async (req, res) => {
  try {
    const { search } = req.query;
    const where = search
      ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { phone: { contains: search } }] }
      : {};

    const suppliers = await prisma.supplier.findMany({
      where,
      include: { _count: { select: { transactions: true } } },
      orderBy: { name: 'asc' },
    });
    res.json(suppliers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب المزودين' });
  }
};

// GET /api/admin/suppliers/:id  → ملف المزود + كل معاملاته
exports.getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: { transactions: { orderBy: { date: 'desc' } } },
    });
    if (!supplier) return res.status(404).json({ error: 'المزود غير موجود' });
    res.json(supplier);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب بيانات المزود' });
  }
};

// POST /api/admin/suppliers
exports.createSupplier = async (req, res) => {
  try {
    const { name, phone, email, address, products, notes } = req.body;
    if (!name) return res.status(400).json({ error: 'اسم المزود مطلوب' });

    const supplier = await prisma.supplier.create({
      data: { name, phone, email, address, products, notes },
    });
    res.status(201).json(supplier);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ أثناء إضافة المزود' });
  }
};

// PUT /api/admin/suppliers/:id
exports.updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, address, products, notes } = req.body;

    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(address !== undefined && { address }),
        ...(products !== undefined && { products }),
        ...(notes !== undefined && { notes }),
      },
    });
    res.json(supplier);
  } catch (error) {
    console.error(error);
    if (error.code === 'P2025') return res.status(404).json({ error: 'المزود غير موجود' });
    res.status(500).json({ error: 'حدث خطأ أثناء تعديل بيانات المزود' });
  }
};

// DELETE /api/admin/suppliers/:id
exports.deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.supplier.delete({ where: { id } });
    res.json({ message: 'تم حذف المزود' });
  } catch (error) {
    console.error(error);
    if (error.code === 'P2025') return res.status(404).json({ error: 'المزود غير موجود' });
    res.status(500).json({ error: 'حدث خطأ أثناء حذف المزود' });
  }
};

// ===== معاملات المزود =====

// POST /api/admin/suppliers/:id/transactions
exports.addTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, type, description, date } = req.body;

    if (!amount || !type) {
      return res.status(400).json({ error: 'المبلغ ونوع المعاملة مطلوبين' });
    }

    const supplier = await prisma.supplier.findUnique({ where: { id } });
    if (!supplier) return res.status(404).json({ error: 'المزود غير موجود' });

    const transaction = await prisma.supplierTransaction.create({
      data: {
        supplierId: id,
        amount,
        type,
        description,
        date: date ? new Date(date) : new Date(),
      },
    });
    res.status(201).json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ أثناء إضافة المعاملة' });
  }
};

// DELETE /api/admin/suppliers/transactions/:transactionId
exports.deleteTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    await prisma.supplierTransaction.delete({ where: { id: transactionId } });
    res.json({ message: 'تم حذف المعاملة' });
  } catch (error) {
    console.error(error);
    if (error.code === 'P2025') return res.status(404).json({ error: 'المعاملة غير موجودة' });
    res.status(500).json({ error: 'حدث خطأ أثناء حذف المعاملة' });
  }
};