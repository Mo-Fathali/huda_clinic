'use client';

import { useEffect, useState } from 'react';
import { api, withAuth } from '@/lib/api';
import { getAdminToken } from '@/lib/auth';

function formatDateKey(date) {
  return date.toISOString().split('T')[0];
}

export default function AdminOverviewPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = getAdminToken();
    const today = formatDateKey(new Date());

    api
      .get(`/api/admin/appointments?date=${today}`, withAuth(token))
      .then(setAppointments)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const confirmed = appointments.filter((a) => a.status === 'confirmed').length;
  const pending = appointments.filter((a) => a.status === 'pending').length;
  const blacklisted = appointments.filter((a) => a.patient?.isBlacklisted).length;

  return (
    <div>
      <h1 className="text-xl font-bold text-ink mb-6">نظرة عامة — اليوم</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <p className="text-gray-500 text-sm">مواعيد اليوم</p>
          <p className="text-2xl font-bold text-ink mt-1">{appointments.length}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <p className="text-gray-500 text-sm">مؤكدة</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{confirmed}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <p className="text-gray-500 text-sm">قيد الانتظار</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{pending}</p>
        </div>
      </div>

      {blacklisted > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
          يوجد {blacklisted} حجز من حالات محظورات — راجعي قائمة الحجوزات
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold text-ink mb-4">مواعيد اليوم</h2>
        {loading && <p className="text-gray-500">جارِ التحميل...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && appointments.length === 0 && (
          <p className="text-gray-500">لا توجد مواعيد اليوم</p>
        )}
        <ul className="divide-y divide-gray-100">
          {appointments.map((apt) => (
            <li key={apt.id} className="py-3 flex items-center justify-between text-sm">
              <div>
                <span className="font-medium text-ink">{apt.patient?.name}</span>
                <span className="text-gray-400 mx-2">—</span>
                <span className="text-gray-600">{apt.service?.name}</span>
              </div>
              <span className="text-gray-500" dir="ltr">{apt.startTime}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}