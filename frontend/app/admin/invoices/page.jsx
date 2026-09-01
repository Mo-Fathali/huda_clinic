'use client';

import { useEffect, useState } from 'react';
import { api, withAuth } from '@/lib/api';
import { getAdminToken } from '@/lib/auth';

const EMPTY_FORM = { patientName: '', patientPhone: '', description: '', amount: '', status: 'paid', date: '' };

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  function load() {
    setLoading(true);
    const token = getAdminToken();
    const query = statusFilter ? `?status=${statusFilter}` : '';
    api
      .get(`/api/admin/invoices${query}`, withAuth(token))
      .then(setInvoices)
      .finally(() => setLoading(false));
  }

  useEffect(load, [statusFilter]);

  function startEdit(inv) {
    setEditingId(inv.id);
    setForm({
      patientName: inv.patientName,
      patientPhone: inv.patientPhone || '',
      description: inv.description || '',
      amount: inv.amount,
      status: inv.status,
      date: new Date(inv.date).toISOString().split('T')[0],
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const token = getAdminToken();
    try {
      if (editingId) {
        await api.put(`/api/admin/invoices/${editingId}`, form, withAuth(token));
      } else {
        await api.post('/api/admin/invoices', form, withAuth(token));
      }
      cancelEdit();
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('هل تريد حذف هذه الفاتورة؟')) return;
    const token = getAdminToken();
    try {
      await api.delete(`/api/admin/invoices/${id}`, withAuth(token));
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  const total = invoices.reduce((sum, inv) => sum + Number(inv.amount), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-ink">الفواتير</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">كل الحالات</option>
          <option value="paid">مدفوعة</option>
          <option value="unpaid">غير مدفوعة</option>
        </select>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="text" placeholder="اسم المريضة" value={form.patientName}
          onChange={(e) => setForm({ ...form, patientName: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2" required
        />
        <input
          type="text" placeholder="رقم الهاتف (اختياري)" value={form.patientPhone}
          onChange={(e) => setForm({ ...form, patientPhone: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2" dir="ltr"
        />
        <input
          type="text" placeholder="الوصف (اختياري)" value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2"
        />
        <input
          type="number" placeholder="المبلغ" value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2" required
        />
        <select
          value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="paid">مدفوعة</option>
          <option value="unpaid">غير مدفوعة</option>
        </select>
        <input
          type="date" value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2"
        />
        <div className="flex gap-2 sm:col-span-2">
          <button type="submit" className="bg-rose text-white rounded-lg px-5 py-2 hover:opacity-90 transition">
            {editingId ? 'حفظ التعديل' : 'إضافة فاتورة'}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="text-gray-500 px-3">إلغاء</button>
          )}
        </div>
      </form>

      <div className="bg-white rounded-xl border border-gray-100 p-5">
        {loading && <p className="text-gray-500 text-center py-6">جارِ التحميل...</p>}
        {!loading && (
          <>
            <p className="text-sm text-gray-500 mb-4">
              الإجمالي المعروض: <span className="font-bold text-rose">{total.toFixed(2)} د.ل</span>
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500">
                    <th className="py-3 px-3">المريضة</th>
                    <th className="py-3 px-3">الوصف</th>
                    <th className="py-3 px-3">المبلغ</th>
                    <th className="py-3 px-3">التاريخ</th>
                    <th className="py-3 px-3">الحالة</th>
                    <th className="py-3 px-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-gray-100">
                      <td className="py-3 px-3 font-medium text-ink">{inv.patientName}</td>
                      <td className="py-3 px-3 text-gray-600">{inv.description || '—'}</td>
                      <td className="py-3 px-3 font-bold text-rose">{Number(inv.amount).toFixed(2)} د.ل</td>
                      <td className="py-3 px-3 text-gray-600">{new Date(inv.date).toLocaleDateString('ar')}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${inv.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {inv.status === 'paid' ? 'مدفوعة' : 'غير مدفوعة'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex gap-2">
                          <button onClick={() => startEdit(inv)} className="text-rose hover:underline text-xs">تعديل</button>
                          <button onClick={() => handleDelete(inv.id)} className="text-red-500 hover:underline text-xs">حذف</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}