'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, withAuth } from '@/lib/api';
import { getPatientToken, getPatientData, isPatientLoggedIn, clearPatientSession, savePatientSession } from '@/lib/auth';
import OtpInput from '@/components/booking/OtpInput';
import Footer from '@/components/landing/Footer';

const STATUS_LABELS = {
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  cancelled: 'ملغى',
  completed: 'مكتمل',
  'no-show': 'لم تحضري',
};

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
  completed: 'bg-blue-100 text-blue-700',
  'no-show': 'bg-red-100 text-red-700',
};

export default function MyAppointmentsPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    setLoggedIn(isPatientLoggedIn());
    setChecking(false);
  }, []);

  useEffect(() => {
    api.get('/api/profile').then(setProfile).catch(() => {});
  }, []);

  useEffect(() => {
    if (!loggedIn) return;
    setLoading(true);
    const token = getPatientToken();
    api
      .get('/api/appointments', withAuth(token))
      .then(setAppointments)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [loggedIn]);

  function handleVerified(result) {
    savePatientSession(result.token, result.patient);
    setLoggedIn(true);
  }

  function handleLogout() {
    clearPatientSession();
    setLoggedIn(false);
    setAppointments([]);
  }

  if (checking) return null;

  if (!loggedIn) {
    return (
      <>
        <main className="min-h-screen bg-white px-6 py-16 flex flex-col">
          <Link href="/" className="text-sm text-gray-500 hover:text-rose mb-8 inline-flex items-center gap-1 self-start">
            ← الرئيسية
          </Link>
          <div className="max-w-sm mx-auto w-full flex-1">
            <h1 className="text-xl font-bold text-ink mb-2 text-center">مواعيدي</h1>
            <p className="text-gray-500 text-sm mb-8 text-center">
              سجلي دخولك برقم هاتفك لعرض حجوزاتك
            </p>
            <OtpInput onVerified={handleVerified} />
          </div>
        </main>
        <Footer profile={profile} />
      </>
    );
  }

  const patient = getPatientData();

  return (
    <>
      <main className="min-h-screen bg-soft px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <Link href="/" className="text-sm text-gray-500 hover:text-rose mb-6 inline-flex items-center gap-1">
            ← الرئيسية
          </Link>

          <div className="flex items-center justify-between mb-8 mt-2">
            <div>
              <h1 className="text-xl font-bold text-ink">مواعيدي</h1>
              {patient?.name && <p className="text-gray-500 text-sm mt-1">مرحباً {patient.name}</p>}
            </div>
            <button type="button" onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-600">
              تسجيل الخروج
            </button>
          </div>

          {loading && (
            <div className="flex flex-col items-center py-16 text-gray-400">
              <div className="w-6 h-6 border-2 border-rose border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm">جارِ التحميل...</p>
            </div>
          )}

          {error && <p className="text-red-600 text-center py-10">{error}</p>}

          {!loading && !error && appointments.length === 0 && (
            <div className="bg-white rounded-xl p-10 text-center border border-gray-100">
              <p className="text-gray-500 mb-4">لا توجد حجوزات بعد</p>
              <Link href="/booking" className="inline-block bg-rose text-white px-6 py-2 rounded-lg hover:opacity-90 transition">
                احجزي موعدك الأول
              </Link>
            </div>
          )}

          {!loading && !error && appointments.length > 0 && (
            <div className="space-y-3">
              {appointments.map((apt) => (
                <Link
                  key={apt.id}
                  href={`/my-appointments/${apt.id}`}
                  className="block bg-white rounded-xl p-5 border border-gray-100 hover:border-rose/40 hover:shadow-sm transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-ink">{apt.service?.name}</h3>
                      <p className="text-gray-500 text-sm mt-1">
                        {new Date(apt.date).toLocaleDateString('ar')} — {apt.startTime}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs shrink-0 ${STATUS_COLORS[apt.status] || 'bg-gray-100'}`}>
                      {STATUS_LABELS[apt.status] || apt.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer profile={profile} />
    </>
  );
}