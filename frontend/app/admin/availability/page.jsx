'use client';

import { useEffect, useState } from 'react';
import { api, withAuth } from '@/lib/api';
import { getAdminToken } from '@/lib/auth';
import AvailabilityEditor from '@/components/admin/AvailabilityEditor';

export default function AdminAvailabilityPage() {
  const [schedule, setSchedule] = useState([]);
  const [blocked, setBlocked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blockForm, setBlockForm] = useState({ date: '', startTime: '', endTime: '', reason: '' });

  function load() {
    const token = getAdminToken();
    Promise.all([
      api.get('/api/admin/availability', withAuth(token)),
      api.get('/api/admin/availability/blocked', withAuth(token)),
    ])
      .then(([sched, block]) => {
        setSchedule(sched);
        setBlocked(block);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleSaveDay(dayData) {
    const token = getAdminToken();
    await api.put('/api/admin/availability', dayData, withAuth(token));
    load();
  }

  async function handleAddBlock(e) {
    e.preventDefault();
    if (!blockForm.date) return;
    const token = getAdminToken();
    try {
      await api.post(
        '/api/admin/availability/blocked',
        {
          date: blockForm.date,
          startTime: blockForm.startTime || undefined,
          endTime: blockForm.endTime || undefined,
          reason: blockForm.reason || undefined,
        },
        withAuth(token)
      );
      setBlockForm({ date: '', startTime: '', endTime: '', reason: '' });
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleRemoveBlock(id) {
    const token = getAdminToken();
    try {
      await api.delete(`/api/admin/availability/blocked/${id}`, withAuth(token));
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <p className="text-gray-500">جارِ التحميل...</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-ink mb-6">جدول الدوام الأسبوعي</h1>
        <AvailabilityEditor schedule={schedule} onSave={handleSaveDay} />
      </div>

      <div>
        <h2 className="text-lg font-bold text-ink mb-4">حجب أيام أو أوقات محددة</h2>

        <form onSubmit={handleAddBlock} className="bg-white rounded-xl border border-gray-100 p-5 grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
          <input
            type="date"
            value={blockForm.date}
            onChange={(e) => setBlockForm({ ...blockForm, date: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2"
            required
          />
          <input
            type="time"
            placeholder="من (اختياري)"
            value={blockForm.startTime}
            onChange={(e) => setBlockForm({ ...blockForm, startTime: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
          <input
            type="time"
            placeholder="إلى (اختياري)"
            value={blockForm.endTime}
            onChange={(e) => setBlockForm({ ...blockForm, endTime: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
          <input
            type="text"
            placeholder="السبب (اختياري)"
            value={blockForm.reason}
            onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
          <button type="submit" className="sm:col-span-4 bg-rose text-white rounded-lg py-2 hover:opacity-90 transition">
            إضافة حجب
          </button>
        </form>
        <p className="text-xs text-gray-400 mb-4">اتركي "من" و"إلى" فاضيين لحجب اليوم كاملاً</p>

        <ul className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100">
          {blocked.length === 0 && <li className="p-5 text-gray-500 text-center">لا توجد أيام محجوبة</li>}
          {blocked.map((b) => (
            <li key={b.id} className="p-4 flex items-center justify-between text-sm">
              <div>
                <span className="font-medium text-ink">{new Date(b.date).toLocaleDateString('ar')}</span>
                {b.startTime && (
                  <span className="text-gray-500 mx-2" dir="ltr">{b.startTime} - {b.endTime}</span>
                )}
                {!b.startTime && <span className="text-gray-500 mx-2">يوم كامل</span>}
                {b.reason && <span className="text-gray-400">({b.reason})</span>}
              </div>
              <button type="button" onClick={() => handleRemoveBlock(b.id)} className="text-red-500 hover:underline">
                إلغاء
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}