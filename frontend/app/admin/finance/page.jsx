'use client';

import { useEffect, useState } from 'react';
import { api, withAuth } from '@/lib/api';
import { getAdminToken } from '@/lib/auth';

const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

export default function AdminFinancePage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [viewMode, setViewMode] = useState('month'); // month | year
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    const token = getAdminToken();
    const query = viewMode === 'month' ? `?year=${year}&month=${month}` : `?year=${year}`;
    api
      .get(`/api/admin/finance/summary${query}`, withAuth(token))
      .then(setSummary)
      .finally(() => setLoading(false));
  }

  useEffect(load, [year, month, viewMode]);

  return (
    <div>
      <h1 className="text-xl font-bold text-ink mb-6">الملخص المالي</h1>

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <select
          value={viewMode} onChange={(e) => setViewMode(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="month">شهري</option>
          <option value="year">سنوي</option>
        </select>

        {viewMode === 'month' && (
          <select
            value={month} onChange={(e) => setMonth(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            {MONTHS.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
        )}

        <select
          value={year} onChange={(e) => setYear(Number(e.target.value))}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          {[year - 1, year, year + 1].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {loading && <p className="text-gray-500">جارِ التحميل...</p>}

      {!loading && summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <p className="text-gray-500 text-sm">إجمالي الدخل</p>
            <p className="text-2xl font-bold text-green-600 mt-2">{summary.revenue.toFixed(2)} د.ل</p>
            <p className="text-xs text-gray-400 mt-1">{summary.invoiceCount} فاتورة</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <p className="text-gray-500 text-sm">إجمالي المصروفات</p>
            <p className="text-2xl font-bold text-red-600 mt-2">{summary.expenses.toFixed(2)} د.ل</p>
            <p className="text-xs text-gray-400 mt-1">{summary.transactionCount} معاملة</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <p className="text-gray-500 text-sm">صافي الربح</p>
            <p className={`text-2xl font-bold mt-2 ${summary.netProfit >= 0 ? 'text-rose' : 'text-red-600'}`}>
              {summary.netProfit.toFixed(2)} د.ل
            </p>
          </div>
        </div>
      )}
    </div>
  );
}