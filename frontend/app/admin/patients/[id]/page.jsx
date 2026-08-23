'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, withAuth } from '@/lib/api';
import { getAdminToken } from '@/lib/auth';



const STATUS_LABELS = {
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  cancelled: 'ملغى',
  completed: 'مكتمل',
  'no-show': 'لم تحضر',
};

const EMPTY_RECORD = {
  bloodType: '', allergies: '', chronicConditions: '', currentMedications: '',
  skinType: '', historySummary: '', proceduresSummary: '', notes: '',
};

export default function PatientDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [patient, setPatient] = useState(null);
  const [record, setRecord] = useState(EMPTY_RECORD);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  function load() {
    const token = getAdminToken();
    api
      .get(`/api/admin/patients/${id}`, withAuth(token))
      .then((data) => {
        setPatient(data);
        if (data.medicalRecord) {
          setRecord({
            bloodType: data.medicalRecord.bloodType || '',
            allergies: data.medicalRecord.allergies || '',
            chronicConditions: data.medicalRecord.chronicConditions || '',
            currentMedications: data.medicalRecord.currentMedications || '',
            skinType: data.medicalRecord.skinType || '',
            historySummary: data.medicalRecord.historySummary || '',
            proceduresSummary: data.medicalRecord.proceduresSummary || '',
            notes: data.medicalRecord.notes || '',
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  async function handleSaveRecord(e) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const token = getAdminToken();
    try {
      await api.put(`/api/admin/patients/${id}/medical-record`, record, withAuth(token));
      setMessage({ type: 'success', text: 'تم حفظ السجل المرضي' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleBlacklist() {
    const token = getAdminToken();
    try {
      await api.put(`/api/admin/patients/${id}`, { isBlacklisted: !patient.isBlacklisted }, withAuth(token));
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <p className="text-gray-500">جارِ التحميل...</p>;
  if (!patient) return <p className="text-red-600">الحالة غير موجودة</p>;

  return (
    <div>
      <button type="button" onClick={() => router.push('/admin/patients')} className="text-sm text-gray-500 hover:text-rose mb-4">
        ← رجوع لسجلات المريضات
      </button>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink">{patient.name || 'بدون اسم'}</h1>
          <p className="text-gray-500 text-sm mt-1" dir="ltr">{patient.phone}</p>
        </div>
        <button
          type="button"
          onClick={handleToggleBlacklist}
          className={`text-sm px-4 py-2 rounded-lg transition ${
            patient.isBlacklisted
              ? 'bg-green-50 text-green-700 hover:bg-green-100'
              : 'bg-red-50 text-red-700 hover:bg-red-100'
          }`}
        >
          {patient.isBlacklisted ? 'إلغاء الحظر' : 'حظر الحالة'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* السجل المرضي */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-ink mb-4">السجل المرضي</h2>
          <form onSubmit={handleSaveRecord} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">فصيلة الدم</label>
                <input
                  value={record.bloodType}
                  onChange={(e) => setRecord({ ...record, bloodType: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">نوع البشرة</label>
                <input
                  value={record.skinType}
                  onChange={(e) => setRecord({ ...record, skinType: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">الحساسية</label>
              <input
                value={record.allergies}
                onChange={(e) => setRecord({ ...record, allergies: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">الأمراض المزمنة</label>
              <input
                value={record.chronicConditions}
                onChange={(e) => setRecord({ ...record, chronicConditions: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">الأدوية الحالية</label>
              <input
                value={record.currentMedications}
                onChange={(e) => setRecord({ ...record, currentMedications: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">ملخص التاريخ المرضي</label>
              <textarea
                value={record.historySummary}
                onChange={(e) => setRecord({ ...record, historySummary: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">ملخص الإجراءات السابقة</label>
              <textarea
                value={record.proceduresSummary}
                onChange={(e) => setRecord({ ...record, proceduresSummary: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">ملاحظات إضافية</label>
              <textarea
                value={record.notes}
                onChange={(e) => setRecord({ ...record, notes: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            {message && (
              <p className={message.type === 'success' ? 'text-green-600 text-sm' : 'text-red-600 text-sm'}>
                {message.text}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="bg-rose text-white rounded-lg px-6 py-2 hover:opacity-90 transition disabled:opacity-50"
            >
              {saving ? 'جارِ الحفظ...' : 'حفظ السجل المرضي'}
            </button>
          </form>
        </div>

        {/* تاريخ الحجوزات */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-ink mb-4">تاريخ الحجوزات</h2>
          {patient.appointments?.length === 0 && (
            <p className="text-gray-500 text-sm">لا يوجد حجوزات سابقة</p>
          )}
          <ul className="space-y-3">
            {patient.appointments?.map((apt) => (
              <li key={apt.id} className="border-b border-gray-100 pb-3 text-sm">
                <p className="font-medium text-ink">{apt.service?.name}</p>
                <p className="text-gray-500 mt-1">
                  {new Date(apt.date).toLocaleDateString('ar')} — {apt.startTime}
                </p>
                <span className="text-xs text-gray-400">{STATUS_LABELS[apt.status] || apt.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}