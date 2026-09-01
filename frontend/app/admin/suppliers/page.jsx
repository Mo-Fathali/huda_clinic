'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, withAuth } from '@/lib/api';
import { getAdminToken } from '@/lib/auth';

const EMPTY_FORM = { name: '', phone: '', email: '', address: '', products: '', notes: '' };

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    const token = getAdminToken();
    const query = search ? `?search=${search}` : '';
    api
      .get(`/api/admin/suppliers${query}`, withAuth(token))
      .then(setSuppliers)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const timeout = setTimeout(load, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  async function handleSubmit(e) {
    e.preventDefault();
    const token = getAdminToken();
    try {
      await api.post('/api/admin/suppliers', form, withAuth(token));
      setForm(EMPTY_FORM);
      setShowForm(false);
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('هل تريد حذف هذا المزود وكل معاملاته؟')) return;
    const token = getAdminToken();
    try {
      await api.delete(`/api/admin/suppliers/${id}`, withAuth(token));
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-xl font-bold text-ink">المزودين</h1>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="bg-rose text-white text-sm px-4 py-2 rounded-lg hover:opacity-90 transition"
        >
          {showForm ? 'إلغاء' : '+ إضافة مزود'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text" placeholder="اسم المزود" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2" required
          />
          <input
            type="text" placeholder="رقم الهاتف" value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2" dir="ltr"
          />
          <input
            type="email" placeholder="البريد الإلكتروني" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2" dir="ltr"
          />
          <input
            type="text" placeholder="العنوان" value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
          <input
            type="text" placeholder="المنتجات/الخدمات المورّدة" value={form.products}
            onChange={(e) => setForm({ ...form, products: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 sm:col-span-2"
          />
          <textarea
            placeholder="ملاحظات" value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={2}
            className="border border-gray-300 rounded-lg px-3 py-2 sm:col-span-2"
          />
          <button type="submit" className="bg-rose text-white rounded-lg px-5 py-2 hover:opacity-90 transition sm:col-span-2">
            إضافة
          </button>
        </form>
      )}

      <input
        type="text"
        placeholder="ابحث بالاسم أو الهاتف..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-6"
      />

      <div className="bg-white rounded-xl border border-gray-100 p-5">
        {loading && <p className="text-gray-500 text-center py-6">جارِ التحميل...</p>}
        {!loading && suppliers.length === 0 && (
          <p className="text-gray-500 text-center py-6">لا يوجد مزودين</p>
        )}
        {!loading && suppliers.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="py-3 px-3">الاسم</th>
                  <th className="py-3 px-3">الهاتف</th>
                  <th className="py-3 px-3">المنتجات</th>
                  <th className="py-3 px-3">عدد المعاملات</th>
                  <th className="py-3 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((s) => (
                  <tr key={s.id} className="border-b border-gray-100">
                    <td className="py-3 px-3 font-medium text-ink">{s.name}</td>
                    <td className="py-3 px-3 text-gray-600" dir="ltr">{s.phone || '—'}</td>
                    <td className="py-3 px-3 text-gray-600">{s.products || '—'}</td>
                    <td className="py-3 px-3 text-gray-600">{s._count?.transactions ?? 0}</td>
                    <td className="py-3 px-3">
                      <div className="flex gap-2">
                        <Link href={`/admin/suppliers/${s.id}`} className="text-rose hover:underline text-xs">
                          عرض التفاصيل
                        </Link>
                        <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:underline text-xs">
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}