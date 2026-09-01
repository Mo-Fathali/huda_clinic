'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, withAuth } from '@/lib/api';
import { getAdminToken } from '@/lib/auth';

const EMPTY_TX = { amount: '', type: 'purchase', description: '', date: '' };

export default function SupplierDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [txForm, setTxForm] = useState(EMPTY_TX);

  function load() {
    const token = getAdminToken();
    api
      .get(`/api/admin/suppliers/${id}`, withAuth(token))
      .then(setSupplier)
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  async function handleAddTransaction(e) {
    e.preventDefault();
    const token = getAdminToken();
    try {
      await api.post(`/api/admin/suppliers/${id}/transactions`, txForm, withAuth(token));
      setTxForm(EMPTY_TX);
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDeleteTransaction(txId) {
    if (!confirm('حذف هذه المعاملة؟')) return;
    const token = getAdminToken();
    try {
      await api.delete(`/api/admin/suppliers/transactions/${txId}`, withAuth(token));
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <p className="text-gray-500">جارِ التحميل...</p>;
  if (!supplier) return <p className="text-red-600">المزود غير موجود</p>;

  const totalAmount = supplier.transactions.reduce((sum, tx) => sum + Number(tx.amount), 0);

  return (
    <div>
      <button type="button" onClick={() => router.push('/admin/suppliers')} className="text-sm text-gray-500 hover:text-rose mb-6">
        ← رجوع للمزودين
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h1 className="text-lg font-bold text-ink mb-4">{supplier.name}</h1>
          <dl className="space-y-3 text-sm">
            {supplier.phone && (
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <dt className="text-gray-500">الهاتف</dt>
                <dd className="text-ink" dir="ltr">{supplier.phone}</dd>
              </div>
            )}
            {supplier.email && (
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <dt className="text-gray-500">البريد</dt>
                <dd className="text-ink" dir="ltr">{supplier.email}</dd>
              </div>
            )}
            {supplier.address && (
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <dt className="text-gray-500">العنوان</dt>
                <dd className="text-ink">{supplier.address}</dd>
              </div>
            )}
            {supplier.products && (
              <div className="pt-1">
                <dt className="text-gray-500 mb-1">المنتجات</dt>
                <dd className="text-ink">{supplier.products}</dd>
              </div>
            )}
            {supplier.notes && (
              <div className="pt-1">
                <dt className="text-gray-500 mb-1">ملاحظات</dt>
                <dd className="text-ink">{supplier.notes}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleAddTransaction} className="bg-white rounded-xl border border-gray-100 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="number" placeholder="المبلغ" value={txForm.amount}
              onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2" required
            />
            <select
              value={txForm.type} onChange={(e) => setTxForm({ ...txForm, type: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="purchase">مشترى</option>
              <option value="payment">دفعة</option>
            </select>
            <input
              type="text" placeholder="الوصف (اختياري)" value={txForm.description}
              onChange={(e) => setTxForm({ ...txForm, description: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 sm:col-span-2"
            />
            <input
              type="date" value={txForm.date}
              onChange={(e) => setTxForm({ ...txForm, date: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
            <button type="submit" className="bg-rose text-white rounded-lg px-5 py-2 hover:opacity-90 transition">
              إضافة معاملة
            </button>
          </form>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-ink">سجل المعاملات</h2>
              <span className="text-sm text-gray-500">
                الإجمالي: <span className="font-bold text-rose">{totalAmount.toFixed(2)} د.ل</span>
              </span>
            </div>
            {supplier.transactions.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-6">لا توجد معاملات بعد</p>
            )}
            <ul className="divide-y divide-gray-100">
              {supplier.transactions.map((tx) => (
                <li key={tx.id} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs ${tx.type === 'purchase' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                      {tx.type === 'purchase' ? 'مشترى' : 'دفعة'}
                    </span>
                    {tx.description && <span className="text-gray-500 mr-2">{tx.description}</span>}
                    <p className="text-gray-400 text-xs mt-1">{new Date(tx.date).toLocaleDateString('ar')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-ink">{Number(tx.amount).toFixed(2)} د.ل</span>
                    <button onClick={() => handleDeleteTransaction(tx.id)} className="text-red-500 hover:underline text-xs">
                      حذف
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}