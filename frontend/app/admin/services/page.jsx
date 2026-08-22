'use client';

import { useEffect, useState } from 'react';
import { api, withAuth } from '@/lib/api';
import { getAdminToken } from '@/lib/auth';

const EMPTY_FORM = { name: '', description: '', duration: '', price: '', order: '' };

export default function AdminServicesPage() {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function load() {
    setLoading(true);
    const token = getAdminToken();
    api
      .get('/api/admin/services', withAuth(token))
      .then(setServices)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function startEdit(service) {
    setEditingId(service.id);
    setForm({
      name: service.name,
      description: service.description || '',
      duration: service.duration,
      price: service.price,
      order: service.order,
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
        await api.put(`/api/admin/services/${editingId}`, form, withAuth(token));
      } else {
        await api.post('/api/admin/services', form, withAuth(token));
      }
      cancelEdit();
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleToggleActive(service) {
    const token = getAdminToken();
    try {
      await api.put(`/api/admin/services/${service.id}`, { isActive: !service.isActive }, withAuth(token));
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-ink mb-6">الخدمات</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="اسم الخدمة"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2"
          required
        />
        <input
          type="text"
          placeholder="الوصف (اختياري)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2"
        />
        <input
          type="number"
          placeholder="المدة بالدقائق"
          value={form.duration}
          onChange={(e) => setForm({ ...form, duration: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2"
          required
        />
        <input
          type="number"
          placeholder="السعر"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2"
          required
        />
        <input
          type="number"
          placeholder="ترتيب العرض"
          value={form.order}
          onChange={(e) => setForm({ ...form, order: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2"
        />
        <div className="flex gap-2">
          <button type="submit" className="bg-rose text-white rounded-lg px-5 py-2 hover:opacity-90 transition">
            {editingId ? 'حفظ التعديل' : 'إضافة خدمة'}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="text-gray-500 px-3">
              إلغاء
            </button>
          )}
        </div>
      </form>

      <div className="bg-white rounded-xl border border-gray-100 p-5">
        {loading && <p className="text-gray-500">جارِ التحميل...</p>}
        {error && <p className="text-red-600">{error}</p>}
        <ul className="divide-y divide-gray-100">
          {services.map((service) => (
            <li key={service.id} className="py-3 flex items-center justify-between">
              <div>
                <span className="font-medium text-ink">{service.name}</span>
                <span className="text-gray-400 mx-2">—</span>
                <span className="text-gray-500 text-sm">{service.duration} د · {service.price} د.ل</span>
                {!service.isActive && (
                  <span className="mr-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">معطلة</span>
                )}
              </div>
              <div className="flex gap-3 text-sm">
                <button type="button" onClick={() => startEdit(service)} className="text-rose hover:underline">
                  تعديل
                </button>
                <button type="button" onClick={() => handleToggleActive(service)} className="text-gray-500 hover:underline">
                  {service.isActive ? 'تعطيل' : 'تفعيل'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}