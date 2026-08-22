'use client';

const STATUS_LABELS = {
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  cancelled: 'ملغى',
  completed: 'مكتمل',
  'no-show': 'لم يحضر',
};

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
  completed: 'bg-blue-100 text-blue-700',
  'no-show': 'bg-red-100 text-red-700',
};

export default function AppointmentTable({ appointments, onStatusChange, onCancel }) {
  if (!appointments || appointments.length === 0) {
    return <p className="text-gray-500 text-center py-10">لا توجد حجوزات</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-right border-collapse">
        <thead>
          <tr className="border-b border-gray-200 text-sm text-gray-500">
            <th className="py-3 px-3">المريضة</th>
            <th className="py-3 px-3">الخدمة</th>
            <th className="py-3 px-3">التاريخ</th>
            <th className="py-3 px-3">الوقت</th>
            <th className="py-3 px-3">الحالة</th>
            <th className="py-3 px-3">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((apt) => (
            <tr key={apt.id} className="border-b border-gray-100 text-sm">
              <td className="py-3 px-3">
                <div className="font-medium text-ink">{apt.patient?.name || '—'}</div>
                <div className="text-gray-400" dir="ltr">{apt.patient?.phone}</div>
              </td>
              <td className="py-3 px-3">{apt.service?.name}</td>
              <td className="py-3 px-3">{new Date(apt.date).toLocaleDateString('ar')}</td>
              <td className="py-3 px-3" dir="ltr">{apt.startTime}</td>
              <td className="py-3 px-3">
                <span className={`px-2 py-1 rounded-full text-xs ${STATUS_COLORS[apt.status] || 'bg-gray-100'}`}>
                  {STATUS_LABELS[apt.status] || apt.status}
                </span>
              </td>
              <td className="py-3 px-3">
                <div className="flex gap-2">
                  {apt.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => onStatusChange(apt.id, 'confirmed')}
                      className="text-green-600 hover:underline text-xs"
                    >
                      تأكيد
                    </button>
                  )}
                  {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                    <button
                      type="button"
                      onClick={() => onStatusChange(apt.id, 'completed')}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      إتمام
                    </button>
                  )}
                  {apt.status !== 'cancelled' && (
                    <button
                      type="button"
                      onClick={() => onStatusChange(apt.id, 'no-show')}
                      className="text-red-500 hover:underline text-xs"
                    >
                      لم يحضر
                    </button>
                  )}
                  {apt.status !== 'cancelled' && (
                    <button
                      type="button"
                      onClick={() => onCancel(apt.id)}
                      className="text-gray-500 hover:underline text-xs"
                    >
                      إلغاء
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}