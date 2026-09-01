const prisma = require('../config/db');

function getMonthRange(year, month) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  return { start, end };
}

function getYearRange(year) {
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);
  return { start, end };
}

// GET /api/admin/finance/summary?year=2026&month=8  (month اختياري)
exports.getSummary = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = req.query.month ? parseInt(req.query.month) : null;

    const { start, end } = month ? getMonthRange(year, month) : getYearRange(year);

    const [invoicesAgg, transactionsAgg] = await Promise.all([
      prisma.invoice.aggregate({
        where: { date: { gte: start, lt: end }, status: 'paid' },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.supplierTransaction.aggregate({
        where: { date: { gte: start, lt: end } },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    const revenue = Number(invoicesAgg._sum.amount || 0);
    const expenses = Number(transactionsAgg._sum.amount || 0);

    res.json({
      period: month ? `${year}-${String(month).padStart(2, '0')}` : String(year),
      revenue,
      expenses,
      netProfit: revenue - expenses,
      invoiceCount: invoicesAgg._count,
      transactionCount: transactionsAgg._count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ أثناء حساب الملخص المالي' });
  }
};