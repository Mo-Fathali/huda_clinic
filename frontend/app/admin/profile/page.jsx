'use client';

import { useEffect, useState } from 'react';
import { api, withAuth } from '@/lib/api';
import { getAdminToken } from '@/lib/auth';

export default function AdminProfilePage() {
  const [form, setForm] = useState({
    name: '', title: '', bio: '', imageUrl: '', phone: '', whatsapp: '', email: '', address: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    api
      .get('/api/profile')
      .then((data) => setForm({ ...form, ...data }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const token = getAdminToken();
    try {
      await api.put('/api/admin/profile', form, withAuth(token));
      setMessage({ type: 'success', text: 'تم حفظ البيانات' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-gray-500">جارِ التحميل...</p>;

  return (
    <div>
      <h1 className="text-xl font-bold text-ink mb-6">بيانات العيادة</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">الاسم</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">التخصص</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">نبذة</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">رابط الصورة</label>
          <input
            value={form.imageUrl || ''}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            dir="ltr"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">الهاتف</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              dir="ltr"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">واتساب</label>
            <input
              value={form.whatsapp || ''}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">البريد الإلكتروني</label>
            <input
              value={form.email || ''}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">العنوان</label>
            <input
              value={form.address || ''}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
        </div>

        {message && (
          <p className={message.type === 'success' ? 'text-green-600' : 'text-red-600'}>
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="bg-rose text-white rounded-lg px-6 py-2 hover:opacity-90 transition disabled:opacity-50"
        >
          {saving ? 'جارِ الحفظ...' : 'حفظ'}
        </button>
      </form>
    </div>
  );
}