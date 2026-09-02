'use client';

import { useState } from 'react';

export default function AddPatientModal({ open, onClose, onSubmit, submitting, errorMessage }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  if (!open) return null;

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ name: name.trim(), phone: phone.trim() });
  }

  function handleClose() {
    setName('');
    setPhone('');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
      <form
        onSubmit={handleSubmit}
        className="relative bg-white rounded-xl shadow-lg border border-gray-100 max-w-sm w-full p-6 animate-toast-in"
        dir="rtl"
      >
        <h2 className="text-base font-bold text-ink mb-4">إضافة حالة يدويًا</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">الاسم</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="اسم المريضة"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">رقم الهاتف</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="09xxxxxxxx"
              dir="ltr"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        {errorMessage && (
          <p className="text-xs text-red-600 mt-3">{errorMessage}</p>
        )}

        <p className="text-xs text-gray-400 mt-4">
          السجل المرضي اختياري ويمكن إضافته لاحقًا من صفحة تفاصيل الحالة.
        </p>

        <div className="flex gap-3 mt-5">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 py-2.5 rounded-lg font-medium text-sm bg-soft text-ink hover:bg-gray-100 transition"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-2.5 rounded-lg font-medium text-sm bg-rose text-white hover:opacity-90 transition disabled:opacity-50"
          >
            {submitting ? 'جارِ الإضافة...' : 'إضافة'}
          </button>
        </div>
      </form>
    </div>
  );
}
