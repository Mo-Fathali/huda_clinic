'use client';

import { useEffect, useState } from 'react';
import { api, withAuth } from '@/lib/api';
import { getAdminToken } from '@/lib/auth';
import AppointmentTable from '@/components/admin/AppointmentTable';

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function load() {
    setLoading(true);
    const token = getAdminToken();
    const query = statusFilter ? `?status=${statusFilter}` : '';
    api
      .get(`/api/admin/appointments${query}`, withAuth(token))
      .then(setAppointments)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [statusFilter]);

  async function handleStatusChange(id, status) {
    const token = getAdminToken();
    try {
      await api.put(`/api/admin/appointments/${id}`, { status }, withAuth(token));
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleCancel(id) {
    if (!confirm('هل تريدين إلغاء هذا الحجز؟')) return;
    const token = getAdminToken();
    try {
      await api.delete(`/api/admin/appointments/${id}`, withAuth(token));
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-ink">الحجوزات</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">كل الحالات</option>
          <option value="pending">قيد الانتظار</option>
          <option value="confirmed">مؤكد</option>
          <option value="completed">مكتمل</option>
          <option value="cancelled">ملغى</option>
          <option value="no-show">لم يحضر</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5">
        {loading && <p className="text-gray-500">جارِ التحميل...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && (
          <AppointmentTable
            appointments={appointments}
            onStatusChange={handleStatusChange}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
}