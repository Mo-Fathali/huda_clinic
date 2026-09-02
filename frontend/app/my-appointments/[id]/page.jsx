'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, withAuth } from '@/lib/api';
import { getPatientToken, isPatientLoggedIn } from '@/lib/auth';
import Toast from '@/components/ui/Toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';


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

export default function AppointmentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!isPatientLoggedIn()) {
      router.replace('/my-appointments');
      return;
    }
    const token = getPatientToken();
    api
      .get(`/api/appointments/${id}`, withAuth(token))
      .then(setAppointment)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, router]);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timeout);
  }, [toast]);

  async function handleCancel() {
    setConfirmOpen(false);
    setCancelling(true);
    try {
      const token = getPatientToken();
      const updated = await api.put(`/api/appointments/${id}/cancel`, {}, withAuth(token));
      setAppointment(updated);
      setToast({ message: 'تم إلغاء الموعد بنجاح', type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center text-gray-400">
        <div className="w-6 h-6 border-2 border-rose border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm">جارِ التحميل...</p>
      </main>
    );
  }

  if (error) {
    return <main className="min-h-screen flex items-center justify-center text-red-600">{error}</main>;
  }
  if (!appointment) return null;

  const canCancel = appointment.status === 'pending' || appointment.status === 'confirmed';
  const showScreenshotHint = appointment.status === 'confirmed' || appointment.status === 'completed';

  return (
    <main className="min-h-screen bg-soft px-6 py-12">
      <div className="max-w-md mx-auto">
        <button
          type="button"
          onClick={() => router.push('/my-appointments')}
          className="text-sm text-gray-500 hover:text-rose transition mb-6 inline-flex items-center gap-1"
        >
          ← رجوع لمواعيدي
        </button>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-bold text-ink">{appointment.service?.name}</h1>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_COLORS[appointment.status] || 'bg-soft text-ink'}`}>
              {STATUS_LABELS[appointment.status] || appointment.status}
            </span>
          </div>

          <dl className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <dt className="text-gray-500">التاريخ</dt>
              <dd className="text-ink font-medium">{new Date(appointment.date).toLocaleDateString('ar')}</dd>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <dt className="text-gray-500">الوقت</dt>
              <dd className="text-ink font-medium" dir="ltr">{appointment.startTime} - {appointment.endTime}</dd>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <dt className="text-gray-500">المدة</dt>
              <dd className="text-ink font-medium">{appointment.service?.duration} دقيقة</dd>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <dt className="text-gray-500">السعر</dt>
              <dd className="text-rose font-bold">{appointment.service?.price} د.ل</dd>
            </div>
            {appointment.notes && (
              <div className="pt-1">
                <dt className="text-gray-500 mb-1">ملاحظات</dt>
                <dd className="text-ink">{appointment.notes}</dd>
              </div>
            )}
          </dl>

          {showScreenshotHint && (
            <p className="text-sm text-gray-500 mt-6 text-center">
              يمكنك أخذ لقطة شاشة (سكرين شوت) لهذه الصفحة كإثبات حجز
            </p>
          )}

          {canCancel && (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              disabled={cancelling}
              className="w-full mt-4 bg-red-50 text-red-700 rounded-lg py-3 font-semibold hover:bg-red-100 transition disabled:opacity-50"
            >
              {cancelling ? 'جارِ الإلغاء...' : 'إلغاء الموعد'}
            </button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="تأكيد الإلغاء"
        message="هل أنتِ متأكدة من إلغاء هذا الموعد؟"
        confirmLabel="نعم، إلغاء"
        cancelLabel="تراجع"
        onConfirm={handleCancel}
        onCancel={() => setConfirmOpen(false)}
      />

      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </main>
  );
}
